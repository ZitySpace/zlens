import json
import os
from datetime import datetime
from typing import List

from databases import Database
from sqlalchemy import and_, delete, insert, select, update

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


async def clear_instances(db: Database, route: str):
    query = delete(InstancesTable).where(InstancesTable.route.has(route=route))

    await db.execute(query)


async def get_route(db: Database, route: str):
    query = select([RoutesTable]).where(RoutesTable.route == route)

    return await db.fetch_one(query)


async def get_routes(db: Database):
    query = select([RoutesTable])

    return await db.fetch_all(query)


async def create_route(db: Database, route: str):
    parent_record = await get_route(db, os.path.dirname(route))
    parent_id = parent_record.id if parent_record else None

    query = insert(RoutesTable).values(route=route, parent_id=parent_id)

    return await db.execute(query)


async def get_children_routes(db: Database, route_id: str):
    query = select([RoutesTable]).where(RoutesTable.parent_id == route_id)

    return await db.fetch_all(query)


async def rename_route(db: Database, route: str, new_route: str):
    record = await get_route(db, route)
    query = update(RoutesTable).where(RoutesTable.id == record.id).values(route=new_route)
    await db.execute(query)

    query = select([RoutesTable]).where(RoutesTable.route.like(f"{route}/%"))
    route_records = await db.fetch_all(query)

    for record in route_records:
        query = (
            update(RoutesTable).where(RoutesTable.id == record.id).values(route=record.route.replace(route, new_route))
        )
        await db.execute(query)


async def delete_route(db: Database, route: str):
    record = await get_route(db, route)
    query = delete(RoutesTable).where(RoutesTable.id == record.id)
    await db.execute(query)
    await clear_instances(db, record.route)

    query = select([RoutesTable]).where(RoutesTable.route.like(f"{route}/%"))
    route_records = await db.fetch_all(query)

    for record in route_records:
        query = delete(RoutesTable).where(RoutesTable.id == record.id)
        await db.execute(query)
        await clear_instances(db, record.route)


async def get_formula(db: Database, id: int):
    query = select([FormulasTable]).where(FormulasTable.id == id)

    formula = await db.fetch_one(query)

    formula_ = FormulasTable(**formula)
    formula_.config = json.loads(formula.config)
    return formula_


async def get_formula_by_creator_slug(db: Database, creator: str, slug: str):
    query = select([FormulasTable]).where(and_(FormulasTable.creator == creator, FormulasTable.slug == slug))

    formula = await db.fetch_one(query)

    formula_ = FormulasTable(**formula)
    formula_.config = json.loads(formula.config)
    return formula_


async def create_formula(db: Database, formula: dict):
    query = insert(FormulasTable).values(**formula)

    return await db.execute(query)


async def get_all_formulas(db: Database):
    query = select([FormulasTable])

    formulas = await db.fetch_all(query)
    formulas_ = []
    for formula in formulas:
        formula_ = FormulasTable(**formula)
        formula_.config = json.loads(formula.config)
        formulas_.append(formula_)

    return formulas_


async def create_formulas(db: Database, formulas: List[dict]):
    query = insert(FormulasTable)

    await db.execute_many(query, formulas)


async def create_service(db: Database, formula_id: int, endpoint: str):
    now = datetime.now().replace(microsecond=0)
    query = update(FormulasTable).where(FormulasTable.id == formula_id).values(endpoint=endpoint, served_at=now)

    await db.execute(query)
