import pytest
from datetime import date, timedelta

def test_root_and_health(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"

def test_login_admin(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@silaicraft.com",
        "password": "Admin@123456"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["role"] == "ADMIN"

def test_login_invalid_password(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@silaicraft.com",
        "password": "WrongPassword123"
    })
    assert response.status_code == 401

def test_customer_registration_and_profile(client):
    reg_response = client.post("/api/v1/auth/register", json={
        "name": "Ananya Sharma",
        "email": "ananya@example.com",
        "phone": "+919876599999",
        "password": "Password@123",
        "confirm_password": "Password@123"
    })
    assert reg_response.status_code == 201
    token = reg_response.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch profile
    me_resp = client.get("/api/v1/users/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["data"]["email"] == "ananya@example.com"

def test_rbac_customer_forbidden_from_admin(client):
    # Login customer
    cust_login = client.post("/api/v1/auth/login", json={
        "email": "priya@example.com",
        "password": "Customer@123456"
    })
    assert cust_login.status_code == 200
    cust_token = cust_login.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {cust_token}"}

    # Attempt to access admin customer directory
    admin_resp = client.get("/api/v1/customers", headers=headers)
    assert admin_resp.status_code == 403

def test_services_catalog_public(client):
    response = client.get("/api/v1/services")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) > 0
    assert any(s["category"] == "BLOUSE" for s in data)

def test_designs_gallery_public(client):
    response = client.get("/api/v1/designs")
    assert response.status_code == 200
    data = response.json()["items"]
    assert len(data) > 0

def test_measurement_creation_and_default(client):
    cust_login = client.post("/api/v1/auth/login", json={
        "email": "priya@example.com",
        "password": "Customer@123456"
    })
    headers = {"Authorization": f"Bearer {cust_login.json()['data']['access_token']}"}

    m_resp = client.post("/api/v1/measurements", json={
        "name": "Festive Kurti Size",
        "garment_type": "KURTI",
        "measurements": {"bust": 36, "waist": 32, "hip": 38, "length": 42},
        "is_default": True
    }, headers=headers)
    assert m_resp.status_code == 201
    assert m_resp.json()["data"]["name"] == "Festive Kurti Size"

def test_appointment_available_slots_and_booking(client):
    target_date = (date.today() + timedelta(days=2)).isoformat()
    slots_resp = client.get(f"/api/v1/appointments/available-slots?date={target_date}")
    assert slots_resp.status_code == 200
    slots = slots_resp.json()["data"]
    assert len(slots) > 0
    avail_slot = next(s for s in slots if s["is_available"])

    # Get a service
    services = client.get("/api/v1/services").json()["data"]
    service_id = services[0]["id"]

    cust_login = client.post("/api/v1/auth/login", json={
        "email": "priya@example.com",
        "password": "Customer@123456"
    })
    headers = {"Authorization": f"Bearer {cust_login.json()['data']['access_token']}"}

    # Book appointment
    book_resp = client.post("/api/v1/appointments", json={
        "service_id": service_id,
        "appointment_date": target_date,
        "start_time": avail_slot["start_time"],
        "notes": "Discussion for bridal blouse."
    }, headers=headers)
    assert book_resp.status_code == 201
    assert book_resp.json()["data"]["status"] == "PENDING"

    # Test double-booking prevention on same slot
    double_resp = client.post("/api/v1/appointments", json={
        "service_id": service_id,
        "appointment_date": target_date,
        "start_time": avail_slot["start_time"],
        "notes": "Attempting second booking on same slot."
    }, headers=headers)
    assert double_resp.status_code == 409

def test_order_creation_and_status_advance(client):
    # Admin login
    admin_login = client.post("/api/v1/auth/login", json={
        "email": "admin@silaicraft.com",
        "password": "Admin@123456"
    })
    admin_headers = {"Authorization": f"Bearer {admin_login.json()['data']['access_token']}"}

    # Get customer
    cust_login = client.post("/api/v1/auth/login", json={
        "email": "priya@example.com",
        "password": "Customer@123456"
    })
    cust_id = cust_login.json()["data"]["user_id"]

    # Create order
    order_resp = client.post("/api/v1/orders", json={
        "customer_id": cust_id,
        "price": 1200.0,
        "advance_amount": 500.0,
        "expected_delivery_date": (date.today() + timedelta(days=7)).isoformat(),
        "notes": "Emerald silk blouse with thread work."
    }, headers=admin_headers)
    assert order_resp.status_code == 201
    order_data = order_resp.json()["data"]
    order_id = order_data["id"]
    assert order_data["remaining_amount"] == 700.0
    assert order_data["status"] == "ORDER_RECEIVED"

    # Advance status to STITCHING
    advance_resp = client.patch(f"/api/v1/orders/{order_id}/status", json={
        "status": "STITCHING",
        "notes": "Master tailor started stitching."
    }, headers=admin_headers)
    assert advance_resp.status_code == 200
    assert advance_resp.json()["data"]["status"] == "STITCHING"

    # Record remaining payment
    pay_resp = client.post("/api/v1/payments", json={
        "order_id": order_id,
        "amount": 700.0,
        "payment_type": "REMAINING",
        "payment_method": "UPI",
        "transaction_reference": "UPI/TEST/998877"
    }, headers=admin_headers)
    assert pay_resp.status_code == 201

    # Verify order balance updated to 0
    updated_order = client.get(f"/api/v1/orders/{order_id}", headers=admin_headers).json()["data"]
    assert updated_order["remaining_amount"] == 0.0
