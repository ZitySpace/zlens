from celery.result import AsyncResult

from .tasks.formula import serv_formula_t


def get_task_progress(task_id):
    result = AsyncResult(task_id)

    return result.info
