/**
 * OCR Hybrid Worker
 * 
 * Runs heavy OCR inference in Web Worker to avoid blocking main thread.
 * Combines Tesseract.js (eng+hin) for text with TFLite for numbers/symbols.
 * 
 * Architecture:
 * - Lazy loads models on first use
 * - Supports ROI (Region of Interest) cropping
 * - Returns unified results with type markers
 */

// @ts-expect-error - Tesseract will be loaded via CDN or npm
declare const Tesseract: {
  createWorker: (options?: { logger?: (info: { status: string; progress: number }) => void }) => Promise<{
    loadLanguage: (lang: string) => Promise<void>;
    initialize: (lang: string) => Promise<void>;
    recognize: (image: ImageData, options?: unknown) => Promise<{ data: { text: string; confidence: number; words: Array<{ text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }> } }>;
    terminate: () => Promise<void>;
  }>;
};

interface WorkerMessage {
  type: 'init' | 'recognize' | 'warmup' | 'destroy';
  payload?: {
    imageData?: ImageData;
    options?: RecognizeOptions;
    rois?: Array<{ x: number; y: number; width: number; height: number }>;
  };
  id: string;
}

interface RecognizeOptions {
  mode?: 'auto' | 'tesseract' | 'tflite';
  language?: string; // 'eng+hin' by default
}

interface OCRResult {
  id: string;
  text: string;
  confidence: number;
  box: { x: number; y: number; width: number; height: number };
  type: 'tesseract' | 'tflite' | 'merged';
}

type TesseractWorker = Awaited<ReturnType<typeof Tesseract.createWorker>>;
type TFLiteModel = { predict: (input: ImageData) => Promise<{ text: string; confidence: number; box: { x: number; y: number; width: number; height: number } }[]> } | null;

let tesseractWorker: TesseractWorker | null = null;
let tfliteModel: TFLiteModel = null; // TFLite model stub
let isInitialized = false;

/**
 * Initialize OCR engines with lazy loading and compressed traineddata
 */
async function initialize(): Promise<void> {
  if (isInitialized) return;

  try {
    // Initialize Tesseract.js with lazy loading
    if (typeof Tesseract !== 'undefined') {
      tesseractWorker = await Tesseract.createWorker({
        logger: (m: { status: string; progress: number }) => {
          // Log progress for debugging
          if (m.status === 'loading tesseract core') {
            postMessage({ type: 'progress', progress: 0.1, id: '' });
          } else if (m.status === 'initializing tesseract') {
            postMessage({ type: 'progress', progress: 0.3, id: '' });
          } else if (m.status === 'loading language traineddata') {
            postMessage({ type: 'progress', progress: 0.6, id: '' });
          } else if (m.status === 'initializing api') {
            postMessage({ type: 'progress', progress: 0.9, id: '' });
          } else if (m.status === 'recognizing text') {
            postMessage({ type: 'progress', progress: m.progress, id: '' });
          }
        }
      });
      
      // Load compressed traineddata for English and Hindi
      // Using lazy loading approach - models will be downloaded on first use
      await tesseractWorker.loadLanguage('eng+hin');
      await tesseractWorker.initialize('eng+hin');
      
      // Set recognition parameters for better accuracy
      await tesseractWorker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789₹.,:-()[]{}!@#$%^&*()_+-=[]{}|;:,.<>?/~` अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह',
        tessedit_pageseg_mode: '6', // Uniform block of text
      });
    }

    // Initialize TFLite model stub (placeholder for future enhancement)
    tfliteModel = {
      predict: async (_imageData: ImageData) => {
        // Placeholder: return empty results for now
        // Future implementation would use quantized TFLite models
        return [];
      }
    };

    isInitialized = true;
    postMessage({ type: 'progress', progress: 1.0, id: '' });
  } catch (error) {
    console.error('OCR Worker initialization failed:', error);
    throw error;
  }
}

/**
 * Run Tesseract OCR on image data
 */
async function runTesseract(imageData: ImageData, options: RecognizeOptions): Promise<OCRResult[]> {
  if (!tesseractWorker) {
    throw new Error('Tesseract not initialized');
  }

  try {
    const { data } = await tesseractWorker.recognize(imageData);
    
    // Parse Tesseract results
    const results: OCRResult[] = [];
    
    if (data.words) {
      data.words.forEach((word, index) => {
        if (word.text && word.text.trim()) {
          results.push({
            id: `tesseract_${Date.now()}_${index}`,
            text: word.text.trim(),
            confidence: word.confidence / 100, // Normalize to 0-1
            box: {
              x: word.bbox.x0,
              y: word.bbox.y0,
              width: word.bbox.x1 - word.bbox.x0,
              height: word.bbox.y1 - word.bbox.y0
            },
            type: 'tesseract'
          });
        }
      });
    }

    return results;
  } catch (error) {
    console.error('Tesseract recognition failed:', error);
    return [];
  }
}

/**
 * Run TFLite model for digits/symbols
 */
async function runTFLite(imageData: ImageData, options: RecognizeOptions): Promise<OCRResult[]> {
  if (!tfliteModel) {
    console.warn('TFLite model not initialized (using stub)');
    return [];
  }

  try {
    // Placeholder for TFLite inference
    // Real implementation would:
    // 1. Preprocess image (resize, normalize)
    // 2. Run inference using TFLite runtime
    // 3. Post-process results
    
    const results = await tfliteModel.predict(imageData);
    return results;
  } catch (error) {
    console.error('TFLite recognition failed:', error);
    return [];
  }
}

/**
 * Crop image data to ROI
 */
function cropImageData(
  imageData: ImageData,
  roi: { x: number; y: number; width: number; height: number }
): ImageData {
  const canvas = new OffscreenCanvas(roi.width, roi.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // Create temporary canvas with full image
  const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) throw new Error('Failed to get temp canvas context');
  
  tempCtx.putImageData(imageData, 0, 0);

  // Draw cropped region
  ctx.drawImage(
    tempCanvas,
    roi.x, roi.y, roi.width, roi.height,
    0, 0, roi.width, roi.height
  );

  return ctx.getImageData(0, 0, roi.width, roi.height);
}

/**
 * Main recognition function
 */
async function recognizeImageData(
  imageData: ImageData,
  options: RecognizeOptions = {},
  rois?: Array<{ x: number; y: number; width: number; height: number }>
): Promise<{ tesseract: OCRResult[]; tflite: OCRResult[] }> {
  await initialize();

  const mode = options.mode || 'auto';
  let tesseractResults: OCRResult[] = [];
  let tfliteResults: OCRResult[] = [];

  // Process full image or ROIs
  const imagesToProcess = rois && rois.length > 0
    ? rois.map(roi => cropImageData(imageData, roi))
    : [imageData];

  for (const imgData of imagesToProcess) {
    if (mode === 'auto' || mode === 'tesseract') {
      // Run Tesseract for general text + Hindi
      const results = await runTesseract(imgData, options);
      tesseractResults = tesseractResults.concat(results);
    }

    if (mode === 'auto' || mode === 'tflite') {
      // Run TFLite for digits/symbols
      const results = await runTFLite(imgData, options);
      tfliteResults = tfliteResults.concat(results);
    }
  }

  return { tesseract: tesseractResults, tflite: tfliteResults };
}

/**
 * Warmup: preload models in background
 */
async function warmup(): Promise<void> {
  await initialize();
}

/**
 * Cleanup resources
 */
async function destroy(): Promise<void> {
  if (tesseractWorker) {
    await tesseractWorker.terminate();
    tesseractWorker = null;
  }
  
  tfliteModel = null;
  isInitialized = false;
}

/**
 * Worker message handler
 */
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, payload, id } = event.data;

  try {
    switch (type) {
      case 'init':
      case 'warmup':
        await warmup();
        postMessage({ type: 'success', id, result: { initialized: true } });
        break;

      case 'recognize': {
        if (!payload?.imageData) {
          throw new Error('Missing imageData in recognize request');
        }
        const results = await recognizeImageData(
          payload.imageData,
          payload.options || {},
          payload.rois
        );
        postMessage({ type: 'success', id, result: results });
        break;
      }

      case 'destroy':
        await destroy();
        postMessage({ type: 'success', id, result: { destroyed: true } });
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    postMessage({
      type: 'error',
      id,
      error: errorMessage
    });
  }
};

// Export types for TypeScript (will be stripped in worker)
export type { WorkerMessage, RecognizeOptions, OCRResult };

