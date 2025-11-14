import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.db.models import LedgerEntry, LedgerIdempotencyKey


def test_create_entry_valid(client: TestClient, db: Session):
    """Test creating a valid ledger entry"""
    response = client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-01-15",
            "description": "Test sale",
            "amount": 1000.0,
            "type": "sale",
            "gstRate": 18.0,
            "party_name": "Test Customer",
            "reference_no": "REF001"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["description"] == "Test sale"
    assert data["amount"] == 1000.0
    assert data["type"] == "sale"
    assert data["gstRate"] == 18.0
    assert data["gstAmount"] == 180.0  # Auto-calculated
    assert data["party_name"] == "Test Customer"
    assert data["is_active"] is True
    assert "id" in data


def test_list_pagination_filters(client: TestClient, db: Session):
    """Test listing with pagination and filters"""
    # Create test entries
    for i in range(5):
        client.post(
            "/api/v1/ledger",
            json={
                "date": f"2024-01-{15+i:02d}",
                "description": f"Entry {i}",
                "amount": 100.0 * (i + 1),
                "type": "sale" if i % 2 == 0 else "purchase",
                "party_name": f"Party {i}"
            }
        )
    
    # Test pagination
    response = client.get("/api/v1/ledger?skip=0&limit=3")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    
    # Test type filter
    response = client.get("/api/v1/ledger?type=sale")
    assert response.status_code == 200
    data = response.json()
    assert all(entry["type"] == "sale" for entry in data)
    
    # Test search
    response = client.get("/api/v1/ledger?search=Party 1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any("Party 1" in entry.get("party_name", "") for entry in data)


def test_update_entry(client: TestClient, db: Session):
    """Test updating a ledger entry"""
    # Create entry
    create_response = client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-01-15",
            "description": "Original",
            "amount": 1000.0,
            "type": "sale"
        }
    )
    entry_id = create_response.json()["id"]
    
    # Update entry
    update_response = client.put(
        f"/api/v1/ledger/{entry_id}",
        json={
            "date": "2024-01-16",
            "description": "Updated",
            "amount": 2000.0,
            "type": "purchase",
            "gstRate": 5.0
        }
    )
    
    assert update_response.status_code == 200
    data = update_response.json()
    assert data["description"] == "Updated"
    assert data["amount"] == 2000.0
    assert data["type"] == "purchase"
    assert data["gstRate"] == 5.0


def test_soft_delete(client: TestClient, db: Session):
    """Test soft delete functionality"""
    # Create entry
    create_response = client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-01-15",
            "description": "To be deleted",
            "amount": 1000.0,
            "type": "sale"
        }
    )
    entry_id = create_response.json()["id"]
    
    # Soft delete
    delete_response = client.delete(f"/api/v1/ledger/{entry_id}")
    assert delete_response.status_code == 200
    
    # Verify entry is not in list (is_active=False)
    list_response = client.get("/api/v1/ledger")
    assert entry_id not in [entry["id"] for entry in list_response.json()]


def test_idempotency_duplicate_returns_409(client: TestClient, db: Session):
    """Test idempotency prevents duplicates"""
    idempotency_key = "test-key-123"
    
    # Create first entry with idempotency key
    first_response = client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-01-15",
            "description": "First",
            "amount": 1000.0,
            "type": "sale",
            "idempotency_key": idempotency_key
        }
    )
    assert first_response.status_code == 200
    first_id = first_response.json()["id"]
    
    # Try to create duplicate with same key
    second_response = client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-01-15",
            "description": "Duplicate",
            "amount": 2000.0,
            "type": "purchase",
            "idempotency_key": idempotency_key
        }
    )
    
    assert second_response.status_code == 409
    error_data = second_response.json()
    assert error_data["detail"]["error"] == "IDEMPOTENT_DUPLICATE"
    assert error_data["detail"]["details"]["entry_id"] == first_id


def test_date_validation_future_date(client: TestClient, db: Session):
    """Test date validation rejects future dates"""
    from datetime import datetime, timedelta
    future_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    
    response = client.post(
        "/api/v1/ledger",
        json={
            "date": future_date,
            "description": "Future entry",
            "amount": 1000.0,
            "type": "sale"
        }
    )
    
    assert response.status_code == 422  # Validation error


def test_gst_auto_calculation(client: TestClient, db: Session):
    """Test GST auto-calculation when only gstRate provided"""
    response = client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-01-15",
            "description": "GST test",
            "amount": 1000.0,
            "type": "sale",
            "gstRate": 18.0
            # gstAmount not provided
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["gstAmount"] == 180.0  # Auto-calculated: 1000 * 0.18


def test_error_envelope_format(client: TestClient, db: Session):
    """Test error envelope is consistent"""
    # Try to update non-existent entry (PUT endpoint exists)
    response = client.put(
        "/api/v1/ledger/99999",
        json={
            "date": "2024-01-15",
            "description": "Test",
            "amount": 1000.0,
            "type": "sale"
        }
    )
    
    # Should return 404 with proper error envelope
    assert response.status_code == 404
    error_data = response.json()
    assert "detail" in error_data
    assert error_data["detail"]["error"] == "NOT_FOUND"
    
    # Try invalid data
    response = client.post(
        "/api/v1/ledger",
        json={
            "date": "invalid-date",
            "description": "Test",
            "amount": -100,  # Negative amount
            "type": "sale"
        }
    )
    
    assert response.status_code == 422  # Validation error
    error_data = response.json()
    assert "detail" in error_data  # FastAPI validation error format

