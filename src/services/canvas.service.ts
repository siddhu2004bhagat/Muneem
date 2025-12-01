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
   * Smooth stroke points using a weighted moving average with better filtering
   * This provides smoother results than simple 3-point average
   */
  static smoothStroke(points: StrokePoint[]): StrokePoint[] {
    if (points.length < 3) return points;
    
    const smoothed: StrokePoint[] = [];
    smoothed.push(points[0]); // Keep first point
    
    // Use weighted average: more weight on current point, less on neighbors
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      // Weighted average: 50% current, 25% each neighbor
      smoothed.push({
        x: prev.x * 0.25 + curr.x * 0.5 + next.x * 0.25,
        y: prev.y * 0.25 + curr.y * 0.5 + next.y * 0.25,
        pressure: prev.pressure * 0.25 + curr.pressure * 0.5 + next.pressure * 0.25,
        timestamp: curr.timestamp
      });
    }
    
    smoothed.push(points[points.length - 1]); // Keep last point
    return smoothed;
  }

  /**
   * Real-time smoothing for incremental drawing
   * Uses a buffer to smooth points as they come in
   */
  static smoothPointIncremental(
    newPoint: StrokePoint,
    previousPoints: StrokePoint[],
    bufferSize: number = 3
  ): StrokePoint {
    if (previousPoints.length === 0) return newPoint;
    
    const buffer = [...previousPoints.slice(-bufferSize), newPoint];
    
    if (buffer.length < 2) return newPoint;
    
    // Weighted average of last few points
    const weights = [0.1, 0.2, 0.3, 0.4]; // More weight on recent points
    let totalWeight = 0;
    let x = 0, y = 0, pressure = 0;
    
    for (let i = 0; i < buffer.length; i++) {
      const weight = weights[Math.min(i, weights.length - 1)];
      x += buffer[i].x * weight;
      y += buffer[i].y * weight;
      pressure += buffer[i].pressure * weight;
      totalWeight += weight;
    }
    
    return {
      x: x / totalWeight,
      y: y / totalWeight,
      pressure: pressure / totalWeight,
      timestamp: newPoint.timestamp
    };
  }

  /**
   * Calculate smooth Bezier control points for quadratic curves
   * Returns control point that creates smooth transitions
   */
  static getBezierControlPoint(
    p0: StrokePoint,
    p1: StrokePoint,
    p2?: StrokePoint
  ): { x: number; y: number } {
    if (!p2) {
      // Simple case: use midpoint
      return {
        x: (p0.x + p1.x) / 2,
        y: (p0.y + p1.y) / 2
      };
    }
    
    // Calculate smooth control point using Catmull-Rom style
    // Control point should be on the line from p0 to p1, but adjusted for smoothness
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 0.1) {
      return { x: p0.x, y: p0.y };
    }
    
    // Use previous point to calculate tangent direction
    const prevDx = p1.x - p0.x;
    const prevDy = p1.y - p0.y;
    const nextDx = p2.x - p1.x;
    const nextDy = p2.y - p1.y;
    
    // Average tangent direction
    const tangentX = (prevDx + nextDx) / 2;
    const tangentY = (prevDy + nextDy) / 2;
    
    // Control point is along the tangent, creating smooth curve
    const tension = 0.3; // Controls curve tightness
    return {
      x: p1.x - tangentX * tension,
      y: p1.y - tangentY * tension
    };
  }

  /**
   * Interpolate points for fast movements (predictive drawing)
   * Adds intermediate points when movement is too fast
   */
  static interpolatePoints(
    from: StrokePoint,
    to: StrokePoint,
    maxDistance: number = 5
  ): StrokePoint[] {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= maxDistance) {
      return [to];
    }
    
    // Calculate number of intermediate points needed
    const numPoints = Math.ceil(distance / maxDistance);
    const points: StrokePoint[] = [];
    
    for (let i = 1; i <= numPoints; i++) {
      const t = i / numPoints;
      const pressure = from.pressure + (to.pressure - from.pressure) * t;
      const timestamp = from.timestamp + (to.timestamp - from.timestamp) * t;
      
      points.push({
        x: from.x + dx * t,
        y: from.y + dy * t,
        pressure,
        timestamp
      });
    }
    
    return points;
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
