"""
Seed Demo Farms via Production API
===================================
Creates 10 farms, crops, and soil profiles for 3 demo users
via the live CropClimate AI API (no direct DB access needed).
"""
import sys
import json
import time
from datetime import date, timedelta

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# PowerShell-compatible HTTP helper
def invoke_api(method, url, body=None, token=None):
    """Uses urllib to make HTTP requests (no external deps needed)."""
    import urllib.request
    import urllib.error
    
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body_text = e.read().decode("utf-8") if e.fp else ""
        print(f"  HTTP {e.code}: {body_text}")
        return e.code, json.loads(body_text) if body_text else {}


BASE_URL = "https://cropclimate-ai-backend.onrender.com/api"

USERS = [
    {"email": "veeramani@gmail.com", "password": "123456789"},
    {"email": "manikandan@gmail.com", "password": "123456789"},
    {"email": "narsi.farmer@gmail.com", "password": "123456789"},
]

# GeoJSON Polygon format: coordinates = [[[lon,lat], [lon,lat], ...]]
# All polygons use [longitude, latitude] per GeoJSON spec.

FARMS_DATA = {
    "veeramani@gmail.com": [
        {
            "farm_name": "Veeramani Vaigai Farm",
            "latitude": 9.9350, "longitude": 78.1100,
            "area_acres": 5.0,
            "state": "Tamil Nadu", "district": "Madurai", "village": "Vaigai Nagar",
            "drainage_class": "MODERATE",
            "boundary_geojson": {
                "type": "Polygon",
                "coordinates": [[[78.1080, 9.9330], [78.1120, 9.9330], [78.1120, 9.9370], [78.1080, 9.9370], [78.1080, 9.9330]]]
            },
            "crop_name": "Paddy", "planting_days_ago": 35, "season": "Samba",
            "soil": {"soil_type": "Alluvial Clay Loam", "sand_percentage": 20.0, "silt_percentage": 45.0, "clay_percentage": 35.0, "ph": 7.2, "organic_carbon": 0.65, "bulk_density": 1.35},
        },
        {
            "farm_name": "Veeramani Green Field",
            "latitude": 9.9450, "longitude": 78.1250,
            "area_acres": 3.5,
            "state": "Tamil Nadu", "district": "Madurai", "village": "Thirupparankundram",
            "drainage_class": "POOR",
            "boundary_geojson": {
                "type": "Polygon",
                "coordinates": [[[78.1230, 9.9430], [78.1270, 9.9430], [78.1270, 9.9470], [78.1230, 9.9470], [78.1230, 9.9430]]]
            },
            "crop_name": "Banana", "planting_days_ago": 120, "season": "Perennial",
            "soil": {"soil_type": "Black Clay", "sand_percentage": 15.0, "silt_percentage": 30.0, "clay_percentage": 55.0, "ph": 7.8, "organic_carbon": 0.80, "bulk_density": 1.40},
        },
        {
            "farm_name": "Veeramani South Farm",
            "latitude": 9.9150, "longitude": 78.1050,
            "area_acres": 4.0,
            "state": "Tamil Nadu", "district": "Madurai", "village": "Melur",
            "drainage_class": "GOOD",
            "boundary_geojson": {
                "type": "Polygon",
                "coordinates": [[[78.1030, 9.9130], [78.1070, 9.9130], [78.1070, 9.9170], [78.1030, 9.9170], [78.1030, 9.9130]]]
            },
            "crop_name": "Groundnut", "planting_days_ago": 55, "season": "Kharif",
            "soil": {"soil_type": "Red Sandy Loam", "sand_percentage": 60.0, "silt_percentage": 20.0, "clay_percentage": 20.0, "ph": 6.5, "organic_carbon": 0.45, "bulk_density": 1.55},
        },
        {
            "farm_name": "Veeramani Marutham Farm",
            "latitude": 9.9550, "longitude": 78.1350,
            "area_acres": 2.5,
            "state": "Tamil Nadu", "district": "Madurai", "village": "Alanganallur",
            "drainage_class": "MODERATE",
            "boundary_geojson": {
                "type": "Polygon",
                "coordinates": [[[78.1330, 9.9530], [78.1370, 9.9530], [78.1370, 9.9570], [78.1330, 9.9570], [78.1330, 9.9530]]]
            },
            "crop_name": "Chilli", "planting_days_ago": 15, "season": "Rabi",
            "soil": {"soil_type": "Loam", "sand_percentage": 40.0, "silt_percentage": 35.0, "clay_percentage": 25.0, "ph": 6.8, "organic_carbon": 0.55, "bulk_density": 1.45},
        },
    ],
    "manikandan@gmail.com": [
        {
            "farm_name": "Manikandan Theni Farm",
            "latitude": 10.0150, "longitude": 77.4800,
            "area_acres": 4.5,
            "state": "Tamil Nadu", "district": "Theni", "village": "Periyakulam",
            "drainage_class": "POOR",
            "boundary_geojson": {
                "type": "Polygon",
                "coordinates": [[[77.4780, 10.0130], [77.4820, 10.0130], [77.4820, 10.0170], [77.4780, 10.0170], [77.4780, 10.0130]]]
            },
            "crop_name": "Banana", "planting_days_ago": 200, "season": "Perennial",
            "soil": {"soil_type": "Clay Loam", "sand_percentage": 25.0, "silt_percentage": 35.0, "clay_percentage": 40.0, "ph": 7.5, "organic_carbon": 0.70, "bulk_density": 1.38},
        },
        {
            "farm_name": "Manikandan Western Farm",
            "latitude": 10.0250, "longitude": 77.4650,
            "area_acres": 3.0,
            "state": "Tamil Nadu", "district": "Theni", "village": "Bodi",
            "drainage_class": "GOOD",
            "boundary_geojson": {
                "type": "Polygon",
                "coordinates": [[[77.4630, 10.0230], [77.4670, 10.0230], [77.4670, 10.0270], [77.4630, 10.0270], [77.4630, 10.0230]]]
            },
            "crop_name": "Maize", "planting_days_ago": 50, "season": "Kharif",
            "soil": {"soil_type": "Sandy Loam", "sand_percentage": 55.0, "silt_percentage": 25.0, "clay_percentage": 20.0, "ph": 6.3, "organic_carbon": 0.40, "bulk_density": 1.58},
        },
    ],
    "narsi.farmer@gmail.com": [
        {
            "farm_name": "Narisimman North Farm",
            "latitude": 9.9650, "longitude": 78.0900,
            "area_acres": 6.0,
            "state": "Tamil Nadu", "district": "Madurai", "village": "Sholavandan",
            "drainage_class": "POOR",
            "boundary_geojson": {
                "type": "Polygon",
                "coordinates": [[[78.0880, 9.9630], [78.0920, 9.9630], [78.0920, 9.9670], [78.0880, 9.9670], [78.0880, 9.9630]]]
            },
            "crop_name": "Paddy", "planting_days_ago": 70, "season": "Samba",
            "soil": {"soil_type": "Alluvial Clay", "sand_percentage": 15.0, "silt_percentage": 40.0, "clay_percentage": 45.0, "ph": 7.5, "organic_carbon": 0.75, "bulk_density": 1.32},
        },
        {
            "farm_name": "Narisimman Green Farm",
            "latitude": 9.9750, "longitude": 78.1000,
            "area_acres": 4.0,
            "state": "Tamil Nadu", "district": "Madurai", "village": "Usilampatti",
            "drainage_class": "MODERATE",
            "boundary_geojson": {
                "type": "Polygon",
                "coordinates": [[[78.0980, 9.9730], [78.1020, 9.9730], [78.1020, 9.9770], [78.0980, 9.9770], [78.0980, 9.9730]]]
            },
            "crop_name": "Cotton", "planting_days_ago": 45, "season": "Kharif",
            "soil": {"soil_type": "Black Cotton Soil", "sand_percentage": 20.0, "silt_percentage": 30.0, "clay_percentage": 50.0, "ph": 8.0, "organic_carbon": 0.60, "bulk_density": 1.42},
        },
        {
            "farm_name": "Narisimman Vaigai Field",
            "latitude": 9.9200, "longitude": 78.0800,
            "area_acres": 2.0,
            "state": "Tamil Nadu", "district": "Madurai", "village": "T. Kallupatti",
            "drainage_class": "GOOD",
            "boundary_geojson": {
                "type": "Polygon",
                "coordinates": [[[78.0780, 9.9180], [78.0820, 9.9180], [78.0820, 9.9220], [78.0780, 9.9220], [78.0780, 9.9180]]]
            },
            "crop_name": "Tomato", "planting_days_ago": 30, "season": "Rabi",
            "soil": {"soil_type": "Red Loam", "sand_percentage": 45.0, "silt_percentage": 30.0, "clay_percentage": 25.0, "ph": 6.6, "organic_carbon": 0.50, "bulk_density": 1.50},
        },
        {
            "farm_name": "Narisimman South Field",
            "latitude": 9.9100, "longitude": 78.1150,
            "area_acres": 3.5,
            "state": "Tamil Nadu", "district": "Madurai", "village": "Vadipatti",
            "drainage_class": "MODERATE",
            "boundary_geojson": {
                "type": "Polygon",
                "coordinates": [[[78.1130, 9.9080], [78.1170, 9.9080], [78.1170, 9.9120], [78.1130, 9.9120], [78.1130, 9.9080]]]
            },
            "crop_name": "Onion", "planting_days_ago": 80, "season": "Rabi",
            "soil": {"soil_type": "Sandy Clay Loam", "sand_percentage": 50.0, "silt_percentage": 20.0, "clay_percentage": 30.0, "ph": 6.9, "organic_carbon": 0.48, "bulk_density": 1.52},
        },
    ],
}


def login(email, password):
    """Login and return access token."""
    status_code, data = invoke_api("POST", f"{BASE_URL}/auth/login", {"email": email, "password": password})
    if status_code == 200:
        print(f"  ✓ Logged in as {email} (user_id={data['user']['id']})")
        return data["access_token"]
    else:
        print(f"  ✗ Login failed for {email}: {status_code}")
        return None


def get_crop_catalog(token):
    """Fetch available crop master data."""
    status_code, data = invoke_api("GET", f"{BASE_URL}/crops", token=token)
    if status_code == 200:
        return {c["name"]: c for c in data}
    return {}


def get_user_farms(token):
    """Fetch current user's farms."""
    status_code, data = invoke_api("GET", f"{BASE_URL}/farms", token=token)
    if status_code == 200:
        return {f["farm_name"]: f for f in data}
    return {}


def create_farm(token, farm_payload):
    """Create a farm via API."""
    api_payload = {
        "farm_name": farm_payload["farm_name"],
        "latitude": farm_payload["latitude"],
        "longitude": farm_payload["longitude"],
        "boundary_geojson": farm_payload["boundary_geojson"],
        "area_acres": farm_payload["area_acres"],
        "state": farm_payload.get("state"),
        "district": farm_payload.get("district"),
        "village": farm_payload.get("village"),
        "drainage_class": farm_payload.get("drainage_class", "MODERATE"),
    }
    status_code, data = invoke_api("POST", f"{BASE_URL}/farms", body=api_payload, token=token)
    if status_code == 201:
        print(f"    ✓ Created farm: {data['farm_name']} (id={data['id']})")
        return data
    else:
        print(f"    ✗ Failed to create farm {farm_payload['farm_name']}: {status_code}")
        return None


def create_soil_profile(token, farm_id, soil_data):
    """Create soil profile via API."""
    status_code, data = invoke_api("POST", f"{BASE_URL}/farms/{farm_id}/soil", body=soil_data, token=token)
    if status_code in (200, 201):
        print(f"      ✓ Soil profile created: {soil_data['soil_type']}")
        return data
    else:
        print(f"      ✗ Soil profile failed: {status_code}")
        return None


def assign_crop(token, farm_id, crop_id, variety_id, planting_date, season):
    """Assign active crop to farm via API."""
    payload = {
        "crop_id": crop_id,
        "variety_id": variety_id,
        "planting_date": planting_date.isoformat(),
        "season": season,
    }
    status_code, data = invoke_api("POST", f"{BASE_URL}/farms/{farm_id}/crop", body=payload, token=token)
    if status_code in (200, 201):
        crop_name = data.get("crop_name", "?")
        stage = data.get("current_growth_stage", {})
        stage_name = stage.get("stage_name", "N/A") if isinstance(stage, dict) else "N/A"
        print(f"      ✓ Assigned crop: {crop_name} → stage: {stage_name}")
        return data
    else:
        print(f"      ✗ Crop assignment failed: {status_code}")
        return None


def main():
    print("=" * 60)
    print("CropClimate AI — Production Demo Seed via API")
    print("=" * 60)

    # Step 1: Login as first user to get crop catalog
    first_token = login(USERS[0]["email"], USERS[0]["password"])
    if not first_token:
        print("Cannot proceed without login. Exiting.")
        return False

    # Step 2: Fetch crop catalog
    crops_catalog = get_crop_catalog(first_token)
    if not crops_catalog:
        print("No crop master data found! Seed crops first.")
        print("Trying /crops/catalog endpoint...")
        status_code, data = invoke_api("GET", f"{BASE_URL}/crops/catalog", token=first_token)
        if status_code == 200:
            crops_catalog = {c["name"]: c for c in data}

    if crops_catalog:
        print(f"\nAvailable crops: {list(crops_catalog.keys())}")
    else:
        print("WARNING: Could not fetch crop catalog. Will try to create farms without crops.")

    total_farms = 0
    total_crops = 0
    total_soils = 0

    # Step 3: For each user, login and create farms
    for user_info in USERS:
        email = user_info["email"]
        print(f"\n{'─' * 50}")
        print(f"Processing: {email}")
        print(f"{'─' * 50}")

        token = login(email, user_info["password"])
        if not token:
            continue

        # Check existing farms
        existing_farms = get_user_farms(token)
        print(f"  Existing farms: {len(existing_farms)}")

        farm_defs = FARMS_DATA.get(email, [])
        for fd in farm_defs:
            farm_name = fd["farm_name"]

            # Skip if farm already exists
            if farm_name in existing_farms:
                print(f"  SKIP (exists): {farm_name}")
                total_farms += 1
                continue

            # Create farm
            farm_result = create_farm(token, fd)
            if not farm_result:
                continue
            total_farms += 1
            farm_id = farm_result["id"]
            time.sleep(0.5)  # rate limit courtesy

            # Create soil profile
            if fd.get("soil"):
                create_soil_profile(token, farm_id, fd["soil"])
                total_soils += 1
                time.sleep(0.3)

            # Assign crop
            crop_name = fd.get("crop_name")
            if crop_name and crops_catalog:
                crop_info = crops_catalog.get(crop_name)
                if crop_info:
                    crop_id = crop_info["id"]
                    # Find variety
                    variety_id = None
                    varieties = crop_info.get("varieties", [])
                    for v in varieties:
                        # Just use the first variety if available
                        variety_id = v.get("id")
                        break

                    planting_date = date.today() - timedelta(days=fd["planting_days_ago"])
                    assign_crop(token, farm_id, crop_id, variety_id, planting_date, fd.get("season", "Kharif"))
                    total_crops += 1
                    time.sleep(0.3)
                else:
                    print(f"      ⚠ Crop '{crop_name}' not in catalog")

    # Summary
    print(f"\n{'=' * 60}")
    print(f"SEED COMPLETE")
    print(f"  Farms:  {total_farms}")
    print(f"  Crops:  {total_crops}")
    print(f"  Soils:  {total_soils}")
    print(f"{'=' * 60}")

    # Verification
    print("\nVERIFICATION:")
    for user_info in USERS:
        token = login(user_info["email"], user_info["password"])
        if token:
            farms = get_user_farms(token)
            print(f"  {user_info['email']}: {len(farms)} farms → {list(farms.keys())}")

    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
