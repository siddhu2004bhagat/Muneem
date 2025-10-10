/**
 * Template Types for Notebook Pages
 * 
 * Defines template IDs and configuration options for page backgrounds.
 */

export type TemplateId = 'blank' | 'lined' | 'columnar';

export interface TemplateOptions {
  lineSpacing?: number;     // Spacing between horizontal lines (default: 40px)
  margin?: number;          // Page margin (default: 20px)
  columnCount?: number;     // Number of columns for columnar template (default: 4)
  color?: string;           // Line/grid color (default: theme-based)
}

export const defaultTemplateId: TemplateId = 'lined';

