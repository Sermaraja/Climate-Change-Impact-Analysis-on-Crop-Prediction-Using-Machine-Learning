# Multi-Source Data Integration Report (Stage 10C)

**Generated On**: 2026-09-26 13:42:42  
**Pipeline**: `ml/src/ingestion/integrate_sources.py`  

---

## 1. Source Summary & Record Counts

| Dataset | Storage Path | Source Records | Key Granularity | Spatial Scale | Target Variable Status |
|---|---|---|---|---|---|
| Standardized Weather & Derived Rain | `data/interim/weather_standardized.csv` | 14,400 rows | Hourly | Farm Point Coordinates | Predictors Only (No Target) |
| Daily Derived Weather Features | `data/processed/integrated_crop_climate_dataset.csv` | 600 rows | Daily | Farm Point Coordinates | Contextual Warning Only |
| GOI APY Crop Production | `data/interim/crop_production_standardized.csv` | 1,000 rows | Seasonal / Annual | District Aggregated | Macro Yield Baseline |
| NDMA Flood Disaster Damage | `data/interim/flood_damage_standardized.csv` | 7 rows | Event-based | Taluk / District | Ground-Truth Affected Area |

---

## 2. Derived Weather Feature Specifications

The following short-duration and antecedent rainfall predictors were successfully computed from 1-hour resolution time-series:

1. **Short-Duration Intensity**: `rain_1h`, `rain_3h`, `rain_6h`, `rain_12h`, `rain_24h`, `rain_48h`
2. **Antecedent Soil Wetness**: `previous_rain_24h`, `previous_rain_48h`, `previous_rain_72h`
3. **Storm Dynamics**: `max_hourly_rain` (peak intensity), `continuous_rain_hours` (uninterrupted duration), `rain_hours` (total precipitation hours in 24h).

---

## 3. Data Cleaning & Integration Rules Applied

1. **Scale Protection Rule**: District-level APY crop production yield (1000 rows) and NDMA relief damage records (7 rows) were **NOT** forcibly flattened onto individual farm point rows. Doing so would create artificial pseudo-observations and violate spatial sampling assumptions.
2. **Contextual Linking**: NDMA disaster events were linked to daily farm weather observations as `official_warning_context` using `(date, district)` defensible join keys.
3. **Zero Missingness**: All missing values in rolling window metrics at time-series boundaries were initialized to `0.0` rather than imputed with central tendencies.
4. **Duplicate Handling**: Deduplication was strictly executed on `(farm_id, datetime)` composite keys.

---

## 4. Geographic & Temporal Coverage

- **Geographic Coverage**: 10 primary agricultural districts of Tamil Nadu (Thanjavur, Cuddalore, Madurai, Nagapattinam, Coimbatore, Tiruchirappalli, Tirunelveli, Villupuram, Erode, Tiruvarur).
- **Time Coverage**: October 1, 2025 to November 29, 2025 (Hourly resolution weather simulation + 2015-2025 macro crop trends).
- **Data Quality Check**: 0 rows removed due to corruption; 100% geographic match across farm coordinate metadata.
