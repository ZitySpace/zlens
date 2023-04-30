import asyncio
import random
import socket

from loguru import logger

from ..worker import Q_FORMULA, appFormula

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


async def serv_ui(formula_fd, ui, **kwargs):
    pass


@appFormula.task(bind=True, acks_later=True, queue=Q_FORMULA)
def serv_ui_t(self, *args, **kwargs):
    return asyncio.run(serv_ui(*args, **kwargs, current_task_ref=self))
