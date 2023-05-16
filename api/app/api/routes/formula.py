import json
import os
from enum import Enum
from threading import Lock
from typing import Optional

import httpx
from databases import Database
from fastapi import APIRouter, Depends, Form, HTTPException, Request
from fastapi.responses import FileResponse, Response

from ...db.connect import get_db
from ...db.core import (
    clear_instances,
    create_instances,
    create_route,
    get_all_formulas,
    get_formula,
    get_formula_by_creator_slug,
    get_instances,
    get_route,
)
from ...utils.taskqueue import tq

formula_router = r = APIRouter(tags=["Formula"])

FORMULAS_FD = os.path.abspath("../../formulas")

locks = {}


@r.get("/formulas/installed", summary="get installed formulas")
async def get_installed_formulas_r(db: Database = Depends(get_db)):
    formulas = await get_all_formulas(db)

    return formulas


@r.get("/formulas/instances", summary="get instances by route")
async def get_instances_r(route: str, db: Database = Depends(get_db)):
    instances_ = await get_instances(db, route)

    instances = []
    for ins in instances_:
        formula = await get_formula(db, ins.formula_id)
        instances.append(
            {
                "id": ins.formula_id,
                "title": formula.title,
                "slug": formula.slug,
                "version": ins.version,
                "creator": formula.creator,
                "author": formula.author,
                "description": formula.description,
                "config": formula.config,
                "visible": ins.visible,
                "instanceId": f"{ins.formula_id}-{ins.id}",
                "version_matched": ins.version == formula.version,
            }
        )

    return instances


@r.post("/formulas/instantiation", summary="instantiate a formula")
async def instantiate_formula_r(formula_id: int, db: Database = Depends(get_db)):
    formula = await get_formula(db, formula_id)
    return formula


@r.post("/formulas/instances", summary="sync up instances")
async def sync_instances_r(instances: str = Form(...), route: str = Form(...), db: Database = Depends(get_db)):
    instances_ = json.loads(instances)
    route_record = await get_route(db, route)

    if not route_record:
        route_id = await create_route(db, route)
    else:
        route_id = route_record.id

    instances_ = [
        {
            "id": ins.get("instanceId").split("-")[1],
            "formula_id": ins.get("instanceId").split("-")[0],
            "version": ins.get("version"),
            "visible": ins.get("visible"),
            "route_id": route_id,
        }
        for ins in instances_
    ]

    await clear_instances(db, route)
    await create_instances(db, instances_)


async def is_serving(endpoint):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{endpoint}/openapi.json")
            response.raise_for_status()
    except (httpx.ConnectError, httpx.HTTPStatusError, Exception):
        return False
    else:
        return True


@r.post("/formulas/services", summary="serv a formula")
async def serv_formula_r(formula_id: int, db: Database = Depends(get_db)):
    formula = await get_formula(db, formula_id)
    endpoint = formula.endpoint

    if endpoint and (await is_serving(endpoint)):
        return {
            "status": "serving",
            "endpoint": f"formula-serv/{formula.creator}/{formula.slug}",
            "docs": f"formula-serv/{formula.creator}/{formula.slug}/docs",
        }

    if formula_id not in locks:
        locks[formula_id] = Lock()

    lock = locks[formula_id]

    if not lock.acquire(blocking=False):
        return {
            "status": "launching",
            "endpoint": f"formula-serv/{formula.creator}/{formula.slug}",
            "docs": f"formula-serv/{formula.creator}/{formula.slug}/docs",
        }

    formula_fd = os.path.join(FORMULAS_FD, formula.creator, formula.slug)

    _ = tq.serv_formula_t.delay(
        formula_fd,
        {
            "id": formula.id,
            "title": formula.title,
            "creator": formula.creator,
            "slug": formula.slug,
            "version": formula.version,
            "description": formula.description,
            "config": formula.config,
        },
    )

    return {
        "status": "launching",
        "endpoint": f"formula-serv/{formula.creator}/{formula.slug}",
        "docs": f"formula-serv/{formula.creator}/{formula.slug}/docs",
    }


formula_ui_router = r_ui = APIRouter(tags=["Formula UI"])


@r_ui.get("/{creator}/{slug}/{file_path:path}")
async def get_formula_ui(creator: str, slug: str, file_path: str):
    formula_fd = os.path.join(FORMULAS_FD, creator, slug)

    return FileResponse(os.path.join(formula_fd, file_path))


formula_serv_router = r_serv = APIRouter(tags=["Formula Service"])


class DocsFile(Enum):
    docs = "docs"
    openapi = "openapi.json"

    @classmethod
    def has(cls, value):
        return value in cls._value2member_map_


@r_serv.api_route("/{creator}/{slug}", methods=["get", "put", "post", "patch", "delete"], include_in_schema=False)
@r_serv.api_route(
    "/{creator}/{slug}/{serv_path:path}",
    methods=["get", "put", "post", "patch", "delete"],
    include_in_schema=False,
)
async def proxy_formula_method(
    request: Request,
    creator: str,
    slug: str,
    serv_path: Optional[str] = "/",
    db: Database = Depends(get_db),
):
    serv_path = serv_path or "/"

    seg = serv_path.strip("/").split("/")
    method = request.method.lower()

    if len(seg) == 1 and DocsFile.has(seg[0]):
        if method != "get":
            raise HTTPException(status_code=405, detail="Method Not Allowed")

    formula = await get_formula_by_creator_slug(db, creator, slug)
    endpoint = formula.endpoint

    query_params = dict(request.query_params)
    headers = dict(request.headers)

    async with httpx.AsyncClient(base_url=endpoint, params=query_params) as client:
        try:
            if method in ["get", "delete"]:
                if "content-length" in headers:
                    headers.pop("content-length")

                response = await getattr(client, method)(serv_path, headers=headers)
            else:
                response = await getattr(client, method)(serv_path, headers=headers, data=request.stream())
        except httpx.ConnectError:
            raise HTTPException(404, "Failed access of formula service")

        if response.status_code != 200:
            error_data = response.json()
            raise HTTPException(response.status_code, error_data.get("detail"), headers=response.headers)

        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response.headers,
        )
