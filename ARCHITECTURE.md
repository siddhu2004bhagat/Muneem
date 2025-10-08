# DigBahi Professional Architecture

## 📁 File Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (shadcn/ui)
│   ├── layout/          # Layout components
│   │   ├── Dashboard.tsx
│   │   ├── LedgerTable.tsx
│   │   └── Auth.tsx
│   ├── forms/           # Form components
│   │   └── EntryForm.tsx
│   ├── canvas/          # Canvas-specific components
│   └── index.ts         # Component exports
│
├── features/            # Feature-based modules
│   ├── pen-input/       # Pen input functionality
│   │   ├── PenCanvas.tsx
│   │   ├── PenCanvasNew.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   ├── reports/         # Reporting features
│   │   └── Reports.tsx
│   └── payments/        # Payment integrations
│       ├── CreditManager.tsx
│       ├── UPIIntegration.tsx
│       └── WhatsAppShare.tsx
│
├── hooks/               # Custom React hooks
│   ├── useCanvas.ts     # Canvas drawing logic
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── services/            # Business logic services
│   ├── canvas.service.ts
│   ├── recognition.service.ts
│   └── ...
│
├── types/               # TypeScript type definitions
│   ├── index.ts         # Main types
│   ├── canvas.ts        # Canvas-specific types
│   ├── api.ts           # API types
│   └── config.ts        # Configuration types
│
├── constants/           # Application constants
│   └── index.ts
│
├── lib/                 # Utility libraries
│   ├── auth.ts
│   ├── db.ts
│   ├── gst.ts
│   ├── i18n.ts
│   └── utils.ts
│
├── pages/               # Page components
│   ├── Index.tsx
│   └── NotFound.tsx
│
├── App.tsx              # Main app component
├── main.tsx             # App entry point
└── index.css            # Global styles
```

## 🏗️ Architecture Principles

### 1. **Feature-Based Organization**
- Features are self-contained modules
- Each feature has its own types, components, and logic
- Clear separation of concerns

### 2. **Service Layer Pattern**
- Business logic separated from UI components
- Reusable services for complex operations
- Easy to test and maintain

### 3. **Custom Hooks**
- Encapsulate complex state logic
- Reusable across components
- Clean separation of concerns

### 4. **Type Safety**
- Comprehensive TypeScript definitions
- Centralized type management
- Feature-specific type modules

### 5. **Constants Management**
- All magic numbers and strings in constants
- Easy to maintain and update
- Environment-specific configurations

## 🎯 Key Components

### Canvas System
- **useCanvas Hook**: Manages all canvas state and drawing logic
- **CanvasService**: Professional drawing algorithms and utilities
- **RecognitionService**: Handwriting and shape recognition
- **PenCanvas Component**: Clean, focused canvas interface

### Services Architecture
```typescript
// Canvas Service - Drawing utilities
CanvasService.smoothStroke()
CanvasService.getStrokeBounds()
CanvasService.optimizeStroke()

// Recognition Service - AI/ML functionality
RecognitionService.detectDataTypes()
RecognitionService.recognizeShape()
RecognitionService.convertStrokeToText()
```

### Type System
```typescript
// Core types
interface Transaction { ... }
interface Stroke { ... }
interface RecognizedData { ... }

// Feature types
interface PenCanvasProps { ... }
interface DashboardStats { ... }
```

## 🚀 Benefits

1. **Maintainability**: Clear structure makes code easy to find and modify
2. **Scalability**: Feature-based organization supports growth
3. **Reusability**: Services and hooks can be used across features
4. **Testability**: Separated concerns make testing straightforward
5. **Type Safety**: Comprehensive TypeScript coverage
6. **Performance**: Lazy loading and optimized rendering

## 📦 Import Strategy

```typescript
// Feature imports
import { PenCanvas } from '@/features/pen-input';

// Service imports
import { CanvasService } from '@/services/canvas.service';

// Type imports
import type { Transaction, Stroke } from '@/types';

// Constant imports
import { DRAWING_CONSTANTS } from '@/constants';
```

## 🔧 Development Guidelines

1. **New Features**: Create feature folders under `src/features/`
2. **Shared Logic**: Add to `src/services/`
3. **Reusable Components**: Add to `src/components/`
4. **Custom Hooks**: Add to `src/hooks/`
5. **Types**: Add to appropriate `src/types/` files
6. **Constants**: Add to `src/constants/index.ts`

This architecture follows industry best practices and provides a solid foundation for professional React development.
