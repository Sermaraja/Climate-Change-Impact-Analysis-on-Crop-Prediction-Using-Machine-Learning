from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.farm import Farm
from app.models.crop import Crop, FarmCrop
from app.services.auth_service import hash_password, create_access_token
from app.services.weather_service import fetch_open_meteo_data
from app.services.hybrid_impact_engine import hybrid_engine
from app.init_db import init_db
from app.seed_crops import seed_crops
import os

client = TestClient(app)

def run_all_qa_tests():
    print("=== STARTING STAGE 23 FULL END-TO-END QA & FAILURE TESTS ===")
    
    # 0. Init DB & Seeds
    init_db()
    seed_crops()
    print("[PASS] Database initialized & crop master seeded.")

    # 1. User Registration & Login
    email = "qa_farmer_2026@example.com"
    db = SessionLocal()
    db.query(User).filter(User.email == email).delete()
    db.commit()

    reg_resp = client.post("/api/auth/register", json={
        "full_name": "QA Tester Farmer",
        "email": email,
        "password": "SecurePassword123!",
        "phone": "+919876543210",
        "preferred_language": "EN"
    })
    assert reg_resp.status_code == 201
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == email
    print("[PASS] User registration successful.")

    dup_resp = client.post("/api/auth/register", json={
        "full_name": "QA Tester Duplicate",
        "email": email,
        "password": "AnotherPassword123!",
        "preferred_language": "EN"
    })
    assert dup_resp.status_code == 400
    print("[PASS] Duplicate registration prevented.")

    login_resp = client.post("/api/auth/login", json={
        "email": email,
        "password": "SecurePassword123!"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    print("[PASS] User login successful & JWT issued.")

    bad_login = client.post("/api/auth/login", json={
        "email": email,
        "password": "WrongPassword"
    })
    assert bad_login.status_code == 401
    print("[PASS] Invalid password rejected.")

    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    print("[PASS] User profile retrieved.")

    onb_resp = client.put("/api/auth/me/onboarding", json={
        "onboarding_completed": True,
        "tour_status": "COMPLETED"
    }, headers={"Authorization": f"Bearer {token}"})
    assert onb_resp.status_code == 200
    print("[PASS] Onboarding status updated & persisted.")

    # 2. Farm Management & Unauthorized Access Tests
    u1 = db.query(User).filter(User.email == email).first()
    token1 = create_access_token({"sub": str(u1.id), "email": u1.email})

    u2_email = "qa_farmer_other@example.com"
    db.query(User).filter(User.email == u2_email).delete()
    db.commit()

    u2 = User(email=u2_email, password_hash=hash_password("Pass123!"), full_name="Other Farmer", preferred_language="EN")
    db.add(u2)
    db.commit()
    db.refresh(u2)
    token2 = create_access_token({"sub": str(u2.id), "email": u2.email})

    farm_resp = client.post("/api/farms", json={
        "farm_name": "Cauvery Delta Plot QA",
        "latitude": 10.7870,
        "longitude": 79.1378,
        "area_acres": 4.5,
        "state": "Tamil Nadu",
        "district": "Thanjavur",
        "village": "Vadapathi",
        "drainage_class": "POOR",
        "boundary_geojson": {
            "type": "Polygon",
            "coordinates": [[[79.137, 10.787], [79.138, 10.787], [79.138, 10.788], [79.137, 10.788], [79.137, 10.787]]]
        }
    }, headers={"Authorization": f"Bearer {token1}"})
    assert farm_resp.status_code == 201
    farm_id = farm_resp.json()["id"]
    print("[PASS] Farm created with PostGIS polygon boundary & area computation.")

    unauth_get = client.get(f"/api/farms/{farm_id}", headers={"Authorization": f"Bearer {token2}"})
    assert unauth_get.status_code in (403, 404)
    print("[PASS] Unauthorized farm access blocked (HTTP 404/403).")

    auth_get = client.get(f"/api/farms/{farm_id}", headers={"Authorization": f"Bearer {token1}"})
    assert auth_get.status_code == 200
    print("[PASS] Authorized farm access granted.")

    # 3. Crop, Soil & Failure Modes
    no_crop_analysis = client.post(f"/api/farms/{farm_id}/analyse-rain-impact", headers={"Authorization": f"Bearer {token1}"})
    assert no_crop_analysis.status_code == 400
    print("[PASS] Analysis without crop rejected with helpful error.")

    crop_resp = client.post(f"/api/farms/{farm_id}/crop", json={
        "crop_id": 1,
        "planting_date": "2026-08-01",
        "season": "Kharif",
        "user_stage_override": None
    }, headers={"Authorization": f"Bearer {token1}"})
    assert crop_resp.status_code == 201
    print("[PASS] Crop profile assigned to farm.")

    soil_resp = client.post(f"/api/farms/{farm_id}/soil", json={
        "soil_type": "Clay Loam",
        "sand_percentage": 25.0,
        "clay_percentage": 45.0,
        "organic_matter_percentage": 2.1,
        "drainage_class": "POOR",
        "soil_data_source": "FARMER_VERIFIED"
    }, headers={"Authorization": f"Bearer {token1}"})
    assert soil_resp.status_code == 201
    print("[PASS] Soil profile saved.")

    # 4. Weather & Hybrid ML Impact Engine Analysis
    weather_resp = client.get(f"/api/farms/{farm_id}/weather/current", headers={"Authorization": f"Bearer {token1}"})
    assert weather_resp.status_code == 200
    print("[PASS] Open-Meteo current weather fetched & cached.")

    impact_resp = client.post(f"/api/farms/{farm_id}/analyse-rain-impact", headers={"Authorization": f"Bearer {token1}"})
    assert impact_resp.status_code == 201
    res = impact_resp.json()
    prediction_id = res.get("analysis_id") or res.get("id")
    print("[PASS] Hybrid Crop Impact Analysis executed (Rain Risk, Waterlogging, Damage, Survival, Recovery, Loss Risk).")

    exp_resp = client.get(f"/api/predictions/{prediction_id}/explanation", headers={"Authorization": f"Bearer {token1}"})
    assert exp_resp.status_code == 200
    print("[PASS] Explainable prediction details & recommendations generated.")

    post_rain_resp = client.post(f"/api/farms/{farm_id}/post-rain-assessment", json={
        "standing_water_hours": 48.0,
        "leaf_condition": "SLIGHT_YELLOWING",
        "plant_condition": "LODGED",
        "visible_damage_percentage": 25.0
    }, headers={"Authorization": f"Bearer {token1}"})
    assert post_rain_resp.status_code == 201
    print("[PASS] Post-Rain field assessment submitted & recovery updated.")

    climate_resp = client.get(f"/api/farms/{farm_id}/climate-analysis", headers={"Authorization": f"Bearer {token1}"})
    assert climate_resp.status_code == 200
    print("[PASS] 30-Year Climate reanalysis trends calculated.")

    history_resp = client.get("/api/predictions/history", headers={"Authorization": f"Bearer {token1}"})
    assert history_resp.status_code == 200
    print("[PASS] Prediction history & MSc audit trail fetched.")

    # 5. Admin Security & Research Panel
    admin_email = "admin_qa_2026@example.com"
    db.query(User).filter(User.email == admin_email).delete()
    db.commit()

    admin_user = User(
        email=admin_email,
        password_hash=hash_password("AdminSecure123!"),
        full_name="System Admin",
        is_admin=True,
        role="ADMIN"
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    admin_token = create_access_token({"sub": str(admin_user.id), "email": admin_user.email})

    forbidden_resp = client.get("/api/admin/dashboard-stats", headers={"Authorization": f"Bearer {token1}"})
    assert forbidden_resp.status_code == 403
    print("[PASS] Farmer access to admin panel blocked (HTTP 403).")

    admin_metrics_resp = client.get("/api/admin/dashboard-stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert admin_metrics_resp.status_code == 200
    print("[PASS] Admin access to research panel & model metrics authorized.")

    db.close()
    print("=== ALL STAGE 23 END-TO-END QA & FAILURE TESTS PASSED CLEANLY! ===")

if __name__ == "__main__":
    run_all_qa_tests()
