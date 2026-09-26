# Data Architecture & Source Registry Guidelines

## Overview
This directory contains the multi-source dataset architecture for the project **"Climate Change Impact Analysis on Crop Prediction Using Machine Learning"**. 

The core focus of this application is predicting the physiological and financial impact of extreme rainfall, waterlogging, and submergence on specific crops grown on individual farms (specifically targeting Tamil Nadu and broader South Indian agronomic conditions).

---

## 1. Directory Structure

```
data/
  raw/                 <- IMMUTABLE raw data files (never edit or overwrite)
    weather/           <- Open-Meteo, IMD gridded daily/hourly rainfall, temperature, humidity
    crop_production/   <- GOI Open Government Data (APY - Area, Production, Yield)
    flood_damage/      <- NDMA & State Disaster relief crop loss & damage records
    crop_science/      <- ICAR & TNAU agronomic guides & submergence tolerance literature
    soil/              <- SoilGrids & state soil survey records
    supporting/        <- Validated secondary/kaggle datasets
  interim/             <- Intermediate standardized and cleaned datasets (ETL outputs)
  processed/           <- Cleaned, joined, feature-engineered datasets ready for ML/Rules
  external/            <- External lookup tables, GIS spatial boundaries, shapefiles
  metadata/            <- Dataset registry CSV, schema definitions, provenance logs
```

---

## 2. Source Classification & Accepted Types

All ingested datasets must be classified into one of the following official `source_type` categories in `data/metadata/dataset_registry.csv`:

1. `OFFICIAL_GOVERNMENT`: India Meteorological Department (IMD), Ministry of Agriculture & Farmers Welfare (GOI), National Disaster Management Authority (NDMA), Tamil Nadu Department of Agriculture.
2. `UNIVERSITY`: Tamil Nadu Agricultural University (TNAU), State Agricultural Universities (SAUs).
3. `RESEARCH`: Indian Council of Agricultural Research (ICAR), International Rice Research Institute (IRRI), CGIAR, ERA5 / ECMWF.
4. `OPEN_DATA`: Open-Meteo, FAOSTAT, World Bank Open Data.
5. `KAGGLE_MIRROR`: Community uploaded datasets (Requires strict validation before use).
6. `SYNTHETIC_DEMO`: Synthetically generated data for unit testing / UI prototyping (STRICTLY FORBIDDEN for scientific evaluation).

---

## 3. Academic Priority & Roles

Each dataset is assigned an `academic_priority`:
- `PRIMARY`: Core feature predictors (Open-Meteo / IMD weather) and authoritative agronomic rules (TNAU / ICAR stress profiles).
- `SECONDARY`: Macro-level background trend data (GOI APY district production stats).
- `SUPPORTING`: Contextual datasets used only after provenance validation.
- `DEMO_ONLY`: Non-production test mock data.

---

## 4. Immutable Raw Data & Processing Workflow

### Immutable Raw Data Rule
> **NEVER overwrite, edit, or modify files stored in `data/raw/`.**
> Raw data represents original scientific evidence. All cleaning, scaling, and feature engineering transformations must occur programmatically in `ml/src/` scripts and output strictly to `data/interim/` or `data/processed/`.

### Processing Workflow
```
[data/raw/*] 
     │
     ▼ (ingestion & standardization: ml/src/ingestion/integrate_sources.py)
[data/interim/*]
     │
     ▼ (feature engineering & derived indices: ml/src/feature_engineering/feature_pipeline.py)
[data/processed/*]
     │
     ▼ (readiness assessment: ml/src/validation/assess_readiness.py)
[ml/reports/ml_readiness_report.md]
```

---

## 5. Dataset Provenance Requirements

Every imported dataset must maintain full provenance records in `data/metadata/dataset_registry.csv` including:
- `dataset_id` (Unique identifier e.g., `DS_WEATHER_001`)
- `dataset_name` & `provider`
- `source_url` & `download_date`
- `geographic_coverage` & `time_coverage` (Start/End years)
- `license` if known
- `target_available` & `target_description`
- `intended_use` & `academic_priority`
- `validation_status` & processing notes

---

## 6. Non-Negotiable Scientific Principles

1. **No Target Label Fabrication**: Never generate artificial crop death or crop damage labels without documented, evidence-based agronomic criteria or observed disaster ground truth.
2. **Rainfall != Instant Crop Death**: High rainfall or Red/Orange weather alerts indicate flood risk, but actual crop damage depends on crop variety, growth stage, soil drainage class, antecedent soil moisture, and submergence duration.
3. **Yield != Damage**: District-level annual crop yield variations reflect overall weather, pest, and market conditions; they cannot be assumed to equal individual farm-level extreme event crop damage.
4. **NPK Crop Recommendation Datasets != Flood Damage Datasets**: Kaggle Crop Recommendation datasets (e.g. NPK-based crop suitability) predict optimal crop selection, NOT submergence or waterlogging loss.
5. **No Model Accuracy on Synthetic Data**: Never claim or publish machine learning model accuracy based on synthetic demo data.
