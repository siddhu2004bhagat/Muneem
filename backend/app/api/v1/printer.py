from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ...services.printer_service import printer_service

router = APIRouter(
    prefix="/api/v1/printer",
    tags=["printer"],
    responses={404: {"description": "Not found"}},
)

class PrintRequest(BaseModel):
    data: str  # Base64 encoded ESC/POS data

@router.post("/raw")
async def print_raw(request: PrintRequest):
    """
    Send raw ESC/POS commands to the printer.
    Expects Base64 encoded binary data.
    """
    success = printer_service.print_raw(request.data)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to print to serial printer")
    return {"status": "success"}

@router.get("/status")
async def get_status():
    """
    Get the current connection status of the printer.
    """
    return printer_service.status()
