export interface AnomalySummary {
  type: string;
  severity: string;
  date: string;
  amount: number;
  description: string;
}

export interface AnalyticsSummary {
  anomalies: AnomalySummary[];
  totals: {
    sales: number;
    purchases: number;
    expenses: number;
    receipts: number;
    profit: number;
  };
  severity: {
    low: number;
    medium: number;
    high: number;
  };
  trends: Array<{
    month: string;
    sales: number;
    purchases: number;
    expenses: number;
    receipts: number;
    profit: number;
  }>;
}

export interface TrendsResponse {
  chartData: Array<{
    month: string;
    sales: number;
    purchases: number;
    expenses: number;
    receipts: number;
    profit: number;
  }>;
}
