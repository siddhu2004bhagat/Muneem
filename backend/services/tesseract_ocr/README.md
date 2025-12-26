## Tesseract OCR Microservice

Self-hosted handwriting OCR service for MUNEEM. Runs Tesseract OCR behind a small FastAPI server.

### Requirements

- Python 3.9+
- pip / virtualenv

### Setup

```bash
cd backend/services/paddle_ocr
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Run

```bash
uvicorn ocr_service:app --host 0.0.0.0 --port 9000
```

Set `VITE_PADDLE_OCR_URL=http://<host>:9000/recognize` in the frontend env.

