import logging
import time
import httpx
from typing import Dict, Any, Optional

logger = logging.getLogger("weather_service")

# In-memory weather cache: key -> (timestamp, data)
_WEATHER_CACHE: Dict[str, tuple[float, Dict[str, Any]]] = {}
CACHE_TTL_SECONDS = 900  # 15 minutes cache


def fetch_open_meteo_data(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Fetch current, hourly forecast, and past 3 days weather data from Open-Meteo API.
    Includes timeout, response validation, and in-memory caching.
    """
    cache_key = f"{round(latitude, 3)}_{round(longitude, 3)}"
    now = time.time()

    if cache_key in _WEATHER_CACHE:
        cached_time, cached_data = _WEATHER_CACHE[cache_key]
        if now - cached_time < CACHE_TTL_SECONDS:
            logger.info(f"Returning cached Open-Meteo weather for key: {cache_key}")
            return cached_data

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": [
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation",
            "rain",
            "wind_speed_10m"
        ],
        "hourly": [
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation",
            "rain",
            "precipitation_probability",
            "wind_speed_10m",
            "soil_moisture_0_to_7cm",
            "soil_moisture_7_to_28cm"
        ],
        "past_days": 3,
        "forecast_days": 3,
        "timezone": "auto"
    }

    try:
        logger.info(f"Requesting Open-Meteo API for lat={latitude}, lon={longitude}")
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            # Validate basic structure
            if "current" not in data or "hourly" not in data:
                raise ValueError("Invalid payload received from Open-Meteo API.")

            _WEATHER_CACHE[cache_key] = (now, data)
            return data
    except httpx.HTTPStatusError as e:
        logger.error(f"Open-Meteo HTTP error status {e.response.status_code}: {e}")
        raise ValueError(f"Open-Meteo service error (Status {e.response.status_code}).")
    except httpx.RequestError as e:
        logger.error(f"Open-Meteo connection failure: {e}")
        raise ValueError("Failed to reach Open-Meteo weather service. Please check network connectivity.")
    except Exception as e:
        logger.error(f"Unexpected error fetching weather: {e}")
        raise ValueError(f"Weather data processing error: {str(e)}")


def parse_current_weather(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    curr = raw_data.get("current", {})
    units = raw_data.get("current_units", {})
    return {
        "time": curr.get("time"),
        "temperature_2m": curr.get("temperature_2m"),
        "temperature_unit": units.get("temperature_2m", "°C"),
        "relative_humidity_2m": curr.get("relative_humidity_2m"),
        "humidity_unit": units.get("relative_humidity_2m", "%"),
        "precipitation": curr.get("precipitation", 0.0),
        "rain": curr.get("rain", 0.0),
        "precipitation_unit": units.get("precipitation", "mm"),
        "wind_speed_10m": curr.get("wind_speed_10m", 0.0),
        "wind_speed_unit": units.get("wind_speed_10m", "km/h"),
        "source": "Open-Meteo"
    }


def parse_forecast_weather(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    hourly = raw_data.get("hourly", {})
    times = hourly.get("time", [])
    precip = hourly.get("precipitation", [])
    probs = hourly.get("precipitation_probability", [])
    temps = hourly.get("temperature_2m", [])
    humidity = hourly.get("relative_humidity_2m", [])
    soil_m_0_7 = hourly.get("soil_moisture_0_to_7cm", [])

    # Filter upcoming 48 hours from current timestamp
    curr_time_str = raw_data.get("current", {}).get("time", "")
    
    start_idx = 0
    if curr_time_str in times:
        start_idx = times.index(curr_time_str)

    forecast_slice_24h = precip[start_idx : start_idx + 24]
    forecast_slice_48h = precip[start_idx : start_idx + 48]

    rain_24h_sum = round(sum(p for p in forecast_slice_24h if p is not None), 2)
    rain_48h_sum = round(sum(p for p in forecast_slice_48h if p is not None), 2)

    hourly_timeline = []
    for i in range(start_idx, min(start_idx + 48, len(times))):
        hourly_timeline.append({
            "time": times[i],
            "precipitation_mm": precip[i] if i < len(precip) else 0.0,
            "probability_pct": probs[i] if i < len(probs) else 0,
            "temperature_c": temps[i] if i < len(temps) else None,
            "humidity_pct": humidity[i] if i < len(humidity) else None,
            "soil_moisture": soil_m_0_7[i] if i < len(soil_m_0_7) else None,
        })

    return {
        "forecast_rain_24h_mm": rain_24h_sum,
        "forecast_rain_48h_mm": rain_48h_sum,
        "hourly_timeline": hourly_timeline,
        "source": "Open-Meteo"
    }


def parse_historical_weather(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    hourly = raw_data.get("hourly", {})
    times = hourly.get("time", [])
    precip = hourly.get("precipitation", [])

    curr_time_str = raw_data.get("current", {}).get("time", "")
    curr_idx = len(times) // 2
    if curr_time_str in times:
        curr_idx = times.index(curr_time_str)

    # Antecedent 24h, 48h, 72h rainfall slices prior to current time
    past_24h_slice = precip[max(0, curr_idx - 24) : curr_idx]
    past_48h_slice = precip[max(0, curr_idx - 48) : curr_idx]
    past_72h_slice = precip[max(0, curr_idx - 72) : curr_idx]

    return {
        "previous_24h_rain_mm": round(sum(p for p in past_24h_slice if p is not None), 2),
        "previous_48h_rain_mm": round(sum(p for p in past_48h_slice if p is not None), 2),
        "previous_72h_rain_mm": round(sum(p for p in past_72h_slice if p is not None), 2),
        "source": "Open-Meteo"
    }
