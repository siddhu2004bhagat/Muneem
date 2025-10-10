/**
 * Legacy Adapter for Paper Templates
 * 
 * Provides backward compatibility between old LedgerFormatId system
 * and new TemplateId system. Preserves existing imports.
 */

import type { LedgerFormatId } from '@/features/ledger-formats';
import { drawTemplate as drawTemplateV2, getTemplateThumbnail as getThumbnailV2, type TemplateId, type TemplateOptions } from './paper-templates-v2';

/**
 * Map old LedgerFormatId to new TemplateId
 */
export function mapLegacyFormatToTemplate(formatId: LedgerFormatId): TemplateId {
  const mapping: Record<LedgerFormatId, TemplateId> = {
    'traditional-khata': 'columnar',
    'cash-book': 'columnar',
    'double-entry': 'columnar',
    'party-ledger': 'columnar',
    'day-book': 'lined',
    'stock-register': 'lined',
    'modern-minimal': 'blank',
    'hybrid-mix': 'lined',
  };
  
  return mapping[formatId] || 'lined';
}

/**
 * Map old format to template options
 */
export function mapLegacyFormatToOptions(formatId: LedgerFormatId): TemplateOptions {
  const optionsMap: Record<LedgerFormatId, TemplateOptions> = {
    'traditional-khata': { lineSpacing: 40, margin: 20, columnCount: 4, color: '#d4d4a8' },
    'cash-book': { lineSpacing: 40, margin: 20, columnCount: 2, color: '#fed7aa' },
    'double-entry': { lineSpacing: 40, margin: 20, columnCount: 3, color: '#bbf7d0' },
    'party-ledger': { lineSpacing: 40, margin: 20, columnCount: 5, color: '#bae6fd' },
    'day-book': { lineSpacing: 40, margin: 20, color: '#d4d4a8' },
    'stock-register': { lineSpacing: 40, margin: 20, color: '#d4d4a8' },
    'modern-minimal': { margin: 20, color: '#e5e5e5' },
    'hybrid-mix': { lineSpacing: 40, margin: 20, color: '#d4d4a8' },
  };
  
  return optionsMap[formatId] || { lineSpacing: 40, margin: 20, color: '#d4d4d4' };
}

/**
 * Legacy adapter: drawTemplate using old format ID
 */
export function drawLegacyTemplate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  formatId: LedgerFormatId,
  opts?: TemplateOptions
): void {
  const templateId = mapLegacyFormatToTemplate(formatId);
  const defaultOpts = mapLegacyFormatToOptions(formatId);
  const mergedOpts = { ...defaultOpts, ...opts };
  
  drawTemplateV2(ctx, width, height, templateId, mergedOpts);
}

/**
 * Legacy adapter: get thumbnail using old format ID
 */
export function getLegacyTemplateThumbnail(
  formatId: LedgerFormatId,
  w: number = 120,
  h: number = 160
): HTMLCanvasElement {
  const templateId = mapLegacyFormatToTemplate(formatId);
  return getThumbnailV2(templateId, w, h);
}

