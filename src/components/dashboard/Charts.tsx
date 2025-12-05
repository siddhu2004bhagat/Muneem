/**
 * Charts Component - Simplified
 * Shows monthly Sales vs Expenses chart
 */

import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/gst';
import * as ledgerApi from '@/services/ledger.api';

interface ChartsProps {
  monthlyData: ledgerApi.MonthlySummary[];
  partyData: ledgerApi.PartySummary[];
  loading: boolean;
  currentYear: number;
}

// Financial Year order: Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec, Jan, Feb, Mar
const FY_MONTH_ORDER = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
const FY_MONTH_NAMES = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

export function Charts({ monthlyData, loading, currentYear }: ChartsProps) {
  // Create map for quick lookup by month number
  const dataMap = new Map(monthlyData.map(item => [item.month, item]));
  
  // Reorder data to Financial Year order (Apr-Mar)
  const chartData = FY_MONTH_ORDER.map((monthNum, index) => {
    const data = dataMap.get(monthNum);
    if (data) {
      return {
        ...data,
        monthName: FY_MONTH_NAMES[index],
      };
    }
    // Fallback for missing months (shouldn't happen, but defensive)
    return {
      month: monthNum,
      sales: 0,
      expenses: 0,
      receipts: 0,
      purchases: 0,
      monthName: FY_MONTH_NAMES[index],
    };
  });

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-64 bg-muted rounded" />
      </Card>
    );
  }

  // Show empty state if no data
  if (chartData.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-muted-foreground">No monthly data available for {currentYear}</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Monthly Sales vs Expenses ({currentYear})</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="monthName" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), '']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Bar dataKey="sales" fill="#10b981" name="Sales" />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

