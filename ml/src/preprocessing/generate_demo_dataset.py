import os
import random
import csv

# CRITICAL LABEL REQUIREMENT
DATASET_LABEL = "DEMO_SYNTHETIC_NOT_FOR_SCIENTIFIC_RESULTS"

CROPS = ["Paddy", "Maize", "Groundnut", "Cotton", "Banana", "Sugarcane", "Tomato", "Chilli", "Onion", "Pulses"]
VARIETIES = ["BPT 5204", "Swarna", "CO 6", "Grand Naine", "PKM 1", "Default"]
GROWTH_STAGES = ["Germination", "Vegetative", "Flowering", "Ripening"]
SOIL_TYPES = ["Clay Loam", "Alluvial Soil", "Red Soil", "Black Cotton Soil", "Sandy Loam"]
DRAINAGE_CLASSES = ["GOOD", "MODERATE", "POOR"]
SEASONS = ["Kharif", "Rabi", "Zaid", "Perennial"]
WATERLOGGING_RISKS = ["LOW", "MODERATE", "HIGH", "CRITICAL"]


def generate_demo_dataset(num_samples: int = 500, output_path: str = "ml/data/raw/demo_crop_damage.csv"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    fieldnames = [
        "dataset_label",
        "crop",
        "crop_variety",
        "crop_age_days",
        "growth_stage",
        "soil_type",
        "soil_moisture",
        "drainage_class",
        "temperature_c",
        "humidity_pct",
        "rainfall_1h",
        "rainfall_6h",
        "rainfall_12h",
        "rainfall_24h",
        "rainfall_48h",
        "previous_rain_24h",
        "previous_rain_48h",
        "previous_rain_72h",
        "peak_hourly_rainfall",
        "continuous_rain_hours",
        "waterlogging_risk",
        "season",
        "damage_class",
        "survival_class"
    ]

    rows = []
    for i in range(num_samples):
        crop = random.choice(CROPS)
        variety = random.choice(VARIETIES)
        age = random.randint(10, 150)
        stage = random.choice(GROWTH_STAGES)
        soil = random.choice(SOIL_TYPES)
        drainage = random.choice(DRAINAGE_CLASSES)
        season = random.choice(SEASONS)

        rain_24h = round(random.uniform(0.0, 150.0), 2)
        rain_48h = round(rain_24h + random.uniform(0.0, 100.0), 2)
        prev_24h = round(random.uniform(0.0, 120.0), 2)
        peak = round(random.uniform(0.0, 45.0), 2)
        continuous = random.randint(0, 24)

        if rain_48h > 120 and drainage == "POOR":
            wl_risk = "CRITICAL"
            damage = "SEVERE" if crop in ["Tomato", "Chilli"] else "MODERATE"
            survival = "LOW" if damage == "SEVERE" else "MODERATE"
        elif rain_48h > 60:
            wl_risk = "HIGH"
            damage = "MODERATE"
            survival = "MODERATE"
        elif rain_48h > 20:
            wl_risk = "MODERATE"
            damage = "MILD"
            survival = "HIGH"
        else:
            wl_risk = "LOW"
            damage = "NONE"
            survival = "HIGH"

        row = {
            "dataset_label": DATASET_LABEL,
            "crop": crop,
            "crop_variety": variety,
            "crop_age_days": age,
            "growth_stage": stage,
            "soil_type": soil,
            "soil_moisture": round(random.uniform(0.15, 0.85), 2),
            "drainage_class": drainage,
            "temperature_c": round(random.uniform(22.0, 36.0), 1),
            "humidity_pct": round(random.uniform(50.0, 95.0), 1),
            "rainfall_1h": round(rain_24h / 10.0, 2),
            "rainfall_6h": round(rain_24h / 4.0, 2),
            "rainfall_12h": round(rain_24h / 2.0, 2),
            "rainfall_24h": rain_24h,
            "rainfall_48h": rain_48h,
            "previous_rain_24h": prev_24h,
            "previous_rain_48h": round(prev_24h + random.uniform(0.0, 50.0), 2),
            "previous_rain_72h": round(prev_24h + random.uniform(20.0, 100.0), 2),
            "peak_hourly_rainfall": peak,
            "continuous_rain_hours": continuous,
            "waterlogging_risk": wl_risk,
            "season": season,
            "damage_class": damage,
            "survival_class": survival
        }
        rows.append(row)

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Generated {num_samples} demo rows saved to {output_path} with label: {DATASET_LABEL}")


if __name__ == "__main__":
    generate_demo_dataset()
