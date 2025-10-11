/**
 * Paper Templates - Unified Export
 * 
 * Exports both V2 (new TemplateId system) and legacy adapter.
 * Preserves backward compatibility with existing imports.
 */

// V2 API (primary)
export {
  drawTemplate,
  getTemplateThumbnail,
  getTemplateName,
  getTemplateDescription,
  defaultTemplateId,
} from './paper-templates-v2';

export type { TemplateId, TemplateOptions } from './paper-templates-v2';

// Legacy adapter (for backward compatibility)
export {
  drawLegacyTemplate,
  getLegacyTemplateThumbnail,
  mapLegacyFormatToTemplate,
  mapLegacyFormatToOptions,
} from './paper-templates-legacy-adapter';

// Keep old exports from paper-templates.ts for existing code
export { PAPER_TEMPLATES, getPaperTemplate, type PaperTemplate } from './paper-templates';

