from datetime import date
from sqlalchemy.orm import Session
from app.models.crop import Crop, CropVariety, CropGrowthStage, FarmCrop
from app.schemas.crop import FarmCropResponse


def calculate_crop_age_days(planting_date: date) -> int:
    today = date.today()
    delta = (today - planting_date).days
    return max(0, delta)


def estimate_growth_stage(db: Session, crop_id: int, crop_age_days: int) -> str:
    stages = (
        db.query(CropGrowthStage)
        .filter(CropGrowthStage.crop_id == crop_id)
        .order_by(CropGrowthStage.stage_order.asc())
        .all()
    )
    if not stages:
        return "Vegetative"

    for stage in stages:
        if stage.min_age_days <= crop_age_days <= stage.max_age_days:
            return stage.stage_name

    # If younger than min age of first stage
    if crop_age_days < stages[0].min_age_days:
        return stages[0].stage_name

    # If older than max age of last stage
    if crop_age_days > stages[-1].max_age_days:
        return f"{stages[-1].stage_name} (Mature / Post-Harvest)"

    return stages[0].stage_name


def farm_crop_to_response(db: Session, farm_crop: FarmCrop) -> FarmCropResponse:
    crop_age_days = calculate_crop_age_days(farm_crop.planting_date)
    estimated_stage = estimate_growth_stage(db, farm_crop.crop_id, crop_age_days)
    
    crop = db.query(Crop).filter(Crop.id == farm_crop.crop_id).first()
    crop_name = crop.name if crop else "Unknown"
    scientific_name = crop.scientific_name if crop else None

    variety_name = None
    if farm_crop.variety_id:
        variety = db.query(CropVariety).filter(CropVariety.id == farm_crop.variety_id).first()
        variety_name = variety.variety_name if variety else None

    confirmed_stage = farm_crop.user_stage_override
    effective_stage = confirmed_stage if confirmed_stage else estimated_stage

    return FarmCropResponse(
        id=farm_crop.id,
        farm_id=farm_crop.farm_id,
        crop_id=farm_crop.crop_id,
        crop_name=crop_name,
        scientific_name=scientific_name,
        variety_id=farm_crop.variety_id,
        variety_name=variety_name,
        planting_date=farm_crop.planting_date,
        crop_age_days=crop_age_days,
        estimated_growth_stage=estimated_stage,
        confirmed_growth_stage=confirmed_stage,
        growth_stage=effective_stage,
        season=farm_crop.season,
        status=farm_crop.status,
        is_active=farm_crop.is_active,
        created_at=farm_crop.created_at,
        updated_at=farm_crop.updated_at,
    )
