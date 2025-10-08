from pydantic import BaseModel
from typing import List, Dict, Any

class AnomalySummary(BaseModel):
    type: str
    severity: str
    date: str
    amount: float
    description: str

class AnalyticsSummary(BaseModel):
    anomalies: List[AnomalySummary]
    totals: Dict[str, float]
    severity: Dict[str, int]
    trends: List[Dict[str, Any]]

class TrendsResponse(BaseModel):
    chartData: List[Dict[str, Any]]

class RefreshResponse(BaseModel):
    status: str
