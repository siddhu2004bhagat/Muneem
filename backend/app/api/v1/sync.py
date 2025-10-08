from fastapi import APIRouter
from typing import List, Any

router = APIRouter(prefix="/api/v1")

@router.post("/sync")
def sync(batch: List[Any]):
    # For now, accept and acknowledge
    return {"ok": True, "received": len(batch)}


