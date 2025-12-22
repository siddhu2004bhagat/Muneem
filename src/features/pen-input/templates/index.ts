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
  type TemplateId,
  type TemplateOptions,
  defaultTemplateId,
} from './paper-templates';



// Keep old exports from paper-templates.ts for existing code
export { PAPER_TEMPLATES, getPaperTemplate, type PaperTemplate } from './paper-templates';

