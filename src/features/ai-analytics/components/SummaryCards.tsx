import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/gst';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, ShoppingCart, Wallet, Receipt } from 'lucide-react';

interface SummaryCardsProps {
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
}

export function SummaryCards({ totals, severity }: SummaryCardsProps) {
  const totalAnomalies = severity.low + severity.medium + severity.high;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 rounded-lg bg-green-500">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
        <p className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">Sales</p>
        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
          {formatCurrency(totals.sales)}
        </p>
      </Card>

      <Card className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 rounded-lg bg-blue-500">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <TrendingDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">Purchases</p>
        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
          {formatCurrency(totals.purchases)}
        </p>
      </Card>

      <Card className="p-5 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 rounded-lg bg-red-500">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wide mb-1">Expenses</p>
        <p className="text-2xl font-bold text-red-900 dark:text-red-100">
          {formatCurrency(totals.expenses)}
        </p>
      </Card>

      <Card className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 rounded-lg bg-purple-500">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <Badge variant={totalAnomalies > 0 ? "destructive" : "secondary"} className="text-xs">
            {totalAnomalies}
          </Badge>
        </div>
        <p className="text-xs font-medium text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-1">Anomalies</p>
        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
          {totalAnomalies > 0 ? `${totalAnomalies} Found` : 'All Clear'}
        </p>
      </Card>
    </div>
  );
}
