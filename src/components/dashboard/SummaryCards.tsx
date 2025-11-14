/**
 * Summary Cards Component (Phase D)
 * Displays 4 key metrics with count-up animation
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/gst';
import { TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react';
import * as ledgerApi from '@/services/ledger.api';

interface SummaryCardsProps {
  summary: ledgerApi.AnalyticsSummary;
  loading: boolean;
}

/**
 * Simple count-up animation hook (CSS-based, no Framer Motion)
 */
function useCountUp(value: number, duration: number = 1000): number {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    const startValue = displayValue;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]); // displayValue intentionally excluded to animate from current value

  return Math.round(displayValue * 100) / 100;
}

export function SummaryCards({ summary, loading }: SummaryCardsProps) {
  const displaySales = useCountUp(summary.total_sales);
  const displayExpenses = useCountUp(summary.total_expenses);
  const displayProfit = useCountUp(summary.net_profit);
  const displayCashFlow = useCountUp(summary.cash_flow);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5 animate-pulse">
            <div className="h-20 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Sales */}
      <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 shadow-sm hover-lift animate-scale-in group">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 rounded-lg bg-green-500 shadow-md group-hover:shadow-lg transition-shadow">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
        <p className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">
          Total Sales
        </p>
        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
          {formatCurrency(displaySales)}
        </p>
      </Card>

      {/* Total Expenses */}
      <Card className="p-5 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800 shadow-sm hover-lift animate-scale-in group" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 rounded-lg bg-red-500 shadow-md group-hover:shadow-lg transition-shadow">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wide mb-1">
          Total Expenses
        </p>
        <p className="text-2xl font-bold text-red-900 dark:text-red-100">
          {formatCurrency(displayExpenses)}
        </p>
      </Card>

      {/* Net Profit/Loss */}
      <Card className={`p-5 bg-gradient-to-br ${summary.net_profit >= 0 ? 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800' : 'from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800'} shadow-sm hover-lift animate-scale-in group`} style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-lg ${summary.net_profit >= 0 ? 'bg-blue-500' : 'bg-red-500'} shadow-md group-hover:shadow-lg transition-shadow`}>
            <Wallet className="w-5 h-5 text-white" />
          </div>
          {summary.net_profit >= 0 ? (
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
          )}
        </div>
        <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${summary.net_profit >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-red-700 dark:text-red-400'}`}>
          Net {summary.net_profit >= 0 ? 'Profit' : 'Loss'}
        </p>
        <p className={`text-2xl font-bold ${summary.net_profit >= 0 ? 'text-blue-900 dark:text-blue-100' : 'text-red-900 dark:text-red-100'}`}>
          {formatCurrency(Math.abs(displayProfit))}
        </p>
      </Card>

      {/* Cash Flow */}
      <Card className={`p-5 bg-gradient-to-br ${summary.cash_flow >= 0 ? 'from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800' : 'from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800'} shadow-sm hover-lift animate-scale-in group`} style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-lg ${summary.cash_flow >= 0 ? 'bg-amber-500' : 'bg-red-500'} shadow-md group-hover:shadow-lg transition-shadow`}>
            <Activity className="w-5 h-5 text-white" />
          </div>
          {summary.cash_flow >= 0 ? (
            <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
          )}
        </div>
        <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${summary.cash_flow >= 0 ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'}`}>
          Cash Flow
        </p>
        <p className={`text-2xl font-bold ${summary.cash_flow >= 0 ? 'text-amber-900 dark:text-amber-100' : 'text-red-900 dark:text-red-100'}`}>
          {formatCurrency(Math.abs(displayCashFlow))}
        </p>
      </Card>
    </div>
  );
}

