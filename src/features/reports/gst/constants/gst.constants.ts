export const GST_RATES = [0, 5, 12, 18, 28] as const;
export type GstRate = typeof GST_RATES[number];
export const DEFAULT_GST_RATE: GstRate = 18;

export const GST_CONFIG = {
  lowValueThreshold: 1000,
  highValueThreshold: 10000,
  defaultPurchaseRate: 18,
};

export const validatePeriod = (period: string): boolean =>
  /^\d{4}-\d{2}$/.test(period);

export const validateAmount = (amount: number): boolean =>
  !isNaN(amount) && amount >= 0;
