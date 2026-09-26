from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.schemas.farm import FarmCreate, FarmUpdate, FarmResponse
from app.services.auth_service import get_current_user
from app.services.farm_service import geojson_to_geometry, farm_to_response

router = APIRouter(prefix="/farms", tags=["Farms"])


@router.post("", response_model=FarmResponse, status_code=status.HTTP_201_CREATED)
def create_farm(
    payload: FarmCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    is_sqlite = db.bind.dialect.name == "sqlite"
    boundary_geom = geojson_to_geometry(payload.boundary_geojson, is_sqlite=is_sqlite)

    farm = Farm(
        user_id=current_user.id,
        farm_name=payload.farm_name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        boundary=boundary_geom,
        area_acres=payload.area_acres,
        state=payload.state,
        district=payload.district,
        village=payload.village,
        drainage_class=payload.drainage_class,
    )
    db.add(farm)
    db.commit()
    db.refresh(farm)

    return farm_to_response(farm)


@router.get("", response_model=List[FarmResponse])
def list_user_farms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    farms = db.query(Farm).filter(Farm.user_id == current_user.id).order_by(Farm.created_at.desc()).all()
    return [farm_to_response(f) for f in farms]


@router.get("/{farm_id}", response_model=FarmResponse)
def get_farm_details(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found or access denied."
        )
    return farm_to_response(farm)


@router.put("/{farm_id}", response_model=FarmResponse)
def update_farm(
    farm_id: int,
    payload: FarmUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found or access denied."
        )

    is_sqlite = db.bind.dialect.name == "sqlite"

    if payload.farm_name is not None:
        farm.farm_name = payload.farm_name
    if payload.latitude is not None:
        farm.latitude = payload.latitude
    if payload.longitude is not None:
        farm.longitude = payload.longitude
    if payload.boundary_geojson is not None:
        farm.boundary = geojson_to_geometry(payload.boundary_geojson, is_sqlite=is_sqlite)
    if payload.area_acres is not None:
        farm.area_acres = payload.area_acres
    if payload.state is not None:
        farm.state = payload.state
    if payload.district is not None:
        farm.district = payload.district
    if payload.village is not None:
        farm.village = payload.village
    if payload.drainage_class is not None:
        farm.drainage_class = payload.drainage_class

    db.commit()
    db.refresh(farm)

    return farm_to_response(farm)


@router.delete("/{farm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farm(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found or access denied."
        )

    db.delete(farm)
    db.commit()
    return None


# --- Farm Crop Endpoints (Stage 5) ---
from app.models.crop import Crop, CropVariety, FarmCrop
from app.schemas.crop import FarmCropCreate, FarmCropUpdate, FarmCropResponse
from app.services.crop_service import farm_crop_to_response


@router.post("/{farm_id}/crop", response_model=FarmCropResponse, status_code=status.HTTP_201_CREATED)
def assign_crop_to_farm(
    farm_id: int,
    payload: FarmCropCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found or access denied."
        )

    crop = db.query(Crop).filter(Crop.id == payload.crop_id).first()
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Crop ID {payload.crop_id} does not exist in master catalog."
        )

    if payload.variety_id:
        variety = db.query(CropVariety).filter(
            CropVariety.id == payload.variety_id,
            CropVariety.crop_id == payload.crop_id
        ).first()
        if not variety:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Variety ID {payload.variety_id} is invalid for crop '{crop.name}'."
            )

    # Deactivate existing active crops for this farm
    existing_crops = db.query(FarmCrop).filter(
        FarmCrop.farm_id == farm_id,
        FarmCrop.is_active == True
    ).all()
    for ex_crop in existing_crops:
        ex_crop.is_active = False

    farm_crop = FarmCrop(
        farm_id=farm_id,
        crop_id=payload.crop_id,
        variety_id=payload.variety_id,
        planting_date=payload.planting_date,
        season=payload.season,
        user_stage_override=payload.user_stage_override,
        status="ACTIVE",
        is_active=True,
    )

    db.add(farm_crop)
    db.commit()
    db.refresh(farm_crop)

    return farm_crop_to_response(db, farm_crop)


@router.get("/{farm_id}/crop", response_model=FarmCropResponse)
def get_farm_crop(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found or access denied."
        )

    farm_crop = (
        db.query(FarmCrop)
        .filter(FarmCrop.farm_id == farm_id, FarmCrop.is_active == True)
        .order_by(FarmCrop.created_at.desc())
        .first()
    )

    if not farm_crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active crop registered for this farm."
        )

    return farm_crop_to_response(db, farm_crop)


@router.put("/{farm_id}/crop", response_model=FarmCropResponse)
def update_farm_crop(
    farm_id: int,
    payload: FarmCropUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found or access denied."
        )

    farm_crop = (
        db.query(FarmCrop)
        .filter(FarmCrop.farm_id == farm_id, FarmCrop.is_active == True)
        .order_by(FarmCrop.created_at.desc())
        .first()
    )

    if not farm_crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active crop to update for this farm."
        )

    if payload.crop_id is not None:
        crop = db.query(Crop).filter(Crop.id == payload.crop_id).first()
        if not crop:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Crop ID {payload.crop_id} does not exist in master catalog."
            )
        farm_crop.crop_id = payload.crop_id

    if payload.variety_id is not None:
        if payload.variety_id != 0:
            variety = db.query(CropVariety).filter(
                CropVariety.id == payload.variety_id,
                CropVariety.crop_id == farm_crop.crop_id
            ).first()
            if not variety:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Variety ID {payload.variety_id} is invalid for crop ID {farm_crop.crop_id}."
                )
            farm_crop.variety_id = payload.variety_id
        else:
            farm_crop.variety_id = None

    if payload.planting_date is not None:
        farm_crop.planting_date = payload.planting_date

    if payload.season is not None:
        farm_crop.season = payload.season

    if payload.status is not None:
        farm_crop.status = payload.status

    if payload.user_stage_override is not None:
        farm_crop.user_stage_override = payload.user_stage_override if payload.user_stage_override.strip() != "" else None

    db.commit()
    db.refresh(farm_crop)

    return farm_crop_to_response(db, farm_crop)

