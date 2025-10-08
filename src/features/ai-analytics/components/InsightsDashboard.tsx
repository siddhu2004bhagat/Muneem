import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, BarChart3, AlertTriangle, TrendingUp, Brain } from 'lucide-react';
import { SummaryCards } from './SummaryCards';
import { AnomalyList } from './AnomalyList';
import { TrendChart } from './TrendChart';
import { useAnalytics } from '../hooks/useAnalytics';
import { 
  LearningPanel, 
  ModelStatusCard, 
  UpdateSummary, 
  useLearningSync 
} from '@/features/ai-learning';

export function InsightsDashboard() {
  const { summary, trends, loading, error, refresh } = useAnalytics();
  const { 
    modelStatus, 
    trainingProgress, 
    syncStatus, 
    trainLocally, 
    syncModel 
  } = useLearningSync();

  if (loading) {
    return (
      <Card className="p-6 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </Card>
    );
  }

  if (!summary || !trends) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">No analytics data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Analytics Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Financial insights and anomaly detection</p>
        </div>
        <Button onClick={refresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>

      <SummaryCards totals={summary.totals} severity={summary.severity} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Trends</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>AI Insights</span>
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>AI Learning</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">Total Revenue</p>
                <p className="text-xl font-bold text-green-900 dark:text-green-100">
                  ₹{(summary.totals.sales + summary.totals.receipts).toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 mb-1">Total Expenses</p>
                <p className="text-xl font-bold text-red-900 dark:text-red-100">
                  ₹{(summary.totals.purchases + summary.totals.expenses).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <TrendChart data={trends.chartData} />
        </TabsContent>

        <TabsContent value="insights">
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Anomaly Detection</h3>
              <AnomalyList anomalies={summary.anomalies} />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="learning">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ModelStatusCard modelStatus={modelStatus} loading={false} />
              <UpdateSummary modelStatus={modelStatus} />
            </div>
            <LearningPanel 
              trainingProgress={trainingProgress}
              syncStatus={syncStatus}
              onTrainLocally={trainLocally}
              onSyncModel={syncModel}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
