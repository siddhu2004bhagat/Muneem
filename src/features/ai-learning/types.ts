export interface ModelUpdate {
  encrypted_data: string;
  hash: string;
  device_id: string;
  timestamp: string;
  model_version: string;
}

export interface ModelStatus {
  global_model: {
    anomaly_threshold: number;
    spending_patterns: number[];
    category_weights: number[];
    temporal_factors: number[];
    version: string;
    aggregated_at: string;
    update_count: number;
  };
  update_count: number;
  last_update?: {
    timestamp: string;
    client_count: number;
    version: string;
  };
  model_hash: string;
  version: string;
}

export interface TrainingProgress {
  status: 'idle' | 'training' | 'completed' | 'error';
  progress: number;
  message: string;
  trained_at?: string;
  model_version?: string;
}

export interface SyncStatus {
  status: 'idle' | 'uploading' | 'downloading' | 'completed' | 'error';
  progress: number;
  message: string;
  last_sync?: string;
}
