"""
Seed Demo Farmers for CropClimate AI
=====================================
Creates 3 demo users with 10 farms total for development/demo purposes.

Users:
  - Veeramani (veeramani@gmail.com)       → 4 farms in Madurai
  - Manikandan (manikandan@gmail.com)     → 2 farms in Theni
  - Narisimman (narsi.farmer@gmail.com)   → 4 farms in Madurai

Idempotent: safe to run multiple times without duplicating data.
"""

import sys
import logging
from datetime import date, timedelta
from pathlib import Path

# Ensure app is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from geoalchemy2.elements import WKTElement
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import (
    User, Farm, Crop, CropVariety, CropGrowthStage, FarmCrop, SoilProfile,
)
from app.models.enums import SoilSourceEnum
from app.services.auth_service import hash_password

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("seed_demo_farmers")

# ─────────────────────────────────────────────────────────────
# DEMO PASSWORD (hashed at runtime via bcrypt)
# ─────────────────────────────────────────────────────────────
DEMO_PASSWORD = "123456789"

# ─────────────────────────────────────────────────────────────
# DEMO USER DEFINITIONS
# ─────────────────────────────────────────────────────────────
DEMO_USERS = [
    {
        "email": "veeramani@gmail.com",
        "full_name": "Veeramani",
        "phone": "+91-9876543210",
    },
    {
        "email": "manikandan@gmail.com",
        "full_name": "Manikandan",
        "phone": "+91-9876543211",
    },
    {
        "email": "narsi.farmer@gmail.com",
        "full_name": "Narisimman",
        "phone": "+91-9876543212",
    },
]

# ─────────────────────────────────────────────────────────────
# DEMO FARM DEFINITIONS
# Coordinates are DEMO synthetic polygons, NOT real farmer land.
# Format: [longitude, latitude] per PostGIS/GeoJSON convention.
# Non-overlapping small polygons within each district.
# ─────────────────────────────────────────────────────────────

# Madurai approximate center: 9.9252° N, 78.1198° E
# Theni approximate center:   10.0104° N, 77.4769° E

DEMO_FARMS = {
    "veeramani@gmail.com": [
        {
            "farm_name": "Veeramani Vaigai Farm",
            "lat": 9.9350,
            "lon": 78.1100,
            "acres": 5.0,
            "district": "Madurai",
            "village": "Vaigai Nagar",
            "drainage": "MODERATE",
            "crop_name": "Paddy",
            "variety_name": "BPT 5204 (Samba Mahsuri)",
            "planting_days_ago": 35,   # Tillering & Vegetative stage
            "season": "Samba",
            "soil": {"type": "Alluvial Clay Loam", "sand": 20.0, "silt": 45.0, "clay": 35.0, "ph": 7.2, "organic_carbon": 0.65, "bulk_density": 1.35},
            "poly": "POLYGON((78.1080 9.9330, 78.1120 9.9330, 78.1120 9.9370, 78.1080 9.9370, 78.1080 9.9330))",
        },
        {
            "farm_name": "Veeramani Green Field",
            "lat": 9.9450,
            "lon": 78.1250,
            "acres": 3.5,
            "district": "Madurai",
            "village": "Thirupparankundram",
            "drainage": "POOR",
            "crop_name": "Banana",
            "variety_name": "Grand Naine",
            "planting_days_ago": 120,  # Active Vegetative stage
            "season": "Perennial",
            "soil": {"type": "Black Clay", "sand": 15.0, "silt": 30.0, "clay": 55.0, "ph": 7.8, "organic_carbon": 0.80, "bulk_density": 1.40},
            "poly": "POLYGON((78.1230 9.9430, 78.1270 9.9430, 78.1270 9.9470, 78.1230 9.9470, 78.1230 9.9430))",
        },
        {
            "farm_name": "Veeramani South Farm",
            "lat": 9.9150,
            "lon": 78.1050,
            "acres": 4.0,
            "district": "Madurai",
            "village": "Melur",
            "drainage": "GOOD",
            "crop_name": "Groundnut",
            "variety_name": "TMV 7",
            "planting_days_ago": 55,   # Pod Formation stage
            "season": "Kharif",
            "soil": {"type": "Red Sandy Loam", "sand": 60.0, "silt": 20.0, "clay": 20.0, "ph": 6.5, "organic_carbon": 0.45, "bulk_density": 1.55},
            "poly": "POLYGON((78.1030 9.9130, 78.1070 9.9130, 78.1070 9.9170, 78.1030 9.9170, 78.1030 9.9130))",
        },
        {
            "farm_name": "Veeramani Marutham Farm",
            "lat": 9.9550,
            "lon": 78.1350,
            "acres": 2.5,
            "district": "Madurai",
            "village": "Alanganallur",
            "drainage": "MODERATE",
            "crop_name": "Chilli",
            "variety_name": "K 1",
            "planting_days_ago": 15,   # Seedling & Establishment stage
            "season": "Rabi",
            "soil": {"type": "Loam", "sand": 40.0, "silt": 35.0, "clay": 25.0, "ph": 6.8, "organic_carbon": 0.55, "bulk_density": 1.45},
            "poly": "POLYGON((78.1330 9.9530, 78.1370 9.9530, 78.1370 9.9570, 78.1330 9.9570, 78.1330 9.9530))",
        },
    ],
    "manikandan@gmail.com": [
        {
            "farm_name": "Manikandan Theni Farm",
            "lat": 10.0150,
            "lon": 77.4800,
            "acres": 4.5,
            "district": "Theni",
            "village": "Periyakulam",
            "drainage": "POOR",
            "crop_name": "Banana",
            "variety_name": "Robusta",
            "planting_days_ago": 200,  # Shooting & Flowering stage
            "season": "Perennial",
            "soil": {"type": "Clay Loam", "sand": 25.0, "silt": 35.0, "clay": 40.0, "ph": 7.5, "organic_carbon": 0.70, "bulk_density": 1.38},
            "poly": "POLYGON((77.4780 10.0130, 77.4820 10.0130, 77.4820 10.0170, 77.4780 10.0170, 77.4780 10.0130))",
        },
        {
            "farm_name": "Manikandan Western Farm",
            "lat": 10.0250,
            "lon": 77.4650,
            "acres": 3.0,
            "district": "Theni",
            "village": "Bodi",
            "drainage": "GOOD",
            "crop_name": "Maize",
            "variety_name": "CO 6",
            "planting_days_ago": 50,   # Tasseling & Silking stage
            "season": "Kharif",
            "soil": {"type": "Sandy Loam", "sand": 55.0, "silt": 25.0, "clay": 20.0, "ph": 6.3, "organic_carbon": 0.40, "bulk_density": 1.58},
            "poly": "POLYGON((77.4630 10.0230, 77.4670 10.0230, 77.4670 10.0270, 77.4630 10.0270, 77.4630 10.0230))",
        },
    ],
    "narsi.farmer@gmail.com": [
        {
            "farm_name": "Narisimman North Farm",
            "lat": 9.9650,
            "lon": 78.0900,
            "acres": 6.0,
            "district": "Madurai",
            "village": "Sholavandan",
            "drainage": "POOR",
            "crop_name": "Paddy",
            "variety_name": "Swarna (MTU 7029)",
            "planting_days_ago": 70,   # Panicle Initiation & Flowering
            "season": "Samba",
            "soil": {"type": "Alluvial Clay", "sand": 15.0, "silt": 40.0, "clay": 45.0, "ph": 7.5, "organic_carbon": 0.75, "bulk_density": 1.32},
            "poly": "POLYGON((78.0880 9.9630, 78.0920 9.9630, 78.0920 9.9670, 78.0880 9.9670, 78.0880 9.9630))",
        },
        {
            "farm_name": "Narisimman Green Farm",
            "lat": 9.9750,
            "lon": 78.1000,
            "acres": 4.0,
            "district": "Madurai",
            "village": "Usilampatti",
            "drainage": "MODERATE",
            "crop_name": "Cotton",
            "variety_name": "MCU 5",
            "planting_days_ago": 45,   # Vegetative & Squaring stage
            "season": "Kharif",
            "soil": {"type": "Black Cotton Soil", "sand": 20.0, "silt": 30.0, "clay": 50.0, "ph": 8.0, "organic_carbon": 0.60, "bulk_density": 1.42},
            "poly": "POLYGON((78.0980 9.9730, 78.1020 9.9730, 78.1020 9.9770, 78.0980 9.9770, 78.0980 9.9730))",
        },
        {
            "farm_name": "Narisimman Vaigai Field",
            "lat": 9.9200,
            "lon": 78.0800,
            "acres": 2.0,
            "district": "Madurai",
            "village": "T. Kallupatti",
            "drainage": "GOOD",
            "crop_name": "Tomato",
            "variety_name": "PKM 1",
            "planting_days_ago": 30,   # Vegetative Growth stage
            "season": "Rabi",
            "soil": {"type": "Red Loam", "sand": 45.0, "silt": 30.0, "clay": 25.0, "ph": 6.6, "organic_carbon": 0.50, "bulk_density": 1.50},
            "poly": "POLYGON((78.0780 9.9180, 78.0820 9.9180, 78.0820 9.9220, 78.0780 9.9220, 78.0780 9.9180))",
        },
        {
            "farm_name": "Narisimman South Field",
            "lat": 9.9100,
            "lon": 78.1150,
            "acres": 3.5,
            "district": "Madurai",
            "village": "Vadipatti",
            "drainage": "MODERATE",
            "crop_name": "Onion",
            "variety_name": "CO 5",
            "planting_days_ago": 80,   # Bulb Initiation & Development stage
            "season": "Rabi",
            "soil": {"type": "Sandy Clay Loam", "sand": 50.0, "silt": 20.0, "clay": 30.0, "ph": 6.9, "organic_carbon": 0.48, "bulk_density": 1.52},
            "poly": "POLYGON((78.1130 9.9080, 78.1170 9.9080, 78.1170 9.9120, 78.1130 9.9120, 78.1130 9.9080))",
        },
    ],
}


def resolve_growth_stage(db: Session, crop_id: int, age_days: int):
    """Find the matching CropGrowthStage for a given crop age in days."""
    stage = db.query(CropGrowthStage).filter(
        CropGrowthStage.crop_id == crop_id,
        CropGrowthStage.min_age_days <= age_days,
        CropGrowthStage.max_age_days >= age_days,
    ).first()
    return stage


def get_or_create_user(db: Session, user_def: dict) -> User:
    """Get existing user by email or create new one. Idempotent."""
    email = user_def["email"]
    user = db.query(User).filter(User.email == email).first()
    if user:
        # Update password and ensure onboarding is complete for demo
        user.password_hash = hash_password(DEMO_PASSWORD)
        user.onboarding_completed = True
        user.tour_status = "COMPLETED"
        user.preferred_language = "EN"
        db.flush()
        logger.info(f"  UPDATED existing user: {user.full_name} (id={user.id})")
        return user
    else:
        user = User(
            email=email,
            password_hash=hash_password(DEMO_PASSWORD),
            full_name=user_def["full_name"],
            phone=user_def.get("phone"),
            role="FARMER",
            is_admin=False,
            onboarding_completed=True,
            tour_status="COMPLETED",
            preferred_language="EN",
        )
        db.add(user)
        db.flush()
        logger.info(f"  CREATED user: {user.full_name} (id={user.id})")
        return user


def get_or_create_farm(db: Session, user: User, farm_def: dict) -> Farm:
    """Get existing farm by user_id + farm_name or create new one."""
    farm = db.query(Farm).filter(
        Farm.user_id == user.id,
        Farm.farm_name == farm_def["farm_name"],
    ).first()

    if farm:
        # Update coordinates and metadata
        farm.latitude = farm_def["lat"]
        farm.longitude = farm_def["lon"]
        farm.boundary = WKTElement(farm_def["poly"], srid=4326)
        farm.area_acres = farm_def["acres"]
        farm.district = farm_def["district"]
        farm.village = farm_def["village"]
        farm.drainage_class = farm_def["drainage"]
        db.flush()
        logger.info(f"    UPDATED farm: {farm.farm_name} (id={farm.id})")
    else:
        farm = Farm(
            user_id=user.id,
            farm_name=farm_def["farm_name"],
            latitude=farm_def["lat"],
            longitude=farm_def["lon"],
            boundary=WKTElement(farm_def["poly"], srid=4326),
            area_acres=farm_def["acres"],
            state="Tamil Nadu",
            district=farm_def["district"],
            village=farm_def["village"],
            drainage_class=farm_def["drainage"],
        )
        db.add(farm)
        db.flush()
        logger.info(f"    CREATED farm: {farm.farm_name} (id={farm.id})")

    return farm


def get_or_create_soil(db: Session, farm: Farm, soil_def: dict) -> SoilProfile:
    """Get existing soil profile or create one. Demo soil uses ESTIMATED source."""
    sp = db.query(SoilProfile).filter(SoilProfile.farm_id == farm.id).first()
    if sp:
        sp.soil_type = soil_def["type"]
        sp.sand_percentage = soil_def["sand"]
        sp.silt_percentage = soil_def["silt"]
        sp.clay_percentage = soil_def["clay"]
        sp.ph = soil_def["ph"]
        sp.organic_carbon = soil_def.get("organic_carbon")
        sp.bulk_density = soil_def.get("bulk_density")
        sp.soil_source = SoilSourceEnum.ESTIMATED
        db.flush()
        logger.info(f"      UPDATED soil: {soil_def['type']}")
    else:
        sp = SoilProfile(
            farm_id=farm.id,
            soil_type=soil_def["type"],
            sand_percentage=soil_def["sand"],
            silt_percentage=soil_def["silt"],
            clay_percentage=soil_def["clay"],
            ph=soil_def["ph"],
            organic_carbon=soil_def.get("organic_carbon"),
            bulk_density=soil_def.get("bulk_density"),
            soil_source=SoilSourceEnum.ESTIMATED,
        )
        db.add(sp)
        db.flush()
        logger.info(f"      CREATED soil: {soil_def['type']}")
    return sp


def get_or_create_farm_crop(
    db: Session, farm: Farm, crop: Crop, variety, farm_def: dict
) -> FarmCrop:
    """Get existing active FarmCrop or create one."""
    planting_date = date.today() - timedelta(days=farm_def["planting_days_ago"])
    age_days = farm_def["planting_days_ago"]

    # Resolve growth stage from crop calendar
    growth_stage = resolve_growth_stage(db, crop.id, age_days)
    stage_name = growth_stage.stage_name if growth_stage else "Unknown"

    fc = db.query(FarmCrop).filter(
        FarmCrop.farm_id == farm.id,
        FarmCrop.is_active == True,
    ).first()

    if fc:
        fc.crop_id = crop.id
        fc.variety_id = variety.id if variety else None
        fc.planting_date = planting_date
        fc.estimated_age_days = age_days
        fc.current_growth_stage_id = growth_stage.id if growth_stage else None
        fc.season = farm_def.get("season")
        fc.status = "ACTIVE"
        fc.is_active = True
        db.flush()
        logger.info(f"      UPDATED crop: {crop.name} ({variety.variety_name if variety else 'N/A'}) → age {age_days}d → {stage_name}")
    else:
        fc = FarmCrop(
            farm_id=farm.id,
            crop_id=crop.id,
            variety_id=variety.id if variety else None,
            planting_date=planting_date,
            estimated_age_days=age_days,
            current_growth_stage_id=growth_stage.id if growth_stage else None,
            season=farm_def.get("season"),
            status="ACTIVE",
            is_active=True,
        )
        db.add(fc)
        db.flush()
        logger.info(f"      CREATED crop: {crop.name} ({variety.variety_name if variety else 'N/A'}) → age {age_days}d → {stage_name}")

    return fc


def seed_demo_farmers():
    """Main entry point. Runs in a single transaction with rollback on failure."""
    db = SessionLocal()
    try:
        logger.info("=" * 60)
        logger.info("CropClimate AI — Demo Farmer Seed Script")
        logger.info("=" * 60)

        # Pre-load crop master lookup
        all_crops = {c.name: c for c in db.query(Crop).all()}
        logger.info(f"Available crop masters: {list(all_crops.keys())}")
        if not all_crops:
            logger.error("No crop master data found! Run seed_crops.py first.")
            return False

        # Pre-load variety lookup
        all_varieties = {}
        for v in db.query(CropVariety).all():
            key = (v.crop_id, v.variety_name)
            all_varieties[key] = v

        stats = {"users": 0, "farms": 0, "crops": 0, "soils": 0}

        for user_def in DEMO_USERS:
            email = user_def["email"]
            logger.info(f"\n── User: {user_def['full_name']} ({email}) ──")
            user = get_or_create_user(db, user_def)
            stats["users"] += 1

            farm_defs = DEMO_FARMS.get(email, [])
            for fd in farm_defs:
                logger.info(f"  Farm: {fd['farm_name']} ({fd['district']})")

                # Resolve crop master
                crop = all_crops.get(fd["crop_name"])
                if not crop:
                    logger.warning(f"    SKIPPED: crop '{fd['crop_name']}' not found in master data")
                    continue

                # Resolve variety
                variety = None
                if fd.get("variety_name"):
                    variety = all_varieties.get((crop.id, fd["variety_name"]))
                    if not variety:
                        logger.warning(f"    Variety '{fd['variety_name']}' not found; proceeding without variety")

                farm = get_or_create_farm(db, user, fd)
                stats["farms"] += 1

                get_or_create_soil(db, farm, fd["soil"])
                stats["soils"] += 1

                get_or_create_farm_crop(db, farm, crop, variety, fd)
                stats["crops"] += 1

        db.commit()

        logger.info("\n" + "=" * 60)
        logger.info("SEED SUMMARY")
        logger.info("=" * 60)
        logger.info(f"  Users:       {stats['users']}")
        logger.info(f"  Farms:       {stats['farms']}")
        logger.info(f"  Active Crops:{stats['crops']}")
        logger.info(f"  Soil Profiles:{stats['soils']}")
        logger.info("=" * 60)

        # ── Verification Queries ──
        logger.info("\nVERIFICATION:")
        for user_def in DEMO_USERS:
            u = db.query(User).filter(User.email == user_def["email"]).first()
            farm_count = db.query(Farm).filter(Farm.user_id == u.id).count() if u else 0
            logger.info(f"  {user_def['full_name']}: {farm_count} farms")

        total_farms = sum(
            db.query(Farm).filter(Farm.user_id == db.query(User).filter(User.email == ud["email"]).first().id).count()
            for ud in DEMO_USERS
        )
        logger.info(f"  Total demo farms: {total_farms}")

        logger.info("\nDEMO DATA SEED: PASS ✓")
        return True

    except Exception as e:
        db.rollback()
        logger.error(f"SEED FAILED — rolled back: {e}")
        import traceback
        traceback.print_exc()
        logger.info("DEMO DATA SEED: FAIL ✗")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    success = seed_demo_farmers()
    sys.exit(0 if success else 1)
