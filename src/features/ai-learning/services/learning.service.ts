import { ModelStatus, ModelUpdate, TrainingProgress } from '../types';

const BASE_URL = 'http://localhost:8000/api/v1/ai/federated';

export const learningService = {
  async getModelStatus(): Promise<ModelStatus> {
    const response = await fetch(`${BASE_URL}/status`);
    if (!response.ok) throw new Error('Failed to fetch model status');
    return response.json();
  },

  async uploadModelUpdate(update: ModelUpdate): Promise<{ status: string; message: string }> {
    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    if (!response.ok) throw new Error('Failed to upload model update');
    return response.json();
  },

  async trainLocalModel(): Promise<TrainingProgress> {
    const response = await fetch(`${BASE_URL}/train-local`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to train local model');
    const result = await response.json();
    
    return {
      status: 'completed',
      progress: 100,
      message: result.message,
      trained_at: result.trained_at,
      model_version: result.model_version
    };
  },

  async aggregateModels(updates: ModelUpdate[]): Promise<{ status: string; aggregated_model: Record<string, unknown> }> {
    const response = await fetch(`${BASE_URL}/aggregate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_updates: updates })
    });
    if (!response.ok) throw new Error('Failed to aggregate models');
    return response.json();
  }
};

export default learningService;
