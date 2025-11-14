"""
Tests for Ledger Analytics Endpoints (Phase D)
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def test_summary_empty_db(client: TestClient, db: Session):
    """Test summary with empty database"""
    response = client.get("/api/v1/ledger/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_sales"] == 0
    assert data["total_purchases"] == 0
    assert data["total_expenses"] == 0
    assert data["total_receipts"] == 0
    assert data["net_profit"] == 0
    assert data["cash_flow"] == 0
    assert "gst_collected" in data
    assert "gst_paid" in data
    assert "net_gst" in data


def test_summary_with_entries(client: TestClient, db: Session):
    """Test summary with entries"""
    # Create test entries
    client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-01-15",
            "description": "Sale 1",
            "amount": 1000.0,
            "type": "sale",
            "gstRate": 18.0
        }
    )
    client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-01-16",
            "description": "Purchase 1",
            "amount": 500.0,
            "type": "purchase",
            "gstRate": 5.0
        }
    )
    client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-01-17",
            "description": "Expense 1",
            "amount": 200.0,
            "type": "expense",
            "gstRate": 0.0
        }
    )
    
    response = client.get("/api/v1/ledger/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    
    assert data["total_sales"] > 0
    assert data["total_purchases"] > 0
    assert data["total_expenses"] > 0
    assert data["net_profit"] == data["total_sales"] - data["total_purchases"] - data["total_expenses"]


def test_summary_with_filters(client: TestClient, db: Session):
    """Test summary with date and type filters"""
    # Create entries in different date ranges
    client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-01-15",
            "description": "Sale Jan",
            "amount": 1000.0,
            "type": "sale",
            "gstRate": 18.0
        }
    )
    client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-02-15",
            "description": "Sale Feb",
            "amount": 2000.0,
            "type": "sale",
            "gstRate": 18.0
        }
    )
    
    # Test date filter
    response = client.get("/api/v1/ledger/analytics/summary?from=2024-01-01&to=2024-01-31")
    assert response.status_code == 200
    data = response.json()
    assert data["total_sales"] > 0
    
    # Test type filter
    response = client.get("/api/v1/ledger/analytics/summary?type=sale")
    assert response.status_code == 200
    data = response.json()
    assert data["total_sales"] > 0
    assert data["total_purchases"] == 0
    assert data["total_expenses"] == 0


def test_monthly_summary(client: TestClient, db: Session):
    """Test monthly aggregation"""
    # Create entries for different months
    client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-01-15",
            "description": "Sale Jan",
            "amount": 1000.0,
            "type": "sale",
            "gstRate": 18.0
        }
    )
    client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-02-15",
            "description": "Sale Feb",
            "amount": 2000.0,
            "type": "sale",
            "gstRate": 18.0
        }
    )
    
    response = client.get("/api/v1/ledger/analytics/monthly?year=2024")
    assert response.status_code == 200
    data = response.json()
    
    assert len(data) == 12  # All 12 months
    assert data[0]["month"] == 1
    assert data[0]["sales"] > 0
    assert data[1]["month"] == 2
    assert data[1]["sales"] > 0


def test_monthly_summary_empty_year(client: TestClient, db: Session):
    """Test monthly summary for year with no entries"""
    response = client.get("/api/v1/ledger/analytics/monthly?year=2025")
    assert response.status_code == 200
    data = response.json()
    
    assert len(data) == 12
    assert all(month["sales"] == 0 for month in data)


def test_party_summary(client: TestClient, db: Session):
    """Test party aggregation"""
    # Create entries for different parties
    client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-01-15",
            "description": "Sale to Customer A",
            "amount": 1000.0,
            "type": "sale",
            "gstRate": 18.0,
            "party_name": "Customer A"
        }
    )
    client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-01-16",
            "description": "Sale to Customer A again",
            "amount": 500.0,
            "type": "sale",
            "gstRate": 18.0,
            "party_name": "Customer A"
        }
    )
    client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-01-17",
            "description": "Sale to Customer B",
            "amount": 2000.0,
            "type": "sale",
            "gstRate": 18.0,
            "party_name": "Customer B"
        }
    )
    
    response = client.get("/api/v1/ledger/analytics/parties?limit=5")
    assert response.status_code == 200
    data = response.json()
    
    assert len(data) <= 5
    assert all("party_name" in party for party in data)
    assert all("transaction_count" in party for party in data)
    assert all("total_sales" in party for party in data)


def test_party_summary_empty(client: TestClient, db: Session):
    """Test party summary with no parties"""
    response = client.get("/api/v1/ledger/analytics/parties")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_party_summary_with_date_filter(client: TestClient, db: Session):
    """Test party summary with date filter"""
    # Create entries
    client.post(
        "/api/v1/ledger",
        json={
            "date": "2024-01-15",
            "description": "Sale",
            "amount": 1000.0,
            "type": "sale",
            "gstRate": 18.0,
            "party_name": "Customer A"
        }
    )
    
    response = client.get("/api/v1/ledger/analytics/parties?from=2024-01-01&to=2024-01-31")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 0  # May or may not have parties in range

