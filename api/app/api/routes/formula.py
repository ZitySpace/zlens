import asyncio
import json
import os
import random
from enum import Enum
from threading import Lock
from typing import Dict, Optional

import httpx
from databases import Database
from fastapi import (
    APIRouter,
    Depends,
    Form,
    HTTPException,
    Request,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.responses import FileResponse, JSONResponse, Response
from websockets.exceptions import ConnectionClosedError

from ...db.connect import get_db
from ...db.core import (
    clear_instances,
    create_instances,
    create_route,
    delete_route,
    get_all_formulas,
    get_children_routes,
    get_formula,
    get_formula_by_creator_slug,
    get_instances,
    get_route,
    get_route_by_id,
    get_routes,
    rename_route,
)
from ...utils.taskqueue import tq

formula_router = r = APIRouter(tags=["Formula"])

FORMULAS_FD = os.path.abspath("../../formulas")
LOGS_FD = os.path.abspath("../../logs")

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
                # "version_matched": ins.version == formula.version,
                "served_params": formula.served_params,
            }
        )

    return instances


@r.get("/formulas/routes-instances", summary="get instances of all routes")
async def get_routes_instances_r(db: Database = Depends(get_db)):
    instances = await get_instances(db)
    rid_to_instances = {}
    fid_to_instance = {}
    for ins in instances:
        rid = ins.route_id
        fid = ins.formula_id

        if fid not in fid_to_instance:
            formula = await get_formula(db, fid)
            fid_to_instance[fid] = {
                "id": formula.id,
                "title": formula.title,
                "slug": formula.slug,
                "version": ins.version,
                "creator": formula.creator,
                "author": formula.author,
                "description": formula.description,
                "config": formula.config,
                "visible": ins.visible,
                "instanceId": f"{ins.formula_id}-{ins.id}",
                # "version_matched": ins.version == formula.version,
            }

        if rid not in rid_to_instances:
            rid_to_instances[rid] = []

        rid_to_instances[rid].append(fid_to_instance[fid])

    routes = await get_routes(db)
    routes_instances = {}

    for route in routes:
        routes_instances[route.route] = rid_to_instances.get(route.id, [])

    return routes_instances


@r.post("/formulas/instantiation", summary="instantiate a formula")
async def instantiate_formula_r(formula_id: int, db: Database = Depends(get_db)):
    formula = await get_formula(db, formula_id)

    ins = {
        "id": formula.id,
        "title": formula.title,
        "slug": formula.slug,
        "version": formula.version,
        "creator": formula.creator,
        "author": formula.author,
        "description": formula.description,
        "config": formula.config,
        "served_params": formula.served_params,
    }

    return ins


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


@r.get("/formulas/children-routes", summary="get children routes of current route")
async def get_children_routes_r(route: str, db: Database = Depends(get_db)):
    route_record = await get_route(db, route)

    if not route_record:
        return []

    # encode/database does not support relationship
    children_routes = await get_children_routes(db, route_record.id)

    return children_routes


@r.get("/formulas/route", summary="get route")
async def get_route_r(route: str, db: Database = Depends(get_db)):
    route_record = await get_route(db, route)

    if not route_record:
        raise HTTPException(status_code=404, detail=f"Route {route} not found")

    return route_record


@r.get("/formulas/route-tree", summary="get route tree")
async def get_route_tree_r(db: Database = Depends(get_db)):
    routes = await get_routes(db)

    tree = {}
    for route in routes:
        tree[route.id] = {"route": route.route, "children": None}

    root_id = None
    for route in routes:
        if route.parent_id:
            if not tree[route.parent_id]["children"]:
                tree[route.parent_id]["children"] = [tree[route.id]]
            else:
                tree[route.parent_id]["children"].append(tree[route.id])
        else:
            root_id = route.id

    return tree[root_id]


@r.post("/formulas/routes", summary="create route")
async def create_route_r(route: str, db: Database = Depends(get_db)):
    route_record = await get_route(db, route)

    if route_record:
        return route_record

    _ = await create_route(db, route)
    route_record = await get_route(db, route)

    return route_record


@r.patch("/formulas/route", summary="rename route")
async def rename_route_r(route: str, new_route: str, db: Database = Depends(get_db)):
    route_record = await get_route(db, route)

    if not route_record:
        raise HTTPException(status_code=404, detail=f"Route {route} not found")

    new_route_record = await get_route(db, new_route)

    if new_route_record:
        raise HTTPException(status_code=409, detail=f"Route {new_route} already exists")

    await rename_route(db, route, new_route)


@r.delete("/formulas/route", summary="delete route")
async def delete_route_r(route: str, db: Database = Depends(get_db)):
    route_record = await get_route(db, route)

    if not route_record:
        raise HTTPException(status_code=404, detail=f"Route {route} not found")

    await clear_instances(db, route)
    await delete_route(db, route)


async def is_serving(endpoint):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{endpoint}/openapi.json")
            response.raise_for_status()
    except (httpx.ConnectError, httpx.HTTPStatusError, Exception):
        return False
    else:
        return True


@r.get("/formulas/services", summary="get all services")
async def get_services_r(db: Database = Depends(get_db)):
    instances = await get_instances(db)
    fid_to_services = {}

    for ins in instances:
        rid = ins.route_id
        fid = ins.formula_id

        if fid not in fid_to_services:
            fid_to_services[fid] = []

        route = await get_route_by_id(db, rid)
        fid_to_services[fid].append({"instanceId": f"{ins.formula_id}-{ins.id}", "route": route.route})

    formulas = await get_all_formulas(db)
    for formula in formulas:
        formula.services = fid_to_services.get(formula.id, [])
        formula.serving = formula.endpoint and (await is_serving(formula.endpoint))
        formula.docs = f"formula-serv/{formula.creator}/{formula.slug}/docs"

    return formulas


@r.post("/formulas/services", summary="serv a formula")
async def serv_formula_r(
    formula_id: int, request: Request, db: Database = Depends(get_db), kwargs: Dict[str, str] = {}
):
    formula = await get_formula(db, formula_id)
    endpoint = formula.endpoint
    entrypoint = formula.config.get("entrypoint")
    cfg_params = (entrypoint.get("serv") or {}).get("parameters") or {}

    params = {}
    for p, tv in cfg_params.items():
        if "default" not in tv and p not in kwargs:
            raise HTTPException(
                status_code=400, detail=f"Parameter {p}: neither default value nor runtime value provided.\n"
            )

        run_v = kwargs.get(p, tv.get("default"))

        try:
            run_v = eval(tv["type"])(run_v)
            params[p] = run_v
        except Exception:
            raise HTTPException(status_code=400, detail=f"Parameter {p}: cannot cast {run_v} into type {tv['type']}.\n")

    if endpoint and (await is_serving(endpoint)):
        return {
            "status": "serving",
            "endpoint": f"formula-serv/{formula.creator}/{formula.slug}",
            "docs": f"formula-serv/{formula.creator}/{formula.slug}/docs",
            "config": formula.config,
            "params": formula.served_params,
        }

    if formula_id not in locks:
        locks[formula_id] = Lock()

    lock = locks[formula_id]

    if not lock.acquire(blocking=False):
        return {
            "status": "launching",
            "endpoint": f"formula-serv/{formula.creator}/{formula.slug}",
            "docs": f"formula-serv/{formula.creator}/{formula.slug}/docs",
            "config": formula.config,
            "params": params,
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
        f"{str(request.url).split('?')[0]}/lock/release",
        params,
    )

    return {
        "status": "launching",
        "endpoint": f"formula-serv/{formula.creator}/{formula.slug}",
        "docs": f"formula-serv/{formula.creator}/{formula.slug}/docs",
        "config": formula.config,
        "params": params,
    }


@r.post("/formulas/services/lock/release", summary="release formula service creation lock")
async def release_lock_r(formula_id: int):
    if formula_id not in locks:
        return JSONResponse(status_code=200, content={"detail": f"lock of formula with id {formula_id} not found"})

    lock = locks[formula_id]

    if lock.locked():
        lock.release()

    return JSONResponse(status_code=200, content={"detail": f"lock of formula with id {formula_id} released"})


class WSConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        sid = f"{random.randint(1, 1e7):07d}"

        while sid in self.active_connections:
            sid = f"{random.randint(1, 1e7):07d}"

        self.active_connections[sid] = {"socket": websocket}

        return sid

    def disconnect(self, sid):
        del self.active_connections[sid]


manager = WSConnectionManager()


def _get_db(websocket: WebSocket) -> Database:
    return websocket.app.state._db


@r.websocket("/formulas/service/log")
async def get_service_log_r(websocket: WebSocket, formula_id: int, db: Database = Depends(_get_db)):
    formula = await get_formula(db, formula_id)
    log_file = os.path.join(LOGS_FD, formula.creator, f"{formula.slug}.log")

    sid = await manager.connect(websocket)
    try:
        with open(log_file, "r") as f:
            while True:
                msg = await websocket.receive_text()
                if msg == "CLOSED":
                    raise WebSocketDisconnect()

                line = f.readline()
                if not line:
                    await websocket.send_text("HEY_EASY")
                    await asyncio.sleep(0.1)
                    continue

                await websocket.send_text(line)

    except (WebSocketDisconnect, ConnectionClosedError):
        print("disconnected by client")
        manager.disconnect(sid)


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

                response = await getattr(client, method)(serv_path, headers=headers, timeout=None)
            else:
                response = await getattr(client, method)(
                    serv_path, headers=headers, data=request.stream(), timeout=None
                )
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
