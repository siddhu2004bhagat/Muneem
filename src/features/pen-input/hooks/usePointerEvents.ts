import { useCallback, useRef } from 'react';
import type { StrokePoint } from '../types/pen.types';

interface Handlers {
  onPointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLCanvasElement>) => void;
}

export function usePointerEvents(
  opts: {
    getPosition: (e: React.PointerEvent) => { x: number; y: number; pressure: number };
    beginStroke: (p: StrokePoint) => void;
    extendStroke: (p: StrokePoint) => void;
    endStroke: () => void;
  }
): Handlers {
  const activePenRef = useRef<boolean>(false);
  const activePointerIdRef = useRef<number | null>(null);
  const activePointersRef = useRef<Set<number>>(new Set()); // Track all active pointers for multi-touch detection

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    // Two-finger scrolling detection: if there's already an active pointer, ignore this one (let browser handle scroll)
    if (activePointersRef.current.size > 0 && activePointerIdRef.current !== e.pointerId) {
      // Second (or more) pointer detected - likely a scroll gesture, don't interfere
      activePointersRef.current.add(e.pointerId);
      return; // Let browser handle scrolling
    }

    // Palm rejection: ignore touch if pen active or big touch
    if (e.pointerType === 'touch') {
      if (activePenRef.current) return; // ignore palm while pen down
      if ((e.width && e.width > 30) || (e.height && e.height > 30)) return; // palm-size touch
    }
    
    // Prefer pen
    if (e.pointerType === 'pen') activePenRef.current = true;
    
    // Track this pointer
    activePointerIdRef.current = e.pointerId;
    activePointersRef.current.add(e.pointerId);
    
    // Capture pointer for drawing
    (e.target as Element).setPointerCapture(e.pointerId);
    
    const { x, y, pressure } = opts.getPosition(e);
    opts.beginStroke({ 
      x, 
      y, 
      pressure: Math.max(0.1, pressure || 1), 
      timestamp: performance.now() // More precise timing
    });
  }, [opts]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    // Use performance.now() for better precision (faster than Date.now())
    const { x, y, pressure } = opts.getPosition(e);
    opts.extendStroke({ 
      x, 
      y, 
      pressure: Math.max(0.1, pressure || 1), 
      timestamp: performance.now() // More precise timing
    });
  }, [opts]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    // Remove from active pointers set
    activePointersRef.current.delete(e.pointerId);
    
    // Only end stroke if this was the primary drawing pointer
    if (activePointerIdRef.current === e.pointerId) {
    (e.target as Element).releasePointerCapture(e.pointerId);
    opts.endStroke();
    activePointerIdRef.current = null;
    if (e.pointerType === 'pen') activePenRef.current = false;
    }
    
    // If no more active pointers, reset state
    if (activePointersRef.current.size === 0) {
      activePointerIdRef.current = null;
      activePenRef.current = false;
    }
  }, [opts]);

  return { onPointerDown, onPointerMove, onPointerUp };
}

export default usePointerEvents;


