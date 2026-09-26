import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from typing import Tuple

CATEGORICAL_FEATURES = ["crop", "crop_variety", "growth_stage", "soil_type", "drainage_class", "waterlogging_risk", "season"]
NUMERICAL_FEATURES = [
    "crop_age_days", "soil_moisture", "temperature_c", "humidity_pct",
    "rainfall_1h", "rainfall_6h", "rainfall_12h", "rainfall_24h", "rainfall_48h",
    "previous_rain_24h", "previous_rain_48h", "previous_rain_72h",
    "peak_hourly_rainfall", "continuous_rain_hours"
]

Tuple_Data = Tuple[pd.DataFrame, np.ndarray]


class MLPreprocessingPipeline:
    def __init__(self):
        self.label_encoders = {col: LabelEncoder() for col in CATEGORICAL_FEATURES}
        self.target_encoder = LabelEncoder()
        self.scaler = StandardScaler()
        self.is_fitted = False

    def fit_transform(self, df: pd.DataFrame) -> Tuple_Data:

        X = df[CATEGORICAL_FEATURES + NUMERICAL_FEATURES].copy()
        y = df["damage_class"].copy() if "damage_class" in df.columns else None

        for col in CATEGORICAL_FEATURES:
            X[col] = self.label_encoders[col].fit_transform(X[col].astype(str))

        X_num_scaled = self.scaler.fit_transform(X[NUMERICAL_FEATURES])
        X_scaled_df = pd.DataFrame(X_num_scaled, columns=NUMERICAL_FEATURES, index=X.index)

        X_final = pd.concat([X[CATEGORICAL_FEATURES], X_scaled_df], axis=1)

        y_encoded = None
        if y is not None:
            y_encoded = self.target_encoder.fit_transform(y.astype(str))

        self.is_fitted = True
        return X_final, y_encoded

    def transform_single(self, feature_dict: dict) -> pd.DataFrame:
        """Transform a single input dict into pandas DataFrame matching fitted feature schema."""
        cat_dict = {}
        for col in CATEGORICAL_FEATURES:
            val = str(feature_dict.get(col, "Unknown"))
            le = self.label_encoders[col]
            if val in le.classes_:
                cat_dict[col] = le.transform([val])[0]
            else:
                cat_dict[col] = 0

        num_df = pd.DataFrame([{col: float(feature_dict.get(col, 0.0)) for col in NUMERICAL_FEATURES}])
        num_scaled = pd.DataFrame(self.scaler.transform(num_df), columns=NUMERICAL_FEATURES)
        cat_df = pd.DataFrame([cat_dict])

        return pd.concat([cat_df, num_scaled], axis=1)



Tuple_Data = tuple[pd.DataFrame, np.ndarray]
