from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from paddleocr import PaddleOCR
from typing import Optional
import base64
import io
from PIL import Image


app = FastAPI(title="DigBahi PaddleOCR Service")
ocr = PaddleOCR(use_angle_cls=True, lang='en')


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "PaddleOCR"}


@app.get("/")
def root():
    return {
        "service": "DigBahi PaddleOCR Service",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "recognize": "/recognize (POST)",
            "docs": "/docs"
        }
    }


class OCRRequest(BaseModel):
    image_base64: str
    target_field: Optional[str] = None


@app.post("/recognize")
def recognize(req: OCRRequest):
    try:
        img_bytes = base64.b64decode(req.image_base64)
        image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {exc}")

    results = ocr.ocr(image, cls=True)
    if not results or not results[0]:
        return {"text": "", "confidence": 0.0}

    lines = results[0]
    text = " ".join([line[1][0] for line in lines]).strip()
    avg_conf = sum(line[1][1] for line in lines) / len(lines)

    return {"text": text, "confidence": float(avg_conf)}





