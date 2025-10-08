import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Cpu, Database, Shield, TrendingUp } from 'lucide-react';
import { ModelStatus } from '../types';

interface ModelStatusCardProps {
  modelStatus: ModelStatus | null;
  loading: boolean;
}

export function ModelStatusCard({ modelStatus, loading }: ModelStatusCardProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!modelStatus) {
    return (
      <Card className="p-6 text-center">
        <Database className="w-8 h-8 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">No model status available</p>
      </Card>
    );
  }

  const { global_model, update_count, version, model_hash } = modelStatus;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Model Status</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          v{version}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <Cpu className="w-4 h-4 mx-auto mb-1 text-blue-600" />
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Updates</p>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
            {update_count}
          </p>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <Shield className="w-4 h-4 mx-auto mb-1 text-green-600" />
          <p className="text-xs text-green-600 dark:text-green-400 mb-1">Threshold</p>
          <p className="text-lg font-bold text-green-900 dark:text-green-100">
            {(global_model.anomaly_threshold * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Model Hash</span>
          <span className="font-mono text-xs text-gray-500">
            {model_hash.substring(0, 8)}...
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
          <span className="text-gray-500">
            {new Date(global_model.aggregated_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Card>
  );
}
