from typing import Callable

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from ..db.connect import close_db_connection, connect_to_db
from .routes.formula import formula_router, formula_serv_router, formula_ui_router


def create_start_app_handler(app: FastAPI) -> Callable:
    async def start_app() -> None:
        await connect_to_db(app)

    return start_app


def create_stop_app_handler(app: FastAPI) -> Callable:
    async def stop_app() -> None:
        await close_db_connection(app)

    return stop_app


def get_application():
    app = FastAPI(title="ZLens API", docs_url="/api/docs", openapi_url="/api/openapi.json")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_event_handler("startup", create_start_app_handler(app))
    app.add_event_handler("shutdown", create_stop_app_handler(app))

    app.mount("/static", StaticFiles(directory="static"), name="static")

    app.include_router(formula_router, prefix="/api")
    app.include_router(formula_ui_router, prefix="/formula-ui")
    app.include_router(formula_serv_router, prefix="/formula-serv")

    return app


app = get_application()
