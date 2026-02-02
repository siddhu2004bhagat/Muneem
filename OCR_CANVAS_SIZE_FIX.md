# OCR Canvas Size Issue - Analysis & Fix

## 🔴 **Problem Identified**

### Root Cause
The OCR system is trying to process the **entire canvas** which is:
- **Width**: 2,396 pixels
- **Height**: 10,000 pixels (5,000px × 2 DPR)
- **Total**: ~24 million pixels

This causes:
1. Browser `toDataURL()` to produce truncated/corrupted PNG
2. Tesseract worker to crash with "Error in pixReadStream: Unknown format"
3. OCR to fail completely

### Evidence
```
Canvas dimensions: 2396 x 10000 pixels
Error: truncated file
Error: Error attempting to read image
```

---

## ✅ **Solution**

### Option 1: Crop to Drawn Area (RECOMMENDED)
Only send the bounding box of actual ink strokes to OCR.

**Benefits**:
- Dramatically reduces image size
- Faster OCR processing
- More accurate results (no empty space)
- Works on all devices

**Implementation**:
1. Track bounding box of all strokes
2. Create temporary canvas with only that region
3. Send cropped canvas to OCR

### Option 2: Reduce Canvas Height
Limit the canvas to a smaller size (e.g., 2,000px instead of 5,000px).

**Benefits**:
- Simple fix
- Reduces memory usage

**Drawbacks**:
- Less scrollable area for users
- Doesn't solve the fundamental issue

### Option 3: Tile-Based OCR
Break the large canvas into smaller tiles and process each separately.

**Benefits**:
- Can handle any canvas size
- Parallel processing possible

**Drawbacks**:
- Complex implementation
- May miss text spanning tiles

---

## 🎯 **Recommended Fix: Smart Cropping**

### Implementation Plan

1. **Add Bounding Box Tracking** to `useCanvas.ts`:
   ```typescript
   const getBoundingBox = useCallback(() => {
     if (strokes.length === 0) return null;
     
     let minX = Infinity, minY = Infinity;
     let maxX = -Infinity, maxY = -Infinity;
     
     strokes.forEach(stroke => {
       stroke.points.forEach(point => {
         minX = Math.min(minX, point.x);
         minY = Math.min(minY, point.y);
         maxX = Math.max(maxX, point.x);
         maxY = Math.max(maxY, point.y);
       });
     });
     
     // Add padding
     const padding = 20;
     return {
       x: Math.max(0, minX - padding),
       y: Math.max(0, minY - padding),
       width: Math.min(config.width, maxX - minX + padding * 2),
       height: Math.min(config.height, maxY - minY + padding * 2)
     };
   }, [strokes, config]);
   ```

2. **Modify OCR Service** to accept bounding box:
   ```typescript
   async recognizeCanvas(
     canvasEl: HTMLCanvasElement,
     options: RecognizeOptions & { boundingBox?: { x, y, width, height } } = {}
   ) {
     let targetCanvas = canvasEl;
     
     // If bounding box provided, crop to that area
     if (options.boundingBox) {
       const { x, y, width, height } = options.boundingBox;
       const tempCanvas = document.createElement('canvas');
       tempCanvas.width = width;
       tempCanvas.height = height;
       const tempCtx = tempCanvas.getContext('2d');
       if (tempCtx) {
         tempCtx.drawImage(canvasEl, x, y, width, height, 0, 0, width, height);
         targetCanvas = tempCanvas;
       }
     }
     
     // Continue with OCR on targetCanvas...
     const dataUrl = targetCanvas.toDataURL('image/png');
     // ...
   }
   ```

3. **Update PenCanvas.tsx** to pass bounding box:
   ```typescript
   const handleRecognize = async () => {
     const boundingBox = getBoundingBox();
     if (!boundingBox) {
       toast.error('No content to recognize');
       return;
     }
     
     const results = await ocrService.recognizeCanvas(canvas, {
       boundingBox
     });
   };
   ```

---

## 📊 **Expected Results**

### Before Fix:
- Canvas: 2,396 × 10,000 px = 24M pixels
- PNG Size: ~50-100MB (fails to generate)
- OCR: **FAILS** ❌

### After Fix (Example):
- Drawn area: 800 × 400 px = 320K pixels
- PNG Size: ~200KB
- OCR: **WORKS** ✅
- Processing time: **10x faster**

---

## 🚀 **Implementation Priority**

**HIGH PRIORITY** - This is blocking OCR functionality completely.

### Steps:
1. Add `getBoundingBox()` method to useCanvas
2. Modify `ocrHybrid.service.ts` to support cropping
3. Update PenCanvas to pass bounding box
4. Test with drawn content
5. Verify OCR works

---

## 🧪 **Testing Checklist**

- [ ] Draw small text (e.g., "TEST") - should work
- [ ] Draw large text across canvas - should work
- [ ] Draw in different areas - should crop correctly
- [ ] Empty canvas - should show error message
- [ ] Very large drawing - should still work (cropped)
- [ ] Check console for errors - should be clean
- [ ] Verify OCR results are accurate

---

## 📝 **Alternative Quick Fix**

If full implementation is too complex, a quick workaround:

**Reduce canvas height in `useCanvas.ts` line 46**:
```typescript
const [config, setConfig] = useState<CanvasConfig>({
  width: 1024,
  height: 2000,  // Changed from 5000 to 2000
  backgroundColor: '#FFF9E6',
  gridType: 'lined',
  zoom: 1,
  pan: { x: 0, y: 0 },
});
```

This will:
- ✅ Fix OCR immediately
- ✅ Reduce memory usage
- ❌ Give users less scrollable space

---

**Status**: Issue identified, solution designed, ready for implementation
**Priority**: HIGH - Blocking core OCR functionality
**Estimated Fix Time**: 30-60 minutes for smart cropping solution
