"""
Stage 22 — Admin & Research Panel Service
Handles scientific rule management, RBAC enforcement, model metadata inspection,
and scientific rule change audit logging.
"""

import os
import json
import csv
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.farm import Farm
from app.models.crop import Crop, CropVariety, CropGrowthStage
from app.models.crop_stress import CropStressProfile, CropRecoveryProfile, AgronomicRecommendation, EvidenceSource
from app.models.prediction import CropDamagePrediction, WaterloggingPrediction

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
AUDIT_LOG_PATH = os.path.join(BASE_DIR, "data", "metadata", "scientific_rule_audit_log.json")


def log_scientific_rule_change(user_email: str, entity_name: str, entity_id: int, old_val: Any, new_val: Any, version: str = "v1.0.0"):
    os.makedirs(os.path.dirname(AUDIT_LOG_PATH), exist_ok=True)
    logs = []
    if os.path.exists(AUDIT_LOG_PATH):
        try:
            with open(AUDIT_LOG_PATH, "r", encoding="utf-8") as f:
                logs = json.load(f)
        except Exception:
            logs = []

    logs.append({
        "timestamp": datetime.now().isoformat(),
        "changed_by": user_email,
        "entity_name": entity_name,
        "entity_id": entity_id,
        "old_value": str(old_val),
        "new_value": str(new_val),
        "version": version
    })

    with open(AUDIT_LOG_PATH, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=2)


def get_admin_dashboard_stats(db: Session) -> Dict[str, Any]:
    users_count = db.query(User).count()
    farms_count = db.query(Farm).count()
    total_preds = db.query(CropDamagePrediction).count()

    # Risk Distribution
    preds = db.query(CropDamagePrediction).all()
    risk_dist = {}
    for p in preds:
        r_str = str(p.damage_risk_level.value if hasattr(p.damage_risk_level, 'value') else p.damage_risk_level)
        risk_dist[r_str] = risk_dist.get(r_str, 0) + 1

    # Load Model Metadata
    model_meta_path = os.path.join(BASE_DIR, "ml", "models", "model_metadata.json")
    model_metadata = {}
    if os.path.exists(model_meta_path):
        try:
            with open(model_meta_path, "r", encoding="utf-8") as f:
                model_metadata = json.load(f)
        except Exception:
            model_metadata = {}

    # Load Dataset Registry Count
    registry_path = os.path.join(BASE_DIR, "data", "metadata", "dataset_registry.csv")
    dataset_registry_count = 0
    if os.path.exists(registry_path):
        try:
            with open(registry_path, "r", encoding="utf-8") as f:
                reader = csv.reader(f)
                dataset_registry_count = max(0, sum(1 for row in reader) - 1)
        except Exception:
            dataset_registry_count = 0

    return {
        "summary_counts": {
            "total_users": users_count,
            "total_farms": farms_count,
            "total_predictions": total_preds,
            "registered_datasets_count": dataset_registry_count
        },
        "risk_distribution": risk_dist,
        "model_metadata": model_metadata,
        "evidence_sources": [
            {
                "id": s.id,
                "name": s.source_name,
                "institution": s.provider_institution,
                "confidence": s.confidence_level
            }
            for s in db.query(EvidenceSource).all()
        ]
    }
