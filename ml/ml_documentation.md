# Canonical ML Feature Schema & Data Provenance

## Project Title
**Climate Change Impact Analysis on Crop Prediction Using Machine Learning**

---

## 1. Feature Provenance Matrix

| Feature Name | Data Source | Provenance / Collection Method | Type | Range / Options |
|---|---|---|---|---|
| `crop` | Farmer Input | Selected from 10 Master Crops | Categorical | Paddy, Maize, Groundnut, Cotton, Banana, Sugarcane, Tomato, Chilli, Onion, Pulses |
| `crop_variety` | Farmer Input (Optional) | Specified during crop assignment | Categorical | BPT 5204, Swarna, IR 64, CO 6, Grand Naine, etc. |
| `crop_age_days` | Derived | Calculated: `(current_date - planting_date)` | Integer | 0 - 450 days |
| `growth_stage` | Farmer / Calculated | Confirmed stage or estimated from day range | Categorical | Germination, Vegetative, Flowering, Ripening, etc. |
| `soil_type` | Soil Profile | Lab test / Farmer self-report / Regional fallback | Categorical | Clay Loam, Alluvial, Red Soil, Black Cotton, Sandy Loam |
| `soil_moisture` | Open-Meteo API | Volumetric soil moisture 0-7cm | Float | 0.0 - 1.0 (m³/m³) |
| `drainage_class` | GIS Farm Input | Selected plot drainage quality | Categorical | GOOD, MODERATE, POOR |
| `temperature_c` | Open-Meteo API | 2m Air Temperature | Float | 10.0 - 45.0 °C |
| `humidity_pct` | Open-Meteo API | 2m Relative Humidity | Float | 20.0 - 100.0 % |
| `rainfall_1h` | Open-Meteo API | 1-hour forecast accumulation | Float | 0.0 - 100.0 mm |
| `rainfall_6h` | Open-Meteo API | 6-hour forecast accumulation | Float | 0.0 - 200.0 mm |
| `rainfall_12h` | Open-Meteo API | 12-hour forecast accumulation | Float | 0.0 - 300.0 mm |
| `rainfall_24h` | Open-Meteo API | 24-hour forecast accumulation | Float | 0.0 - 400.0 mm |
| `rainfall_48h` | Open-Meteo API | 48-hour forecast accumulation | Float | 0.0 - 500.0 mm |
| `previous_rain_24h` | Open-Meteo API | Past 24h antecedent rainfall | Float | 0.0 - 400.0 mm |
| `previous_rain_48h` | Open-Meteo API | Past 48h antecedent rainfall | Float | 0.0 - 600.0 mm |
| `previous_rain_72h` | Open-Meteo API | Past 72h antecedent rainfall | Float | 0.0 - 800.0 mm |
| `peak_hourly_rainfall` | Derived | Max single hour rain in forecast window | Float | 0.0 - 100.0 mm/h |
| `continuous_rain_hours` | Derived | Consecutive forecast hours with rain ≥ 0.1mm | Integer | 0 - 48 hours |
| `waterlogging_risk` | Engine Derived | Hydrological risk engine output | Categorical | LOW, MODERATE, HIGH, CRITICAL |
| `season` | Farmer Input | Agricultural cropping season | Categorical | Kharif, Rabi, Zaid, Perennial |

---

## 2. Target Schema

- `damage_class`: `NONE`, `MILD`, `MODERATE`, `SEVERE`, `TOTAL_LOSS`
- `survival_class`: `HIGH`, `MODERATE`, `LOW`
- `recovery_class`: `FAST`, `PARTIAL`, `UNLIKELY`
- `loss_class`: `LOW`, `MODERATE`, `HIGH`

---

## 3. Critical Disclaimer
`DEMO_SYNTHETIC_NOT_FOR_SCIENTIFIC_RESULTS`
The synthetic dataset generated in this repository is strictly for software engineering pipeline validation. Scientific field predictions require verified ground-truth agricultural observations.
