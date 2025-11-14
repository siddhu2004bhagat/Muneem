/**
 * Shared ledger metric calculation helpers
 * Ensures consistency between API and Dexie calculations
 * 
 * IMPORTANT: This logic must match backend/app/api/v1/ledger.py exactly
 */

export const CREDIT_TYPES = ['sale', 'receipt'] as const;
export const DEBIT_TYPES = ['purchase', 'expense'] as const;

export type LedgerType = 'sale' | 'purchase' | 'expense' | 'receipt';

export interface LedgerEntryForMetrics {
  type: LedgerType;
  amount: number;
  gstAmount?: number;
}

/**
 * Check if entry type is credit (money coming in)
 */
export const isCredit = (type?: string): boolean => {
  return CREDIT_TYPES.includes(type as typeof CREDIT_TYPES[number]);
};

/**
 * Check if entry type is debit (money going out)
 */
export const isDebit = (type?: string): boolean => {
  return DEBIT_TYPES.includes(type as typeof DEBIT_TYPES[number]);
};

/**
 * Compute totals from entries (matches backend logic exactly)
 * Includes GST in amount calculations
 * 
 * Backend equivalent (Python):
 *   total_sales = sum(e.amount + e.gstAmount for e in entries if e.type == 'sale')
 *   total_purchases = sum(e.amount + e.gstAmount for e in entries if e.type == 'purchase')
 *   total_expenses = sum(e.amount + e.gstAmount for e in entries if e.type == 'expense')
 *   total_receipts = sum(e.amount + e.gstAmount for e in entries if e.type == 'receipt')
 */
export const computeTotals = (entries: LedgerEntryForMetrics[]) => {
  let totalSales = 0;
  let totalPurchases = 0;
  let totalExpenses = 0;
  let totalReceipts = 0;
  let totalCredit = 0;
  let totalDebit = 0;

  for (const e of entries) {
    const totalAmount = e.amount + (e.gstAmount || 0);
    
    if (e.type === 'sale') {
      totalSales += totalAmount;
      totalCredit += totalAmount;
    } else if (e.type === 'purchase') {
      totalPurchases += totalAmount;
      totalDebit += totalAmount;
    } else if (e.type === 'expense') {
      totalExpenses += totalAmount;
      totalDebit += totalAmount;
    } else if (e.type === 'receipt') {
      totalReceipts += totalAmount;
      totalCredit += totalAmount;
    }
  }

  return {
    totalSales: Math.round(totalSales * 100) / 100,
    totalPurchases: Math.round(totalPurchases * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    totalReceipts: Math.round(totalReceipts * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    totalDebit: Math.round(totalDebit * 100) / 100,
    netProfit: Math.round((totalSales - totalPurchases - totalExpenses) * 100) / 100,
    cashFlow: Math.round((totalReceipts - totalPurchases - totalExpenses) * 100) / 100,
  };
};

/**
 * Calculate GST totals
 * 
 * Backend equivalent (Python):
 *   gst_collected = sum(e.gstAmount for e in entries if e.type == 'sale')
 *   gst_paid = sum(e.gstAmount for e in entries if e.type == 'purchase')
 */
export const computeGSTTotals = (entries: LedgerEntryForMetrics[]) => {
  let gstCollected = 0;
  let gstPaid = 0;

  for (const e of entries) {
    const gst = e.gstAmount || 0;
    if (e.type === 'sale') {
      gstCollected += gst;
    } else if (e.type === 'purchase') {
      gstPaid += gst;
    }
  }

  return {
    gstCollected: Math.round(gstCollected * 100) / 100,
    gstPaid: Math.round(gstPaid * 100) / 100,
    netGST: Math.round((gstCollected - gstPaid) * 100) / 100,
  };
};

