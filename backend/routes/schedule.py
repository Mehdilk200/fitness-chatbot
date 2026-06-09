from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from bson.errors import InvalidId
from routes.auth import get_current_user
from db.schemas import ScheduleItem, ScheduleCreate, ScheduleUpdate
from routes.crud import (
    create_schedule_item, 
    get_user_schedule, 
    update_schedule_item, 
    delete_schedule_item
)

router = APIRouter(prefix="/api/schedule", tags=["schedule"])

@router.get("", response_model=List[ScheduleItem])
async def read_schedule(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    return await get_user_schedule(user_id)

@router.post("", response_model=ScheduleItem, status_code=status.HTTP_201_CREATED)
async def add_schedule_item(
    item: ScheduleCreate, 
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    return await create_schedule_item(user_id, item.dict())

@router.put("/{item_id}")
async def update_item(
    item_id: str,
    data: ScheduleUpdate,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    try:
        ObjectId(item_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    
    success = await update_schedule_item(item_id, user_id, update_data)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Updated successfully"}

@router.delete("/{item_id}")
async def delete_item(
    item_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    
    try:
        ObjectId(item_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    
    success = await delete_schedule_item(item_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Deleted successfully"}
