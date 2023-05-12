import json
import os

from databases import Database
from fastapi import APIRouter, Depends, Form
from fastapi.responses import FileResponse

from ...db.connect import get_db
from ...db.core import (
    clear_instances,
    create_instances,
    create_route,
    get_all_formulas,
    get_formula,
    get_instances,
    get_route,
)

formula_router = r = APIRouter(tags=["Formula"])

FORMULAS_FD = os.path.abspath("../../formulas")


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


@r.post("/formulas/services", summary="serv a formula")
async def serv_formula_r(formula_id: int, db: Database = Depends(get_db)):
    formula = await get_formula(db, formula_id)
    print(formula)


formula_ui_router = r_ui = APIRouter(tags=["Formula UI"])


@r_ui.get("/{creator}/{slug}/{file_path:path}")
async def get_formula_ui(creator: str, slug: str, file_path: str):
    formula_fd = os.path.join(FORMULAS_FD, creator, slug)

    return FileResponse(os.path.join(formula_fd, file_path))
