import { AnalyticsSummary, TrendsResponse } from '../types';

const BASE_URL = 'http://localhost:8000/api/v1/ai/analytics';

export const analyticsService = {
  async getSummary(): Promise<AnalyticsSummary> {
    const response = await fetch(`${BASE_URL}/summary`);
    if (!response.ok) throw new Error('Failed to fetch analytics summary');
    return response.json();
  },

  async getTrends(): Promise<TrendsResponse> {
    const response = await fetch(`${BASE_URL}/trends`);
    if (!response.ok) throw new Error('Failed to fetch trends');
    return response.json();
  },

  async refresh(): Promise<{ status: string }> {
    const response = await fetch(`${BASE_URL}/refresh`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to refresh analytics');
    return response.json();
  },
};

export default analyticsService;
