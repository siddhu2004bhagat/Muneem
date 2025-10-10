# Page Templates Module

This module provides the page template system for the notebook feature, allowing users to select different paper layouts for their digital ledger pages.

## Overview

The template system supports three built-in templates:
- **Blank**: Clean canvas with subtle paper texture
- **Lined**: Horizontal ruled lines for writing
- **Columnar**: Vertical columns for structured ledger entries (Date | Party | Amount | Notes)

## Architecture

```
src/features/pen-input/templates/
├── index.ts                        # Main exports
├── paper-templates-v2.ts           # Core template drawing functions
├── paper-templates-legacy-adapter.ts  # Backward compatibility adapter
├── types/
│   └── template.types.ts           # TypeScript types
└── __tests__/
    ├── templates.spec.ts           # Template rendering tests
    └── migration.spec.ts           # Migration tests
```

## Usage

### Basic Template Drawing

```typescript
import { drawTemplate, TemplateId } from '@/features/pen-input/templates';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d')!;

// Draw a lined template
drawTemplate(ctx, 800, 600, 'lined');

// Draw with custom options
drawTemplate(ctx, 800, 600, 'lined', {
  lineSpacing: 40,
  margin: 50,
  color: '#cccccc',
});
```

### Generating Thumbnails

```typescript
import { getTemplateThumbnail } from '@/features/pen-input/templates';

// Generate a 120x160 thumbnail
const thumbnail = getTemplateThumbnail('lined', 120, 160);

// Use in React
<canvas
  ref={node => {
    if (node && thumbnail) {
      const ctx = node.getContext('2d');
      if (ctx) {
        node.width = thumbnail.width;
        node.height = thumbnail.height;
        ctx.drawImage(thumbnail, 0, 0);
      }
    }
  }}
/>
```

### Template Options

```typescript
interface TemplateOptions {
  lineSpacing?: number;  // Spacing between lines (default: 30)
  margin?: number;       // Page margin (default: 40)
  columnCount?: number;  // Number of columns for columnar template (default: 4)
  color?: string;        // Line/grid color (default: '#e0e0e0')
}
```

## Adding a New Template

To add a new template:

1. **Add the template ID to types:**

```typescript
// src/features/pen-input/types/template.types.ts
export type TemplateId = 'blank' | 'lined' | 'columnar' | 'your-new-template';
```

2. **Implement the drawing function:**

```typescript
// src/features/pen-input/templates/paper-templates-v2.ts
function drawYourNewTemplate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: TemplateOptions
): void {
  const dpr = window.devicePixelRatio || 1;
  const { margin = 40, color = '#e0e0e0' } = opts;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1 / dpr;
  
  // Your drawing logic here
  
  ctx.restore();
}
```

3. **Update the switch statement in drawTemplate:**

```typescript
export function drawTemplate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  templateId: TemplateId,
  opts?: TemplateOptions
): void {
  const options = { ...opts };
  
  switch (templateId) {
    case 'blank':
      drawBlank(ctx, width, height, options);
      break;
    case 'lined':
      drawLined(ctx, width, height, options);
      break;
    case 'columnar':
      drawColumnar(ctx, width, height, options);
      break;
    case 'your-new-template':
      drawYourNewTemplate(ctx, width, height, options);
      break;
    default:
      drawLined(ctx, width, height, options);
  }
}
```

4. **Add to TemplatePicker:**

```typescript
// src/features/pen-input/components/templates/TemplatePicker.tsx
const TEMPLATES: Array<{ id: TemplateId; name: string; description: string }> = [
  { id: 'blank', name: 'Blank', description: 'Clean canvas' },
  { id: 'lined', name: 'Lined', description: 'Horizontal ruled lines' },
  { id: 'columnar', name: 'Columnar', description: 'Ledger columns' },
  { id: 'your-new-template', name: 'Your Template', description: 'Description' },
];
```

5. **Add tests:**

```typescript
// src/features/pen-input/templates/__tests__/templates.spec.ts
it('should draw your-new-template without errors', () => {
  expect(() => {
    drawTemplate(ctx, canvas.width, canvas.height, 'your-new-template');
  }).not.toThrow();
});
```

## Performance Considerations

- Templates should render in **< 20ms** for smooth UX
- Use `devicePixelRatio` scaling for crisp lines on high-DPI screens
- Templates are drawn on a separate background canvas layer
- Thumbnails are generated once and cached

## Testing

Run tests:
```bash
npm test -- templates.spec.ts
npm test -- migration.spec.ts
```

Performance benchmarks are included in the test suite and will log rendering times.

## Migration

The system includes migration helpers for upgrading existing pages:

```typescript
import { migratePagesToV2, backupPagesBeforeMigration } from '@/lib/localStore';

// Create backup before migration
const backupJSON = await backupPagesBeforeMigration();
console.log('Backup created:', backupJSON);

// Run migration
const result = await migratePagesToV2();
console.log(`Migrated: ${result.migrated}, Skipped: ${result.skipped}, Errors: ${result.errors}`);
```

## Backward Compatibility

The system maintains backward compatibility with the legacy `paper-templates.ts` system through the `paper-templates-legacy-adapter.ts` adapter. Existing code using the old system will continue to work.

## Related Components

- **TemplatePicker** (`components/templates/TemplatePicker.tsx`): UI for selecting templates
- **SectionManager** (`components/sections/SectionManager.tsx`): UI for managing sections
- **NotebookGrid** (`components/NotebookGrid.tsx`): Thumbnail grid view
- **NotebookNav** (`components/NotebookNav.tsx`): Navigation with template controls
- **PenCanvas** (`PenCanvas.tsx`): Main canvas with template background

## Tessdata Note

For OCR functionality, ensure Tesseract.js traineddata files are present:

```bash
# Download required traineddata files
curl -L https://github.com/naptha/tessdata/raw/gh-pages/4.0.0/eng.traineddata \
  -o public/models/tessdata/eng.traineddata

curl -L https://github.com/naptha/tessdata/raw/gh-pages/4.0.0/hin.traineddata \
  -o public/models/tessdata/hin.traineddata
```

## Security

- All page data (including `templateId` and `sectionId`) is encrypted using AES-GCM before storage in IndexedDB
- Template rendering happens client-side only
- No backend involvement for template system

## Future Enhancements

- Custom user-defined templates
- Template import/export
- Template marketplace
- Advanced columnar layouts (income/expense, multi-currency)
- Dynamic template generation based on ledger format

## License

Part of the DigBahi Accounting Software project.

