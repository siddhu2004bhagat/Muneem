/**
 * Charts Component (Phase D)
 * Monthly Sales vs Expenses, Cash Flow, and Top Parties charts
 */

import { Card } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/gst';
import * as ledgerApi from '@/services/ledger.api';

interface ChartsProps {
  monthlyData: ledgerApi.MonthlySummary[];
  partyData: ledgerApi.PartySummary[];
  loading: boolean;
  currentYear: number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function Charts({ monthlyData, partyData, loading, currentYear }: ChartsProps) {
  // Format monthly data for chart
  const chartData = monthlyData.map(item => ({
    ...item,
    monthName: MONTH_NAMES[item.month - 1],
  }));

  // Calculate daily cash flow (simplified - using monthly data)
  const cashFlowData = monthlyData.map(item => ({
    month: MONTH_NAMES[item.month - 1],
    cashFlow: item.receipts - (item.purchases + item.expenses),
  }));

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-64 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monthly Sales vs Expenses Bar Chart */}
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

      {/* Cash Flow Line Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Cash Flow ({currentYear})</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cashFlowData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Cash Flow']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="cashFlow" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top 5 Parties Bar Chart */}
      {partyData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top 5 Parties by Transaction Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={partyData} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} />
                <YAxis 
                  dataKey="party_name" 
                  type="category" 
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'transaction_count') {
                      return [value, 'Transactions'];
                    }
                    return [formatCurrency(value), name];
                  }}
                  labelFormatter={(label) => `Party: ${label}`}
                />
                <Bar dataKey="net_balance" fill="#3b82f6" name="Net Balance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}

