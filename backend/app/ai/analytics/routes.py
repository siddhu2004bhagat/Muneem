from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...db.base import get_db
from ...db.models import LedgerEntry
from .schemas import AnalyticsSummary, TrendsResponse, RefreshResponse
from .summarizer import summarize_analytics
from .detector import calculate_trends

router = APIRouter(prefix="/api/v1/ai/analytics")

@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db)):
    """Get comprehensive analytics summary with anomalies and totals"""
    entries = db.query(LedgerEntry).all()
    summary = summarize_analytics(entries)
    return summary

@router.get("/trends", response_model=TrendsResponse)
def get_analytics_trends(db: Session = Depends(get_db)):
    """Get monthly trends data for chart visualization"""
    entries = db.query(LedgerEntry).all()
    trends = calculate_trends(entries)
    return trends

@router.post("/refresh", response_model=RefreshResponse)
def refresh_analytics(db: Session = Depends(get_db)):
    """Force refresh of analytics calculations"""
    # In a real implementation, this would trigger background processing
    # For now, just return success status
    return {"status": "refreshed"}
