import React, { useEffect, useRef } from 'react';
import type { ShapeDetection } from '../types/shape.types';

interface Props {
  shape: ShapeDetection | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const ShapeSnapOverlay: React.FC<Props> = ({ shape }) => {
  if (!shape) return null;
  // Visual will be drawn on canvas layer by caller; this component can hold controls
  return (
    <div className="absolute bottom-3 right-3 bg-background/90 border rounded-lg shadow p-2 flex gap-2 z-30">
      <span className="text-xs text-muted-foreground">Shape detected: {shape.type}</span>
    </div>
  );
};

export default ShapeSnapOverlay;


