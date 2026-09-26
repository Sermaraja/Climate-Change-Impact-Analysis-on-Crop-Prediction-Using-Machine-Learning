import os
import json
import joblib
import pandas as pd
import numpy as np

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

from ml.src.preprocessing.generate_demo_dataset import generate_demo_dataset, DATASET_LABEL
from ml.src.preprocessing.validate_dataset import validate_and_clean_dataset
from ml.src.feature_engineering.pipeline import MLPreprocessingPipeline
from ml.src.training.split_data import create_train_val_test_splits


def train_and_evaluate_damage_models():
    raw_path = "ml/data/raw/demo_crop_damage.csv"
    if not os.path.exists(raw_path):
        generate_demo_dataset(num_samples=600, output_path=raw_path)

    # 1. Validate & Clean Data
    df, report = validate_and_clean_dataset(raw_path)

    # 2. Feature Engineering & Encoding
    pipeline = MLPreprocessingPipeline()
    X, y = pipeline.fit_transform(df)

    # 3. Train/Val/Test Split
    X_train, X_val, X_test, y_train, y_val, y_test = create_train_val_test_splits(X, y)

    # 4. Define Candidate Models
    candidates = {
        "LogisticRegression": LogisticRegression(max_iter=500),
        "DecisionTree": DecisionTreeClassifier(max_depth=6),
        "RandomForest": RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42),
        "GradientBoosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, random_state=42)
    }

    best_name = None
    best_model = None
    best_f1 = -1.0
    results = {}

    print("--- MODEL TRAINING & EVALUATION REPORT ---")
    print(f"Dataset Label: {DATASET_LABEL}")

    for name, model in candidates.items():
        model.fit(X_train, y_train)
        y_val_pred = model.predict(X_val)

        acc = float(accuracy_score(y_val, y_val_pred))
        prec = float(precision_score(y_val, y_val_pred, average="weighted", zero_division=0))
        rec = float(recall_score(y_val, y_val_pred, average="weighted", zero_division=0))
        f1 = float(f1_score(y_val, y_val_pred, average="weighted", zero_division=0))

        results[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "confusion_matrix": confusion_matrix(y_val, y_val_pred).tolist()
        }

        print(f"Model: {name:20s} | Acc: {acc:.4f} | F1: {f1:.4f} | Prec: {prec:.4f} | Rec: {rec:.4f}")

        if f1 > best_f1:
            best_f1 = f1
            best_name = name
            best_model = model

    # Evaluate Best Model on Hold-Out Test Set
    y_test_pred = best_model.predict(X_test)
    test_acc = float(accuracy_score(y_test, y_test_pred))
    test_f1 = float(f1_score(y_test, y_test_pred, average="weighted", zero_division=0))

    print(f"\nSELECTED BEST MODEL BASED ON EVIDENCE: {best_name}")
    print(f"Test Set Accuracy: {test_acc:.4f} | Test Set F1: {test_f1:.4f}")

    # 5. Save Artifacts to backend/app/ml/ and ml/models/
    artifact_payload = {
        "model_name": best_name,
        "model": best_model,
        "pipeline": pipeline,
        "model_version": "v1.0.0",
        "dataset_label": DATASET_LABEL,
        "evaluation_metrics": results
    }

    os.makedirs("ml/models", exist_ok=True)
    os.makedirs("backend/app/ml", exist_ok=True)

    joblib.dump(artifact_payload, "ml/models/crop_damage_v1.joblib")
    joblib.dump(artifact_payload, "backend/app/ml/crop_damage_v1.joblib")

    # Save metrics report
    report_data = {
        "selected_model": best_name,
        "test_accuracy": test_acc,
        "test_f1": test_f1,
        "candidate_results": results,
        "note": "Software pipeline demo dataset training. Not for scientific publication."
    }
    os.makedirs("ml/reports", exist_ok=True)
    with open("ml/reports/model_evaluation_report.json", "w") as f:
        json.dump(report_data, f, indent=2)

    print("Model artifact successfully saved to backend/app/ml/crop_damage_v1.joblib!")
    return artifact_payload


if __name__ == "__main__":
    train_and_evaluate_damage_models()
