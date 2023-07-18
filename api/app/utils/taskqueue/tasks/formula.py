import asyncio
import json
import os
import random
import socket
import subprocess
import time

import httpx
from databases import Database

from ....config import DATABASE_URL
from ....db.core import create_service
from ..worker import Q_FORMULA, appFormula

MIN_PORT = 50000
MAX_PORT = 65535
unassigned_ports = list(range(MIN_PORT, MAX_PORT + 1))
random.shuffle(unassigned_ports)

SERVICE_FILE = os.path.abspath("app/utils/taskqueue/tasks/service.py")
LOGS_FD = os.path.abspath("../../logs")

db = Database(DATABASE_URL)


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


async def serv_formula(formula_fd, formula, lock_release_endpoint, params, **kwargs):
    fid, title, creator, slug, version, description, config = (
        formula.get("id"),
        formula.get("title"),
        formula.get("creator"),
        formula.get("slug"),
        formula.get("version"),
        formula.get("description"),
        formula.get("config"),
    )
    entrypoint = config.get("entrypoint")
    main, app = (
        entrypoint.get("main", "main.py"),
        entrypoint.get("serv", {}).get("app"),
    )

    os.makedirs(os.path.join(LOGS_FD, creator), exist_ok=True)
    log_file = open(os.path.join(LOGS_FD, creator, f"{slug}.log"), "w")

    log_file.write(json.dumps(formula, indent=2))
    log_file.write("\n")

    log_file.write(json.dumps(params, indent=2))
    log_file.write("\n")

    log_file.flush()

    port = random_port()
    serv_cmd = (
        f"python {SERVICE_FILE}"
        f" --main={main}"
        f" --app={app}"
        f" --port={port}"
        f" --title='{title}'"
        f" --creator={creator}"
        f" --slug={slug}"
        f" --version={version}"
        f" --description='{description}'"
        f" --params_str='{json.dumps(params)}'"
    )

    with log_file:
        _ = subprocess.Popen(serv_cmd, shell=True, stdout=log_file, stderr=log_file, cwd=formula_fd)

        await db.connect()
        await create_service(db, fid, f"http://localhost:{port}")
        await db.disconnect()

        # release formula creation lock after a delay to prevent spinning up
        # multiple services for the same formula
        time.sleep(2)
        async with httpx.AsyncClient() as client:
            await client.post(f"{lock_release_endpoint}?formula_id={fid}")


@appFormula.task(bind=True, acks_later=True, queue=Q_FORMULA)
def serv_formula_t(self, *args, **kwargs):
    return asyncio.run(serv_formula(*args, **kwargs, current_task_ref=self))
