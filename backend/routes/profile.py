from fastapi import APIRouter, Depends, HTTPException
from routes.auth import get_current_user
from db.schemas import UserProfile, UserProfileUpdate
from routes.crud import get_profile, create_or_update_profile

router = APIRouter(prefix="/api/profile", tags=["profile"])


_REQUIRED_FIELDS = {"age", "weight_kg", "height_cm", "gender", "goal"}

@router.get("/me", response_model=UserProfile)
async def read_profile(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    profile = await get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile non trouvé")
    return profile

@router.post("/update", response_model=UserProfile)
async def update_user_profile(
    data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    
    update_data = {k: v for k, v in data.dict().items() if v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="Aucun champ à mettre à jour")

    
    existing = await get_profile(user_id)
    if not existing:
        missing = _REQUIRED_FIELDS - set(update_data.keys())
        if missing:
            raise HTTPException(
                status_code=422,
                detail=f"Champs obligatoires manquants pour créer le profil : {', '.join(missing)}"
            )

    updated_profile = await create_or_update_profile(user_id, update_data)
    return updated_profile
