import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/gst';
import { TrendingUp, TrendingDown, Wallet, Receipt, DollarSign, ShoppingCart, CreditCard, FileText, Calendar, Filter } from 'lucide-react';
import { InsightsDashboard } from '@/features/ai-analytics';
import { getLedgerDataSource } from '@/services/ledger.datasource';
import { useLedgerSync } from '@/hooks/useLedgerSync';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { Charts } from '@/components/dashboard/Charts';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import * as ledgerApi from '@/services/ledger.api';

export function Dashboard() {
  const [summary, setSummary] = useState<ledgerApi.AnalyticsSummary>({
    total_sales: 0,
    total_purchases: 0,
    total_expenses: 0,
    total_receipts: 0,
    net_profit: 0,
    cash_flow: 0,
    gst_collected: 0,
    gst_paid: 0,
    net_gst: 0,
  });
  const [monthlyData, setMonthlyData] = useState<ledgerApi.MonthlySummary[]>([]);
  const [partyData, setPartyData] = useState<ledgerApi.PartySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Filters
  const [filters, setFilters] = useState<{ from?: string; to?: string; type?: string }>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  // Real-time sync: Listen for ledger events
  useLedgerSync({
    onEntryCreated: () => {
      loadAnalytics();
    },
    onEntryUpdated: () => {
      loadAnalytics();
    },
    onEntryDeleted: () => {
      loadAnalytics();
    },
  });

  useEffect(() => {
    loadAnalytics();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.from, filters.to, filters.type, currentYear]);

  async function loadAnalytics() {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    try {
      const datasource = getLedgerDataSource();
      
      // Load summary, monthly, and party data in parallel
      const [summaryResult, monthlyResult, partyResult] = await Promise.all([
        datasource.getSummary(filters, signal),
        datasource.getMonthlySummary(currentYear, filters.type, signal),
        datasource.getPartySummary(5, filters, signal),
      ]);

      if (!signal.aborted) {
        setSummary(summaryResult);
        setMonthlyData(monthlyResult);
        setPartyData(partyResult);
      }
    } catch (error: unknown) {
      if (signal.aborted) return;
      console.error('Failed to load analytics:', error);
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }

  const netProfit = summary.net_profit;
  const netGST = summary.net_gst;

  return (
    <div className="space-y-6">
      {/* Dashboard Header with Active Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Ledger Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Financial analytics and insights
          </p>
        </div>
        {(filters.from || filters.to || filters.type) && (
          <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
            {filters.from && filters.to && (
              <span className="px-2 py-1 bg-muted rounded-md">
                Period: {filters.from} → {filters.to}
              </span>
            )}
            {filters.type && (
              <span className="px-2 py-1 bg-muted rounded-md">
                Type: {filters.type}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from" className="text-xs flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              From Date
            </Label>
            <Input
              id="from"
              type="date"
              value={filters.from || ''}
              onChange={(e) => setFilters({ ...filters, from: e.target.value || undefined })}
              className="touch-friendly"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to" className="text-xs flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              To Date
            </Label>
            <Input
              id="to"
              type="date"
              value={filters.to || ''}
              onChange={(e) => setFilters({ ...filters, to: e.target.value || undefined })}
              className="touch-friendly"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type" className="text-xs">Type</Label>
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) => setFilters({ ...filters, type: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="touch-friendly">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="receipt">Receipt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="year" className="text-xs">Year</Label>
            <Input
              id="year"
              type="number"
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value) || new Date().getFullYear())}
              min={2000}
              max={2100}
              className="touch-friendly"
            />
          </div>
        </div>
      </Card>

      {/* Summary Cards (Phase D) */}
      <SummaryCards summary={summary} loading={loading} />

      {/* Business Overview Banner */}
      <Card className="p-8 gradient-hero shadow-strong animate-scale-in">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <p className="text-white/80 text-sm uppercase tracking-wider mb-2">Total Revenue</p>
            <p className="text-4xl font-bold text-white mb-1">{formatCurrency(summary.total_sales + summary.total_receipts)}</p>
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

      {/* Charts (Phase D) */}
      <Charts monthlyData={monthlyData} partyData={partyData} loading={loading} currentYear={currentYear} />

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
              <span className="font-bold text-green-700 dark:text-green-400">{formatCurrency(summary.total_sales)}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-all">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Cost of Goods
              </span>
              <span className="font-bold text-blue-700 dark:text-blue-400">{formatCurrency(summary.total_purchases)}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 transition-all">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                Expenses
              </span>
              <span className="font-bold text-red-700 dark:text-red-400">{formatCurrency(summary.total_expenses)}</span>
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
              <span className="font-bold text-green-700 dark:text-green-400">{formatCurrency(summary.gst_collected)}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 transition-all">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                GST Paid
              </span>
              <span className="font-bold text-red-700 dark:text-red-400">{formatCurrency(summary.gst_paid)}</span>
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
