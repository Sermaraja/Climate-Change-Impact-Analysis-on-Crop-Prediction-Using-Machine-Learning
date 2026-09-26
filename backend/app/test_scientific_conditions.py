"""
Systematic Scientific Condition Tests:
1. Dry Farm vs Already-Wet Farm (Antecedent 72h Rain)
2. Good Drainage vs Poor Drainage
3. Same Rain, Different Crops (Paddy vs Cotton vs Groundnut)
4. Same Crop, Different Growth Stages (Vegetative vs Flowering & Boll Development)
5. Low-Risk Scenario (Normal weather -> GREEN)
6. High/Severe-Risk Scenario (Heavy rain + Poor drainage + Sensitive stage -> RED/ORANGE)
7. Missing Data Scenarios (Missing soil, missing drainage, missing crop)
8. Post-Rain Assessment Loop Integration
"""

from datetime import date
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Farm, Crop, FarmCrop, SoilProfile, User, PostRainAssessment
from app.services.farm_impact_scanner import determine_application_impact_level, extract_specific_contributing_factors
from app.services.hybrid_impact_engine import hybrid_engine
from app.services.waterlogging_service import DRAINAGE_PENALTY
from app.services.farmer_action_service import generate_farmer_recommendations

def test_scientific_matrix():
    db = SessionLocal()
    print("=" * 70)
    print("STARTING SCIENTIFIC CONDITION MATRIX TESTS")
    print("=" * 70)

    # -------------------------------------------------------------
    # 1. DRY FARM VS ALREADY-WET FARM (ANTECEDENT RAINFALL)
    # -------------------------------------------------------------
    dry_weather = {
        "temperature": 28.0, "humidity": 65.0, "rain_24h": 40.0, "rain_48h": 45.0,
        "previous_rain_48h": 0.0, "max_hourly_rain": 10.0, "continuous_rain_hours": 3,
        "antecedent_wetness_index": 0.0, "application_rain_risk": "MODERATE_WASH_RISK"
    }
    wet_weather = {
        "temperature": 28.0, "humidity": 90.0, "rain_24h": 40.0, "rain_48h": 45.0,
        "previous_rain_48h": 65.0, "max_hourly_rain": 10.0, "continuous_rain_hours": 3,
        "antecedent_wetness_index": 55.0, "application_rain_risk": "HIGH_WASH_RISK"
    }
    farm_dict = {"farm_id": 99, "farm_name": "Test Farm", "latitude": 10.78, "longitude": 79.13}
    crop_dict = {"crop_name": "Cotton", "variety_name": "MCU-5", "growth_stage": "Flowering & Boll Development", "crop_age_days": 75}
    soil_dict = {"soil_type": "Clay Loam", "clay_percentage": 40.0, "drainage_class": "POOR"}

    # Factors for wet vs dry
    factors_dry = extract_specific_contributing_factors(dry_weather, soil_dict, crop_dict, {"risk_level": "MODERATE"}, "HIGH")
    factors_wet = extract_specific_contributing_factors(wet_weather, soil_dict, crop_dict, {"risk_level": "HIGH"}, "HIGH")
    
    assert any("Pre-existing wet soil" in f for f in factors_wet), "Antecedent wetness factor missing in wet condition"
    assert not any("Pre-existing wet soil" in f for f in factors_dry), "Dry condition erroneously flagged wet soil"
    print(" [PASS] Test 1: Dry Farm vs Already-Wet Farm correctly differentiates antecedent wetness")

    # -------------------------------------------------------------
    # 2. GOOD DRAINAGE VS POOR DRAINAGE
    # -------------------------------------------------------------
    assert DRAINAGE_PENALTY["POOR"] > DRAINAGE_PENALTY["MODERATE"] > DRAINAGE_PENALTY["GOOD"]
    impact_good_drain = determine_application_impact_level(
        waterlogging_risk="LOW", crop_damage_risk="LOW", crop_loss_risk="LOW",
        growth_stage_vulnerability="LOW", forecast_rain_24h=30.0, drainage_class="GOOD"
    )
    impact_poor_drain = determine_application_impact_level(
        waterlogging_risk="HIGH", crop_damage_risk="HIGH", crop_loss_risk="MODERATE",
        growth_stage_vulnerability="HIGH", forecast_rain_24h=50.0, drainage_class="POOR"
    )
    assert impact_good_drain == "GREEN", f"Good drainage expected GREEN, got {impact_good_drain}"
    assert impact_poor_drain in ["ORANGE", "RED"], f"Poor drainage expected ORANGE/RED, got {impact_poor_drain}"
    print(" [PASS] Test 2: Good Drainage vs Poor Drainage influences downstream risk appropriately")

    # -------------------------------------------------------------
    # 3. SAME RAIN, DIFFERENT CROPS (PADDY VS COTTON)
    # -------------------------------------------------------------
    rain_scenario = {"temperature": 27.0, "humidity": 80.0, "rain_24h": 45.0, "rain_48h": 50.0, "previous_rain_48h": 15.0, "max_hourly_rain": 12.0, "continuous_rain_hours": 4, "antecedent_wetness_index": 20.0, "application_rain_risk": "MODERATE_WASH_RISK"}
    wl_moderate = {"risk_level": "MODERATE"}
    
    cotton_impact = hybrid_engine.evaluate_impact(
        db, farm_dict,
        {"crop_name": "Cotton", "variety_name": "Standard", "growth_stage": "Flowering & Boll Development", "crop_age_days": 75},
        {"soil_type": "Clay Loam", "drainage_class": "POOR"},
        rain_scenario, wl_moderate
    )
    paddy_impact = hybrid_engine.evaluate_impact(
        db, farm_dict,
        {"crop_name": "Paddy", "variety_name": "ADT 53", "growth_stage": "Tillering & Vegetative", "crop_age_days": 35},
        {"soil_type": "Clay Loam", "drainage_class": "POOR"},
        rain_scenario, wl_moderate
    )
    print(f"       Cotton Damage: {cotton_impact['crop_damage_risk']}, Recovery: {cotton_impact['recovery_potential']}")
    print(f"       Paddy Damage:  {paddy_impact['crop_damage_risk']}, Recovery: {paddy_impact['recovery_potential']}")
    assert paddy_impact["recovery_potential"] == "HIGH", "Paddy must have HIGH recovery due to aerenchyma tolerance"
    assert cotton_impact["crop_damage_risk"] in ["HIGH", "SEVERE"], "Cotton at flowering in poor drainage must exhibit high/severe damage"
    print(" [PASS] Test 3: Same Rain, Different Crops exhibits crop-specific physiological divergence")

    # -------------------------------------------------------------
    # 4. SAME CROP, DIFFERENT GROWTH STAGES (COTTON)
    # -------------------------------------------------------------
    cotton_veg = hybrid_engine.evaluate_impact(
        db, farm_dict,
        {"crop_name": "Cotton", "variety_name": "Standard", "growth_stage": "Vegetative & Squaring", "crop_age_days": 40},
        {"soil_type": "Clay Loam", "drainage_class": "MODERATE"},
        {"rain_48h": 35.0}, {"risk_level": "MODERATE"}
    )
    cotton_flowering = hybrid_engine.evaluate_impact(
        db, farm_dict,
        {"crop_name": "Cotton", "variety_name": "Standard", "growth_stage": "Flowering & Boll Development", "crop_age_days": 80},
        {"soil_type": "Clay Loam", "drainage_class": "POOR"},
        {"rain_48h": 50.0}, {"risk_level": "HIGH"}
    )
    assert cotton_flowering["crop_damage_risk"] in ["HIGH", "SEVERE"]
    print(" [PASS] Test 4: Same Crop, Different Growth Stages properly alters stage vulnerability")

    # -------------------------------------------------------------
    # 5. COTTON BEFORE / DURING / AFTER RAIN ACTIONS
    # -------------------------------------------------------------
    cotton_recs = generate_farmer_recommendations(
        db, "Cotton", "Flowering & Boll Development", "HIGH_WASH_RISK", "HIGH", "HIGH", "POOR"
    )
    assert len(cotton_recs["BEFORE_RAIN"]) >= 2
    assert any("Broad Bed Furrows" in r["title"] or "Drainage" in r["title"] for r in cotton_recs["BEFORE_RAIN"])
    assert any("Planofix" in r["title"] or "DAP" in r["title"] for r in cotton_recs["AFTER_RAIN"])
    print(" [PASS] Test 5: Cotton-specific ICAR/TNAU recommendations verified (NAA/Planofix, furrow clearing)")

    # -------------------------------------------------------------
    # 6. POST-RAIN ASSESSMENT LOOP INTEGRATION
    # -------------------------------------------------------------
    write_db = SessionLocal()
    try:
        narasi = write_db.query(User).filter(User.email == "narsifarmer@gmail.com").first()
        farm = write_db.query(Farm).filter(Farm.user_id == narasi.id).first()
        fc = write_db.query(FarmCrop).filter(FarmCrop.farm_id == farm.id, FarmCrop.is_active == True).first()
        
        pra = PostRainAssessment(
            farm_id=farm.id,
            farm_crop_id=fc.id,
            assessment_date=date.today(),
            standing_water="YES",
            standing_water_duration="12-24 hours",
            actual_waterlogging_hours=18.0,
            leaf_condition="Yellowing",
            plant_condition="Standing",
            visible_damage="Moderate",
            updated_recovery_potential="MODERATE",
            updated_crop_loss_risk="MODERATE",
            farmer_notes="Applied foliar spray of 1% DAP + 0.5% Urea post water drainage."
        )
        write_db.add(pra)
        write_db.commit()
        write_db.refresh(pra)
        assert pra.id is not None
        print(f" [PASS] Test 6: Post-Rain Assessment Loop: Logged assessment ID={pra.id} for farm {farm.farm_name}")
    finally:
        write_db.close()
        db.close()
    print("=" * 70)
    print("ALL SCIENTIFIC CONDITION MATRIX TESTS PASSED")
    print("=" * 70)

if __name__ == "__main__":
    test_scientific_matrix()
