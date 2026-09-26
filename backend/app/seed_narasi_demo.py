"""
Setup Narasi Demo User and 3 Thanjavur Farms
"""

from datetime import date, timedelta
from geoalchemy2.elements import WKTElement
from app.database import SessionLocal
from app.models import User, Farm, Crop, FarmCrop, SoilProfile
from app.models.enums import SoilSourceEnum
from app.services.auth_service import hash_password


def setup_narasi_demo():
    db = SessionLocal()

    # Check or create Narasi
    user = db.query(User).filter(User.email == "narsifarmer@gmail.com").first()
    if not user:
        user = User(
            email="narsifarmer@gmail.com",
            password_hash=hash_password("123456789"),
            full_name="Narasi",
            role="FARMER",
            preferred_language="EN",
            onboarding_completed=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created Narasi user with ID: {user.id}")
    else:
        # ensure password is set
        user.password_hash = hash_password("123456789")
        user.onboarding_completed = True
        db.commit()
        print(f"Reusing existing Narasi user with ID: {user.id}")

    # Fetch Crops
    cotton = db.query(Crop).filter(Crop.name.ilike("%Cotton%")).first()
    paddy = db.query(Crop).filter(Crop.name.ilike("%Paddy%")).first()
    groundnut = db.query(Crop).filter(Crop.name.ilike("%Groundnut%")).first()

    print(f"Found crops: Cotton={cotton.id if cotton else None}, Paddy={paddy.id if paddy else None}, Groundnut={groundnut.id if groundnut else None}")

    # Farms setup definition
    farms_def = [
        {
            "farm_name": "Narasi Thanjavur Cotton Farm",
            "lat": 10.7820,
            "lon": 79.1310,
            "acres": 4.5,
            "village": "Vallam",
            "drainage": "POOR",
            "crop": cotton,
            "planting_days_ago": 75,  # Flowering & Boll Development (~75d)
            "soil": {"type": "Black Clay Loam", "sand": 25.0, "silt": 35.0, "clay": 40.0, "ph": 7.8},
            "poly": "POLYGON((79.1290 10.7800, 79.1330 10.7800, 79.1330 10.7840, 79.1290 10.7840, 79.1290 10.7800))",
        },
        {
            "farm_name": "Narasi Cauvery Delta Paddy Farm",
            "lat": 10.8780,
            "lon": 79.1030,
            "acres": 5.0,
            "village": "Thiruvaiyaru",
            "drainage": "MODERATE",
            "crop": paddy,
            "planting_days_ago": 35,  # Tillering & Vegetative (~35d)
            "soil": {"type": "Alluvial Clay Loam", "sand": 20.0, "silt": 45.0, "clay": 35.0, "ph": 7.2},
            "poly": "POLYGON((79.1010 10.8760, 79.1050 10.8760, 79.1050 10.8800, 79.1010 10.8800, 79.1010 10.8760))",
        },
        {
            "farm_name": "Narasi Orathanadu Groundnut Field",
            "lat": 10.6250,
            "lon": 79.2550,
            "acres": 3.0,
            "village": "Orathanadu",
            "drainage": "POOR",
            "crop": groundnut,
            "planting_days_ago": 40,  # Flowering & Pegging (~40d)
            "soil": {"type": "Red Sandy Loam", "sand": 60.0, "silt": 20.0, "clay": 20.0, "ph": 6.5},
            "poly": "POLYGON((79.2530 10.6230, 79.2570 10.6230, 79.2570 10.6270, 79.2530 10.6270, 79.2530 10.6230))",
        },
    ]

    for fd in farms_def:
        farm = db.query(Farm).filter(Farm.user_id == user.id, Farm.farm_name == fd["farm_name"]).first()
        if not farm:
            farm = Farm(
                user_id=user.id,
                farm_name=fd["farm_name"],
                latitude=fd["lat"],
                longitude=fd["lon"],
                boundary=WKTElement(fd["poly"], srid=4326),
                area_acres=fd["acres"],
                state="Tamil Nadu",
                district="Thanjavur",
                village=fd["village"],
                drainage_class=fd["drainage"],
            )
            db.add(farm)
            db.commit()
            db.refresh(farm)
            print(f"Created farm {farm.farm_name} with ID: {farm.id}")
        else:
            farm.latitude = fd["lat"]
            farm.longitude = fd["lon"]
            farm.drainage_class = fd["drainage"]
            db.commit()
            print(f"Found existing farm {farm.farm_name} with ID: {farm.id}")

        # Soil
        sp = db.query(SoilProfile).filter(SoilProfile.farm_id == farm.id).first()
        if not sp:
            sp = SoilProfile(
                farm_id=farm.id,
                soil_type=fd["soil"]["type"],
                sand_percentage=fd["soil"]["sand"],
                silt_percentage=fd["soil"]["silt"],
                clay_percentage=fd["soil"]["clay"],
                ph=fd["soil"]["ph"],
                soil_source=SoilSourceEnum.FARMER_VERIFIED,
            )
            db.add(sp)
            db.commit()
        else:
            sp.soil_type = fd["soil"]["type"]
            sp.sand_percentage = fd["soil"]["sand"]
            sp.silt_percentage = fd["soil"]["silt"]
            sp.clay_percentage = fd["soil"]["clay"]
            db.commit()

        # Active FarmCrop
        if fd["crop"]:
            fc = db.query(FarmCrop).filter(FarmCrop.farm_id == farm.id, FarmCrop.is_active == True).first()
            plant_dt = date.today() - timedelta(days=fd["planting_days_ago"])
            c_name = fd["crop"].name
            if not fc:
                fc = FarmCrop(
                    farm_id=farm.id,
                    crop_id=fd["crop"].id,
                    planting_date=plant_dt,
                    is_active=True,
                    status="ACTIVE",
                    season="Kharif / Samba",
                )
                db.add(fc)
                db.commit()
                print(f"  Added active crop {c_name} planted on {plant_dt}")
            else:
                fc.crop_id = fd["crop"].id
                fc.planting_date = plant_dt
                db.commit()
                print(f"  Updated active crop {c_name} planted on {plant_dt}")

    db.close()
    print("SUCCESSFULLY VERIFIED AND POPULATED NARASI DEMO FARMS IN THANJAVUR")


if __name__ == "__main__":
    setup_narasi_demo()
