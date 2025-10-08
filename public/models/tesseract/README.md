# Tesseract.js Trained Data Files

This directory contains trained data files for Tesseract.js OCR engine.

## Required Files

### 1. `eng.traineddata`
- **Language:** English
- **Version:** Tesseract 4.0+
- **Size:** ~11 MB

**Download:**
```bash
cd public/models/tesseract
wget https://github.com/tesseract-ocr/tessdata_fast/raw/main/eng.traineddata
```

### 2. `hin.traineddata` (Hindi/Devanagari)
- **Language:** Hindi (Devanagari script)
- **Version:** Tesseract 4.0+
- **Size:** ~2 MB

**Download:**
```bash
cd public/models/tesseract
wget https://github.com/tesseract-ocr/tessdata_fast/raw/main/hin.traineddata
```

## Alternative: Use CDN

Instead of hosting locally, Tesseract.js can load from CDN:

```typescript
// In ocrHybrid.worker.ts
tesseractWorker = await Tesseract.createWorker('eng+hin', 1, {
  langPath: 'https://tessdata.projectnaptha.com/4.0.0',
  // ... other options
});
```

**Trade-offs:**
- ✅ **CDN:** No local storage, always up-to-date
- ✅ **Local:** Works offline, faster first load

## File Structure

```
public/models/tesseract/
├── README.md                ← This file
├── eng.traineddata         ← English (download)
├── hin.traineddata         ← Hindi (download)
└── .gitignore              ← Ignore traineddata files
```

## `.gitignore` Entry

Add to your `.gitignore`:
```
public/models/tesseract/*.traineddata
```

## Usage in Code

The worker will automatically load from this directory:

```typescript
// ocrHybrid.worker.ts
tesseractWorker = await Tesseract.createWorker('eng+hin', 1, {
  langPath: '/models/tesseract',  // Points to public/models/tesseract/
  // ... other config
});
```

## Supported Languages

Tesseract supports 100+ languages. For DigBahi, we primarily use:

- **eng:** English (accounting terms, brand names)
- **hin:** Hindi/Devanagari (local language entries)

Additional languages can be added:
```bash
# Marathi
wget https://github.com/tesseract-ocr/tessdata_fast/raw/main/mar.traineddata

# Tamil
wget https://github.com/tesseract-ocr/tessdata_fast/raw/main/tam.traineddata

# Telugu
wget https://github.com/tesseract-ocr/tessdata_fast/raw/main/tel.traineddata
```

Then use: `createWorker('eng+hin+mar', ...)`

## Fine-Tuning for Handwriting

Tesseract is primarily trained on printed text. For better handwriting recognition:

1. **Use LSTM models:** Already included in Tesseract 4.0+
2. **Configure for handwriting:**
   ```typescript
   await tesseractWorker.setParameters({
     tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
     tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789₹/-.,() '
   });
   ```
3. **Consider fine-tuning:** Train on your own handwriting dataset using `tesstrain`

## Performance

| Language | Load Time | Recognition Time | Accuracy (Print) | Accuracy (Handwriting) |
|----------|-----------|-----------------|------------------|----------------------|
| eng | ~2s | ~500ms | 95%+ | 70-80% |
| hin | ~1s | ~400ms | 90%+ | 65-75% |

## Resources

- **Tesseract.js Docs:** https://tesseract.projectnaptha.com/
- **Trained Data Repository:** https://github.com/tesseract-ocr/tessdata_fast
- **Language Codes:** https://tesseract-ocr.github.io/tessdoc/Data-Files-in-different-versions.html

## Support

For issues with Tesseract recognition:
1. Check console for loading errors
2. Verify traineddata files are downloaded
3. Test with simple printed text first
4. Adjust PSM (Page Segmentation Mode) for your use case

