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

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function Charts({ monthlyData, loading, currentYear }: ChartsProps) {
  // Format monthly data for chart
  const chartData = monthlyData.map(item => ({
    ...item,
    monthName: MONTH_NAMES[item.month - 1],
  }));

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

