import { LedgerFormat, LedgerFormatId } from '../types/format.types';

// Traditional Khata Book Format
export const TRADITIONAL_KHATA: LedgerFormat = {
  id: 'traditional-khata',
  name: 'Traditional Khata Book',
  nameHindi: 'पारंपरिक खाता बुक',
  description: 'Simple single-line entries, just like your paper khata',
  descriptionHindi: 'सरल एक-पंक्ति प्रविष्टियाँ, बिल्कुल आपकी कागज़ी खाता की तरह',
  industries: ['retail', 'other'],
  preview: '/formats/traditional-khata.png',
  icon: '📓',
  template: {
    columns: [
      { id: 'date', label: 'Date', labelHindi: 'तारीख', width: 15, align: 'left', type: 'date' },
      { id: 'party', label: 'Party Name', labelHindi: 'पार्टी का नाम', width: 30, align: 'left', type: 'text' },
      { id: 'details', label: 'Details', labelHindi: 'विवरण', width: 35, align: 'left', type: 'text' },
      { id: 'amount', label: 'Amount', labelHindi: 'रकम', width: 20, align: 'right', type: 'currency' }
    ],
    layout: 'single',
    ruling: 'lined',
    colors: {
      income: '#10b981',
      expense: '#ef4444',
      text: '#1f2937',
      background: '#fefce8',
      lines: '#d1d5db',
      accent: '#3b82f6'
    },
    pageStyle: {
      marginTop: 40,
      marginBottom: 40,
      marginLeft: 20,
      marginRight: 20,
      lineHeight: 36
    }
  },
  features: [
    'Simple one-line entries',
    'Familiar format',
    'Easy to understand',
    'Quick data entry'
  ],
  sampleEntries: [
    { date: '1/1/25', party: 'Ram Kumar', details: 'Sale - Saree', amount: 2000, type: 'income' },
    { date: '1/1/25', party: 'Cash', details: 'Rent payment', amount: 5000, type: 'expense' },
    { date: '2/1/25', party: 'Shyam', details: 'Purchase - Shoes', amount: 1500, type: 'expense' }
  ],
  recommended: true,
  popularity: 95
};

// Double Entry (Jama-Kharcha) Format
export const DOUBLE_ENTRY: LedgerFormat = {
  id: 'double-entry',
  name: 'Double Entry (Jama-Kharcha)',
  nameHindi: 'दोहरी प्रविष्टि (जमा-खर्च)',
  description: 'Professional accounting with debit and credit columns',
  descriptionHindi: 'डेबिट और क्रेडिट कॉलम के साथ पेशेवर लेखांकन',
  industries: ['manufacturing', 'services', 'wholesale'],
  preview: '/formats/double-entry.png',
  icon: '📊',
  template: {
    columns: [
      { id: 'date', label: 'Date', labelHindi: 'तारीख', width: 15, align: 'left', type: 'date' },
      { id: 'jama', label: 'Jama (Credit)', labelHindi: 'जमा', width: 40, align: 'right', type: 'currency' },
      { id: 'kharcha', label: 'Kharcha (Debit)', labelHindi: 'खर्च', width: 40, align: 'right', type: 'currency' }
    ],
    layout: 'double',
    ruling: 'lined',
    colors: {
      income: '#059669',
      expense: '#dc2626',
      text: '#111827',
      background: '#f0fdf4',
      lines: '#d1d5db',
      accent: '#10b981'
    },
    pageStyle: {
      marginTop: 40,
      marginBottom: 40,
      marginLeft: 30,
      marginRight: 30,
      lineHeight: 40
    }
  },
  features: [
    'Professional accounting',
    'Debit/Credit columns',
    'Running totals',
    'Balance calculation'
  ],
  sampleEntries: [
    { date: '1/1/25', details: 'Sale', amount: 2000, type: 'income' },
    { date: '1/1/25', details: 'Purchase', amount: 5000, type: 'expense' },
    { date: '2/1/25', details: 'Receipt', amount: 1500, type: 'income' }
  ],
  recommended: false,
  popularity: 75
};

// Cash Book Format
export const CASH_BOOK: LedgerFormat = {
  id: 'cash-book',
  name: 'Cash Book',
  nameHindi: 'कैश बुक',
  description: 'Track daily cash with opening and closing balance',
  descriptionHindi: 'शुरुआती और अंतिम शेष के साथ दैनिक नकदी ट्रैक करें',
  industries: ['retail', 'restaurant', 'other'],
  preview: '/formats/cash-book.png',
  icon: '💵',
  template: {
    columns: [
      { id: 'cashIn', label: 'Cash In', labelHindi: 'नकद आना', width: 48, align: 'right', type: 'currency' },
      { id: 'cashOut', label: 'Cash Out', labelHindi: 'नकद जाना', width: 48, align: 'right', type: 'currency' }
    ],
    layout: 'double',
    ruling: 'lined',
    colors: {
      income: '#16a34a',
      expense: '#dc2626',
      text: '#0f172a',
      background: '#fffbeb',
      lines: '#d1d5db',
      accent: '#f59e0b'
    },
    pageStyle: {
      marginTop: 60,
      marginBottom: 60,
      marginLeft: 25,
      marginRight: 25,
      lineHeight: 38
    }
  },
  features: [
    'Opening/Closing balance',
    'Cash focus',
    'Daily reconciliation',
    'In/Out tracking'
  ],
  sampleEntries: [
    { date: '1/1/25', details: 'Sale', amount: 2000, type: 'income' },
    { date: '1/1/25', details: 'Electricity', amount: 500, type: 'expense' },
    { date: '1/1/25', details: 'Receipt', amount: 1000, type: 'income' }
  ],
  recommended: true,
  popularity: 85
};

// Party Ledger Format
export const PARTY_LEDGER: LedgerFormat = {
  id: 'party-ledger',
  name: 'Party Ledger (Udhaar Khata)',
  nameHindi: 'पार्टी लेजर (उधार खाता)',
  description: 'Track customer/supplier accounts with credit management',
  descriptionHindi: 'क्रेडिट प्रबंधन के साथ ग्राहक/आपूर्तिकर्ता खाते ट्रैक करें',
  industries: ['retail', 'wholesale', 'manufacturing'],
  preview: '/formats/party-ledger.png',
  icon: '📒',
  template: {
    columns: [
      { id: 'date', label: 'Date', labelHindi: 'तारीख', width: 15, align: 'left', type: 'date' },
      { id: 'given', label: 'Given (Sale)', labelHindi: 'दिया (बिक्री)', width: 40, align: 'right', type: 'currency' },
      { id: 'received', label: 'Received (Payment)', labelHindi: 'प्राप्त (भुगतान)', width: 40, align: 'right', type: 'currency' }
    ],
    layout: 'double',
    ruling: 'lined',
    colors: {
      income: '#10b981',
      expense: '#f59e0b',
      text: '#1f2937',
      background: '#f0f9ff',
      lines: '#cbd5e1',
      accent: '#3b82f6'
    },
    pageStyle: {
      marginTop: 50,
      marginBottom: 50,
      marginLeft: 25,
      marginRight: 25,
      lineHeight: 38
    }
  },
  features: [
    'Per-party tracking',
    'Credit management',
    'Outstanding calculation',
    'Payment history'
  ],
  sampleEntries: [
    { date: '1/1/25', party: 'Ram Kumar', details: 'Sale', amount: 2000, type: 'income' },
    { date: '2/1/25', party: 'Ram Kumar', details: 'Payment received', amount: 1000, type: 'income' },
    { date: '5/1/25', party: 'Ram Kumar', details: 'Sale', amount: 3000, type: 'income' }
  ],
  recommended: false,
  popularity: 70
};

// Day Book Format
export const DAY_BOOK: LedgerFormat = {
  id: 'day-book',
  name: 'Day Book (Roj Namcha)',
  nameHindi: 'दिन बुक (रोज़ नामचा)',
  description: 'Time-based chronological entries for busy businesses',
  descriptionHindi: 'व्यस्त व्यवसायों के लिए समय-आधारित कालानुक्रमिक प्रविष्टियाँ',
  industries: ['restaurant', 'services', 'retail'],
  preview: '/formats/day-book.png',
  icon: '📆',
  template: {
    columns: [
      { id: 'time', label: 'Time', labelHindi: 'समय', width: 12, align: 'left', type: 'text' },
      { id: 'type', label: 'Type', labelHindi: 'प्रकार', width: 18, align: 'left', type: 'text' },
      { id: 'details', label: 'Details', labelHindi: 'विवरण', width: 45, align: 'left', type: 'text' },
      { id: 'amount', label: 'Amount', labelHindi: 'रकम', width: 25, align: 'right', type: 'currency' }
    ],
    layout: 'single',
    ruling: 'lined',
    colors: {
      income: '#059669',
      expense: '#dc2626',
      text: '#0f172a',
      background: '#fdf4ff',
      lines: '#d1d5db',
      accent: '#a855f7'
    },
    pageStyle: {
      marginTop: 45,
      marginBottom: 45,
      marginLeft: 20,
      marginRight: 20,
      lineHeight: 34
    }
  },
  features: [
    'Time-based entries',
    'Chronological order',
    'Bill numbering',
    'End-of-day summary'
  ],
  sampleEntries: [
    { date: '1/1/25 9:00 AM', details: 'Bill #1', amount: 500, type: 'income' },
    { date: '1/1/25 11:00 AM', details: 'Bill #2', amount: 1200, type: 'income' },
    { date: '1/1/25 2:00 PM', details: 'Vegetables', amount: 300, type: 'expense' }
  ],
  recommended: false,
  popularity: 60
};

// Modern Minimal Format
export const MODERN_MINIMAL: LedgerFormat = {
  id: 'modern-minimal',
  name: 'Modern Minimal',
  nameHindi: 'आधुनिक न्यूनतम',
  description: 'Clean, modern design for tech-savvy users',
  descriptionHindi: 'तकनीक-प्रेमी उपयोगकर्ताओं के लिए स्वच्छ, आधुनिक डिज़ाइन',
  industries: ['services', 'other'],
  preview: '/formats/modern-minimal.png',
  icon: '📱',
  template: {
    columns: [
      { id: 'entry', label: 'Entry', labelHindi: 'प्रविष्टि', width: 75, align: 'left', type: 'text' },
      { id: 'amount', label: 'Amount', labelHindi: 'रकम', width: 25, align: 'right', type: 'currency' }
    ],
    layout: 'single',
    ruling: 'plain',
    colors: {
      income: '#10b981',
      expense: '#f43f5e',
      text: '#18181b',
      background: '#ffffff',
      lines: '#e5e7eb',
      accent: '#6366f1'
    },
    pageStyle: {
      marginTop: 30,
      marginBottom: 30,
      marginLeft: 15,
      marginRight: 15,
      lineHeight: 50
    }
  },
  features: [
    'Clean design',
    'Card-based layout',
    'Icons and emojis',
    'Swipe gestures'
  ],
  sampleEntries: [
    { date: '1/1/25', party: 'Ram Kumar', details: 'Sale', amount: 2000, type: 'income' },
    { date: '1/1/25', details: 'Electricity', amount: 500, type: 'expense' },
    { date: '1/1/25', party: 'Shyam', details: 'Receipt', amount: 1000, type: 'income' }
  ],
  recommended: false,
  popularity: 55
};

// Export all formats
export const ALL_FORMATS: LedgerFormat[] = [
  TRADITIONAL_KHATA,
  DOUBLE_ENTRY,
  CASH_BOOK,
  PARTY_LEDGER,
  DAY_BOOK,
  MODERN_MINIMAL
];

// Helper function to get format by ID
export const getFormatById = (id: LedgerFormatId): LedgerFormat | undefined => {
  return ALL_FORMATS.find(format => format.id === id);
};

// Helper function to get recommended formats for industry
export const getRecommendedFormats = (industry: string): LedgerFormat[] => {
  return ALL_FORMATS
    .filter(format => format.industries.includes(industry as any) || format.recommended)
    .sort((a, b) => b.popularity - a.popularity);
};
