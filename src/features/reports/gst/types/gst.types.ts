export interface GSTR1Row {
  invoiceDate: string;
  description?: string;
  type?: 'sale' | 'purchase' | 'expense' | 'receipt';
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
}

export interface GSTR3BSummary {
  period: string;
  outwardTaxable: number;
  outwardGST: number;
  inwardTaxable: number;
  inwardGST: number;
  netGSTLiability: number;
}

export interface LedgerLocal {
  id?: number;
  date: string;
  description?: string;
  amount: number;
  type: 'sale' | 'purchase' | 'expense' | 'receipt';
  gstRate?: number;
  gstAmount?: number;
  createdAt?: number;
}
