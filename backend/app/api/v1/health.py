from fastapi import APIRouter
from ...utils.memory import get_memory_usage, is_raspberry_pi

router = APIRouter(prefix="/api/v1")

@router.get("/health")
def health():
    """Health check endpoint with memory status"""
    try:
        mem = get_memory_usage()
        return {
            "status": "ok",
            "platform": "raspberry_pi" if is_raspberry_pi() else "unknown",
            "memory": {
                "total_mb": round(mem["total_mb"], 2),
                "available_mb": round(mem["available_mb"], 2),
                "used_mb": round(mem["used_mb"], 2),
                "percent": round(mem["percent"], 2),
                "status": mem["status"]
            }
        }
    except Exception as e:
        # Fallback if memory monitoring fails
        return {
            "status": "ok",
            "platform": "unknown",
            "memory": {"error": str(e)}
        }


