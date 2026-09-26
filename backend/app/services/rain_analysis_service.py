from typing import Dict, Any
from app.services.weather_service import fetch_open_meteo_data

# Configurable Risk Thresholds (can be calibrated from empirical flood evidence)
RAIN_RISK_THRESHOLDS = {
    "EXTREME": {"rain_24h_mm": 100.0, "peak_hourly_mm": 25.0, "continuous_hours": 12},
    "HIGH": {"rain_24h_mm": 60.0, "ari_mm": 75.0},
    "MODERATE": {"rain_24h_mm": 25.0, "ari_mm": 35.0},
}


def calculate_rainfall_analysis(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Feature engineering service for extreme rainfall analysis.
    Extracts raw weather observations and derives short-term & antecedent rainfall metrics.
    """
    raw_data = fetch_open_meteo_data(latitude, longitude)
    hourly = raw_data.get("hourly", {})
    times = hourly.get("time", [])
    precip = [p if p is not None else 0.0 for p in hourly.get("precipitation", [])]

    curr_time_str = raw_data.get("current", {}).get("time", "")
    curr_idx = times.index(curr_time_str) if curr_time_str in times else 72

    # Historical Antecedent Rainfall Slices (Prior to current time)
    past_24h_slice = precip[max(0, curr_idx - 24) : curr_idx]
    past_48h_slice = precip[max(0, curr_idx - 48) : max(0, curr_idx - 24)]
    past_72h_slice = precip[max(0, curr_idx - 72) : max(0, curr_idx - 48)]

    previous_rain_24h = round(sum(past_24h_slice), 2)
    previous_rain_48h = round(previous_rain_24h + sum(past_48h_slice), 2)
    previous_rain_72h = round(previous_rain_48h + sum(past_72h_slice), 2)

    # Antecedent Rainfall Index (ARI) = R_24 + 0.7 * R_(48-24) + 0.5 * R_(72-48)
    r24 = previous_rain_24h
    r48_24 = round(sum(past_48h_slice), 2)
    r72_48 = round(sum(past_72h_slice), 2)
    antecedent_rainfall_index = round(r24 + (0.7 * r48_24) + (0.5 * r72_48), 2)

    # Forecast Rainfall Slices (Upcoming from current time)
    forecast_slice_48h = precip[curr_idx : curr_idx + 48]

    forecast_rain_1h = round(sum(forecast_slice_48h[:1]), 2)
    forecast_rain_3h = round(sum(forecast_slice_48h[:3]), 2)
    forecast_rain_6h = round(sum(forecast_slice_48h[:6]), 2)
    forecast_rain_12h = round(sum(forecast_slice_48h[:12]), 2)
    forecast_rain_24h = round(sum(forecast_slice_48h[:24]), 2)
    forecast_rain_48h = round(sum(forecast_slice_48h[:48]), 2)

    maximum_hourly_rainfall = round(max(forecast_slice_48h) if forecast_slice_48h else 0.0, 2)
    number_of_rain_hours = sum(1 for p in forecast_slice_48h if p >= 0.1)

    # Continuous Rain Duration (Maximum consecutive hours with rain >= 0.1mm)
    max_continuous = 0
    current_continuous = 0
    for p in forecast_slice_48h:
        if p >= 0.1:
            current_continuous += 1
            max_continuous = max(max_continuous, current_continuous)
        else:
            current_continuous = 0
    continuous_rain_hours = max_continuous

    # Evaluate Application Rain Risk (Internal Model Classification)
    if (
        forecast_rain_24h >= RAIN_RISK_THRESHOLDS["EXTREME"]["rain_24h_mm"]
        or maximum_hourly_rainfall >= RAIN_RISK_THRESHOLDS["EXTREME"]["peak_hourly_mm"]
        or continuous_rain_hours >= RAIN_RISK_THRESHOLDS["EXTREME"]["continuous_hours"]
    ):
        risk_level = "EXTREME"
    elif (
        forecast_rain_24h >= RAIN_RISK_THRESHOLDS["HIGH"]["rain_24h_mm"]
        or antecedent_rainfall_index >= RAIN_RISK_THRESHOLDS["HIGH"]["ari_mm"]
    ):
        risk_level = "HIGH"
    elif (
        forecast_rain_24h >= RAIN_RISK_THRESHOLDS["MODERATE"]["rain_24h_mm"]
        or antecedent_rainfall_index >= RAIN_RISK_THRESHOLDS["MODERATE"]["ari_mm"]
    ):
        risk_level = "MODERATE"
    else:
        risk_level = "LOW"

    return {
        "raw_sources": {
            "source_provider": "Open-Meteo",
            "current_temperature": raw_data.get("current", {}).get("temperature_2m"),
            "current_humidity": raw_data.get("current", {}).get("relative_humidity_2m"),
            "current_precipitation": raw_data.get("current", {}).get("precipitation"),
        },
        "derived_metrics": {
            "forecast_rain_1h": forecast_rain_1h,
            "forecast_rain_3h": forecast_rain_3h,
            "forecast_rain_6h": forecast_rain_6h,
            "forecast_rain_12h": forecast_rain_12h,
            "forecast_rain_24h": forecast_rain_24h,
            "forecast_rain_48h": forecast_rain_48h,
            "previous_rain_24h": previous_rain_24h,
            "previous_rain_48h": previous_rain_48h,
            "previous_rain_72h": previous_rain_72h,
            "maximum_hourly_rainfall": maximum_hourly_rainfall,
            "continuous_rain_hours": continuous_rain_hours,
            "number_of_rain_hours": number_of_rain_hours,
            "antecedent_rainfall_index": antecedent_rainfall_index,
        },
        "application_rain_risk": risk_level,
        "risk_classification_name": "Application Rain Risk",
        "threshold_config": RAIN_RISK_THRESHOLDS,
    }
