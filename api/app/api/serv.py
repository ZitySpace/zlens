from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.formula import formula_router


def get_application():
    app = FastAPI(title="ZLens API", docs_url="/api/docs", openapi_url="/api/openapi.json")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(formula_router, prefix="/api")

    return app


app = get_application()
