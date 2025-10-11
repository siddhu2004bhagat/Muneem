/**
 * Paper Templates V2 - New Template API
 * 
 * Implements blank, lined, and columnar templates with configurable options.
 * Uses devicePixelRatio for crisp rendering.
 */

import type { TemplateId, TemplateOptions } from '../types/template.types';
import { defaultTemplateId } from '../types/template.types';

// Re-export types for consumers
export type { TemplateId, TemplateOptions };
export { defaultTemplateId };

/**
 * Draw template background on canvas context
 * Fast, idempotent rendering optimized for devicePixelRatio
 */
export function drawTemplate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  templateId: TemplateId,
  opts?: TemplateOptions
): void {
  const options = {
    lineSpacing: opts?.lineSpacing || 40,
    margin: opts?.margin || 20,
    columnCount: opts?.columnCount || 4,
    color: opts?.color || '#d4d4d4',
  };
  
  // Get device pixel ratio for crisp lines
  const dpr = window.devicePixelRatio || 1;
  
  // Clear and prepare context
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  
  switch (templateId) {
    case 'blank':
      drawBlankTemplate(ctx, width, height, options, dpr);
      break;
    case 'lined':
      drawLinedTemplate(ctx, width, height, options, dpr);
      break;
    case 'columnar':
      drawColumnarTemplate(ctx, width, height, options, dpr);
      break;
    default:
      drawLinedTemplate(ctx, width, height, options, dpr);
  }
  
  ctx.restore();
}

/**
 * Blank template - subtle paper background only
 */
function drawBlankTemplate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: Required<TemplateOptions>,
  dpr: number
): void {
  // Subtle paper texture background
  ctx.fillStyle = '#fefefe';
  ctx.fillRect(0, 0, width, height);
  
  // Very subtle border
  ctx.strokeStyle = '#f0f0f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, width, height);
}

/**
 * Lined template - horizontal ruled lines
 */
function drawLinedTemplate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: Required<TemplateOptions>,
  dpr: number
): void {
  // Paper background (slight cream color for khata book feel)
  ctx.fillStyle = '#fefce8';
  ctx.fillRect(0, 0, width, height);
  
  // Draw horizontal ruled lines
  ctx.strokeStyle = opts.color;
  ctx.lineWidth = 1 / dpr; // Crisp 1px line at any DPI
  
  const { lineSpacing, margin } = opts;
  const startY = margin;
  const endY = height - margin;
  const startX = margin;
  const endX = width - margin;
  
  for (let y = startY + lineSpacing; y < endY; y += lineSpacing) {
    ctx.beginPath();
    ctx.moveTo(startX, Math.floor(y) + 0.5); // +0.5 for crisp lines
    ctx.lineTo(endX, Math.floor(y) + 0.5);
    ctx.stroke();
  }
  
  // Optional: Draw left margin line (like notebook paper)
  ctx.strokeStyle = '#fca5a5';
  ctx.lineWidth = 2 / dpr;
  const marginLineX = margin * 2;
  ctx.beginPath();
  ctx.moveTo(marginLineX, startY);
  ctx.lineTo(marginLineX, endY);
  ctx.stroke();
}

/**
 * Columnar template - columns for Date | Party | Amount | Notes
 */
function drawColumnarTemplate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: Required<TemplateOptions>,
  dpr: number
): void {
  // Paper background
  ctx.fillStyle = '#fefce8';
  ctx.fillRect(0, 0, width, height);
  
  const { lineSpacing, margin, columnCount } = opts;
  const startY = margin + 30; // Space for headers
  const endY = height - margin;
  const startX = margin;
  const endX = width - margin;
  
  // Define column widths (optimized for accounting)
  const columnWidths = columnCount === 4 
    ? [0.15, 0.35, 0.20, 0.30] // Date, Party, Amount, Notes
    : Array(columnCount).fill(1 / columnCount);
  
  // Draw vertical column lines
  ctx.strokeStyle = opts.color;
  ctx.lineWidth = 1 / dpr;
  
  let xPos = startX;
  const columnPositions: number[] = [xPos];
  
  for (let i = 0; i < columnWidths.length - 1; i++) {
    xPos += (endX - startX) * columnWidths[i];
    columnPositions.push(xPos);
    
    ctx.beginPath();
    ctx.moveTo(Math.floor(xPos) + 0.5, margin);
    ctx.lineTo(Math.floor(xPos) + 0.5, endY);
    ctx.stroke();
  }
  columnPositions.push(endX);
  
  // Draw horizontal lines
  for (let y = startY + lineSpacing; y < endY; y += lineSpacing) {
    ctx.beginPath();
    ctx.moveTo(startX, Math.floor(y) + 0.5);
    ctx.lineTo(endX, Math.floor(y) + 0.5);
    ctx.stroke();
  }
  
  // Draw header row separator (thicker)
  ctx.strokeStyle = opts.color;
  ctx.lineWidth = 2 / dpr;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, startY);
  ctx.stroke();
  
  // Draw column headers
  const headers = ['Date', 'Party Name', 'Amount', 'Notes'];
  ctx.fillStyle = '#78716c';
  ctx.font = `${12 * dpr}px sans-serif`;
  ctx.textBaseline = 'top';
  
  headers.forEach((header, i) => {
    if (i < columnPositions.length - 1) {
      const x = columnPositions[i] + 8;
      const y = margin + 8;
      ctx.fillText(header, x, y);
    }
  });
}

/**
 * Get template thumbnail for UI preview
 * Returns a canvas element with the rendered template
 */
export function getTemplateThumbnail(
  templateId: TemplateId,
  w: number = 120,
  h: number = 160
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context for thumbnail');
  }
  
  // Draw template at thumbnail size with scaled options
  const scaledOpts: TemplateOptions = {
    lineSpacing: 16, // Smaller spacing for thumbnail
    margin: 8,
    columnCount: 4,
    color: '#d4d4d4',
  };
  
  drawTemplate(ctx, w, h, templateId, scaledOpts);
  
  return canvas;
}

/**
 * Get template display name
 */
export function getTemplateName(templateId: TemplateId): string {
  const names: Record<TemplateId, string> = {
    blank: 'Blank Page',
    lined: 'Lined Paper',
    columnar: 'Columnar Ledger',
  };
  return names[templateId] || 'Unknown';
}

/**
 * Get template description
 */
export function getTemplateDescription(templateId: TemplateId): string {
  const descriptions: Record<TemplateId, string> = {
    blank: 'Clean page with no lines - perfect for free-form drawing',
    lined: 'Horizontal ruled lines - like traditional notebook paper',
    columnar: 'Columns for Date, Party, Amount, Notes - structured ledger format',
  };
  return descriptions[templateId] || '';
}

