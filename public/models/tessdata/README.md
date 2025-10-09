# Tesseract Trained Data

This directory contains trained data files for Tesseract OCR.

## Required Files

- `eng.traineddata` - English language (required)
- `hin.traineddata` - Hindi/Devanagari language (required)

## Download Instructions

Download the trained data files from Tesseract's official repository:

```bash
# English
curl -L https://github.com/tesseract-ocr/tessdata_fast/raw/main/eng.traineddata -o public/models/tessdata/eng.traineddata

# Hindi
curl -L https://github.com/tesseract-ocr/tessdata_fast/raw/main/hin.traineddata -o public/models/tessdata/hin.traineddata
```

## Auto-Download

If these files are missing, the OCR system will attempt to fetch them from a configured CDN on first use. A warning will be shown in the OCRDebug interface if files are not available.

## File Sizes

- `eng.traineddata`: ~4.9 MB
- `hin.traineddata`: ~1.9 MB

## Notes

- Files are loaded lazily when user triggers OCR recognition
- Fast models are used for better performance
- Models are cached by the browser after first load
