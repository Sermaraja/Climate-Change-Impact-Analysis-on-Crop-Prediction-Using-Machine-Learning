from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.models.soil import SoilProfile
from app.schemas.soil import SoilProfileCreate, SoilProfileUpdate, SoilProfileResponse
from app.services.auth_service import get_current_user
from app.services.soil_provider import soil_provider, SOIL_TYPE_PRESETS

router = APIRouter(prefix="/farms", tags=["Soil Profiles"])


@router.get("/{farm_id}/soil", response_model=SoilProfileResponse)
def get_farm_soil_profile(
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

    existing_profile = db.query(SoilProfile).filter(SoilProfile.farm_id == farm_id).first()
    return soil_provider.resolve_soil_profile(
        farm_id=farm_id,
        existing_profile=existing_profile,
        latitude=farm.latitude,
        longitude=farm.longitude,
        state=farm.state
    )


@router.post("/{farm_id}/soil", response_model=SoilProfileResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_soil_profile(
    farm_id: int,
    payload: SoilProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found or access denied."
        )

    # Auto-fill preset texture values if farmer selected preset soil_type and didn't provide textures
    sand = payload.sand_percentage
    silt = payload.silt_percentage
    clay = payload.clay_percentage
    ph = payload.ph
    oc = payload.organic_carbon
    bd = payload.bulk_density

    if payload.soil_type in SOIL_TYPE_PRESETS:
        preset = SOIL_TYPE_PRESETS[payload.soil_type]
        if sand is None: sand = preset["sand_percentage"]
        if silt is None: silt = preset["silt_percentage"]
        if clay is None: clay = preset["clay_percentage"]
        if ph is None: ph = preset["ph"]
        if oc is None: oc = preset["organic_carbon"]
        if bd is None: bd = preset["bulk_density"]

    existing = db.query(SoilProfile).filter(SoilProfile.farm_id == farm_id).first()
    if existing:
        existing.soil_type = payload.soil_type
        existing.sand_percentage = sand
        existing.silt_percentage = silt
        existing.clay_percentage = clay
        existing.ph = ph
        existing.organic_carbon = oc
        existing.bulk_density = bd
        existing.soil_source = payload.soil_source
        existing.notes = payload.notes
        profile = existing
    else:
        profile = SoilProfile(
            farm_id=farm_id,
            soil_type=payload.soil_type,
            sand_percentage=sand,
            silt_percentage=silt,
            clay_percentage=clay,
            ph=ph,
            organic_carbon=oc,
            bulk_density=bd,
            soil_source=payload.soil_source,
            notes=payload.notes,
        )
        db.add(profile)

    db.commit()
    db.refresh(profile)

    return soil_provider.resolve_soil_profile(
        farm_id=farm_id,
        existing_profile=profile,
        latitude=farm.latitude,
        longitude=farm.longitude,
        state=farm.state
    )


@router.put("/{farm_id}/soil", response_model=SoilProfileResponse)
def update_soil_profile(
    farm_id: int,
    payload: SoilProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found or access denied."
        )

    profile = db.query(SoilProfile).filter(SoilProfile.farm_id == farm_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No soil profile found for this farm to update."
        )

    if payload.soil_type is not None:
        profile.soil_type = payload.soil_type
    if payload.sand_percentage is not None:
        profile.sand_percentage = payload.sand_percentage
    if payload.silt_percentage is not None:
        profile.silt_percentage = payload.silt_percentage
    if payload.clay_percentage is not None:
        profile.clay_percentage = payload.clay_percentage
    if payload.ph is not None:
        profile.ph = payload.ph
    if payload.organic_carbon is not None:
        profile.organic_carbon = payload.organic_carbon
    if payload.bulk_density is not None:
        profile.bulk_density = payload.bulk_density
    if payload.soil_source is not None:
        profile.soil_source = payload.soil_source
    if payload.notes is not None:
        profile.notes = payload.notes

    db.commit()
    db.refresh(profile)

    return soil_provider.resolve_soil_profile(
        farm_id=farm_id,
        existing_profile=profile,
        latitude=farm.latitude,
        longitude=farm.longitude,
        state=farm.state
    )
