from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter()

@router.get("/sync")
def sync_upi() -> List[Dict[str, str]]:
    """
    Sync UPI payment statuses from backend
    Returns: [{"txnRef": "TXN123", "status": "reconciled"}]
    Keep tiny, stateless; align with schema keys (txnRef, status).
    """
    # Demo payload; replace with real reconciliation source later.
    # In production, this would query your payment gateway APIs
    # or database for actual payment statuses
    
    return [
        {"txnRef": "TXN123", "status": "reconciled"},
        {"txnRef": "TXN456", "status": "reconciled"}
    ]

@router.get("/health")
def health_check() -> Dict[str, str]:
    """Health check endpoint for AutoSync service"""
    return {"status": "ok", "service": "upi_sync"}
