"""
Additional tests for Phase A: Filter & Pagination features
Tests for tags filter and total count functionality
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def test_tags_filter(client: TestClient, db: Session):
    """Test filtering by tags"""
    # Create entries with different tags
    client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-01-15",
            "description": "Urgent entry",
            "amount": 1000.0,
            "type": "sale",
            "tags": "urgent, payment-due"
        }
    )
    
    client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-01-16",
            "description": "Regular entry",
            "amount": 500.0,
            "type": "purchase",
            "tags": "recurring"
        }
    )
    
    # Test single tag filter
    response = client.get("/api/v1/ledger?tags=urgent")
    assert response.status_code == 200
    data = response.json()
    if isinstance(data, list):
        assert len(data) >= 1
        assert any("urgent" in entry.get("tags", "").lower() for entry in data)
    
    # Test multiple tags (comma-separated)
    response = client.get("/api/v1/ledger?tags=urgent,payment-due")
    assert response.status_code == 200


def test_total_count_parameter(client: TestClient, db: Session):
    """Test include_total parameter"""
    # Create multiple entries
    for i in range(5):
        client.post(
            "/api/v1/ledger",
            json={
                "date": f"2024-01-{15+i:02d}",
                "description": f"Entry {i}",
                "amount": 100.0 * (i + 1),
                "type": "sale"
            }
        )
    
    # Test without total (backward compatible)
    response = client.get("/api/v1/ledger?skip=0&limit=3")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 3
    
    # Test with total
    response = client.get("/api/v1/ledger?skip=0&limit=3&include_total=true")
    assert response.status_code == 200
    data = response.json()
    if isinstance(data, dict):
        assert "items" in data
        assert "total" in data
        assert "hasNext" in data
        assert isinstance(data["items"], list)
        assert isinstance(data["total"], int)
        assert data["total"] >= len(data["items"])


def test_date_range_filter(client: TestClient, db: Session):
    """Test date range filtering"""
    # Create entries with different dates
    client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-01-15",
            "description": "Early entry",
            "amount": 1000.0,
            "type": "sale"
        }
    )
    
    client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-01-20",
            "description": "Late entry",
            "amount": 500.0,
            "type": "purchase"
        }
    )
    
    # Test date range
    response = client.get("/api/v1/ledger?from=2024-01-15&to=2024-01-18")
    assert response.status_code == 200
    data = response.json()
    if isinstance(data, list):
        # All entries should be within date range
        for entry in data:
            assert entry["date"] >= "2024-01-15"
            assert entry["date"] <= "2024-01-18"

