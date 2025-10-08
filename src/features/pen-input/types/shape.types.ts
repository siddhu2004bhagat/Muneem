export type ShapeType = 'line' | 'rect' | 'circle' | 'arrow';

export interface ShapeDetection {
  type: ShapeType;
  confidence: number;
  bounds: { x: number; y: number; width: number; height: number };
}


