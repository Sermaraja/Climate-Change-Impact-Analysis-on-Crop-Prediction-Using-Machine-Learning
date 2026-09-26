import os
import pandas as pd
from typing import Tuple

REQUIRED_COLUMNS = [
    "crop", "crop_age_days", "growth_stage", "soil_type", "soil_moisture",
    "drainage_class", "temperature_c", "humidity_pct", "rainfall_24h", "rainfall_48h",
    "previous_rain_24h", "previous_rain_72h", "peak_hourly_rainfall",
    "continuous_rain_hours", "waterlogging_risk", "season", "damage_class"
]


def validate_and_clean_dataset(csv_path: str) -> Tuple[pd.DataFrame, dict]:
    """
    Validate ML dataset schema, verify sample count, handle missing values,
    and output validation report.
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"ML dataset path not found: {csv_path}")

    df = pd.read_csv(csv_path)
    report = {
        "raw_rows": len(df),
        "missing_values": df.isnull().sum().to_dict(),
        "is_synthetic_demo": "dataset_label" in df.columns and (df["dataset_label"] == "DEMO_SYNTHETIC_NOT_FOR_SCIENTIFIC_RESULTS").all()
    }

    # Verify required feature columns
    for col in REQUIRED_COLUMNS:
        if col not in df.columns:
            raise ValueError(f"Missing required ML feature column: {col}")

    # Fill numerical missing values with median
    num_cols = df.select_dtypes(include=['float64', 'int64']).columns
    df[num_cols] = df[num_cols].fillna(df[num_cols].median())

    # Fill categorical missing values with mode
    cat_cols = df.select_dtypes(include=['object']).columns
    for c in cat_cols:
        df[c] = df[c].fillna(df[c].mode()[0] if not df[c].mode().empty else "Unknown")

    report["cleaned_rows"] = len(df)
    return df, report


if __name__ == "__main__":
    demo_path = "ml/data/raw/demo_crop_damage.csv"
    if os.path.exists(demo_path):
        df_clean, rep = validate_and_clean_dataset(demo_path)
        print("Validation Report:", rep)
