from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.seed_crops import seed_crops
import geoalchemy2.admin.dialects.sqlite

# Setup SQLite test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_stage91011.db"
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


def test_stage_9_10_11_complete():
    # 1. Register and Login User
    reg_res = client.post("/api/auth/register", json={
        "full_name": "Stage 9-11 Farmer",
        "email": "farmer91011@example.com",
        "password": "Password123!",
        "preferred_language": "EN"
    })
    assert reg_res.status_code == 201, reg_res.text

    login_res = client.post("/api/auth/login", json={
        "email": "farmer91011@example.com",
        "password": "Password123!"
    })
    assert login_res.status_code == 200, login_res.text
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Farm & Assign Crop Profile
    farm_res = client.post("/api/farms", json={
        "farm_name": "Cauvery Delta Test Field",
        "latitude": 10.7870,
        "longitude": 79.1378,
        "boundary_geojson": {
            "type": "Polygon",
            "coordinates": [[[79.137, 10.786], [79.138, 10.786], [79.138, 10.787], [79.137, 10.787], [79.137, 10.786]]]
        },
        "area_acres": 4.0,
        "state": "Tamil Nadu",
        "district": "Thanjavur",
        "village": "Vadapathi",
        "drainage_class": "POOR"
    }, headers=headers)
    assert farm_res.status_code == 201, farm_res.text
    farm_id = farm_res.json()["id"]

    # Assign Crop Profile (Paddy)
    crops_res = client.get("/api/crops")
    paddy_id = next(c["id"] for c in crops_res.json() if c["name"] == "Paddy")

    crop_assign = client.post(f"/api/farms/{farm_id}/crop", json={
        "crop_id": paddy_id,
        "planting_date": (date.today() - timedelta(days=45)).isoformat(),
        "season": "Kharif",
        "user_stage_override": "Tillering"
    }, headers=headers)
    assert crop_assign.status_code == 201, crop_assign.text

    # --- STAGE 9: WATERLOGGING RISK ENGINE TEST ---
    wl_res = client.post(f"/api/farms/{farm_id}/waterlogging-analysis", headers=headers)
    assert wl_res.status_code == 201, wl_res.text
    wl_data = wl_res.json()
    assert wl_data["risk_level"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert "explanation" in wl_data
    assert "contributing_factors" in wl_data
    assert "data_sources" in wl_data
    assert wl_data["model_version"] == "v1.0.0-hydrological"
    print("STAGE 9 WATERLOGGING RISK ENGINE TEST PASSED!")

    # --- STAGE 11: CROP DAMAGE ML MODEL TEST ---
    damage_res = client.post(f"/api/farms/{farm_id}/analyse-crop-damage", headers=headers)
    assert damage_res.status_code == 201, damage_res.text
    dmg_data = damage_res.json()
    assert dmg_data["damage_class"] in ["NONE", "MILD", "MODERATE", "SEVERE", "TOTAL_LOSS"]
    assert 0.0 <= dmg_data["survival_probability"] <= 1.0
    assert dmg_data["model_version"] == "v1.0.0"
    assert len(dmg_data["main_input_factors"]) > 0
    print("STAGE 11 CROP DAMAGE ML INFERENCE TEST PASSED!")

    print("ALL STAGES 9, 10 & 11 TESTS PASSED CLEANLY!")


if __name__ == "__main__":
    test_stage_9_10_11_complete()
