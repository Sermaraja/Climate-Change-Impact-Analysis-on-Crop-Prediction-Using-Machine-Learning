from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.crop import Crop
from app.schemas.crop import CropResponse

router = APIRouter(prefix="/crops", tags=["Master Crops"])


@router.get("", response_model=List[CropResponse])
def get_master_crops(db: Session = Depends(get_db)):
    crops = db.query(Crop).order_by(Crop.name.asc()).all()
    return crops


@router.get("/{crop_id}", response_model=CropResponse)
def get_crop_details(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found.")
    return crop
