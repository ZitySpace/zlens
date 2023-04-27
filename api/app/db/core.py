import os
from typing import List

from databases import Database
from sqlalchemy import delete, insert, select

from .schemas import FormulasTable, InstancesTable, RoutesTable


async def get_instances(db: Database, route: str):
    query = select([InstancesTable]).where(InstancesTable.route.has(route=route))

    instances = await db.fetch_all(query)
    return instances


async def create_instance(db: Database, instance: dict):
    query = insert(InstancesTable).values(**instance)

    return await db.execute(query)


async def create_instances(db: Database, instances: List[dict]):
    query = insert(InstancesTable)

    await db.execute_many(query, instances)


async def clear_all_instances(db: Database):
    query = delete(InstancesTable)

    await db.execute(query)


async def get_route(db: Database, route: str):
    query = select([RoutesTable]).where(RoutesTable.route == route)

    return await db.fetch_one(query)


async def create_route(db: Database, route: str):
    parent_record = await get_route(db, os.path.dirname(route))
    parent_id = parent_record.id if parent_record else None

    query = insert(RoutesTable).values(route=route, parent_id=parent_id)

    return await db.execute(query)


async def get_formula(db: Database, id: int):
    query = select([FormulasTable]).where(FormulasTable.id == id)

    formulas = await db.fetch_one(query)
    return formulas


async def create_formula(db: Database, formula: dict):
    query = insert(FormulasTable).values(**formula)

    return await db.execute(query)


async def get_all_formulas(db: Database):
    query = select([FormulasTable])

    formulas = await db.fetch_all(query)
    return formulas


async def create_formulas(db: Database, formulas: List[dict]):
    query = insert(FormulasTable)

    await db.execute_many(query, formulas)
