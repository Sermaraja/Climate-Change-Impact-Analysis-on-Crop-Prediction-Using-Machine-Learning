import sys
import os
from datetime import date, timedelta
from fastapi.testclient import TestClient

# Ensure app is in Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database import engine, Base
from app.init_db import init_db
from app.seed_crops import seed_crops
from app.seed_crop_stress import seed_crop_stress_knowledge_base

client = TestClient(app)


def test_stages_12_to_16_complete():
    print("\n=== STARTING STAGES 12 - 16 COMPREHENSIVE BACKEND INTEGRATION TEST ===")
    init_db()
    seed_crops()
    seed_crop_stress_knowledge_base()

    # 1. Register User & Auth
    auth_req = {
        "full_name": "Stage 12-16 Test Farmer",
        "email": "farmer1216_unique@example.com",
        "password": "Password123!",
        "preferred_language": "en"
    }
    reg_res = client.post("/api/auth/register", json=auth_req)
    if reg_res.status_code != 201:
        login_res = client.post("/api/auth/login", json={"email": auth_req["email"], "password": auth_req["password"]})
    else:
        login_res = client.post("/api/auth/login", json={"email": auth_req["email"], "password": auth_req["password"]})

    assert login_res.status_code == 200, login_res.text

    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Farm
    farm_res = client.post("/api/farms", json={
        "farm_name": "Stage 12-16 Test Paddy Farm",
        "latitude": 10.7870,
        "longitude": 79.1378,
        "state": "Tamil Nadu",
        "district": "Thanjavur",
        "village": "Pattukkottai",
        "drainage_class": "POOR",
        "area_acres": 4.5
    }, headers=headers)
    assert farm_res.status_code == 201, farm_res.text
    farm_id = farm_res.json()["id"]

    # 3. Assign Active Crop (Paddy)
    crops_res = client.get("/api/crops")
    paddy_id = next(c["id"] for c in crops_res.json() if c["name"] == "Paddy")
    crop_assign = client.post(f"/api/farms/{farm_id}/crop", json={
        "crop_id": paddy_id,
        "planting_date": (date.today() - timedelta(days=50)).isoformat(),
        "season": "Samba",
        "user_stage_override": "Tillering"
    }, headers=headers)
    assert crop_assign.status_code == 201, crop_assign.text

    # --- STAGE 14: ANALYSE MY CROP MASTER PIPELINE TEST ---
    analyse_res = client.post(f"/api/farms/{farm_id}/analyse-rain-impact", headers=headers)
    assert analyse_res.status_code == 201, analyse_res.text
    data = analyse_res.json()

    print("\nSTAGE 14 ANALYSE MY CROP RESPONSE SUMMARY:")
    print(f"Analysis ID: {data['analysis_id']}")
    print(f"Primary Results: {data['primary_results']}")
    print(f"Prediction Method: {data['why_this_result']['prediction_method_label']}")

    assert "primary_results" in data
    assert data["primary_results"]["application_rain_risk"] in ["LOW_WASH_RISK", "MODERATE_WASH_RISK", "HIGH_WASH_RISK"]
    assert data["primary_results"]["waterlogging_risk"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert data["primary_results"]["crop_damage_risk"] in ["LOW", "MODERATE", "HIGH", "SEVERE"]
    assert data["primary_results"]["survival_potential"] in ["LOW", "MEDIUM", "HIGH"]
    assert data["primary_results"]["recovery_potential"] in ["LOW", "MEDIUM", "HIGH"]
    assert data["primary_results"]["crop_loss_risk"] in ["LOW", "MODERATE", "HIGH"]
    print("STAGE 14 TEST PASSED CLEANLY!")

    # --- STAGE 13: EXPLAINABLE PREDICTION ENGINE API TEST ---
    prediction_id = data["analysis_id"]
    exp_res = client.get(f"/api/predictions/{prediction_id}/explanation", headers=headers)
    assert exp_res.status_code == 200, exp_res.text
    exp_data = exp_res.json()

    assert "why_this_result" in exp_data
    assert len(exp_data["why_this_result"]) > 0
    assert "prediction_method_label" in exp_data
    print("STAGE 13 EXPLAINABLE PREDICTION ENGINE TEST PASSED!")

    # --- STAGE 15: FARMER RECOMMENDATIONS TEST ---
    assert "action_recommendations" in data
    recs = data["action_recommendations"]
    assert "BEFORE_RAIN" in recs
    assert "DURING_RAIN_EVENT" in recs
    assert "AFTER_RAIN" in recs
    assert len(recs["BEFORE_RAIN"]) > 0
    print("STAGE 15 EVIDENCE-BASED ACTION ENGINE TEST PASSED!")

    # --- STAGE 16: POST-RAIN ASSESSMENT TEST ---
    post_res = client.post(f"/api/farms/{farm_id}/post-rain-assessment", json={
        "standing_water": "YES",
        "standing_water_duration": "24-48 hours",
        "leaf_condition": "Yellowing",
        "plant_condition": "Standing",
        "visible_damage": "Moderate",
        "farmer_notes": "Standing water remained for 30 hours after heavy monsoon downpour."
    }, headers=headers)
    assert post_res.status_code == 201, post_res.text
    post_data = post_res.json()

    assert "updated_evaluation" in post_data
    assert post_data["updated_evaluation"]["updated_recovery_potential"] in ["LOW", "MEDIUM", "HIGH"]
    assert post_data["updated_evaluation"]["updated_crop_loss_risk"] in ["LOW", "MODERATE", "HIGH"]

    hist_res = client.get(f"/api/farms/{farm_id}/post-rain-assessment", headers=headers)
    assert hist_res.status_code == 200, hist_res.text
    assert len(hist_res.json()) >= 1
    print("STAGE 16 POST-RAIN ASSESSMENT TEST PASSED!")

    print("\nALL STAGES 12, 13, 14, 15 & 16 BACKEND TESTS PASSED CLEANLY!")


if __name__ == "__main__":
    test_stages_12_to_16_complete()
