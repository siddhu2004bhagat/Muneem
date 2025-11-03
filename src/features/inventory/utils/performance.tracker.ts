/**
 * Query Performance Tracker
 * Monitors database query performance for optimization
 */
export class QueryPerformanceTracker {
  private static metrics: Map<string, number[]> = new Map();

  /**
   * Track query performance
   */
  static async trackQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    const result = await queryFn();
    const duration = performance.now() - start;
    
    // Store metrics
    if (!this.metrics.has(queryName)) {
      this.metrics.set(queryName, []);
    }
    this.metrics.get(queryName)!.push(duration);
    
    // Log slow queries (>100ms)
    if (duration > 100) {
      console.warn(`🐌 Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`);
    } else {
      console.log(`⚡ Query ${queryName}: ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }

  /**
   * Get performance statistics
   */
  static getStats(queryName: string): {
    avg: number;
    min: number;
    max: number;
    count: number;
  } | null {
    const metrics = this.metrics.get(queryName);
    if (!metrics || metrics.length === 0) return null;

    const avg = metrics.reduce((a, b) => a + b, 0) / metrics.length;
    const min = Math.min(...metrics);
    const max = Math.max(...metrics);

    return { avg, min, max, count: metrics.length };
  }

  /**
   * Get all query statistics
   */
  static getAllStats(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const stats: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    for (const [queryName] of this.metrics) {
      const stat = this.getStats(queryName);
      if (stat) {
        stats[queryName] = stat;
      }
    }
    
    return stats;
  }

  /**
   * Clear all metrics
   */
  static clearMetrics(): void {
    this.metrics.clear();
  }
}
