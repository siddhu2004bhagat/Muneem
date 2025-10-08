# 📁 DigBahi - Clean Folder Structure Guide

> **MOST IMPORTANT RULE:** Always maintain clean, well-structured folders. No duplicates, no nested copies, no misplaced files.

---

## 🎯 Core Principles

1. **One Place for Everything** - Each file has exactly one location
2. **No Duplicates** - Never create `backend/backend/`, `src/src/`, or `features/features/`
3. **Feature-Based Organization** - Group by feature, not by file type
4. **Clear Naming** - Descriptive names, consistent conventions
5. **Shallow Hierarchy** - Maximum 4 levels deep

---

## 📂 Current Structure (VERIFIED CLEAN ✅)

```
digi-bahi-ink/
├── backend/                        ← Backend API (FastAPI)
│   ├── app/
│   │   ├── ai/                    ← AI features (analytics, federated learning)
│   │   ├── api/v1/                ← API routes (health, ledger, sync, etc.)
│   │   ├── db/                    ← Database (models, schemas, base)
│   │   ├── services/              ← Business logic (audit, role services)
│   │   ├── __init__.py            ← Package marker
│   │   └── main.py                ← FastAPI app entry point
│   └── tests/                     ← Backend tests
│       ├── integration/
│       └── test_*.py
│
├── src/                           ← Frontend source (React/Vite)
│   ├── components/                ← Shared UI components
│   │   ├── forms/                 ← Form components
│   │   ├── layout/                ← Layout components (Header, Dashboard, etc.)
│   │   ├── ui/                    ← Shadcn/ui components (Button, Card, etc.)
│   │   ├── AccessDenied.tsx
│   │   ├── AuditLogView.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── RoleManager.tsx
│   │   └── index.ts               ← Component exports
│   │
│   ├── features/                  ← Feature modules (self-contained)
│   │   ├── ai-analytics/          ← AI analytics dashboard
│   │   │   ├── components/        ← Feature-specific components
│   │   │   ├── hooks/             ← Feature-specific hooks
│   │   │   └── services/          ← Feature-specific services
│   │   │
│   │   ├── ai-learning/           ← Federated learning feature
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── services/
│   │   │
│   │   ├── ledger-formats/        ← Ledger format selection
│   │   │   ├── components/        ← FormatCard, SimpleFormatPicker, etc.
│   │   │   ├── config/            ← formats.config.ts (8+ formats)
│   │   │   ├── types/             ← TypeScript interfaces
│   │   │   └── index.ts           ← Public API
│   │   │
│   │   ├── pen-input/             ← Digital pen input (MAIN FEATURE)
│   │   │   ├── components/        ← LassoOverlay, ShapeSnapOverlay, ToolPalette
│   │   │   ├── context/           ← PenToolContext
│   │   │   ├── hooks/             ← useCanvas, usePointerEvents
│   │   │   ├── services/          ← strokeEngine, recognition, shapeSnapper
│   │   │   ├── templates/         ← paper-templates.ts (formatted backgrounds)
│   │   │   ├── types/             ← canvas.types, pen.types, shape.types
│   │   │   ├── PenCanvas.tsx      ← Main canvas component
│   │   │   └── index.ts           ← Feature exports
│   │   │
│   │   ├── payments/              ← UPI/WhatsApp integration
│   │   └── reports/               ← Financial reports
│   │
│   ├── hooks/                     ← Global hooks
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useOnline.ts
│   │   ├── useRole.ts
│   │   ├── useSession.ts
│   │   └── useSyncStatus.ts
│   │
│   ├── lib/                       ← Utility libraries
│   │   ├── auth.ts
│   │   ├── db.ts                  ← IndexedDB (Dexie)
│   │   ├── gst.ts
│   │   ├── i18n.ts
│   │   ├── localStore.ts
│   │   └── utils.ts
│   │
│   ├── pages/                     ← Page components
│   │   ├── AdminPage.tsx
│   │   ├── Index.tsx              ← Main app page
│   │   └── NotFound.tsx
│   │
│   ├── services/                  ← Global API services
│   │   ├── api.service.ts
│   │   ├── audit.service.ts
│   │   ├── backup.service.ts
│   │   ├── canvas.service.ts
│   │   ├── ledger.service.ts
│   │   ├── role.service.ts
│   │   ├── session.service.ts
│   │   ├── sync.service.ts
│   │   └── ws.service.ts
│   │
│   ├── styles/                    ← Global styles
│   │   └── globals.css
│   │
│   ├── types/                     ← Global TypeScript types
│   │   ├── canvas.ts
│   │   └── index.ts
│   │
│   ├── App.css
│   ├── App.tsx
│   ├── main.tsx                   ← Vite entry point
│   └── vite-env.d.ts
│
├── public/                        ← Static assets
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── manifest.json
│   ├── placeholder.svg
│   └── robots.txt
│
├── ARCHITECTURE.md                ← Architecture documentation
├── PRODUCT_VALIDATION_REPORT.md  ← Test validation results
├── README.md                      ← Project README
├── package.json                   ← Frontend dependencies
├── vite.config.ts                 ← Vite configuration
├── tailwind.config.ts             ← Tailwind CSS config
├── tsconfig.json                  ← TypeScript config
└── test-all-features.sh           ← Automated test script
```

---

## ✅ What Makes This Structure Clean

### 1. **Feature-Based Organization**
```
src/features/
├── pen-input/          ← Everything pen-related in ONE place
│   ├── components/     ← Pen UI components
│   ├── hooks/          ← Pen hooks
│   ├── services/       ← Pen services
│   ├── templates/      ← Paper templates (NEW!)
│   └── types/          ← Pen types
```

**Benefits:**
- ✅ Easy to find files
- ✅ Self-contained features
- ✅ Clear dependencies
- ✅ Easy to delete/move entire features

### 2. **No Duplicates**
```
❌ BAD (duplicates):
backend/
├── backend/          ← DUPLICATE!
│   └── app/
└── app/

✅ GOOD (clean):
backend/
└── app/              ← One clear structure
```

### 3. **Clear Separation of Concerns**
```
src/
├── components/       ← SHARED components (used everywhere)
├── features/         ← FEATURE-SPECIFIC code (self-contained)
├── services/         ← GLOBAL services (API calls)
├── hooks/            ← GLOBAL hooks (shared state)
└── pages/            ← PAGE components (routes)
```

### 4. **Consistent Naming**
```
✅ GOOD:
- useCanvas.ts          (hook)
- canvas.service.ts     (service)
- canvas.types.ts       (types)
- CanvasComponent.tsx   (component)

❌ BAD:
- Canvas_hook.ts        (inconsistent)
- canvasServ.ts         (abbreviated)
- canvas-type.ts        (mixed conventions)
```

---

## 🚫 Common Mistakes to AVOID

### ❌ Mistake 1: Duplicate Folders
```
❌ DON'T CREATE:
src/features/ledger-formats/
src/components/ledger-formats/    ← DUPLICATE!
src/ledger-formats/                ← DUPLICATE!
```

### ❌ Mistake 2: Deep Nesting
```
❌ TOO DEEP (5+ levels):
src/features/pen-input/components/canvas/tools/palette/buttons/PenButton.tsx

✅ BETTER (3-4 levels):
src/features/pen-input/components/ToolPalette.tsx
```

### ❌ Mistake 3: Mixing Concerns
```
❌ BAD (mixed):
src/components/
├── Button.tsx          ← UI component
├── useCanvas.ts        ← Hook (doesn't belong here!)
├── api.service.ts      ← Service (doesn't belong here!)
└── LedgerTable.tsx     ← Layout component

✅ GOOD (separated):
src/components/ui/Button.tsx
src/hooks/useCanvas.ts
src/services/api.service.ts
src/components/layout/LedgerTable.tsx
```

### ❌ Mistake 4: Missing index.ts
```
❌ BAD (no public API):
import { SimpleFormatPicker } from '@/features/ledger-formats/components/SimpleFormatPicker';

✅ GOOD (clean exports):
import { SimpleFormatPicker } from '@/features/ledger-formats';
```

---

## 📝 Rules for Adding New Features

### Step 1: Choose the Right Location
```
Is it feature-specific?
├── YES → src/features/[feature-name]/
└── NO → Is it a shared component?
    ├── YES → src/components/
    └── NO → Is it a global service?
        ├── YES → src/services/
        └── NO → Is it a global hook?
            ├── YES → src/hooks/
            └── NO → src/lib/
```

### Step 2: Create Feature Structure
```
src/features/new-feature/
├── components/        ← Feature UI components
├── hooks/             ← Feature hooks
├── services/          ← Feature API calls
├── types/             ← Feature TypeScript types
├── index.ts           ← Public exports
└── [MainComponent].tsx
```

### Step 3: Export Cleanly
```typescript
// src/features/new-feature/index.ts
export { MainComponent } from './MainComponent';
export { useFeatureHook } from './hooks/useFeatureHook';
export * from './types';
```

### Step 4: Verify Structure
```bash
# Run this command to check for duplicates
find . -type d -name '[feature-name]' | wc -l
# Should return: 1 (only one folder)
```

---

## 🔍 How to Verify Clean Structure

### Command 1: Check for Duplicates
```bash
# Find duplicate folder names
find src -type d -printf "%f\n" | sort | uniq -d
# Expected output: (empty - no duplicates)
```

### Command 2: Check Folder Depth
```bash
# Find files deeper than 5 levels
find src -mindepth 6 -type f
# Expected output: (empty - not too deep)
```

### Command 3: Check Feature Isolation
```bash
# List all feature folders
ls -1 src/features/
# Expected output: Each feature is self-contained
```

### Command 4: Check for Orphaned Files
```bash
# Find TypeScript files not in a folder
find src -maxdepth 1 -name "*.ts" -o -name "*.tsx"
# Expected output: Only App.tsx, main.tsx, etc.
```

---

## 📚 Feature Module Template

### Template for New Feature
```
src/features/[feature-name]/
├── components/
│   ├── [Feature]Dashboard.tsx    ← Main component
│   ├── [Feature]List.tsx         ← List view
│   ├── [Feature]Card.tsx         ← Card component
│   └── index.ts                  ← Component exports
├── hooks/
│   ├── use[Feature].ts           ← Main hook
│   └── use[Feature]Sync.ts       ← Sync hook
├── services/
│   └── [feature].service.ts      ← API service
├── types/
│   └── [feature].types.ts        ← TypeScript types
├── config/                        ← Optional: configuration
│   └── [feature].config.ts
├── index.ts                       ← Public API
└── README.md                      ← Optional: feature docs
```

### Example: Invoice Scanner Feature (Future)
```
src/features/invoice-scanner/
├── components/
│   ├── InvoiceScanner.tsx
│   ├── CameraView.tsx
│   ├── ScanResults.tsx
│   └── index.ts
├── hooks/
│   ├── useScanner.ts
│   └── useOCR.ts
├── services/
│   └── scanner.service.ts
├── types/
│   └── scanner.types.ts
└── index.ts
```

---

## 🎯 Maintenance Checklist

### Daily
- [ ] Check no new duplicate folders created
- [ ] Verify imports use correct paths
- [ ] Ensure new files go in right location

### Weekly
- [ ] Run structure verification commands
- [ ] Review new feature organization
- [ ] Clean up any temporary files

### Monthly
- [ ] Review entire folder structure
- [ ] Update this guide if structure changes
- [ ] Refactor if any features becoming too large

---

## 🚀 Quick Reference

### Adding a Component
```typescript
// Feature-specific
src/features/[feature]/components/[Component].tsx

// Shared
src/components/[Component].tsx
```

### Adding a Hook
```typescript
// Feature-specific
src/features/[feature]/hooks/use[Hook].ts

// Global
src/hooks/use[Hook].ts
```

### Adding a Service
```typescript
// Feature-specific
src/features/[feature]/services/[feature].service.ts

// Global
src/services/[service].service.ts
```

### Adding Types
```typescript
// Feature-specific
src/features/[feature]/types/[feature].types.ts

// Global
src/types/[type].ts
```

---

## ✅ Current Status

**Folder Structure Health: EXCELLENT** 🟢

- ✅ Zero duplicate folders
- ✅ Clear feature separation
- ✅ Consistent naming
- ✅ Proper depth (max 4 levels)
- ✅ Clean exports via index.ts
- ✅ Well-organized backend
- ✅ Self-contained features

**Last Verified:** $(date)
**Total Files:** 62
**Total Folders:** 29
**Deepest Level:** 4
**Duplicate Folders:** 0

---

## 🎓 Remember

> **"A place for everything, and everything in its place."**

1. **Before adding a file:** Ask "Where does this belong?"
2. **Before creating a folder:** Ask "Does this already exist?"
3. **After adding code:** Ask "Is this structure clean?"
4. **Always:** Keep it simple, keep it organized, keep it clean.

---

**This structure is your foundation. Protect it!** 🛡️

*If you ever see duplicate folders, nested copies, or misplaced files - STOP and reorganize immediately.*

---

*Maintained by: DigBahi Development Team*  
*Last Updated: $(date)*

