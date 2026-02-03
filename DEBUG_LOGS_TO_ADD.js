// Debug script to add comprehensive logging to tesseractWorker.ts
// This will help us validate if Tesseract.js is actually processing the Blob correctly

// Lines to add after line 143:
console.log('═══════════════════════════════════════════════════');
console.log('[OCR Worker] 🔍 DETAILED DEBUG - Starting Recognition');
console.log('[OCR Worker] Input Type:', inputType);
console.log('[OCR Worker] Input Size:', dimensions);
console.log('[OCR Worker] Input instanceof Blob:', input instanceof Blob);
console.log('[OCR Worker] Input instanceof ImageData:', input instanceof ImageData);
if (input instanceof Blob) {
    console.log('[OCR Worker] Blob.type:', input.type);
    console.log('[OCR Worker] Blob.size:', input.size);
}
console.log('[OCR Worker] Tesseract Worker Ready:', !!tesseractWorker);
console.log('═══════════════════════════════════════════════════');

// After line 147 (after tesseractWorker.recognize call):
console.log('[OCR Worker] ✅ Tesseract.recognize() completed');
console.log('[OCR Worker] Result exists:', !!result);
console.log('[OCR Worker] Result.data exists:', !!result?.data);

// After line 148 (after data assignment):
console.log('═══════════════════════════════════════════════════');
console.log('[OCR Worker] 📊 TESSERACT RESULTS:');
console.log('[OCR Worker] Text found:', data.text ? `"${data.text}"` : 'EMPTY');
console.log('[OCR Worker] Text length:', data.text?.length || 0);
console.log('[OCR Worker] Confidence:', data.confidence);
console.log('[OCR Worker] Words array exists:', !!data.words);
console.log('[OCR Worker] Words count:', data.words?.length || 0);
if (data.words && data.words.length > 0) {
    console.log('[OCR Worker] First 3 words:', data.words.slice(0, 3));
}
console.log('═══════════════════════════════════════════════════');

// Before return (line 192):
console.log('═══════════════════════════════════════════════════');
console.log('[OCR Worker] ✅ FINAL RESULTS COUNT:', results.length);
if (results.length > 0) {
    console.log('[OCR Worker] First result:', results[0]);
}
console.log('═══════════════════════════════════════════════════');

// In catch block (replace line 194):
console.log('═══════════════════════════════════════════════════');
console.error('[OCR Worker] ❌ TESSERACT RECOGNITION FAILED');
console.error('[OCR Worker] Error:', error);
console.error('[OCR Worker] Error message:', error?.message);
console.error('[OCR Worker] Error stack:', error?.stack);
console.log('═══════════════════════════════════════════════════');
