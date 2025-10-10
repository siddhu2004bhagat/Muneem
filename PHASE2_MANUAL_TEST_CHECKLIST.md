# Phase 2 Manual Integration Test Checklist

**Date:** October 10, 2025  
**Tester:** To be performed by user  
**Status:** Ready for manual testing

---

## Pre-Test Setup

- [ ] Backup existing IndexedDB data (optional)
- [ ] Start development server: `npm run dev`
- [ ] Open browser to http://localhost:5173
- [ ] Open browser DevTools Console
- [ ] Open browser DevTools Application tab → IndexedDB

---

## Test Suite 1: Template System

### 1.1 Template Rendering
- [ ] **Navigate to PenCanvas/Notebook page**
- [ ] **Verify default template is "lined"**
  - Check background has horizontal lines
  - Lines should be crisp and evenly spaced
- [ ] **Click template picker button (shows "lined")**
  - Verify picker popover opens
  - Verify 3 template cards shown (Blank, Lined, Columnar)
  - Each card should have thumbnail preview

### 1.2 Template Switching
- [ ] **Select "Blank" template**
  - Background should change to subtle paper texture only
  - Verify existing strokes are preserved
  - Verify page is saved (check browser console)
- [ ] **Select "Columnar" template**
  - Background should show column dividers
  - Verify column headers visible (Date, Party, Amount, Notes)
  - Verify existing strokes are preserved
- [ ] **Select "Lined" template again**
  - Background should return to horizontal lines
  - Verify existing strokes are preserved

### 1.3 Template Persistence
- [ ] **Draw some strokes on a lined page**
- [ ] **Refresh the browser (F5)**
- [ ] **Verify:**
  - Template remains "lined"
  - Strokes are still visible
  - Background template draws correctly

---

## Test Suite 2: Section Management

### 2.1 Section Creation
- [ ] **Click "Manage Sections" button (Tags icon)**
- [ ] **Verify SectionManager dialog opens**
- [ ] **Click "New Section" button**
- [ ] **Enter section name: "Personal Expenses"**
- [ ] **Select a color (e.g., red)**
- [ ] **Click "Create"**
  - Verify section appears in list
  - Verify color indicator shows correctly

### 2.2 Section Assignment
- [ ] **Close Section Manager**
- [ ] **Open section dropdown (next to template picker)**
- [ ] **Verify "Personal Expenses" appears in dropdown**
- [ ] **Select "Personal Expenses"**
  - Verify page is assigned to section
  - Check browser console for save confirmation

### 2.3 Section CRUD Operations
- [ ] **Open Section Manager again**
- [ ] **Create 2 more sections:**
  - "Business Expenses" (blue)
  - "Income" (green)
- [ ] **Edit "Personal Expenses":**
  - Click edit icon
  - Change name to "Personal Bills"
  - Change color to orange
  - Click "Save"
  - Verify changes reflected in list
- [ ] **Delete "Income" section:**
  - Click delete icon
  - Verify confirmation dialog appears
  - Click "Delete"
  - Verify section removed from list

### 2.4 Section Persistence
- [ ] **Refresh browser (F5)**
- [ ] **Open Section Manager**
- [ ] **Verify:**
  - "Personal Bills" (orange) exists
  - "Business Expenses" (blue) exists
  - "Income" does not exist (deleted)

---

## Test Suite 3: Multi-Page Navigation

### 3.1 Page Creation with Templates
- [ ] **Create new page (click "New Page")**
- [ ] **Verify page 2 is created with default "lined" template**
- [ ] **Change template to "blank"**
- [ ] **Create page 3 with "columnar" template**
- [ ] **Verify you now have 3 pages:**
  - Page 1: lined
  - Page 2: blank
  - Page 3: columnar

### 3.2 Page Navigation
- [ ] **Navigate to page 1**
  - Verify lined background
  - Verify any strokes from earlier are still there
- [ ] **Navigate to page 2**
  - Verify blank background
- [ ] **Navigate to page 3**
  - Verify columnar background

### 3.3 Grid View
- [ ] **Click "Grid View" button (Grid3x3 icon)**
- [ ] **Verify NotebookGrid dialog opens**
- [ ] **Verify:**
  - All 3 pages shown as thumbnails
  - Each thumbnail shows correct template
  - Page numbers displayed (1, 2, 3)
  - Current page has "Current" indicator
- [ ] **Click page 1 thumbnail**
  - Verify navigation to page 1
  - Verify grid closes

---

## Test Suite 4: Database Migration

### 4.1 Migration Helper (Console Test)
- [ ] **Open Browser Console**
- [ ] **Import migration helper:**
  ```javascript
  import { migratePagesToV2, backupPagesBeforeMigration } from './src/lib/localStore.ts'
  ```
  Note: May need to test via actual app code or test file
- [ ] **Run backup:**
  ```javascript
  const backup = await backupPagesBeforeMigration()
  console.log(backup)
  ```
  - Verify JSON output contains all pages
- [ ] **Run migration:**
  ```javascript
  const result = await migratePagesToV2()
  console.log(result)
  ```
  - Verify output: `{ migrated: X, skipped: Y, errors: 0 }`

### 4.2 Check IndexedDB
- [ ] **Open DevTools → Application → IndexedDB**
- [ ] **Expand "digbahi-pen" database**
- [ ] **Verify tables exist:**
  - `notebookPages`
  - `notebookSections` ← NEW
- [ ] **Check notebookPages table:**
  - Open a few rows
  - Verify `payload` is encrypted (not readable)
  - Verify `iv` and `salt` exist
- [ ] **Check notebookSections table:**
  - Verify sections exist
  - Verify encryption (payload, iv, salt)

---

## Test Suite 5: OCR Integration

### 5.1 OCR with Templates
- [ ] **Navigate to page with "columnar" template**
- [ ] **Switch pen tool to OCR mode**
- [ ] **Draw a lasso around some handwritten text/numbers**
- [ ] **Verify OCR Confirm dialog appears**
- [ ] **Verify processed fields shown**
- [ ] **Click "Confirm & Save"**
- [ ] **Verify:**
  - Entry saved
  - Template background still visible
  - No visual corruption

### 5.2 OCR Telemetry (if enabled)
- [ ] **Check browser console for telemetry logs**
- [ ] **Verify consent dialog appears (first time)**
- [ ] **Verify telemetry data encrypted before storage**

---

## Test Suite 6: Stroke Preservation

### 6.1 Strokes with Template Changes
- [ ] **On page 1, draw several strokes (lines, shapes)**
- [ ] **Change template from "lined" to "blank"**
- [ ] **Verify all strokes remain visible**
- [ ] **Change template to "columnar"**
- [ ] **Verify all strokes remain visible and aligned**

### 6.2 Strokes with Page Navigation
- [ ] **On page 1, draw more strokes**
- [ ] **Navigate to page 2**
- [ ] **Navigate back to page 1**
- [ ] **Verify all strokes from step 1 are still there**

---

## Test Suite 7: Performance

### 7.1 Template Rendering Speed
- [ ] **Open Performance tab in DevTools**
- [ ] **Start recording**
- [ ] **Switch between templates rapidly (blank → lined → columnar)**
- [ ] **Stop recording**
- [ ] **Verify:**
  - Each template change < 50ms total
  - No significant layout shifts
  - No memory leaks (check memory tab)

### 7.2 Grid View Performance
- [ ] **Create 10+ pages with different templates**
- [ ] **Open Grid View**
- [ ] **Measure time to render grid**
- [ ] **Verify:**
  - Grid renders in < 1 second
  - Smooth scrolling
  - Thumbnails crisp and correct

---

## Test Suite 8: Edge Cases

### 8.1 Empty Database
- [ ] **Clear IndexedDB (delete database)**
- [ ] **Refresh app**
- [ ] **Verify:**
  - Initial page created with default "lined" template
  - No errors in console

### 8.2 Invalid Data Recovery
- [ ] **Manually corrupt a notebookPage entry in IndexedDB**
- [ ] **Refresh app**
- [ ] **Verify:**
  - App loads without crash
  - Error logged in console
  - Other pages still accessible

### 8.3 Rapid Operations
- [ ] **Rapidly switch templates 20 times**
- [ ] **Verify no crashes or freezes**
- [ ] **Rapidly create/delete sections**
- [ ] **Verify no data loss**

---

## Test Suite 9: Mobile Responsiveness

### 9.1 Mobile View (if applicable)
- [ ] **Resize browser to mobile width (< 768px)**
- [ ] **Verify:**
  - Template picker adapts to small screen
  - Section manager dialog fits screen
  - Grid view shows 2 columns
  - Navigation buttons accessible

### 9.2 Touch Events (if touch screen available)
- [ ] **Use touch to:**
  - Draw strokes
  - Select templates
  - Navigate pages
  - Open grid view
- [ ] **Verify all interactions work**

---

## Test Suite 10: Backward Compatibility

### 10.1 Legacy Template System
- [ ] **If old paper-templates.ts consumers exist, verify:**
  - Old imports still work
  - `getPaperTemplate()` still works
  - No breaking changes

### 10.2 Existing Features
- [ ] **Verify Phase 1 features still work:**
  - Pen tool (pen, highlighter, eraser)
  - Shape detection
  - Lasso selection
  - Undo/Redo
  - Export/Import

---

## Critical Security Checks

### 11.1 Encryption Verification
- [ ] **Open IndexedDB → notebookPages**
- [ ] **Verify payload is NOT plain text (should be encrypted)**
- [ ] **Open notebookSections**
- [ ] **Verify payload is NOT plain text**
- [ ] **Check browser console:**
  - No unencrypted data logged
  - No encryption errors

### 11.2 Backend Isolation
- [ ] **Verify backend server NOT required for:**
  - Template rendering
  - Section management
  - Page navigation
  - Grid view
- [ ] **Disconnect network, verify app still works**

---

## Acceptance Criteria Final Check

After completing all tests above:

- [ ] ✅ All template types render correctly
- [ ] ✅ Template switching preserves strokes
- [ ] ✅ Sections create/edit/delete successfully
- [ ] ✅ Grid view shows all pages correctly
- [ ] ✅ Migration runs without errors
- [ ] ✅ Data persists after refresh
- [ ] ✅ OCR integration works with templates
- [ ] ✅ No console errors (except expected warnings)
- [ ] ✅ Performance is acceptable (< 50ms template changes)
- [ ] ✅ Mobile view is usable
- [ ] ✅ Encryption verified
- [ ] ✅ Backend not touched (secure_sync.py)

---

## Bug Report Template

If any issues found:

```
**Bug #:** [number]
**Test:** [Test Suite X.Y name]
**Expected:** [what should happen]
**Actual:** [what actually happened]
**Steps to Reproduce:**
1. 
2. 
3. 
**Console Errors:** [paste errors]
**Browser:** [Chrome/Firefox/Safari version]
**Screenshot:** [if applicable]
```

---

## Next Steps After Testing

Once all tests pass:

1. ✅ Mark validation complete in PHASE2_NOTEBOOK_VALIDATION.md
2. 📝 Update README with new features
3. 🚀 Create PR: `notebook-phase2-finalize` → `main`
4. 🎯 Begin Phase 3 planning

---

**Test Completion Date:** ___________  
**Tester Signature:** ___________  
**Overall Status:** PASS / FAIL / PARTIAL

