import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from routes.auth import get_current_user
from db.schemas import UserProfile, UserProfileUpdate
from routes.crud import get_profile, create_or_update_profile
from services.r2_upload import upload_to_r2

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


_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    file_bytes = await file.read()
    content_type = file.content_type or "image/jpeg"

    r2_url = await upload_to_r2(file_bytes, file.filename, content_type)
    if r2_url:
        avatar_url = r2_url
    else:
        uploads_dir = os.path.join(_BACKEND_DIR, "uploads")
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir)
        ext = os.path.splitext(file.filename)[1]
        filename = f"avatar_{user_id}{ext}"
        file_path = os.path.join(uploads_dir, filename)
        with open(file_path, "wb") as buffer:
            buffer.write(file_bytes)
        avatar_url = f"/uploads/{filename}"

    await create_or_update_profile(user_id, {"avatar_url": avatar_url})
    return {"avatar_url": avatar_url}
