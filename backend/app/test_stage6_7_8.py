from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.seed_crops import seed_crops
import geoalchemy2.admin.dialects.sqlite

# Setup SQLite test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_stage678.db"
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


def test_stage_6_7_8_complete():
    # 1. Register and Login User
    reg_res = client.post("/api/auth/register", json={
        "full_name": "Stage 678 Farmer",
        "email": "farmer678@example.com",
        "password": "Password123!",
        "preferred_language": "EN"
    })
    assert reg_res.status_code == 201, reg_res.text

    login_res = client.post("/api/auth/login", json={
        "email": "farmer678@example.com",
        "password": "Password123!"
    })
    assert login_res.status_code == 200, login_res.text
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Farm with Real Coordinates (Thanjavur, Tamil Nadu Delta: 10.7870, 79.1378)
    farm_res = client.post("/api/farms", json={
        "farm_name": "Thanjavur Delta Farm",
        "latitude": 10.7870,
        "longitude": 79.1378,
        "boundary_geojson": {
            "type": "Polygon",
            "coordinates": [[[79.137, 10.786], [79.138, 10.786], [79.138, 10.787], [79.137, 10.787], [79.137, 10.786]]]
        },
        "area_acres": 5.0,
        "state": "Tamil Nadu",
        "district": "Thanjavur",
        "village": "Cauvery Basin",
        "drainage_class": "MODERATE"
    }, headers=headers)
    assert farm_res.status_code == 201, farm_res.text
    farm_id = farm_res.json()["id"]

    # --- STAGE 6: SOIL PROFILE TESTS ---
    # GET soil (should return ESTIMATED fallback)
    soil_get1 = client.get(f"/api/farms/{farm_id}/soil", headers=headers)
    assert soil_get1.status_code == 200, soil_get1.text
    soil1 = soil_get1.json()
    assert soil1["soil_source"] == "ESTIMATED"
    assert soil1["is_estimated_fallback"] is True

    # POST soil (Farmer verified "I know my soil type")
    soil_post = client.post(f"/api/farms/{farm_id}/soil", json={
        "soil_type": "Clay Loam",
        "soil_source": "FARMER_VERIFIED",
        "notes": "Farmer verified clay loam soil"
    }, headers=headers)
    assert soil_post.status_code == 201, soil_post.text
    soil2 = soil_post.json()
    assert soil2["soil_source"] == "FARMER_VERIFIED"
    assert soil2["sand_percentage"] == 30.0
    assert soil2["clay_percentage"] == 35.0

    # PUT soil (Lab verified test data)
    soil_put = client.put(f"/api/farms/{farm_id}/soil", json={
        "soil_type": "Alluvial Clay Loam",
        "ph": 7.1,
        "organic_carbon": 0.85,
        "bulk_density": 1.32,
        "soil_source": "LAB_VERIFIED",
        "notes": "Verified by TNAU Soil Testing Lab"
    }, headers=headers)
    assert soil_put.status_code == 200, soil_put.text
    soil3 = soil_put.json()
    assert soil3["soil_source"] == "LAB_VERIFIED"
    assert soil3["ph"] == 7.1
    assert soil3["organic_carbon"] == 0.85
    print("STAGE 6 SOIL PROFILE TESTS PASSED!")

    # --- STAGE 7: OPEN-METEO WEATHER TESTS ---
    curr_weather = client.get(f"/api/farms/{farm_id}/weather/current", headers=headers)
    assert curr_weather.status_code == 200, curr_weather.text
    cw_data = curr_weather.json()
    assert cw_data["source"] == "Open-Meteo"
    assert "temperature_2m" in cw_data
    assert "relative_humidity_2m" in cw_data

    fc_weather = client.get(f"/api/farms/{farm_id}/weather/forecast", headers=headers)
    assert fc_weather.status_code == 200, fc_weather.text
    fc_data = fc_weather.json()
    assert fc_data["source"] == "Open-Meteo"
    assert "forecast_rain_24h_mm" in fc_data
    assert len(fc_data["hourly_timeline"]) > 0

    hist_weather = client.get(f"/api/farms/{farm_id}/weather/history", headers=headers)
    assert hist_weather.status_code == 200, hist_weather.text
    hist_data = hist_weather.json()
    assert hist_data["source"] == "Open-Meteo"
    assert "previous_24h_rain_mm" in hist_data
    print("STAGE 7 OPEN-METEO WEATHER TESTS PASSED!")

    # --- STAGE 8: RAINFALL ANALYSIS ENGINE TESTS ---
    rain_analysis = client.get(f"/api/farms/{farm_id}/rain-analysis", headers=headers)
    assert rain_analysis.status_code == 200, rain_analysis.text
    ra_data = rain_analysis.json()
    assert ra_data["risk_classification_name"] == "Application Rain Risk"
    assert ra_data["application_rain_risk"] in ["LOW", "MODERATE", "HIGH", "EXTREME"]
    assert "derived_metrics" in ra_data
    assert "antecedent_rainfall_index" in ra_data["derived_metrics"]
    assert "forecast_rain_24h" in ra_data["derived_metrics"]
    print("STAGE 8 RAINFALL ANALYSIS ENGINE TESTS PASSED!")

    print("ALL STAGE 6, 7 & 8 TESTS PASSED CLEANLY!")


if __name__ == "__main__":
    test_stage_6_7_8_complete()
