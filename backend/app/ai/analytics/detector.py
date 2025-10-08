from typing import List, Dict, Any, Tuple
from datetime import datetime, timedelta
from ...db.models import LedgerEntry

def detect_anomalies(entries: List[LedgerEntry]) -> List[Dict[str, Any]]:
    """Detect unusual patterns in ledger entries"""
    anomalies = []
    
    # Group by date for time-series analysis
    daily_amounts = {}
    for entry in entries:
        date = entry.date
        if date not in daily_amounts:
            daily_amounts[date] = []
        daily_amounts[date].append(abs(entry.amount or 0))
    
    # Calculate daily totals
    daily_totals = {date: sum(amounts) for date, amounts in daily_amounts.items()}
    
    if len(daily_totals) < 2:
        return anomalies
    
    # Calculate moving average and detect spikes
    amounts = list(daily_totals.values())
    mean_amount = sum(amounts) / len(amounts)
    std_amount = (sum((x - mean_amount) ** 2 for x in amounts) / len(amounts)) ** 0.5
    
    threshold = mean_amount + 2 * std_amount
    
    for date, total in daily_totals.items():
        if total > threshold:
            anomalies.append({
                "type": "spending_spike",
                "severity": "high" if total > mean_amount + 3 * std_amount else "medium",
                "date": date,
                "amount": total,
                "description": f"Unusual spending spike detected"
            })
    
    # Check for duplicate entries
    seen_combinations = {}
    for entry in entries:
        key = (entry.description, entry.amount, entry.type)
        if key in seen_combinations:
            anomalies.append({
                "type": "duplicate_entry",
                "severity": "medium",
                "date": entry.date,
                "amount": entry.amount,
                "description": f"Potential duplicate: {entry.description}"
            })
        else:
            seen_combinations[key] = entry
    
    return anomalies[:10]  # Limit to top 10

def calculate_trends(entries: List[LedgerEntry]) -> Dict[str, Any]:
    """Calculate monthly trends for visualization"""
    monthly_data = {}
    
    for entry in entries:
        try:
            # Parse date and get month key
            date_obj = datetime.strptime(entry.date, '%Y-%m-%d')
            month_key = date_obj.strftime('%Y-%m')
            
            if month_key not in monthly_data:
                monthly_data[month_key] = {"sales": 0, "purchases": 0, "expenses": 0, "receipts": 0}
            
            amount = abs(entry.amount or 0)
            if entry.type == 'sale':
                monthly_data[month_key]["sales"] += amount
            elif entry.type == 'purchase':
                monthly_data[month_key]["purchases"] += amount
            elif entry.type == 'expense':
                monthly_data[month_key]["expenses"] += amount
            elif entry.type == 'receipt':
                monthly_data[month_key]["receipts"] += amount
        except:
            continue
    
    # Convert to chart data format
    chart_data = []
    for month, data in sorted(monthly_data.items()):
        chart_data.append({
            "month": month,
            "sales": data["sales"],
            "purchases": data["purchases"],
            "expenses": data["expenses"],
            "receipts": data["receipts"],
            "profit": data["sales"] + data["receipts"] - data["purchases"] - data["expenses"]
        })
    
    return {"chartData": chart_data}
