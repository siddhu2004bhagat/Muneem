import { useState, useEffect } from 'react';
import { db, LedgerEntry } from '@/lib/db';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/gst';
import { TrendingUp, TrendingDown, Wallet, Receipt, DollarSign, ShoppingCart, CreditCard, FileText } from 'lucide-react';
import { InsightsDashboard } from '@/features/ai-analytics';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    totalReceipts: 0,
    gstCollected: 0,
    gstPaid: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const entries = await db.ledger.toArray();
    
    const stats = entries.reduce((acc, entry) => {
      const total = entry.amount + entry.gstAmount;
      
      switch (entry.type) {
        case 'sale':
          acc.totalSales += total;
          acc.gstCollected += entry.gstAmount;
          break;
        case 'purchase':
          acc.totalPurchases += total;
          acc.gstPaid += entry.gstAmount;
          break;
        case 'expense':
          acc.totalExpenses += total;
          break;
        case 'receipt':
          acc.totalReceipts += total;
          break;
      }
      
      return acc;
    }, {
      totalSales: 0,
      totalPurchases: 0,
      totalExpenses: 0,
      totalReceipts: 0,
      gstCollected: 0,
      gstPaid: 0
    });

    setStats(stats);
  }

  const netProfit = stats.totalSales - stats.totalPurchases - stats.totalExpenses;
  const netGST = stats.gstCollected - stats.gstPaid;

  return (
    <div className="space-y-6">
      {/* Business Overview Banner */}
      <Card className="p-8 gradient-hero shadow-strong animate-scale-in">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <p className="text-white/80 text-sm uppercase tracking-wider mb-2">Total Revenue</p>
            <p className="text-4xl font-bold text-white mb-1">{formatCurrency(stats.totalSales + stats.totalReceipts)}</p>
            <p className="text-white/70 text-xs">Sales + Receipts</p>
          </div>
          <div className="text-center">
            <p className="text-white/80 text-sm uppercase tracking-wider mb-2">Net Profit</p>
            <p className={`text-4xl font-bold mb-1 ${netProfit >= 0 ? 'text-white' : 'text-red-200'}`}>
              {formatCurrency(netProfit)}
            </p>
            <div className="flex items-center justify-center gap-1 text-white/70 text-xs">
              {netProfit >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{netProfit >= 0 ? 'Profit' : 'Loss'}</span>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-white/80 text-sm uppercase tracking-wider mb-2">GST Liability</p>
            <p className="text-4xl font-bold text-white mb-1">{formatCurrency(netGST)}</p>
            <p className="text-white/70 text-xs">Net GST Due</p>
          </div>
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 shadow-sm hover-lift animate-scale-in group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-green-500 shadow-md group-hover:shadow-lg transition-shadow">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">Sales</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {formatCurrency(stats.totalSales)}
          </p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800 shadow-sm hover-lift animate-scale-in group" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-blue-500 shadow-md group-hover:shadow-lg transition-shadow">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <TrendingDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">Purchases</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatCurrency(stats.totalPurchases)}
          </p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800 shadow-sm hover-lift animate-scale-in group" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-red-500 shadow-md group-hover:shadow-lg transition-shadow">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wide mb-1">Expenses</p>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100">
            {formatCurrency(stats.totalExpenses)}
          </p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800 shadow-sm hover-lift animate-scale-in group" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-amber-500 shadow-md group-hover:shadow-lg transition-shadow">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Receipts</p>
          <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            {formatCurrency(stats.totalReceipts)}
          </p>
        </Card>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white dark:bg-card shadow-lg border-l-4 border-l-green-500 hover-lift animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-green-500">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-xl text-foreground">Profit & Loss</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30 transition-all">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Revenue
              </span>
              <span className="font-bold text-green-700 dark:text-green-400">{formatCurrency(stats.totalSales)}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-all">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Cost of Goods
              </span>
              <span className="font-bold text-blue-700 dark:text-blue-400">{formatCurrency(stats.totalPurchases)}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 transition-all">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                Expenses
              </span>
              <span className="font-bold text-red-700 dark:text-red-400">{formatCurrency(stats.totalExpenses)}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 mt-4 shadow-md">
              <span className="font-bold text-white text-base">Net Profit</span>
              <span className="font-bold text-white text-xl">
                {formatCurrency(netProfit)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-card shadow-lg border-l-4 border-l-amber-500 hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-amber-500">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-xl text-foreground">GST Summary</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30 transition-all">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                GST Collected
              </span>
              <span className="font-bold text-green-700 dark:text-green-400">{formatCurrency(stats.gstCollected)}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 transition-all">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                GST Paid
              </span>
              <span className="font-bold text-red-700 dark:text-red-400">{formatCurrency(stats.gstPaid)}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 mt-4 shadow-md">
              <span className="font-bold text-white text-base">Net GST Liability</span>
              <span className="font-bold text-white text-xl">
                {formatCurrency(netGST)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Analytics Dashboard */}
      <InsightsDashboard />
    </div>
  );
}
