import os
import random
import socket

import yaml
from fastapi import APIRouter

formula_router = r = APIRouter(tags=["Formula"])


MIN_PORT = 50000
MAX_PORT = 65535
unassigned_ports = list(range(MIN_PORT, MAX_PORT + 1))
random.shuffle(unassigned_ports)


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


@r.get("/formulas", summary="get available formulas")
async def get_formulas():
    return {"formula": "z = x + iy"}


@r.get("/formulas/installed", summary="get installed formulas")
async def get_installed_formulas():
    formulas = [
        {
            "id": 1,
            "title": "Category distribution",
            "slug": "category-distribution",
            "description": (
                "A quick visual summary of how the data is distributed across the categories in the dataset. It can"
                " reveal imbalances or other patterns in the data that may be useful to know for training machine"
                " learning models."
            ),
        },
        {
            "id": 2,
            "title": "Size distribution",
            "slug": "size-distribution",
            "description": (
                "Image size distribution and box size distribution help detecting erratic images and annotations in the"
                " dataset."
            ),
        },
        {
            "id": 3,
            "title": "Annotation tracker",
            "slug": "annotation-tracker",
            "description": "Manage annotation progress and discover quality issues as early as possible.",
        },
        {
            "id": 4,
            "title": "Hirarchical category treeview",
            "slug": "hirarchical-category-treeview",
            "description": (
                "Using tree / treemap representation to understand and navigate category taxonomy, discover imbalance"
                " issue in the dataset."
            ),
        },
    ]

    return formulas


@r.post("/formulas/installed", summary="install a formula")
async def install_formula(creator, slug, version):
    pass


@r.get("/formulas/instances", summary="get formula instances")
async def get_formulas_instances():
    pass


@r.post("/formulas/instances", summary="instantiate a formula")
async def instantiate_formula(creator, slug):
    zit_root = os.path.abspath("../..")
    formula_fd = os.path.join(zit_root, "formulas", creator, slug)
    cfg = yaml.safe_load(open(os.path.join(formula_fd, "config.yaml"), "rb"))

    if cfg.get("ui"):
        # if ui exists, start serving it
        pass

    return cfg
