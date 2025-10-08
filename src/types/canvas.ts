// Canvas and drawing specific types
export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  gridType: 'none' | 'lined' | 'squared';
  zoom: number;
  pan: { x: number; y: number };
}

export interface DrawingSettings {
  strokeWidth: number;
  strokeColor: string;
  opacity: number;
  pressureSensitivity: boolean;
  palmRejection: boolean;
  strokeSmoothing: boolean;
}

export interface ToolState {
  activeTool: 'pen' | 'eraser' | 'highlighter' | 'lasso' | 'text' | 'shape';
  showAddMenu: boolean;
  showSelectionMenu: boolean;
  selectionMode: 'none' | 'selecting' | 'selected';
  selectedStrokes: string[];
}

export interface CanvasHistory {
  strokes: Stroke[];
  currentStep: number;
  maxSteps: number;
}

export interface Stroke {
  id: string;
  points: StrokePoint[];
  tool: string;
  color: string;
  width: number;
  opacity: number;
  timestamp: number;
}

export interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
}

export interface CanvasEventHandlers {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onWheel: (e: React.WheelEvent) => void;
}
