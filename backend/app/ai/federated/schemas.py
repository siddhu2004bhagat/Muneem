from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class ModelUpdateRequest(BaseModel):
    encrypted_data: str
    hash: str
    device_id: str
    timestamp: str
    model_version: str

class AggregateRequest(BaseModel):
    client_updates: List[ModelUpdateRequest]
    aggregation_method: str = "fedavg"

class ModelStatusResponse(BaseModel):
    global_model: Dict[str, Any]
    update_count: int
    last_update: Optional[Dict[str, Any]]
    model_hash: str
    version: str

class UploadResponse(BaseModel):
    status: str
    message: str
    received_at: str

class AggregateResponse(BaseModel):
    status: str
    aggregated_model: Dict[str, Any]
    client_count: int
    aggregation_timestamp: str
