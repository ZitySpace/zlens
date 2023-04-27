from databases import Database
from fastapi import FastAPI, Request
from loguru import logger

from ..config import DATABASE_URL


async def connect_to_db(app: FastAPI) -> None:
    database = Database(DATABASE_URL)

    try:
        if hasattr(app.state, "_db"):
            logger.info("--- DB object already exists! ---")
            return
        await database.connect()
        app.state._db = database
        logger.info("--- DB connected! ---")
    except Exception as e:
        logger.warning("--- DB Connection Error ---")
        logger.warning(e)

    await logger.complete()


async def close_db_connection(app: FastAPI) -> None:
    try:
        if not hasattr(app.state, "_db"):
            logger.info("--- DB object does not exist, shutting down ... ---")
        await app.state._db.disconnect()
        logger.info("--- DB disconnected! ---")
    except Exception as e:
        logger.warning("--- DB Disconnect Error ---")
        logger.warning(e)

    await logger.complete()


def get_db(request: Request) -> Database:
    return request.app.state._db
