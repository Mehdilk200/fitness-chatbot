from fastapi import APIRouter, Query
from typing import List
from db.schemas import Exercise
from routes.crud import search_exercises

router = APIRouter(prefix="/api/exercises", tags=["exercises"])

@router.get("/search", response_model=List[Exercise])
async def search_exercise_endpoint(
    muscle: str = Query(None, description="Muscle ciblé"),
    body_part: str = Query(None, description="Partie du corps"),
    equipment: str = Query(None, description="Équipement requis"),
    limit: int = Query(10, description="Nombre max de résultats")
):
   
    exercises = await search_exercises(muscle=muscle, body_part=body_part, equipment=equipment, limit=limit)
    return exercises
