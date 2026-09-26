"""
Comprehensive Automated Test Suite for Farm-Specific Weather Warning -> Crop Impact System
Tests all mandatory scenarios via direct services and FastAPI TestClient.
"""

import sys
import os
from datetime import date

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User
from app.models.farm import Farm
from app.models.crop import Crop, CropGrowthStage, FarmCrop
from app.models.farm_impact_alert import FarmImpactAlert
from app.services.farm_impact_scanner import (
    farm_impact_scanner,
    scan_single_farm_impact,
    determine_application_impact_level
)
from app.services.weather_warning_service import weather_warning_service
from app.services.alert_service import alert_service
from app.services.auth_service import hash_password, create_access_token

client = TestClient(app)


def run_all_tests():
    print("=" * 70)
    print("STARTING TEST SUITE: FARM-SPECIFIC WEATHER WARNING -> CROP IMPACT")
    print("=" * 70)

    db = SessionLocal()
    passed = 0
    total = 0

    def assert_test(cond, title):
        nonlocal passed, total
        total += 1
        if cond:
            passed += 1
            print(f" [PASS] {title}")
        else:
            print(f" [FAIL] {title}")
            assert cond, f"Failed: {title}"

    # TEST SCENARIO 1: Classification Logic (GREEN, YELLOW, ORANGE, RED)
    red_level = determine_application_impact_level(
        waterlogging_risk="HIGH",
        crop_damage_risk="SEVERE",
        crop_loss_risk="SEVERE",
        growth_stage_vulnerability="HIGH",
        forecast_rain_24h=75.0,
        drainage_class="POOR"
    )
    assert_test(red_level == "RED", "Scenario: High waterlogging + Severe damage + Sensitive stage = RED")

    orange_level = determine_application_impact_level(
        waterlogging_risk="MODERATE",
        crop_damage_risk="HIGH",
        crop_loss_risk="MODERATE",
        growth_stage_vulnerability="MODERATE",
        forecast_rain_24h=48.0,
        drainage_class="POOR"
    )
    assert_test(orange_level == "ORANGE", "Scenario: Moderate waterlogging + High damage in poor drainage = ORANGE")

    yellow_level = determine_application_impact_level(
        waterlogging_risk="MODERATE",
        crop_damage_risk="LOW",
        crop_loss_risk="LOW",
        growth_stage_vulnerability="MODERATE",
        forecast_rain_24h=28.0,
        drainage_class="MODERATE"
    )
    assert_test(yellow_level == "YELLOW", "Scenario: Moderate waterlogging + 28mm rain = YELLOW")

    green_level = determine_application_impact_level(
        waterlogging_risk="LOW",
        crop_damage_risk="LOW",
        crop_loss_risk="LOW",
        growth_stage_vulnerability="LOW",
        forecast_rain_24h=5.0,
        drainage_class="GOOD"
    )
    assert_test(green_level == "GREEN", "Scenario: Low waterlogging + Good drainage = GREEN")

    # TEST SCENARIO 2: Official Warning Separation (Never manufacture official warning)
    official_check_tiru = weather_warning_service.get_official_warning_for_location(district="Tirunelveli")
    assert_test(
        official_check_tiru["is_available"] == True and official_check_tiru["warning_level"] == "ORANGE",
        "Official Warning Separation: Verified bulletin returned for Tirunelveli"
    )
    official_check_unknown = weather_warning_service.get_official_warning_for_location(district="Coimbatore")
    assert_test(
        official_check_unknown["is_available"] == False and "unavailable" in official_check_unknown["status_text"].lower(),
        "Official Warning Separation: Strict fallback 'Official warning data unavailable' when no bulletin"
    )

    # 3. Setup Test User
    email = "farmer_murugan_qa@cropclimate.ai"
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            password_hash=hash_password("Pass1234!"),
            full_name="Farmer Murugan",
            phone="9876543210",
            role="FARMER"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    auth_token = create_access_token({"sub": str(user.id), "email": user.email})
    headers = {"Authorization": f"Bearer {auth_token}"}

    # Ensure crops exist
    paddy = db.query(Crop).filter(Crop.name == "Paddy").first()
    if not paddy:
        paddy = Crop(name="Paddy", category="Cereal")
        db.add(paddy)
        db.commit()
        db.refresh(paddy)

    maize = db.query(Crop).filter(Crop.name == "Maize").first()
    if not maize:
        maize = Crop(name="Maize", category="Cereal")
        db.add(maize)
        db.commit()
        db.refresh(maize)

    # Clean existing test farms
    db.query(Farm).filter(Farm.user_id == user.id).delete()
    db.commit()

    # TEST SCENARIO 3: Farm without Crop
    farm_empty = Farm(
        user_id=user.id,
        farm_name="East Field (No Crop)",
        latitude=10.787,
        longitude=79.137,
        area_acres=3.5,
        district="Thanjavur",
        state="Tamil Nadu"
    )
    db.add(farm_empty)
    db.commit()
    db.refresh(farm_empty)

    res_empty = scan_single_farm_impact(db, farm_empty)
    assert_test(res_empty["has_crop"] == False, "Farm without crop: has_crop is False")
    assert_test("Add the crop" in res_empty["status_message"], "Farm without crop: Clear professional message shown")
    assert_test(res_empty["application_impact_level"] == "UNKNOWN", "Farm without crop: Impact level is UNKNOWN")

    # TEST SCENARIO 4: Farm with Active Crop & Growth Stage
    farm_maize = Farm(
        user_id=user.id,
        farm_name="South Farm (Maize)",
        latitude=8.7139,
        longitude=77.7567,
        area_acres=5.0,
        district="Tirunelveli",
        state="Tamil Nadu",
        drainage_class="POOR"
    )
    db.add(farm_maize)
    db.commit()
    db.refresh(farm_maize)

    crop_maize = FarmCrop(
        farm_id=farm_maize.id,
        crop_id=maize.id,
        planting_date=date(2026, 8, 1),
        is_active=True
    )
    db.add(crop_maize)
    db.commit()
    db.refresh(crop_maize)

    res_maize = scan_single_farm_impact(db, farm_maize)
    assert_test(res_maize["has_crop"] == True, "Farm with crop: has_crop is True")
    assert_test(res_maize["soil_profile"]["drainage_class"] == "POOR", "Drainage: Preserved POOR condition")
    assert_test(len(res_maize["why_this_alert"]["contributing_factors"]) > 0, "Why This Alert: Contributing factors generated")

    # TEST SCENARIO 5: Stage Override / User Confirmed Stage
    crop_maize.user_stage_override = "Flowering"
    db.commit()
    res_maize_confirmed = scan_single_farm_impact(db, farm_maize)
    assert_test(res_maize_confirmed["active_crop"]["growth_stage_source"] == "USER_CONFIRMED", "Stage Source: USER_CONFIRMED when user overrides")

    # TEST SCENARIO 6: Multi-Farm Scanner (All user farms scanned in one call)
    multi_scan = farm_impact_scanner.scan_all_user_farms(db, user.id)
    assert_test(multi_scan["has_farms"] == True, "Multi-Farm Scanner: has_farms True")
    assert_test(multi_scan["summary"]["farms_total"] == 2, "Multi-Farm Scanner: Scanned all 2 user farms")
    assert_test(multi_scan["summary"]["no_crop_count"] == 1, "Multi-Farm Scanner: Correctly identified 1 farm without crop")

    # TEST SCENARIO 7: API Endpoints (GET /api/farm-impact/summary & POST /api/farm-impact/analyse-all)
    api_summary_resp = client.get("/api/farm-impact/summary", headers=headers)
    if api_summary_resp.status_code != 200:
        print("API Summary Error:", api_summary_resp.status_code, api_summary_resp.text)
    assert_test(api_summary_resp.status_code == 200, "API: GET /api/farm-impact/summary returns 200 OK")
    api_summary_data = api_summary_resp.json()
    assert_test("summary" in api_summary_data and "farms" in api_summary_data, "API: Summary contains summary and farms array")

    api_scan_resp = client.post("/api/farm-impact/analyse-all", headers=headers)
    assert_test(api_scan_resp.status_code == 200, "API: POST /api/farm-impact/analyse-all returns 200 OK")

    api_map_resp = client.get("/api/farm-impact/map", headers=headers)
    assert_test(api_map_resp.status_code == 200, "API: GET /api/farm-impact/map returns 200 OK FeatureCollection")

    # TEST SCENARIO 8: Alert Lifecycle API (GET /api/alerts, Acknowledge, Resolve)
    alerts_resp = client.get("/api/alerts", headers=headers)
    assert_test(alerts_resp.status_code == 200, "API: GET /api/alerts returns 200 OK")
    alerts_data = alerts_resp.json()
    assert_test(len(alerts_data) >= 1, "Alert Lifecycle: Farm impact alert present in user list")

    test_alert_id = alerts_data[0]["id"]
    ack_resp = client.post(f"/api/alerts/{test_alert_id}/acknowledge", headers=headers)
    assert_test(ack_resp.status_code == 200 and ack_resp.json()["status"] == "ACKNOWLEDGED", "API: Alert acknowledged successfully")

    res_resp = client.post(f"/api/alerts/{test_alert_id}/resolve", headers=headers)
    assert_test(res_resp.status_code == 200 and res_resp.json()["status"] == "RESOLVED", "API: Alert resolved successfully")

    # TEST SCENARIO 9: Scientific Integrity
    assert_test(
        res_maize["crop_impact_analysis"]["survival_potential"] in ["HIGH", "MODERATE", "LOW"],
        "Scientific Integrity: Survival potential is valid risk class (HIGH/MODERATE/LOW)"
    )
    assert_test(
        res_maize["crop_impact_analysis"]["recovery_potential"] in ["HIGH", "MODERATE", "LOW"],
        "Scientific Integrity: Recovery potential is valid risk class (HIGH/MODERATE/LOW)"
    )

    print("=" * 70)
    print(f"ALL TESTS COMPLETED: {passed}/{total} PASSED")
    print("=" * 70)
    db.close()
    return passed == total


if __name__ == "__main__":
    success = run_all_tests()
    if not success:
        sys.exit(1)
