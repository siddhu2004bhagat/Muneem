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
