from fastapi import APIRouter

formula_router = r = APIRouter(tags=["Formula"])


@r.get("/formulas", summary="get list of formulas")
def get_formulas():
    return {"formula": "z = x + iy"}
