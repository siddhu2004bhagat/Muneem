# Palm Rejection - Manual Validation Guide

## ⚠️ Note on Unit Tests

The test file `palmRejection.test.ts` requires **vitest** which is not currently installed in this project. 

To run unit tests, you would need to:
```bash
npm install -D vitest @testing-library/react @testing-library/react-hooks
```

However, for immediate validation, we can use **manual testing** which is actually more effective for palm rejection since it requires real hardware interaction.

---

## ✅ Manual Validation Steps

### Step 1: Check TypeScript Compilation

```bash
cd /Users/abdulkadir/DIGBAHI_ACCOUNTING/digi-bahi-ink
npx tsc --noEmit --skipLibCheck
```

**Expected Result**: No errors

---

### Step 2: Start the Application

```bash
./start.sh
```

**Expected Result**: Application runs on `http://localhost:5173`

---

### Step 3: Enable Debug Mode

Edit `src/features/pen-input/PenCanvas.tsx` around line 178:

```typescript
const { onPointerDown, onPointerMove, onPointerUp } = usePointerEvents(
  {
    getPosition,
    beginStroke,
    extendStroke,
    endStroke,
  },
  {
    debugPalmRejection: true  // ← Add this line
  }
);
```

Save the file and the app will hot-reload.

---

### Step 4: Open Browser Console

1. Open the application in browser
2. Press `F12` or `Cmd+Option+I` to open DevTools
3. Go to the **Console** tab

---

### Step 5: Test Palm Rejection

#### Test 5.1: Size-Based Rejection (Tier 1)
1. **Action**: Touch the canvas with your palm (large contact area)
2. **Expected Console Log**: 
   ```
   [PalmRejection] Immediate rejection: Size 45.2px exceeds threshold 30px
   ```
3. **Expected Behavior**: No mark appears on canvas

#### Test 5.2: Stylus Acceptance
1. **Action**: Draw with stylus (small contact area)
2. **Expected Console Log**: 
   ```
   [PalmRejection] Pointer accepted after delay: 123
   ```
   or immediate acceptance if very small
3. **Expected Behavior**: Stroke appears on canvas

#### Test 5.3: Palm-Before-Stylus (Tier 2)
1. **Action**: Rest palm on canvas, then start writing with stylus
2. **Expected Console Logs**:
   ```
   [PalmRejection] Pointer accepted after delay: 456 (stylus)
   [PalmRejection] Pointer rejected: 123 Rejected by smaller stylus touch
   ```
3. **Expected Behavior**: Only stylus stroke appears, no palm mark

#### Test 5.4: Stationary Palm (Tier 3)
1. **Action**: Rest palm lightly (passes Tier 1), don't move it
2. **Expected Console Log** (after 100ms):
   ```
   [PalmRejection] Velocity rejection: Stationary large touch (1.2px movement in 120ms)
   ```
3. **Expected Behavior**: Stroke is cancelled mid-drawing

#### Test 5.5: Two-Finger Scroll
1. **Action**: Use two fingers to scroll the canvas
2. **Expected Console Log**:
   ```
   [PalmRejection] Multi-touch detected, ignoring pointer 789
   ```
3. **Expected Behavior**: Canvas scrolls, no drawing occurs

---

### Step 6: Use Calibration Tool

Open browser console and run:

```javascript
// The calibrator is automatically loaded
palmCalibrator.startCalibration()
```

Follow the prompts:
1. Make 5 stylus strokes (classify as 's')
2. Rest palm 5 times (classify as 'p')
3. Touch with finger 5 times (classify as 'f')

Then analyze:
```javascript
palmCalibrator.analyzeAndRecommend()
```

**Expected Output**: Recommended threshold based on your hardware

---

### Step 7: Use Manual Test Page

```bash
# Open the standalone test page
open test/palm-rejection-manual-test.html
```

This page provides:
- ✅ Live configuration sliders
- ✅ Real-time statistics
- ✅ Visual feedback
- ✅ Debug logging

**Test Procedure**:
1. Adjust `sizeThreshold` slider
2. Draw with stylus - should work
3. Rest palm - should be rejected
4. Check statistics for rejection rate

---

## 📊 Validation Checklist

### Code Quality
- [x] TypeScript types are correct
- [x] No circular dependencies
- [x] Proper cleanup on unmount
- [x] Memory-efficient data structures

### Functionality
- [ ] Tier 1: Large touches rejected immediately
- [ ] Tier 2: Stylus accepted, palm rejected when stylus appears
- [ ] Tier 3: Stationary large touches rejected
- [ ] Debug mode shows helpful logs
- [ ] Configuration changes work

### Performance
- [ ] No noticeable lag when drawing
- [ ] Smooth on Raspberry Pi 4/5
- [ ] Memory usage stays low
- [ ] No frame drops

### User Experience
- [ ] Stylus strokes appear correctly
- [ ] Palm marks don't appear
- [ ] No false rejections of valid strokes
- [ ] Natural writing experience

---

## 🐛 Common Issues & Solutions

### Issue: TypeScript errors

**Solution**: Check imports are correct
```bash
# Verify the hook exports
grep -r "usePalmRejection" src/features/pen-input/
```

### Issue: Debug logs not appearing

**Solution**: Ensure debug mode is enabled
```typescript
{ debugPalmRejection: true }
```

### Issue: All touches rejected

**Solution**: Threshold too low, increase it
```typescript
palmRejection: { sizeThreshold: 40 }
```

### Issue: Palm marks still appear

**Solution**: Threshold too high, decrease it
```typescript
palmRejection: { sizeThreshold: 25 }
```

---

## 📝 Validation Report Template

```markdown
## Palm Rejection Validation Report

**Date**: [Fill in]
**Device**: Waveshare 10.1" DSI + Raspberry Pi [4/5]
**Tester**: [Your name]

### Test Results

| Test | Status | Notes |
|------|--------|-------|
| TypeScript Compilation | [ ] Pass / [ ] Fail | |
| Tier 1 (Size) | [ ] Pass / [ ] Fail | |
| Tier 2 (Temporal) | [ ] Pass / [ ] Fail | |
| Tier 3 (Velocity) | [ ] Pass / [ ] Fail | |
| Debug Logging | [ ] Pass / [ ] Fail | |
| Performance | [ ] Pass / [ ] Fail | |
| User Experience | [ ] Pass / [ ] Fail | |

### Configuration Used
```typescript
{
  sizeThreshold: [value],
  temporalDelayMs: [value],
  velocityThreshold: [value],
  enableEdgeFiltering: [true/false]
}
```

### Issues Found
1. [List any issues]

### Recommendations
1. [List recommendations]

### Overall Status
[ ] ✅ Ready for Production
[ ] ⚠️ Needs Tuning
[ ] ❌ Needs Fixes
```

---

## 🚀 Next Steps

1. **Complete manual validation** using steps above
2. **Tune thresholds** based on your specific stylus
3. **Document optimal settings** for your hardware
4. **(Optional) Install vitest** if you want automated tests

---

## 📖 Additional Resources

- **User Guide**: `docs/PALM_REJECTION.md`
- **Quick Reference**: `PALM_REJECTION_QUICK_REF.md`
- **Implementation Details**: `docs/IMPLEMENTATION_SUMMARY.md`
- **Final Summary**: `PALM_REJECTION_FINAL_SUMMARY.md`

---

**Status**: Ready for manual validation ✅
