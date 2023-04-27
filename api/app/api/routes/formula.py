import json
import os
import random
import socket
from datetime import datetime

import yaml
from databases import Database
from fastapi import APIRouter, Depends, Form

from ...db.connect import get_db
from ...db.core import (
    clear_all_instances,
    create_formulas,
    create_instances,
    create_route,
    get_all_formulas,
    get_formula,
    get_instances,
    get_route,
)

formula_router = r = APIRouter(tags=["Formula"])


MIN_PORT = 50000
MAX_PORT = 65535
unassigned_ports = list(range(MIN_PORT, MAX_PORT + 1))
random.shuffle(unassigned_ports)

FORMULAS_FD = os.path.abspath("../../formulas")


# formula utility functions
def _try_port(port):
    with socket.socket() as s:
        try:
            s.bind(("", port))
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            return port
        except OSError:
            return None


def random_port():
    global unassigned_ports

    def _try_ports():
        for idx, port in enumerate(unassigned_ports):
            if _try_port(port) is not None:
                return idx, port
        return None, None

    idx, port = _try_ports()

    if not port:
        unassigned_ports = list(set(range(MIN_PORT, MAX_PORT + 1)) - set(unassigned_ports))
        idx, port = _try_ports()

    if idx:
        unassigned_ports.pop(idx)

    return port


@r.get("/formulas/installed", summary="get installed formulas")
async def get_installed_formulas_r(db: Database = Depends(get_db)):
    # formulas = [
    #     {
    #         "id": 1,
    #         "title": "Category distribution",
    #         "slug": "category-distribution",
    #         "version": "0.0.1",
    #         "creator": "zityspace",
    #         "author": "zheng rui",
    #         "description": (
    #             "A quick visual summary of how the data is distributed across the categories in the dataset. It can"
    #             " reveal imbalances or other patterns in the data that may be useful to know for training machine"
    #             " learning models."
    #         ),
    #     },
    #     {
    #         "id": 2,
    #         "title": "Size distribution",
    #         "slug": "size-distribution",
    #         "version": "0.0.1",
    #         "creator": "zityspace",
    #         "author": "zheng rui",
    #         "description": (
    #             "Image size distribution and box size distribution help detecting erratic images and annotations "
    #             " in the dataset."
    #         ),
    #     },
    #     {
    #         "id": 3,
    #         "title": "Annotation tracker",
    #         "slug": "annotation-tracker",
    #         "version": "0.0.1",
    #         "creator": "zityspace",
    #         "author": "zheng rui",
    #         "description": "Manage annotation progress and discover quality issues as early as possible.",
    #     },
    #     {
    #         "id": 4,
    #         "title": "Hirarchical category treeview",
    #         "slug": "hirarchical-category-treeview",
    #         "version": "0.0.1",
    #         "creator": "zityspace",
    #         "author": "zheng rui",
    #         "description": (
    #             "Using tree / treemap representation to understand and navigate category taxonomy, discover imbalance"
    #             " issue in the dataset."
    #         ),
    #     },
    # ]

    # now = datetime.now().replace(microsecond=0)
    # for fm in formulas:
    #     fm['installed_at'] = now
    #     fm['updated_at'] = now

    # await create_formulas(db, formulas)

    formulas = await get_all_formulas(db)
    return formulas


@r.post("/formulas/installed", summary="install a formula")
async def install_formula_r(creator, slug, version):
    pass


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
                "visible": ins.visible,
                "instanceId": f"{ins.formula_id}-{ins.id}",
                "version_matched": ins.version == formula.version,
            }
        )

    return instances


@r.post("/formulas/instantiation", summary="instantiate a formula")
async def instantiate_formula_r(formula: str = Form(...), db: Database = Depends(get_db)):
    formula_ = json.loads(formula)
    creator, slug = formula_.get("creator"), formula_.get("slug")
    formula_fd = os.path.join(FORMULAS_FD, creator, slug)
    cfg = yaml.safe_load(open(os.path.join(formula_fd, "config.yaml"), "rb"))

    if cfg.get("ui"):
        # if ui exists, start serving it
        pass

    return cfg


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

    await clear_all_instances(db)
    await create_instances(db, instances_)
