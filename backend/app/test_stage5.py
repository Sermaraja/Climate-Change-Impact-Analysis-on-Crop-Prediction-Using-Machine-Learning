from datetime import date, timedelta
from fastapi.testclient import TestClient

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.seed_crops import seed_crops

import geoalchemy2.admin.dialects.sqlite

# Setup SQLite test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_stage5.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@event.listens_for(engine, "connect")
def register_sqlite_gis_functions(dbapi_connection, connection_record):
    dbapi_connection.create_function("GeomFromEWKT", 1, lambda val: val)
    dbapi_connection.create_function("GeomFromText", 1, lambda val: val)
    dbapi_connection.create_function("AsEWKB", 1, lambda val: val.encode('utf-8') if isinstance(val, str) else val)
    dbapi_connection.create_function("AsText", 1, lambda val: val.decode('utf-8') if isinstance(val, bytes) else str(val))
    dbapi_connection.create_function("ST_AsGeoJSON", 1, lambda val: val)

geoalchemy2.admin.dialects.sqlite.after_create = lambda table, bind, **kw: None
geoalchemy2.admin.dialects.sqlite.before_drop = lambda table, bind, **kw: None
geoalchemy2.admin.dialects.sqlite.after_drop = lambda table, bind, **kw: None




Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
seed_crops(TestingSessionLocal())



def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_stage5_crop_management():
    # 1. Register and Login User
    reg_res = client.post("/api/auth/register", json={
        "full_name": "Stage 5 Farmer",
        "email": "farmer5@example.com",
        "password": "Password123!",
        "preferred_language": "en"
    })
    assert reg_res.status_code == 201, reg_res.text

    login_res = client.post("/api/auth/login", json={
        "email": "farmer5@example.com",
        "password": "Password123!"
    })
    assert login_res.status_code == 200, login_res.text
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Fetch Master Crops
    crops_res = client.get("/api/crops")
    assert crops_res.status_code == 200, crops_res.text
    crops = crops_res.json()
    assert len(crops) >= 10
    crop_names = [c["name"] for c in crops]
    for required_crop in ["Paddy", "Maize", "Groundnut", "Cotton", "Banana", "Sugarcane", "Tomato", "Chilli", "Onion", "Pulses"]:
        assert required_crop in crop_names

    paddy = next(c for c in crops if c["name"] == "Paddy")
    paddy_id = paddy["id"]
    variety_id = paddy["varieties"][0]["id"] if paddy["varieties"] else None

    # 3. Create a Farm
    farm_res = client.post("/api/farms", json={
        "farm_name": "Stage 5 Paddy Field",
        "latitude": 10.7905,
        "longitude": 78.7047,
        "boundary_geojson": {
            "type": "Polygon",
            "coordinates": [[[78.704, 10.790], [78.705, 10.790], [78.705, 10.791], [78.704, 10.791], [78.704, 10.790]]]
        },
        "area_acres": 2.5,
        "state": "Tamil Nadu",
        "district": "Thanjavur",
        "village": "Cauvery Delta",
        "drainage_class": "MODERATE"
    }, headers=headers)
    assert farm_res.status_code == 201, farm_res.text
    farm_id = farm_res.json()["id"]

    # 4. POST /api/farms/{farm_id}/crop (Assign Paddy planted 35 days ago)
    planting_date_35d_ago = (date.today() - timedelta(days=35)).isoformat()
    assign_res = client.post(f"/api/farms/{farm_id}/crop", json={
        "crop_id": paddy_id,
        "variety_id": variety_id,
        "planting_date": planting_date_35d_ago,
        "season": "Kharif"
    }, headers=headers)
    assert assign_res.status_code == 201, assign_res.text
    assigned_crop = assign_res.json()
    assert assigned_crop["crop_name"] == "Paddy"
    assert assigned_crop["crop_age_days"] == 35
    assert assigned_crop["estimated_growth_stage"] == "Tillering & Vegetative"
    assert assigned_crop["confirmed_growth_stage"] is None
    assert assigned_crop["growth_stage"] == "Tillering & Vegetative"

    # 5. GET /api/farms/{farm_id}/crop
    get_crop_res = client.get(f"/api/farms/{farm_id}/crop", headers=headers)
    assert get_crop_res.status_code == 200, get_crop_res.text
    fetched_crop = get_crop_res.json()
    assert fetched_crop["crop_name"] == "Paddy"
    assert fetched_crop["crop_age_days"] == 35
    assert fetched_crop["estimated_growth_stage"] == "Tillering & Vegetative"

    # 6. PUT /api/farms/{farm_id}/crop (Confirm/Override growth stage to "Panicle Initiation")
    update_res = client.put(f"/api/farms/{farm_id}/crop", json={
        "user_stage_override": "Panicle Initiation"
    }, headers=headers)
    assert update_res.status_code == 200, update_res.text
    updated_crop = update_res.json()
    assert updated_crop["estimated_growth_stage"] == "Tillering & Vegetative"
    assert updated_crop["confirmed_growth_stage"] == "Panicle Initiation"
    assert updated_crop["growth_stage"] == "Panicle Initiation"

    print("STAGE 5 ALL BACKEND TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_stage5_crop_management()
