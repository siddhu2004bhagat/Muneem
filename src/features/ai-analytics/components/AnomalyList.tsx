import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Copy, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/gst';
import { AnomalySummary } from '../types';

interface AnomalyListProps {
  anomalies: AnomalySummary[];
}

export function AnomalyList({ anomalies }: AnomalyListProps) {
  if (anomalies.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="text-green-600 dark:text-green-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No Anomalies Detected</h3>
        <p className="text-gray-600 dark:text-gray-400">Your financial data looks healthy!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {anomalies.map((anomaly, index) => (
        <Card key={index} className="p-4 border-l-4 border-l-orange-500">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge 
                    variant={anomaly.severity === 'high' ? 'destructive' : anomaly.severity === 'medium' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {anomaly.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {anomaly.type.replace('_', ' ')}
                  </Badge>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {anomaly.description}
                </h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{anomaly.date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatCurrency(anomaly.amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
