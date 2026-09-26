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
