import { Stroke, StrokePoint } from '@/types/canvas';
import { DRAWING_CONSTANTS } from '@/constants';

/**
 * Canvas drawing service with professional drawing algorithms
 */
export class CanvasService {
  /**
   * Map input velocity to a stroke width using a pressure/velocity curve.
   * Slower movement => thicker line; faster => thinner (pencil-like).
   */
  static widthFromVelocity(
    velocity: number,
    minWidth: number,
    maxWidth: number
  ): number {
    // Clamp velocity (px/ms)
    const v = Math.max(0, Math.min(1.5, velocity));
    // Ease-out curve: width = max - (normalizedVelocity^k)*(range)
    const k = 1.2;
    const t = Math.pow(Math.min(1, v / 1.5), k);
    return maxWidth - t * (maxWidth - minWidth);
  }

  /**
   * Compute instantaneous velocity between two points
   */
  static velocityBetween(a: StrokePoint, b: StrokePoint): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dt = Math.max(1, b.timestamp - a.timestamp);
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist / dt; // px per ms
  }

  /**
   * Smooth stroke points using a simple moving average
   */
  static smoothStroke(points: StrokePoint[]): StrokePoint[] {
    if (points.length < 3) return points;
    
    const smoothed: StrokePoint[] = [];
    smoothed.push(points[0]);
    
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      smoothed.push({
        x: (prev.x + curr.x + next.x) / 3,
        y: (prev.y + curr.y + next.y) / 3,
        pressure: (prev.pressure + curr.pressure + next.pressure) / 3,
        timestamp: curr.timestamp
      });
    }
    
    smoothed.push(points[points.length - 1]);
    return smoothed;
  }

  /**
   * Calculate stroke bounding box
   */
  static getStrokeBounds(stroke: Stroke): { x: number; y: number; width: number; height: number } {
    if (stroke.points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const minX = Math.min(...stroke.points.map(p => p.x));
    const maxX = Math.max(...stroke.points.map(p => p.x));
    const minY = Math.min(...stroke.points.map(p => p.y));
    const maxY = Math.max(...stroke.points.map(p => p.y));

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * Optimize stroke by removing redundant points
   */
  static optimizeStroke(stroke: Stroke, tolerance: number = 2): Stroke {
    if (stroke.points.length < 3) return stroke;

    const optimized: StrokePoint[] = [stroke.points[0]];
    
    for (let i = 1; i < stroke.points.length - 1; i++) {
      const prev = optimized[optimized.length - 1];
      const curr = stroke.points[i];
      const next = stroke.points[i + 1];
      
      // Check if current point adds significant value
      const dist1 = Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2);
      const dist2 = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);
      
      if (dist1 > tolerance || dist2 > tolerance) {
        optimized.push(curr);
      }
    }
    
    optimized.push(stroke.points[stroke.points.length - 1]);
    
    return {
      ...stroke,
      points: optimized
    };
  }

  /**
   * Calculate stroke length
   */
  static calculateStrokeLength(stroke: Stroke): number {
    if (stroke.points.length < 2) return 0;
    
    let length = 0;
    for (let i = 1; i < stroke.points.length; i++) {
      const prev = stroke.points[i - 1];
      const curr = stroke.points[i];
      length += Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2);
    }
    
    return length;
  }

  /**
   * Check if stroke is a tap (very small movement)
   */
  static isTap(stroke: Stroke): boolean {
    const length = this.calculateStrokeLength(stroke);
    const bounds = this.getStrokeBounds(stroke);
    return length < 5 && bounds.width < 10 && bounds.height < 10;
  }
}
