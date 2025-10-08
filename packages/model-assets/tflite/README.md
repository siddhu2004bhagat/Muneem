# TFLite Models for OCR Hybrid System

This directory contains quantized TensorFlow Lite models for handwriting recognition on ARM devices.

## Required Models

### 1. `handwriting_eng_hin.tflite`
- **Purpose:** Handwriting recognition for English and Hindi (Devanagari) text
- **Size:** ~5-10 MB (quantized)
- **Input:** 224x224 grayscale image
- **Output:** Character probabilities

**Download:**
```bash
# Option 1: Pre-trained model from TensorFlow Hub
wget https://tfhub.dev/google/lite-model/handwriting/1?lite-format=tflite -O handwriting_eng_hin.tflite

# Option 2: Custom trained model (recommended for better accuracy)
# Train your own model using TensorFlow and convert to TFLite:
# https://www.tensorflow.org/lite/models/convert/convert_models
```

### 2. `digits_symbols.tflite`
- **Purpose:** Specialized model for digits, currency symbols (₹, $), and numeric characters
- **Size:** ~2-5 MB (quantized)
- **Input:** 96x96 grayscale image
- **Output:** Digit/symbol class probabilities

**Download:**
```bash
# Custom model for Indian accounting symbols
# Includes: 0-9, ₹, /, -, ., ,, Rs
# Contact: model-assets@digbahi.com for pre-trained weights
```

## Model Quantization

All models MUST be quantized for ARM performance:

```python
import tensorflow as tf

# Load your trained model
model = tf.keras.models.load_model('your_model.h5')

# Convert to TFLite with quantization
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.float16]  # or int8 for more compression

tflite_model = converter.convert()

# Save
with open('handwriting_eng_hin.tflite', 'wb') as f:
    f.write(tflite_model)
```

## Usage in Code

Models are loaded lazily in `ocrHybrid.worker.ts`:

```typescript
// The worker will attempt to fetch models from this directory
const model = await tf.loadGraphModel('/packages/model-assets/tflite/handwriting_eng_hin.tflite');
```

## Model Performance Targets

| Model | Inference Time (ARM) | Accuracy | Size |
|-------|---------------------|----------|------|
| handwriting_eng_hin.tflite | < 200ms | > 85% | ~8 MB |
| digits_symbols.tflite | < 100ms | > 95% | ~3 MB |

## Training Data Recommendations

For best results with Indian handwriting:

1. **English + Hindi:** Train on IAM Handwriting Database + Devanagari datasets
2. **Digits/Currency:** Use custom dataset with Indian accounting notation
3. **Data Augmentation:** Include rotations, noise, varying pen widths

## Alternative: Use Placeholder

For development/testing without models:

```typescript
// In ocrHybrid.worker.ts, the TFLite prediction returns empty array
// This allows testing other features without heavy models
```

## ⚠️ Important Notes

1. **DO NOT commit model binaries to git** - They are too large
2. Add models to `.gitignore`:
   ```
   packages/model-assets/tflite/*.tflite
   ```
3. For production deployment, host models on CDN or server
4. Models should be encrypted if they contain proprietary training data

## Support

For model training assistance or pre-trained weights:
- Email: models@digbahi.com
- Docs: https://digbahi.com/docs/ocr-models

