import sys
import os
from sqlalchemy.orm import Session

# Ensure app is in Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base, SessionLocal
from app.models.crop import Crop, CropGrowthStage
from app.models.crop_stress import (
    EvidenceSource,
    CropStressProfile,
    CropStageStressProfile,
    CropRecoveryProfile,
    AgronomicRecommendation,
)


def seed_crop_stress_knowledge_base():
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        print("Seeding Evidence-Based Crop Stress Knowledge Base (Stage 10B)...")

        # 1. Seed Evidence Sources
        sources = [
            {
                "id": 1,
                "source_name": "TNAU Agritech Portal - Crop Production & Protection Guidelines",
                "provider_institution": "Tamil Nadu Agricultural University (TNAU)",
                "publication_title": "Agri-Information Portal - Disaster Management & Crop Submergence Guidelines",
                "url_or_doi": "https://agritech.tnau.ac.in/crop_protection/crop_prot.html",
                "confidence_level": "HIGH",
            },
            {
                "id": 2,
                "source_name": "ICAR National Institute of Abiotic Stress Management (NIASM)",
                "provider_institution": "Indian Council of Agricultural Research (ICAR)",
                "publication_title": "Technical Bulletin: Flooding & Waterlogging Management in Indian Field Crops",
                "url_or_doi": "https://icar.org.in/node/14205",
                "confidence_level": "HIGH",
            },
            {
                "id": 3,
                "source_name": "IRRI Rice Flood & Submergence Research Manual",
                "provider_institution": "International Rice Research Institute (IRRI)",
                "publication_title": "Sub1 Gene Submergence Tolerance in Rainfed Lowland Rice Systems",
                "url_or_doi": "https://www.irri.org/submergence-tolerant-rice",
                "confidence_level": "HIGH",
            },
        ]

        for s_data in sources:
            existing = db.query(EvidenceSource).filter_by(id=s_data["id"]).first()
            if not existing:
                db.add(EvidenceSource(**s_data))

        db.commit()

        # Map crop names to Crop IDs in database
        crops = db.query(Crop).all()
        crop_map = {c.name.strip().lower(): c for c in crops}

        primary_crop_names = [
            "Paddy", "Maize", "Groundnut", "Cotton", "Banana",
            "Sugarcane", "Tomato", "Chilli", "Onion", "Pulses"
        ]

        # Ensure primary crops exist in crops table if not already created
        for cname in primary_crop_names:
            if cname.lower() not in crop_map:
                new_c = Crop(name=cname, category="Field Crop", description=f"{cname} crop profile")
                db.add(new_c)
                db.commit()
                crop_map[cname.lower()] = new_c

        # 2. Seed Crop Stress Profiles
        stress_profiles_data = [
            {
                "crop": "Paddy",
                "stress_type": "SUBMERGENCE",
                "rainfall_sensitivity": "MODERATE",
                "waterlogging_sensitivity": "LOW",
                "submergence_tolerance_qualitative": "HIGH",
                "critical_duration_hours": 144, # ~6 days for standard varieties, longer for Sub1
                "evidence_source_id": 3,
                "evidence_reference": "IRRI Sub1 Gene Manual / TNAU Agritech",
                "notes": "Paddy tolerates standing water during vegetative stage; complete submergence exceeding 7-10 days causes severe chlorosis and stem decay unless Sub1 variety."
            },
            {
                "crop": "Maize",
                "stress_type": "WATERLOGGING",
                "rainfall_sensitivity": "HIGH",
                "waterlogging_sensitivity": "CRITICAL",
                "submergence_tolerance_qualitative": "LOW",
                "critical_duration_hours": 48,
                "evidence_source_id": 2,
                "evidence_reference": "ICAR-NIASM Technical Bulletin on Maize Abiotic Stress",
                "notes": "Maize root systems undergo severe anoxia under 24-48 hours of standing water leading to leaf yellowing and adventitious root growth failure."
            },
            {
                "crop": "Groundnut",
                "stress_type": "WATERLOGGING",
                "rainfall_sensitivity": "HIGH",
                "waterlogging_sensitivity": "HIGH",
                "submergence_tolerance_qualitative": "LOW",
                "critical_duration_hours": 36,
                "evidence_source_id": 1,
                "evidence_reference": "TNAU Agritech Groundnut Water Stress Guide",
                "notes": "Excessive soil saturation during pegging or pod development causes pod rot (Aspergillus flavus) and nitrogen fixation collapse."
            },
            {
                "crop": "Cotton",
                "stress_type": "WATERLOGGING",
                "rainfall_sensitivity": "HIGH",
                "waterlogging_sensitivity": "HIGH",
                "submergence_tolerance_qualitative": "LOW",
                "critical_duration_hours": 48,
                "evidence_source_id": 1,
                "evidence_reference": "TNAU Agritech Cotton Advisory",
                "notes": "Standing water for >48h triggers heavy boll shedding, square drop, and root hypoxia in heavy clay black soils."
            },
            {
                "crop": "Banana",
                "stress_type": "WATERLOGGING",
                "rainfall_sensitivity": "MODERATE",
                "waterlogging_sensitivity": "HIGH",
                "submergence_tolerance_qualitative": "MODERATE",
                "critical_duration_hours": 72,
                "evidence_source_id": 1,
                "evidence_reference": "TNAU Agritech Horticulture Manual",
                "notes": "Waterlogging >72h leads to pseudostem collapse, root suffocation, and secondary Panama wilt infection risk."
            },
            {
                "crop": "Sugarcane",
                "stress_type": "WATERLOGGING",
                "rainfall_sensitivity": "LOW",
                "waterlogging_sensitivity": "LOW",
                "submergence_tolerance_qualitative": "HIGH",
                "critical_duration_hours": 168, # 7 days
                "evidence_source_id": 1,
                "evidence_reference": "TNAU Agritech Sugarcane Guide",
                "notes": "High waterlogging tolerance during grand growth phase; however prolonged stagnation reduces cane juice brix percentage."
            },
            {
                "crop": "Tomato",
                "stress_type": "HEAVY_RAIN",
                "rainfall_sensitivity": "CRITICAL",
                "waterlogging_sensitivity": "CRITICAL",
                "submergence_tolerance_qualitative": "LOW",
                "critical_duration_hours": 24,
                "evidence_source_id": 1,
                "evidence_reference": "TNAU Vegetable Crops Protection Guide",
                "notes": "Highly sensitive to excess moisture; 24h soil saturation causes epinasty, flower drop, root rot (Pythium/Phytophthora), and fruit cracking."
            },
            {
                "crop": "Chilli",
                "stress_type": "WATERLOGGING",
                "rainfall_sensitivity": "CRITICAL",
                "waterlogging_sensitivity": "CRITICAL",
                "submergence_tolerance_qualitative": "LOW",
                "critical_duration_hours": 24,
                "evidence_source_id": 1,
                "evidence_reference": "TNAU Chilli Advisory",
                "notes": "Wilting occurs rapidly within 24-36 hours of flooding due to acute oxygen deficiency in the root zone."
            },
            {
                "crop": "Onion",
                "stress_type": "WATERLOGGING",
                "rainfall_sensitivity": "HIGH",
                "waterlogging_sensitivity": "CRITICAL",
                "submergence_tolerance_qualitative": "LOW",
                "critical_duration_hours": 36,
                "evidence_source_id": 1,
                "evidence_reference": "ICAR-DOGR Onion Waterlogging Guidelines",
                "notes": "Excess rain during bulb development causes bulb rot, purple blotch outbreak, and complete crop loss."
            },
            {
                "crop": "Pulses",
                "stress_type": "WATERLOGGING",
                "rainfall_sensitivity": "HIGH",
                "waterlogging_sensitivity": "HIGH",
                "submergence_tolerance_qualitative": "LOW",
                "critical_duration_hours": 36,
                "evidence_source_id": 2,
                "evidence_reference": "ICAR-IIPR Pulses Abiotic Stress Guide",
                "notes": "Blackgram/Greengram are extremely vulnerable to waterlogging during flowering, resulting in 50-80% yield reduction due to flower drop."
            },
        ]

        for p in stress_profiles_data:
            c = crop_map.get(p["crop"].lower())
            if c:
                existing = db.query(CropStressProfile).filter_by(crop_id=c.id, stress_type=p["stress_type"]).first()
                if not existing:
                    sp = CropStressProfile(
                        crop_id=c.id,
                        stress_type=p["stress_type"],
                        rainfall_sensitivity=p["rainfall_sensitivity"],
                        waterlogging_sensitivity=p["waterlogging_sensitivity"],
                        submergence_tolerance_qualitative=p["submergence_tolerance_qualitative"],
                        critical_duration_hours=p["critical_duration_hours"],
                        evidence_source_id=p["evidence_source_id"],
                        evidence_reference=p["evidence_reference"],
                        notes=p["notes"]
                    )
                    db.add(sp)

        # 3. Seed Agronomic Recommendations
        recs_data = [
            {
                "crop": "Paddy",
                "trigger_stress_type": "SUBMERGENCE",
                "trigger_severity_level": "HIGH",
                "recommendation_title": "Post-Submergence Drainage and Foliar Nutrient Management",
                "action_steps": "1. Drain excess field water immediately to expose upper canopy.\n2. Apply foliar spray of 1% Urea + 0.5% Zinc Sulphate to restore photosynthetic activity after flood water recedes.\n3. Avoid heavy basal nitrogen application until new tillers emerge.",
                "timing_window_hours": 48,
                "evidence_source_id": 1
            },
            {
                "crop": "Maize",
                "trigger_stress_type": "WATERLOGGING",
                "trigger_severity_level": "HIGH",
                "recommendation_title": "Field De-watering and Soil Aeration Protocol",
                "action_steps": "1. Dig surface drainage channels along field boundaries to drain stagnant water within 24 hours.\n2. Spray 0.5% Potassium Nitrate (13-0-45) to reduce chlorosis.\n3. Apply earthing up once soil dries to improve soil aeration.",
                "timing_window_hours": 24,
                "evidence_source_id": 2
            },
            {
                "crop": "Tomato",
                "trigger_stress_type": "WATERLOGGING",
                "trigger_severity_level": "CRITICAL",
                "recommendation_title": "Fungal Rot Prevention and Ridge Drainage",
                "action_steps": "1. Immediately drain standing water from furrows.\n2. Drench soil around root zone with Copper Oxychloride (2.5g/L) or Trichoderma viride to prevent Phytophthora root rot.\n3. Remove decayed lower leaves.",
                "timing_window_hours": 24,
                "evidence_source_id": 1
            },
            {
                "crop": "Cotton",
                "trigger_stress_type": "WATERLOGGING",
                "trigger_severity_level": "HIGH",
                "recommendation_title": "Square Drop Mitigation Spray",
                "action_steps": "1. Open field drains to evacuate excess surface water.\n2. Spray NAA (Planofix) @ 40 ppm along with 1% DAP to arrest square and boll shedding caused by water stress.",
                "timing_window_hours": 48,
                "evidence_source_id": 1
            }
        ]

        for r in recs_data:
            c = crop_map.get(r["crop"].lower())
            if c:
                existing = db.query(AgronomicRecommendation).filter_by(
                    crop_id=c.id, trigger_stress_type=r["trigger_stress_type"]
                ).first()
                if not existing:
                    rec = AgronomicRecommendation(
                        crop_id=c.id,
                        trigger_stress_type=r["trigger_stress_type"],
                        trigger_severity_level=r["trigger_severity_level"],
                        recommendation_title=r["recommendation_title"],
                        action_steps=r["action_steps"],
                        timing_window_hours=r["timing_window_hours"],
                        evidence_source_id=r["evidence_source_id"]
                    )
                    db.add(rec)

        db.commit()
        print("Successfully seeded Crop Stress Knowledge Base!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding crop stress knowledge base: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_crop_stress_knowledge_base()
