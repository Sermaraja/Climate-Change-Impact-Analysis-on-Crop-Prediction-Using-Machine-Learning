import logging
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal
from app.models.crop import Crop, CropVariety, CropGrowthStage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_crops")

CROP_SEED_DATA = [
    {
        "name": "Paddy",
        "scientific_name": "Oryza sativa",
        "category": "Cereal",
        "description": "Staple cereal crop grown predominantly under flooded/irrigated conditions.",
        "varieties": [
            {"variety_name": "BPT 5204 (Samba Mahsuri)", "duration_days": 135, "submergence_tolerance_days": 3},
            {"variety_name": "Swarna (MTU 7029)", "duration_days": 150, "submergence_tolerance_days": 5},
            {"variety_name": "IR 64", "duration_days": 120, "submergence_tolerance_days": 2},
            {"variety_name": "CR 1009 (Sub1)", "duration_days": 155, "submergence_tolerance_days": 14},
        ],
        "growth_stages": [
            {"stage_name": "Germination & Seedling", "stage_order": 1, "min_age_days": 0, "max_age_days": 20, "flood_vulnerability_level": "MODERATE"},
            {"stage_name": "Tillering & Vegetative", "stage_order": 2, "min_age_days": 21, "max_age_days": 50, "flood_vulnerability_level": "LOW"},
            {"stage_name": "Panicle Initiation & Flowering", "stage_order": 3, "min_age_days": 51, "max_age_days": 90, "flood_vulnerability_level": "HIGH"},
            {"stage_name": "Grain Filling & Ripening", "stage_order": 4, "min_age_days": 91, "max_age_days": 160, "flood_vulnerability_level": "MODERATE"},
        ]
    },
    {
        "name": "Maize",
        "scientific_name": "Zea mays",
        "category": "Cereal",
        "description": "Versatile cereal crop highly sensitive to waterlogging at early stages.",
        "varieties": [
            {"variety_name": "CO 6", "duration_days": 110},
            {"variety_name": "Hybrid 900M", "duration_days": 105},
            {"variety_name": "Pioneer 30V92", "duration_days": 115},
        ],
        "growth_stages": [
            {"stage_name": "Germination & Emergence", "stage_order": 1, "min_age_days": 0, "max_age_days": 15, "flood_vulnerability_level": "HIGH"},
            {"stage_name": "Vegetative Growth", "stage_order": 2, "min_age_days": 16, "max_age_days": 45, "flood_vulnerability_level": "EXTREME"},
            {"stage_name": "Tasseling & Silking", "stage_order": 3, "min_age_days": 46, "max_age_days": 75, "flood_vulnerability_level": "HIGH"},
            {"stage_name": "Grain Filling & Maturation", "stage_order": 4, "min_age_days": 76, "max_age_days": 120, "flood_vulnerability_level": "MODERATE"},
        ]
    },
    {
        "name": "Groundnut",
        "scientific_name": "Arachis hypogaea",
        "category": "Oilseed",
        "description": "Legume oilseed crop sensitive to standing water and pod rot.",
        "varieties": [
            {"variety_name": "TMV 7", "duration_days": 105},
            {"variety_name": "VRI 2", "duration_days": 110},
            {"variety_name": "Kadiri 6", "duration_days": 115},
        ],
        "growth_stages": [
            {"stage_name": "Emergence & Early Vegetative", "stage_order": 1, "min_age_days": 0, "max_age_days": 20, "flood_vulnerability_level": "MODERATE"},
            {"stage_name": "Flowering & Pegging", "stage_order": 2, "min_age_days": 21, "max_age_days": 50, "flood_vulnerability_level": "EXTREME"},
            {"stage_name": "Pod Formation", "stage_order": 3, "min_age_days": 51, "max_age_days": 85, "flood_vulnerability_level": "HIGH"},
            {"stage_name": "Pod Maturation & Harvest", "stage_order": 4, "min_age_days": 86, "max_age_days": 125, "flood_vulnerability_level": "HIGH"},
        ]
    },
    {
        "name": "Cotton",
        "scientific_name": "Gossypium hirsutum",
        "category": "Commercial Fiber",
        "description": "Long duration commercial cash crop prone to boll shedding under flood stress.",
        "varieties": [
            {"variety_name": "MCU 5", "duration_days": 165},
            {"variety_name": "Bunny BG II", "duration_days": 160},
            {"variety_name": "RCH 2", "duration_days": 155},
        ],
        "growth_stages": [
            {"stage_name": "Germination & Seedling", "stage_order": 1, "min_age_days": 0, "max_age_days": 30, "flood_vulnerability_level": "HIGH"},
            {"stage_name": "Vegetative & Squaring", "stage_order": 2, "min_age_days": 31, "max_age_days": 65, "flood_vulnerability_level": "MODERATE"},
            {"stage_name": "Flowering & Boll Development", "stage_order": 3, "min_age_days": 66, "max_age_days": 120, "flood_vulnerability_level": "EXTREME"},
            {"stage_name": "Boll Opening & Maturation", "stage_order": 4, "min_age_days": 121, "max_age_days": 180, "flood_vulnerability_level": "HIGH"},
        ]
    },
    {
        "name": "Banana",
        "scientific_name": "Musa acuminata",
        "category": "Fruit Crop",
        "description": "Perennial fruit crop susceptible to root asphyxiation during standing water.",
        "varieties": [
            {"variety_name": "Grand Naine", "duration_days": 365},
            {"variety_name": "Robusta", "duration_days": 360},
            {"variety_name": "Rasthali", "duration_days": 380},
            {"variety_name": "Poovan", "duration_days": 400},
        ],
        "growth_stages": [
            {"stage_name": "Early Vegetative", "stage_order": 1, "min_age_days": 0, "max_age_days": 90, "flood_vulnerability_level": "MODERATE"},
            {"stage_name": "Active Vegetative", "stage_order": 2, "min_age_days": 91, "max_age_days": 180, "flood_vulnerability_level": "MODERATE"},
            {"stage_name": "Shooting & Flowering", "stage_order": 3, "min_age_days": 181, "max_age_days": 240, "flood_vulnerability_level": "HIGH"},
            {"stage_name": "Bunch Maturation & Harvest", "stage_order": 4, "min_age_days": 241, "max_age_days": 420, "flood_vulnerability_level": "MODERATE"},
        ]
    },
    {
        "name": "Sugarcane",
        "scientific_name": "Saccharum officinarum",
        "category": "Commercial Crop",
        "description": "High biomass perennial cash crop moderately flood tolerant in grand growth phase.",
        "varieties": [
            {"variety_name": "Co 86032", "duration_days": 360},
            {"variety_name": "Co 0238", "duration_days": 360},
            {"variety_name": "Co 11015", "duration_days": 340},
        ],
        "growth_stages": [
            {"stage_name": "Germination Phase", "stage_order": 1, "min_age_days": 0, "max_age_days": 35, "flood_vulnerability_level": "HIGH"},
            {"stage_name": "Formative & Tillering Phase", "stage_order": 2, "min_age_days": 36, "max_age_days": 100, "flood_vulnerability_level": "MODERATE"},
            {"stage_name": "Grand Growth Phase", "stage_order": 3, "min_age_days": 101, "max_age_days": 270, "flood_vulnerability_level": "LOW"},
            {"stage_name": "Ripening & Maturation", "stage_order": 4, "min_age_days": 271, "max_age_days": 380, "flood_vulnerability_level": "MODERATE"},
        ]
    },
    {
        "name": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "category": "Vegetable",
        "description": "Solanaceous vegetable crop extremely vulnerable to waterlogging wilt and root decay.",
        "varieties": [
            {"variety_name": "PKM 1", "duration_days": 135},
            {"variety_name": "Arka Vikas", "duration_days": 140},
            {"variety_name": "Heemsohna", "duration_days": 150},
        ],
        "growth_stages": [
            {"stage_name": "Nursery & Establishment", "stage_order": 1, "min_age_days": 0, "max_age_days": 20, "flood_vulnerability_level": "HIGH"},
            {"stage_name": "Vegetative Growth", "stage_order": 2, "min_age_days": 21, "max_age_days": 45, "flood_vulnerability_level": "EXTREME"},
            {"stage_name": "Flowering & Fruit Set", "stage_order": 3, "min_age_days": 46, "max_age_days": 80, "flood_vulnerability_level": "EXTREME"},
            {"stage_name": "Fruit Ripening & Harvesting", "stage_order": 4, "min_age_days": 81, "max_age_days": 140, "flood_vulnerability_level": "HIGH"},
        ]
    },
    {
        "name": "Chilli",
        "scientific_name": "Capsicum annuum",
        "category": "Spices / Vegetable",
        "description": "High value spice crop prone to rapid root rot under water stagnation.",
        "varieties": [
            {"variety_name": "K 1", "duration_days": 160},
            {"variety_name": "CO 4", "duration_days": 150},
            {"variety_name": "G4 Chilli", "duration_days": 165},
        ],
        "growth_stages": [
            {"stage_name": "Seedling & Establishment", "stage_order": 1, "min_age_days": 0, "max_age_days": 25, "flood_vulnerability_level": "HIGH"},
            {"stage_name": "Vegetative Growth", "stage_order": 2, "min_age_days": 26, "max_age_days": 55, "flood_vulnerability_level": "EXTREME"},
            {"stage_name": "Flowering & Pod Set", "stage_order": 3, "min_age_days": 56, "max_age_days": 95, "flood_vulnerability_level": "EXTREME"},
            {"stage_name": "Ripening & Pickings", "stage_order": 4, "min_age_days": 96, "max_age_days": 170, "flood_vulnerability_level": "HIGH"},
        ]
    },
    {
        "name": "Onion",
        "scientific_name": "Allium cepa",
        "category": "Vegetable",
        "description": "Shallow rooted bulb crop prone to bulb rotting when field stays waterlogged.",
        "varieties": [
            {"variety_name": "Agrifound Light Red", "duration_days": 125},
            {"variety_name": "CO 5", "duration_days": 120},
            {"variety_name": "N-53", "duration_days": 130},
        ],
        "growth_stages": [
            {"stage_name": "Seedling & Establishment", "stage_order": 1, "min_age_days": 0, "max_age_days": 30, "flood_vulnerability_level": "HIGH"},
            {"stage_name": "Leaf Growth", "stage_order": 2, "min_age_days": 31, "max_age_days": 65, "flood_vulnerability_level": "MODERATE"},
            {"stage_name": "Bulb Initiation & Development", "stage_order": 3, "min_age_days": 66, "max_age_days": 105, "flood_vulnerability_level": "EXTREME"},
            {"stage_name": "Maturation & Harvest", "stage_order": 4, "min_age_days": 106, "max_age_days": 140, "flood_vulnerability_level": "HIGH"},
        ]
    },
    {
        "name": "Pulses",
        "scientific_name": "Fabaceae",
        "category": "Pulses / Legumes",
        "description": "Short duration grain legumes (Blackgram / Greengram / Redgram) sensitive to heavy rain.",
        "varieties": [
            {"variety_name": "VBN 8 (Blackgram)", "duration_days": 70},
            {"variety_name": "ADT 5 (Greengram)", "duration_days": 65},
            {"variety_name": "Co 6 (Redgram)", "duration_days": 170},
        ],
        "growth_stages": [
            {"stage_name": "Seedling & Early Vegetative", "stage_order": 1, "min_age_days": 0, "max_age_days": 25, "flood_vulnerability_level": "HIGH"},
            {"stage_name": "Flowering & Pod Initiation", "stage_order": 2, "min_age_days": 26, "max_age_days": 55, "flood_vulnerability_level": "EXTREME"},
            {"stage_name": "Pod Filling", "stage_order": 3, "min_age_days": 56, "max_age_days": 75, "flood_vulnerability_level": "HIGH"},
            {"stage_name": "Maturation & Harvest", "stage_order": 4, "min_age_days": 76, "max_age_days": 180, "flood_vulnerability_level": "MODERATE"},
        ]
    }
]


def seed_crops(db: Session = None):
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        logger.info("Seeding master crop data...")
        for crop_data in CROP_SEED_DATA:
            existing_crop = db.query(Crop).filter(Crop.name == crop_data["name"]).first()
            if not existing_crop:
                crop = Crop(
                    name=crop_data["name"],
                    scientific_name=crop_data.get("scientific_name"),
                    category=crop_data.get("category"),
                    description=crop_data.get("description"),
                )
                db.add(crop)
                db.flush()
                logger.info(f"Created crop: {crop.name}")
            else:
                crop = existing_crop

            # Seed varieties
            for var_data in crop_data.get("varieties", []):
                existing_var = db.query(CropVariety).filter(
                    CropVariety.crop_id == crop.id,
                    CropVariety.variety_name == var_data["variety_name"]
                ).first()
                if not existing_var:
                    variety = CropVariety(
                        crop_id=crop.id,
                        variety_name=var_data["variety_name"],
                        duration_days=var_data.get("duration_days"),
                        submergence_tolerance_days=var_data.get("submergence_tolerance_days", 2),
                    )
                    db.add(variety)

            # Seed growth stages
            for stage_data in crop_data.get("growth_stages", []):
                existing_stage = db.query(CropGrowthStage).filter(
                    CropGrowthStage.crop_id == crop.id,
                    CropGrowthStage.stage_order == stage_data["stage_order"]
                ).first()
                if not existing_stage:
                    growth_stage = CropGrowthStage(
                        crop_id=crop.id,
                        stage_name=stage_data["stage_name"],
                        stage_order=stage_data["stage_order"],
                        min_age_days=stage_data["min_age_days"],
                        max_age_days=stage_data["max_age_days"],
                        flood_vulnerability_level=stage_data.get("flood_vulnerability_level", "MODERATE"),
                    )
                    db.add(growth_stage)

        db.commit()
        logger.info("Crop master seed completed successfully.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding crops: {e}")
        raise e
    finally:
        if close_db:
            db.close()


if __name__ == "__main__":
    seed_crops()
