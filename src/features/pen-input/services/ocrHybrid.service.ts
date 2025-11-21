/**
 * OCR Hybrid Service
 * 
 * Service layer for hybrid OCR (Tesseract.js + TFLite).
 * Handles worker lifecycle, result merging, and post-processing.
 * 
 * Key Features:
 * - Lazy loads worker on first use
 * - Merges results from multiple OCR engines
 * - Normalizes output for downstream processing
 * - Applies merge rules (prefer TFLite for numbers, Tesseract for text)
 */

import type { OCRResult } from '../ocr/worker/tesseractWorker';

export type { OCRResult };

interface RecognizeOptions {
  mode?: 'auto' | 'tesseract' | 'tflite';
  language?: string;
  rois?: Array<{ x: number; y: number; width: number; height: number }>;
}

interface WorkerResult {
  tesseract: Array<{ text: string; confidence: number; box: { x: number; y: number; width: number; height: number } }>;
  tflite: Array<{ text: string; confidence: number; box: { x: number; y: number; width: number; height: number } }>;
}

interface WorkerResponse {
  type: 'success' | 'error' | 'progress';
  id: string;
  result?: WorkerResult;
  error?: string;
  progress?: number;
}

/**
 * Check if two bounding boxes overlap
 */
function boxesOverlap(
  box1: { x: number; y: number; width: number; height: number },
  box2: { x: number; y: number; width: number; height: number },
  threshold: number = 0.5
): boolean {
  const x1 = Math.max(box1.x, box2.x);
  const y1 = Math.max(box1.y, box2.y);
  const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
  const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

  if (x2 < x1 || y2 < y1) return false;

  const intersectionArea = (x2 - x1) * (y2 - y1);
  const box1Area = box1.width * box1.height;
  const box2Area = box2.width * box2.height;
  const unionArea = box1Area + box2Area - intersectionArea;

  return intersectionArea / unionArea > threshold;
}

/**
 * Check if text is numeric or digit-heavy
 */
function isNumeric(text: string): boolean {
  const digits = text.replace(/[^0-9]/g, '');
  return digits.length / text.length > 0.6;
}

/**
 * Check if text contains currency symbols
 */
function isCurrency(text: string): boolean {
  return /[₹$€£¥]/.test(text) || /rs\.?|inr/i.test(text);
}

/**
 * Normalize currency text
 */
function normalizeCurrency(text: string): string {
  // Convert various currency formats to canonical ₹
  return text
    .replace(/rs\.?|inr/gi, '₹')
    .replace(/[$€£¥]/g, '₹')
    .trim();
}

/**
 * Normalize number text
 */
function normalizeNumber(text: string): string {
  // Remove non-digit chars except decimal point and comma
  return text.replace(/[^\d.,]/g, '').trim();
}

/**
 * Merge OCR results from multiple engines
 * 
 * Rules:
 * 1. Prefer TFLite for numeric/currency tokens (high confidence)
 * 2. Use Tesseract for text and Devanagari
 * 3. Merge overlapping boxes intelligently
 */
function mergeResults(results: OCRResult[]): OCRResult[] {
  if (results.length === 0) return [];

  const tesseractResults = results.filter(r => r.type === 'tesseract');
  const tfliteResults = results.filter(r => r.type === 'tflite');

  // If only one engine ran, return as-is
  if (tesseractResults.length === 0) return tfliteResults;
  if (tfliteResults.length === 0) return tesseractResults;

  const merged: OCRResult[] = [];
  const usedTesseract = new Set<string>();
  const usedTFLite = new Set<string>();

  // First pass: find overlaps and apply merge rules
  for (const tfResult of tfliteResults) {
    let bestMatch: OCRResult | null = null;
    let bestOverlap = 0;

    // Find overlapping Tesseract result
    for (const tesResult of tesseractResults) {
      if (usedTesseract.has(tesResult.id)) continue;

      if (boxesOverlap(tfResult.box, tesResult.box, 0.3)) {
        const overlapScore = 0.5; // Could calculate actual IoU
        if (overlapScore > bestOverlap) {
          bestOverlap = overlapScore;
          bestMatch = tesResult;
        }
      }
    }

    if (bestMatch) {
      // Overlap found - apply merge rules
      const tesseractText = bestMatch.text;
      const tfliteText = tfResult.text;

      // Rule 1: Prefer TFLite for numeric tokens
      if (
        (isNumeric(tfliteText) || isCurrency(tfliteText)) &&
        tfResult.confidence > 0.6
      ) {
        // Use TFLite result
        merged.push({
          ...tfResult,
          text: isCurrency(tfliteText)
            ? normalizeCurrency(tfliteText)
            : normalizeNumber(tfliteText),
          type: 'merged'
        });
        usedTFLite.add(tfResult.id);
        usedTesseract.add(bestMatch.id);
      } else {
        // Use Tesseract result (better for text)
        merged.push({
          ...bestMatch,
          type: 'merged'
        });
        usedTesseract.add(bestMatch.id);
        usedTFLite.add(tfResult.id);
      }
    } else {
      // No overlap - keep TFLite result if it's numeric/currency
      if (
        (isNumeric(tfResult.text) || isCurrency(tfResult.text)) &&
        tfResult.confidence > 0.5
      ) {
        merged.push({
          ...tfResult,
          text: isCurrency(tfResult.text)
            ? normalizeCurrency(tfResult.text)
            : normalizeNumber(tfResult.text)
        });
        usedTFLite.add(tfResult.id);
      }
    }
  }

  // Second pass: add remaining Tesseract results (text/Devanagari)
  for (const tesResult of tesseractResults) {
    if (!usedTesseract.has(tesResult.id)) {
      merged.push(tesResult);
    }
  }

  // Sort by position (top to bottom, left to right)
  merged.sort((a, b) => {
    const rowDiff = a.box.y - b.box.y;
    if (Math.abs(rowDiff) > 20) return rowDiff;
    return a.box.x - b.box.x;
  });

  return merged;
}

/**
 * OCR Hybrid Service
 */
export default class OCRHybridService {
  private worker: Worker | null = null;
  private messageId = 0;
  private pendingRequests = new Map<string, {
    resolve: (value: WorkerResult | undefined) => void;
    reject: (error: Error) => void;
  }>();

  private paddleEndpoint = import.meta.env.VITE_PADDLE_OCR_URL as string | undefined;

  /**
   * Lazy load worker
   */
  private async ensureWorker(): Promise<Worker> {
    if (this.worker) return this.worker;

    // Create worker from worker file
    this.worker = new Worker(
      new URL('../ocr/worker/tesseractWorker.ts', import.meta.url),
      { type: 'module' }
    );

    // Set up message handler
    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { type, id, result, error, progress } = event.data;

      if (type === 'progress' && progress !== undefined) {
        // Emit progress event (could hook into UI loading indicator)
        this.onProgress?.(progress);
        return;
      }

      const pending = this.pendingRequests.get(id);
      if (!pending) return;

      this.pendingRequests.delete(id);

      if (type === 'success') {
        pending.resolve(result);
      } else if (type === 'error') {
        pending.reject(new Error(error || 'OCR worker error'));
      }
    };

    this.worker.onerror = (error) => {
      console.error('OCR Worker error:', error);
      // Reject all pending requests
      for (const [id, pending] of this.pendingRequests) {
        pending.reject(new Error('Worker crashed'));
      }
      this.pendingRequests.clear();
      this.worker = null;
    };

    return this.worker;
  }

  /**
   * Send message to worker
   */
  private async sendMessage(type: string, payload?: unknown): Promise<WorkerResult | undefined> {
    const worker = await this.ensureWorker();
    const id = `msg_${++this.messageId}`;

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });

      worker.postMessage({ type, payload, id });

      // Timeout after 10 seconds (reduced from 30s for faster feedback)
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('OCR request timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Progress callback (optional)
   */
  public onProgress?: (progress: number) => void;

  /**
   * Warmup: preload models in background
   */
  async warmup(): Promise<void> {
    await this.sendMessage('warmup');
  }

  /**
   * Recognize text from canvas
   */
  async recognizeCanvas(
    canvasEl: HTMLCanvasElement,
    options: RecognizeOptions = {}
  ): Promise<OCRResult[]> {
    // Get image data from canvas
    const ctx = canvasEl.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);

    // Send to worker
    const rawResults = await this.sendMessage('recognize', {
      imageData,
      options,
      rois: options.rois
    });

    // Check if rawResults is valid
    if (!rawResults) {
      console.warn('[OCRHybridService] No results from worker');
      return [];
    }

    // Flatten results from both engines
    const allResults: OCRResult[] = [];
    if (rawResults.tesseract && Array.isArray(rawResults.tesseract)) {
      allResults.push(...rawResults.tesseract.map(r => ({ ...r, type: 'tesseract' as const })));
    }
    if (rawResults.tflite && Array.isArray(rawResults.tflite)) {
      allResults.push(...rawResults.tflite.map(r => ({ ...r, type: 'tflite' as const })));
    }

    // Merge and post-process results
    const merged = mergeResults(allResults);

    return merged;
  }

  /**
   * Recognize specific region from canvas
   */
  async recognizeCanvasRegion(
    canvasEl: HTMLCanvasElement,
    options: RecognizeOptions & {
      region?: { x: number; y: number; width: number; height: number };
    } = {}
  ): Promise<OCRResult[]> {
    if (options.region) {
      // Use ROI
      return this.recognizeCanvas(canvasEl, {
        ...options,
        rois: [options.region]
      });
    }

    return this.recognizeCanvas(canvasEl, options);
  }

  /**
   * Recognize text using external PaddleOCR service
   */
  async recognizeWithPaddle(canvasEl: HTMLCanvasElement): Promise<OCRResult[]> {
    if (!this.paddleEndpoint) {
      console.warn('[OCRHybridService] Paddle OCR endpoint not configured');
      return [];
    }

    const dataUrl = canvasEl.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];

    try {
      const response = await fetch(this.paddleEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: base64 })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`PaddleOCR error: ${response.status} ${text}`);
      }

      const { text, confidence } = await response.json() as { text: string; confidence: number };

      if (!text) {
        return [];
      }

      const fallbackResult: OCRResult = {
        id: `paddle_${Date.now()}`,
        text,
        confidence: typeof confidence === 'number' ? confidence : 0.7,
        box: { x: 0, y: 0, width: canvasEl.width, height: canvasEl.height },
        type: 'merged'
      };

      console.log('[OCRHybridService] PaddleOCR result:', fallbackResult);
      return [fallbackResult];
    } catch (error) {
      console.error('[OCRHybridService] PaddleOCR request failed:', error);
      throw error instanceof Error ? error : new Error('PaddleOCR request failed');
    }
  }

  hasPaddleFallback(): boolean {
    return Boolean(this.paddleEndpoint);
  }

  /**
   * Clean up worker
   */
  async destroy(): Promise<void> {
    if (this.worker) {
      await this.sendMessage('destroy');
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingRequests.clear();
  }
}

// Singleton instance
let instance: OCRHybridService | null = null;

/**
 * Get singleton instance
 */
export function getOCRHybridService(): OCRHybridService {
  if (!instance) {
    instance = new OCRHybridService();
  }
  return instance;
}

