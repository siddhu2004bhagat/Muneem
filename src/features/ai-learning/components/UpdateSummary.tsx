import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { ModelStatus } from '../types';

interface UpdateSummaryProps {
  modelStatus: ModelStatus | null;
}

export function UpdateSummary({ modelStatus }: UpdateSummaryProps) {
  if (!modelStatus) {
    return (
      <Card className="p-6 text-center">
        <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">No update summary available</p>
      </Card>
    );
  }

  const { global_model, last_update } = modelStatus;
  const { anomaly_threshold, spending_patterns, category_weights, temporal_factors } = global_model;

  // Calculate some insights
  const avgSpendingPattern = spending_patterns.length > 0 
    ? spending_patterns.reduce((a, b) => a + b, 0) / spending_patterns.length 
    : 0;
  
  const dominantCategory = category_weights.length > 0
    ? ['Sales', 'Purchases', 'Expenses', 'Receipts'][category_weights.indexOf(Math.max(...category_weights))]
    : 'Unknown';

  const busiestDay = temporal_factors.length > 0
    ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][temporal_factors.indexOf(Math.max(...temporal_factors))]
    : 'Unknown';

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Learning Summary</h3>
        <Badge variant="outline" className="text-xs">
          {global_model.version}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
          <TrendingUp className="w-4 h-4 mx-auto mb-1 text-purple-600" />
          <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Pattern Score</p>
          <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
            {(avgSpendingPattern * 100).toFixed(1)}
          </p>
        </div>
        <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
          <TrendingDown className="w-4 h-4 mx-auto mb-1 text-orange-600" />
          <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">Dominant Category</p>
          <p className="text-sm font-bold text-orange-900 dark:text-orange-100">
            {dominantCategory}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900/20 rounded">
          <span className="text-sm text-gray-600 dark:text-gray-400">Busiest Day</span>
          <span className="text-sm font-medium">{busiestDay}</span>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900/20 rounded">
          <span className="text-sm text-gray-600 dark:text-gray-400">Anomaly Sensitivity</span>
          <span className="text-sm font-medium">
            {(anomaly_threshold * 100).toFixed(1)}%
          </span>
        </div>

        {last_update && (
          <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950/20 rounded">
            <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Last Update
            </span>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              {new Date(last_update.timestamp).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
