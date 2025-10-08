// Ledger format types and interfaces
export type LedgerFormatId = 
  | 'traditional-khata'
  | 'double-entry'
  | 'cash-book'
  | 'party-ledger'
  | 'day-book'
  | 'stock-register'
  | 'modern-minimal'
  | 'hybrid-mix';

export type IndustryType = 
  | 'retail'
  | 'restaurant'
  | 'manufacturing'
  | 'services'
  | 'contractor'
  | 'wholesale'
  | 'agriculture'
  | 'other';

export type RulingType = 'lined' | 'plain' | 'grid';
export type LayoutType = 'single' | 'double' | 'triple';

export interface Column {
  id: string;
  label: string;
  labelHindi: string;
  width: number;
  align: 'left' | 'center' | 'right';
  type: 'text' | 'number' | 'date' | 'currency';
}

export interface FormatColors {
  income: string;
  expense: string;
  text: string;
  background: string;
  lines: string;
  accent: string;
}

export interface FormatTemplate {
  columns: Column[];
  layout: LayoutType;
  ruling: RulingType;
  colors: FormatColors;
  pageStyle: {
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
    lineHeight: number;
  };
}

export interface SampleEntry {
  date: string;
  party?: string;
  details: string;
  amount: number;
  type: 'income' | 'expense';
}

export interface LedgerFormat {
  id: LedgerFormatId;
  name: string;
  nameHindi: string;
  description: string;
  descriptionHindi: string;
  industries: IndustryType[];
  preview: string;
  icon: string;
  template: FormatTemplate;
  features: string[];
  sampleEntries: SampleEntry[];
  recommended: boolean;
  popularity: number;
}

export interface UserFormatPreference {
  userId: string;
  selectedFormat: LedgerFormatId;
  customizations?: {
    colors?: Partial<FormatColors>;
    ruling?: RulingType;
    language?: 'en' | 'hi' | 'both';
  };
  lastModified: string;
}
