import argparse
import importlib
import os
import sys

from databases import Database
from fastapi.openapi.utils import get_openapi
from uvicorn import Config, Server


def make_service(
    main_: str,
    app_: str,
    port: int,
    title: str,
    creator: str,
    slug: str,
    version: str,
    description: str,
    params_str: str,
):
    sys.path.insert(0, ".")

    try:
        os.environ["PARAMS_STR"] = params_str
        main = importlib.import_module(os.path.splitext(main_)[0])
        app = getattr(main, app_)

        app.title = f"{title} ({creator}/{slug})"
        app.version = version
        app.description = description
        app.setup()

        db = Database("sqlite:///../../../zit.sqlite")

        @app.post("/kill")
        async def kill():
            server.should_exit = True
            server.force_exit = True
            await server.shutdown()

            await db.connect()
            query = "UPDATE formulas SET endpoint = :endpoint WHERE creator = :creator AND slug = :slug"
            await db.execute(query=query, values={"endpoint": None, "creator": creator, "slug": slug})
            await db.disconnect()

        def patched_openapi():
            if app.openapi_schema:
                return app.openapi_schema

            openapi_schema = get_openapi(
                title=app.title,
                version=app.version,
                description=app.description,
                routes=app.routes,
                servers=app.servers,
            )

            app.openapi_schema = openapi_schema
            return app.openapi_schema

        app.openapi = patched_openapi

        config = Config(app=app, port=port, lifespan="off", root_path=f"/formula-serv/{creator}/{slug}")
        server = Server(config=config)
        server.run()

    except Exception as err:
        print(f"MakeServiceError: {err}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="The script to serv lambda as service given lambda serv config")
    parser.add_argument("--main", type=str, required=True)
    parser.add_argument("--app", type=str, required=True)
    parser.add_argument("--port", type=int, required=True)
    parser.add_argument("--title", type=str, required=True)
    parser.add_argument("--creator", type=str, required=True)
    parser.add_argument("--slug", type=str, required=True)
    parser.add_argument("--version", type=str, required=True)
    parser.add_argument("--description", type=str, required=True)
    parser.add_argument("--params_str", type=str, default="{}")
    args = parser.parse_args()

    make_service(
        args.main,
        args.app,
        args.port,
        args.title,
        args.creator,
        args.slug,
        args.version,
        args.description,
        args.params_str,
    )
