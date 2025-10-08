export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  gridType: 'none' | 'lined' | 'squared';
  zoom: number;
  pan: { x: number; y: number };
}


