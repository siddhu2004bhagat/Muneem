from typing import List, Dict, Any
from .detector import detect_anomalies, calculate_trends
from ...db.models import LedgerEntry

def summarize_analytics(entries: List[LedgerEntry]) -> Dict[str, Any]:
    """Generate comprehensive analytics summary"""
    anomalies = detect_anomalies(entries)
    trends = calculate_trends(entries)
    
    # Calculate totals
    total_sales = sum(abs(e.amount or 0) for e in entries if e.type == 'sale')
    total_purchases = sum(abs(e.amount or 0) for e in entries if e.type == 'purchase')
    total_expenses = sum(abs(e.amount or 0) for e in entries if e.type == 'expense')
    total_receipts = sum(abs(e.amount or 0) for e in entries if e.type == 'receipt')
    
    # Count anomalies by severity
    severity_counts = {"low": 0, "medium": 0, "high": 0}
    for anomaly in anomalies:
        severity_counts[anomaly.get("severity", "low")] += 1
    
    return {
        "anomalies": anomalies,
        "totals": {
            "sales": total_sales,
            "purchases": total_purchases,
            "expenses": total_expenses,
            "receipts": total_receipts,
            "profit": total_sales + total_receipts - total_purchases - total_expenses
        },
        "severity": severity_counts,
        "trends": trends["chartData"]
    }
