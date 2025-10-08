import React from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/gst';

interface TrendChartProps {
  data: Array<{
    month: string;
    sales: number;
    purchases: number;
    expenses: number;
    receipts: number;
    profit: number;
  }>;
}

export function TrendChart({ data }: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">No trend data available</p>
      </Card>
    );
  }

  const formatTooltipValue = (value: number) => formatCurrency(value);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.split('-')[1]} // Show only month number
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatTooltipValue}
            />
            <Tooltip 
              formatter={(value: number) => [formatTooltipValue(value), '']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Sales"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="purchases" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Purchases"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Expenses"
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              name="Profit"
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
