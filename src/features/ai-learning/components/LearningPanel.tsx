import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Brain, RefreshCw, Upload, Download } from 'lucide-react';
import { TrainingProgress, SyncStatus } from '../types';

interface LearningPanelProps {
  trainingProgress: TrainingProgress;
  syncStatus: SyncStatus;
  onTrainLocally: () => void;
  onSyncModel: () => void;
}

export function LearningPanel({ 
  trainingProgress, 
  syncStatus, 
  onTrainLocally, 
  onSyncModel 
}: LearningPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'training': case 'uploading': case 'downloading': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'training': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'uploading': return <Upload className="w-4 h-4" />;
      case 'downloading': return <Download className="w-4 h-4" />;
      case 'completed': return <Brain className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Local Training Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Local Training</h3>
          </div>
          <Button 
            onClick={onTrainLocally} 
            disabled={trainingProgress.status === 'training'}
            variant="outline"
            size="sm"
          >
            {trainingProgress.status === 'training' ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Brain className="w-4 h-4 mr-2" />
            )}
            Train Locally
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className={getStatusColor(trainingProgress.status)}>
              {getStatusIcon(trainingProgress.status)}
              <span className="ml-2">{trainingProgress.message}</span>
            </span>
            <span className="text-gray-500">{trainingProgress.progress}%</span>
          </div>
          
          <Progress value={trainingProgress.progress} className="h-2" />
          
          {trainingProgress.trained_at && (
            <div className="text-xs text-gray-500">
              Last trained: {new Date(trainingProgress.trained_at).toLocaleString()}
            </div>
          )}
        </div>
      </Card>

      {/* Model Sync Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Model Sync</h3>
          </div>
          <Button 
            onClick={onSyncModel} 
            disabled={syncStatus.status === 'uploading' || syncStatus.status === 'downloading'}
            variant="outline"
            size="sm"
          >
            {syncStatus.status === 'uploading' || syncStatus.status === 'downloading' ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Sync Model
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className={getStatusColor(syncStatus.status)}>
              {getStatusIcon(syncStatus.status)}
              <span className="ml-2">{syncStatus.message}</span>
            </span>
            <span className="text-gray-500">{syncStatus.progress}%</span>
          </div>
          
          <Progress value={syncStatus.progress} className="h-2" />
          
          {syncStatus.last_sync && (
            <div className="text-xs text-gray-500">
              Last synced: {new Date(syncStatus.last_sync).toLocaleString()}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
