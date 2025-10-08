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

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    // Palm rejection: ignore touch if pen active or big touch
    if (e.pointerType === 'touch') {
      if (activePenRef.current) return; // ignore palm while pen down
      if ((e.width && e.width > 30) || (e.height && e.height > 30)) return; // palm-size touch
    }
    // Prefer pen
    if (e.pointerType === 'pen') activePenRef.current = true;
    if (activePointerIdRef.current !== null && activePointerIdRef.current !== e.pointerId) return;
    activePointerIdRef.current = e.pointerId;
    (e.target as Element).setPointerCapture(e.pointerId);
    const { x, y, pressure } = opts.getPosition(e);
    opts.beginStroke({ x, y, pressure: Math.max(0.1, pressure || 1), timestamp: Date.now() });
  }, [opts]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    const { x, y, pressure } = opts.getPosition(e);
    opts.extendStroke({ x, y, pressure: Math.max(0.1, pressure || 1), timestamp: Date.now() });
  }, [opts]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    (e.target as Element).releasePointerCapture(e.pointerId);
    opts.endStroke();
    activePointerIdRef.current = null;
    if (e.pointerType === 'pen') activePenRef.current = false;
  }, [opts]);

  return { onPointerDown, onPointerMove, onPointerUp };
}

export default usePointerEvents;


