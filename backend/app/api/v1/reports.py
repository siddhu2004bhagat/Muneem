from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...db.base import get_db
from ...db.models import LedgerEntry
from typing import List, Dict, Any
from datetime import datetime

router = APIRouter(prefix="/api/v1")

@router.get("/reports")
def get_reports(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Get comprehensive report summary including P&L, GST, and totals.
    Returns aggregated data for the Reports tab.
    """
    entries = db.query(LedgerEntry).all()
    
    # Calculate totals by type
    sales = sum(e.amount + e.gstAmount for e in entries if e.type == 'sale')
    purchases = sum(e.amount + e.gstAmount for e in entries if e.type == 'purchase')
    expenses = sum(e.amount + e.gstAmount for e in entries if e.type == 'expense')
    receipts = sum(e.amount for e in entries if e.type == 'receipt')
    
    # Calculate GST
    gst_collected = sum(e.gstAmount for e in entries if e.type == 'sale')
    gst_paid = sum(e.gstAmount for e in entries if e.type in ['purchase', 'expense'])
    net_gst = gst_collected - gst_paid
    
    # Calculate P&L
    total_income = sales + receipts
    total_expenses = purchases + expenses
    net_profit = total_income - total_expenses
    
    # GST breakdown by rate
    gst_by_rate: Dict[float, float] = {}
    for entry in entries:
        if entry.gstRate > 0:
            rate = float(entry.gstRate)
            if rate not in gst_by_rate:
                gst_by_rate[rate] = 0.0
            gst_by_rate[rate] += entry.gstAmount
    
    return {
        "summary": {
            "total_entries": len(entries),
            "sales": sales,
            "purchases": purchases,
            "expenses": expenses,
            "receipts": receipts,
            "total_income": total_income,
            "total_expenses": total_expenses,
            "net_profit": net_profit
        },
        "gst": {
            "collected": gst_collected,
            "paid": gst_paid,
            "net": net_gst,
            "breakdown_by_rate": gst_by_rate
        },
        "generated_at": datetime.now().isoformat()
    }

