// Pen input feature exports
export { default as PenCanvas } from './PenCanvas';

// Context providers
export { NotebookProvider, useNotebook } from './context/NotebookContext';

// Components
export { default as NotebookNav } from './components/NotebookNav';

// Templates
export { getPaperTemplate, PAPER_TEMPLATES } from './templates/paper-templates';

// Types
export type { PenCanvasProps } from './types/pen.types';
export type { PaperTemplate } from './templates/paper-templates';
export type { NotebookPage } from '@/lib/localStore';

// Palm Rejection (for advanced configuration)
export { usePalmRejection } from './hooks/usePalmRejection';
export type { PalmRejectionConfig } from './hooks/usePalmRejection';
export type { PointerEventsConfig } from './hooks/usePointerEvents';

// Development utilities (calibration tool)
export { PalmRejectionCalibrator } from './utils/palmCalibrator';
