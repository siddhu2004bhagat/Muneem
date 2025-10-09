import Dexie from 'dexie';

export interface StrokeRow { id?: number; payload: ArrayBuffer; iv: ArrayBuffer; salt: ArrayBuffer; createdAt: number }
export interface ShapeRow { id?: number; payload: ArrayBuffer; iv: ArrayBuffer; salt: ArrayBuffer; createdAt: number }
export interface OcrRow { id?: number; payload: ArrayBuffer; iv: ArrayBuffer; salt: ArrayBuffer; createdAt: number }
export interface OCRCorrectionRow { id?: number; payload: ArrayBuffer; iv: ArrayBuffer; salt: ArrayBuffer; createdAt: number }
export interface OCRTelemetryRow { id?: number; payload: ArrayBuffer; iv: ArrayBuffer; salt: ArrayBuffer; createdAt: number }

/**
 * OCR Correction Interface (before encryption)
 * Stores user corrections for adaptive learning
 */
export interface OCRCorrection {
  id: string;
  strokeIds: string[];
  recognizedText: string;
  correctedText: string;
  timestamp: number;
  confidence: number;
  locale?: string;
}

/**
 * OCR Telemetry Interface (before encryption)
 * Stores OCR recognition results for analytics and debugging
 */
export interface OCRTelemetry {
  id: string;
  timestamp: number;
  imageHash: string;
  recognizedText: string;
  correctedText?: string;
  confidence: number;
  format?: string;
  deviceType?: string;
  screenDPI?: number;
  strokeCount?: number;
  sessionId?: string;
  userLang?: string;
  fields?: Record<string, string>;
}

class PenDB extends Dexie {
  strokes!: Dexie.Table<StrokeRow, number>;
  shapes!: Dexie.Table<ShapeRow, number>;
  ocr!: Dexie.Table<OcrRow, number>;
  ocrCorrections!: Dexie.Table<OCRCorrectionRow, number>;
  ocrTelemetry!: Dexie.Table<OCRTelemetryRow, number>;
  
  constructor() {
    super('digbahi_pen');
    // Version 1: Original schema
    this.version(1).stores({
      strokes: '++id, createdAt',
      shapes: '++id, createdAt',
      ocr: '++id, createdAt',
    });
    // Version 2: Add ocrCorrections for adaptive learning
    this.version(2).stores({
      strokes: '++id, createdAt',
      shapes: '++id, createdAt',
      ocr: '++id, createdAt',
      ocrCorrections: '++id, createdAt',
    });
    // Version 3: Add ocrTelemetry for analytics and debugging
    this.version(3).stores({
      strokes: '++id, createdAt',
      shapes: '++id, createdAt',
      ocr: '++id, createdAt',
      ocrCorrections: '++id, createdAt',
      ocrTelemetry: '++id, createdAt',
    });
  }
}

export const penDB = new PenDB();

// AES-GCM helpers
async function importKeyFromPIN(pin: string, salt: ArrayBuffer) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function randBytes(len: number) { return crypto.getRandomValues(new Uint8Array(len)).buffer }

export async function encryptObject(obj: unknown, pin: string) {
  const salt = randBytes(16); const iv = randBytes(12);
  const key = await importKeyFromPIN(pin, salt);
  const data = new TextEncoder().encode(JSON.stringify(obj));
  const payload = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  return { payload, iv, salt };
}

export async function decryptObject<T>(payload: ArrayBuffer, iv: ArrayBuffer, salt: ArrayBuffer, pin: string): Promise<T> {
  const key = await importKeyFromPIN(pin, salt);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, payload);
  return JSON.parse(new TextDecoder().decode(new Uint8Array(decrypted))) as T;
}

// Save helpers (callers pass user PIN)
export async function saveStroke(payload: unknown, pin = '1234') {
  const { payload: data, iv, salt } = await encryptObject(payload, pin);
  return penDB.strokes.add({ payload: data, iv, salt, createdAt: Date.now() });
}
export async function saveShape(payload: unknown, pin = '1234') {
  const { payload: data, iv, salt } = await encryptObject(payload, pin);
  return penDB.shapes.add({ payload: data, iv, salt, createdAt: Date.now() });
}
export async function saveOcr(payload: unknown, pin = '1234') {
  const { payload: data, iv, salt } = await encryptObject(payload, pin);
  return penDB.ocr.add({ payload: data, iv, salt, createdAt: Date.now() });
}

export async function loadAll(pin = '1234') {
  const [strokes, shapes, ocr] = await Promise.all([
    penDB.strokes.toArray(), penDB.shapes.toArray(), penDB.ocr.toArray(),
  ]);
  return {
    strokes: await Promise.all(strokes.map(r => decryptObject<any>(r.payload, r.iv, r.salt, pin))),
    shapes: await Promise.all(shapes.map(r => decryptObject<any>(r.payload, r.iv, r.salt, pin))),
    ocr: await Promise.all(ocr.map(r => decryptObject<any>(r.payload, r.iv, r.salt, pin))),
  };
}

// OCR Corrections helpers
export async function saveOCRCorrection(correction: OCRCorrection, pin = '1234') {
  const { payload, iv, salt } = await encryptObject(correction, pin);
  return penDB.ocrCorrections.add({ payload, iv, salt, createdAt: Date.now() });
}

export async function loadOCRCorrections(pin = '1234'): Promise<OCRCorrection[]> {
  const rows = await penDB.ocrCorrections.orderBy('createdAt').reverse().toArray();
  return Promise.all(rows.map(r => decryptObject<OCRCorrection>(r.payload, r.iv, r.salt, pin)));
}

export async function deleteOCRCorrection(id: number) {
  return penDB.ocrCorrections.delete(id);
}

export async function clearOldCorrections(daysToKeep = 30) {
  const cutoff = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
  return penDB.ocrCorrections.where('createdAt').below(cutoff).delete();
}

// OCR Telemetry helpers
export async function saveOCRTelemetry(telemetry: OCRTelemetry, pin = '1234') {
  const { payload, iv, salt } = await encryptObject(telemetry, pin);
  return penDB.ocrTelemetry.add({ payload, iv, salt, createdAt: Date.now() });
}

export async function loadOCRTelemetry(pin = '1234', limit = 100): Promise<OCRTelemetry[]> {
  const rows = await penDB.ocrTelemetry
    .orderBy('createdAt')
    .reverse()
    .limit(limit)
    .toArray();
  return Promise.all(rows.map(r => decryptObject<OCRTelemetry>(r.payload, r.iv, r.salt, pin)));
}

export async function deleteOCRTelemetry(id: number) {
  return penDB.ocrTelemetry.delete(id);
}

export async function clearOldTelemetry(daysToKeep = 90) {
  const cutoff = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
  return penDB.ocrTelemetry.where('createdAt').below(cutoff).delete();
}

