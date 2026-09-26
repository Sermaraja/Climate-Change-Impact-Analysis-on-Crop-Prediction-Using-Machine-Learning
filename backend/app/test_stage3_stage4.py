from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_auth_and_farm_flow():
    email = "farmer.thanjavur@agriimpact.org"
    password = "SecurePassword123!"

    print("--- 1. Testing Registration ---")
    reg_resp = client.post("/api/auth/register", json={
        "full_name": "Kavitha Raman",
        "email": email,
        "password": password,
        "phone": "+91 9876543210",
        "preferred_language": "EN"
    })
    if reg_resp.status_code == 400:
        print("User already exists, logging in instead...")
        login_resp = client.post("/api/auth/login", json={"email": email, "password": password})
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        data = login_resp.json()
    else:
        assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.text}"
        data = reg_resp.json()

    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Token received. User ID: {data['user']['id']}")

    print("--- 2. Testing GET /api/auth/me ---")
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200, f"Get profile failed: {me_resp.text}"
    user_prof = me_resp.json()
    assert user_prof["email"] == email

    print("--- 3. Testing POST /api/farms (PostGIS Polygon Boundary) ---")
    polygon_geojson = {
        "type": "Polygon",
        "coordinates": [[
            [79.1368, 10.7880],
            [79.1390, 10.7890],
            [79.1395, 10.7860],
            [79.1370, 10.7855],
            [79.1368, 10.7880]
        ]]
    }
    farm_resp = client.post("/api/farms", headers=headers, json={
        "farm_name": "Cauvery Delta Test Farm",
        "latitude": 10.7870,
        "longitude": 79.1378,
        "boundary_geojson": polygon_geojson,
        "area_acres": 4.25,
        "state": "Tamil Nadu",
        "district": "Thanjavur",
        "village": "Vadapathi",
        "drainage_class": "MODERATE"
    })
    assert farm_resp.status_code == 201, f"Create farm failed: {farm_resp.text}"
    farm_data = farm_resp.json()
    farm_id = farm_data["id"]
    print(f"Farm created! ID: {farm_id}, Acres: {farm_data['area_acres']}, Hectares: {farm_data['area_hectares']}")
    assert farm_data["boundary_geojson"] is not None

    print("--- 4. Testing GET /api/farms ---")
    farms_list_resp = client.get("/api/farms", headers=headers)
    assert farms_list_resp.status_code == 200
    farms_list = farms_list_resp.json()
    assert len(farms_list) >= 1

    print("--- 5. Testing GET /api/farms/{id} ---")
    detail_resp = client.get(f"/api/farms/{farm_id}", headers=headers)
    assert detail_resp.status_code == 200
    assert detail_resp.json()["farm_name"] == "Cauvery Delta Test Farm"

    print("--- 6. Testing PUT /api/farms/{id} ---")
    update_resp = client.put(f"/api/farms/{farm_id}", headers=headers, json={
        "farm_name": "Cauvery Delta Updated Farm Plot",
        "drainage_class": "POOR"
    })
    assert update_resp.status_code == 200
    assert update_resp.json()["farm_name"] == "Cauvery Delta Updated Farm Plot"

    print("SUCCESS! All Stage 3 & Stage 4 Auth and GIS Farm APIs verified cleanly!")

if __name__ == "__main__":
    test_full_auth_and_farm_flow()
