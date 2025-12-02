import { useCallback, useEffect, useRef, useState } from 'react';
import { StrokeEngine } from '../services/strokeEngine';
import History, { Command } from '../services/history.service';
import { saveStroke, loadAll } from '@/lib/localStore';
import type { Stroke, StrokePoint } from '../types/pen.types';
import type { CanvasConfig } from '../types/canvas.types';
import { usePenTool } from '../context/PenToolContext';
import { getPaperTemplate } from '../templates/paper-templates';
import { LedgerFormatId } from '@/features/ledger-formats';
import { createPencilPattern } from '../services/texture.service';
import { CanvasService } from '@/services/canvas.service';

const DPR = () => window.devicePixelRatio || 1;

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const historyRef = useRef(new History());

  const { tool, color, width, opacity } = usePenTool();

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const lastPointRef = useRef<StrokePoint | null>(null);

  // Cache for pencil patterns to avoid recreating every frame
  const patternCacheRef = useRef<Map<string, CanvasPattern>>(new Map());

  // Real-time smoothing buffer for incremental drawing
  const smoothingBufferRef = useRef<StrokePoint[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastProcessedTimeRef = useRef<number>(0);
  const pendingPointsRef = useRef<StrokePoint[]>([]);
  
  // Performance optimization: minimum time between point processing (throttle)
  const MIN_PROCESSING_INTERVAL = 8; // ~120fps max (8ms = 125fps)

  const [config, setConfig] = useState<CanvasConfig>({
    width: 1024,
    height: 15000, // Extended height for more writing space
    backgroundColor: '#FFF9E6',
    gridType: 'lined',
    zoom: 1,
    pan: { x: 0, y: 0 },
  });

  const drawBackground = useCallback(() => {
    const bg = bgRef.current; if (!bg) return;
    const ctx = bg.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, bg.width, bg.height);

    // Get selected format from localStorage
    const selectedFormatId = (localStorage.getItem('muneem_format') || 'traditional-khata') as LedgerFormatId;
    const paperTemplate = getPaperTemplate(selectedFormatId);

    // Draw formatted paper background
    paperTemplate.drawBackground(ctx, bg.width, bg.height);
  }, []);

  const resizeToContainer = useCallback(() => {
    const c = canvasRef.current, b = bgRef.current, container = containerRef.current;
    if (!c || !b || !container) return;
    const dpr = DPR();
    const rect = container.getBoundingClientRect();
    // Use config height for canvas (allows scrolling), but viewport width
    [c, b].forEach(el => {
      el.width = Math.max(1, rect.width) * dpr;
      el.height = Math.max(1, config.height) * dpr; // Use config height for scrolling
      el.style.width = `${Math.max(1, rect.width)}px`;
      el.style.height = `${config.height}px`; // Full canvas height for scrolling
      const ctx = el.getContext('2d', { 
        alpha: true,
        desynchronized: true, // Better performance on tablets
        willReadFrequently: false 
      });
      if (ctx) { 
        ctx.setTransform(1, 0, 0, 1, 0, 0); 
        ctx.scale(dpr, dpr);
        if (el === c) ctxRef.current = ctx; // Cache main canvas context
      }
    });
    drawBackground();
    redrawAll();
  }, [drawBackground, config.height]);

  useEffect(() => {
    const ro = new ResizeObserver(() => resizeToContainer());
    if (containerRef.current) ro.observe(containerRef.current);
    resizeToContainer();
    // Load session strokes
    loadAll().then(data => {
      if (Array.isArray(data.strokes)) setStrokes(data.strokes as any);
    });
    return () => ro.disconnect();
  }, [resizeToContainer]);

  const getPattern = (ctx: CanvasRenderingContext2D, color: string, opacity: number) => {
    const key = `${color}-${opacity}`;
    if (!patternCacheRef.current.has(key)) {
      const pattern = createPencilPattern(ctx, color, opacity);
      if (pattern) patternCacheRef.current.set(key, pattern);
    }
    return patternCacheRef.current.get(key);
  };

  const redrawAll = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    strokes.forEach(s => {
      if (s.points.length < 2) return;
      ctx.save();

      // iPad-like Physics & Rendering (Redraw)
      if (s.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = s.opacity;
        ctx.lineWidth = s.width * 4;
      } else if (s.tool === 'highlighter') {
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.width * 6;
        ctx.lineCap = 'butt';
      } else if (s.tool === 'pencil') {
        ctx.globalCompositeOperation = 'source-over';
        // Use texture pattern
        const pattern = getPattern(ctx, s.color, 0.9);
        ctx.strokeStyle = pattern || s.color;
        ctx.globalAlpha = 1; // Alpha handled in pattern
        ctx.lineWidth = Math.max(0.8, s.width * 0.9); // Slightly thicker for visibility
        ctx.lineCap = 'round';
        // No shadow - keep it crisp
      } else {
        // Default Pen - crisp, thin, natural
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = s.opacity;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.width; // Use exact width
        ctx.lineCap = 'round';
        // No shadow - keep lines crisp
      }

      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);

      // Improved smooth curve rendering with proper Bezier control points
      if (s.points.length < 2) return;

      if (s.tool === 'pen') {
        // Variable width rendering for Pen with smooth curves
        ctx.beginPath();
        ctx.moveTo(s.points[0].x, s.points[0].y);
        
        for (let i = 1; i < s.points.length; i++) {
          const p0 = s.points[i - 1];
          const p1 = s.points[i];
          const p2 = i < s.points.length - 1 ? s.points[i + 1] : undefined;

          // Calculate smooth control point
          const control = CanvasService.getBezierControlPoint(p0, p1, p2);
          
          // Calculate width based on pressure
          const baseWidth = s.width;
          const pressure = p1.pressure || 0.5;
          const pressureFactor = 0.7 + (pressure * 0.6);
          const segmentWidth = baseWidth * pressureFactor;

          ctx.lineWidth = segmentWidth;
          
          // Use quadratic curve with proper control point for smoothness
          const midX = (p0.x + p1.x) / 2;
          const midY = (p0.y + p1.y) / 2;
          ctx.quadraticCurveTo(control.x, control.y, midX, midY);
          
          // Draw segment if we have next point, otherwise draw to end
          if (i === s.points.length - 1) {
            ctx.lineTo(p1.x, p1.y);
          }
        }
        ctx.stroke();
      } else {
        // Constant width for others (Pencil/Highlighter/Eraser) with smooth curves
        ctx.beginPath();
        ctx.moveTo(s.points[0].x, s.points[0].y);
        
        for (let i = 1; i < s.points.length; i++) {
          const p0 = s.points[i - 1];
          const p1 = s.points[i];
          const p2 = i < s.points.length - 1 ? s.points[i + 1] : undefined;
          
          // Calculate smooth control point
          const control = CanvasService.getBezierControlPoint(p0, p1, p2);
          const midX = (p0.x + p1.x) / 2;
          const midY = (p0.y + p1.y) / 2;
          
          ctx.quadraticCurveTo(control.x, control.y, midX, midY);
          
          // Draw to final point
          if (i === s.points.length - 1) {
            ctx.lineTo(p1.x, p1.y);
          }
        }
        ctx.stroke();
      }

      ctx.restore();
    });
  }, [strokes]);

  const addStrokeCommand = useCallback((stroke: Stroke): Command => ({
    do: () => { setStrokes(prev => [...prev, stroke]); requestIdleCallback?.(() => saveStroke(stroke)); },
    undo: () => setStrokes(prev => prev.filter(s => s.id !== stroke.id)),
  }), []);

  const clearCommand = useCallback((): Command => {
    let prev: Stroke[] = [];
    return {
      do: () => setStrokes(p => (prev = p, [])),
      undo: () => setStrokes(prev),
    };
  }, []);

  // Public API used by pointer events
  const beginStroke = useCallback((p: StrokePoint) => {
    // Reset performance tracking
    lastProcessedTimeRef.current = performance.now();
    pendingPointsRef.current = [];
    smoothingBufferRef.current = [p];
    
    // Ensure canvas context is cached
    if (!ctxRef.current && canvasRef.current) {
      ctxRef.current = canvasRef.current.getContext('2d', {
        alpha: true,
        desynchronized: true, // Better performance on tablets
        willReadFrequently: false
      });
    }
    
    const stroke: Stroke = {
      id: `s_${Date.now()}_${Math.random()}`,
      tool,
      color: tool === 'eraser' ? '#000000' : color,
      width: tool === 'eraser' ? width * 4 : width,
      opacity,
      points: [p],
      timestamp: Date.now(),
    };
    currentStrokeRef.current = stroke;
    lastPointRef.current = p;
    (stroke as any).lastDrawnIndex = 0; // Initialize drawing index
  }, [tool, color, width, opacity]);

  const extendStroke = useCallback((p: StrokePoint) => {
    const stroke = currentStrokeRef.current; if (!stroke) return;
    const now = performance.now();
    
    // Throttle: Skip processing if too soon (reduces lag on fast movements)
    if (now - lastProcessedTimeRef.current < MIN_PROCESSING_INTERVAL) {
      pendingPointsRef.current.push(p);
      return; // Will be processed in next RAF
    }
    
    const last = lastPointRef.current || stroke.points[stroke.points.length - 1];
    lastProcessedTimeRef.current = now;

    // Calculate distance and velocity
    const dx = p.x - last.x;
    const dy = p.y - last.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const dt = p.timestamp - last.timestamp;
    const velocity = dt > 0 ? distance / dt : 0;

    // OPTIMIZATION: Skip interpolation for slow movements (reduces processing)
    // Only interpolate if movement is fast (>10px) or very fast (>20px)
    let pointsToAdd: StrokePoint[] = [];
    if (distance > 20) {
      // Very fast: interpolate with larger threshold
      pointsToAdd = CanvasService.interpolatePoints(last, p, 8);
    } else if (distance > 10) {
      // Fast: interpolate with normal threshold
      pointsToAdd = CanvasService.interpolatePoints(last, p, 5);
    } else {
      // Slow: add point directly (no interpolation needed)
      pointsToAdd = [p];
    }

    // OPTIMIZATION: Light smoothing during drawing (only 2-point buffer for speed)
    // Heavy smoothing will be applied at stroke end
    const smoothedPoints: StrokePoint[] = [];
    for (const point of pointsToAdd) {
      // Light smoothing: only use last 2 points for speed
      const buffer = smoothingBufferRef.current.slice(-2);
      const smoothed = buffer.length >= 2
        ? CanvasService.smoothPointIncremental(point, buffer, 2)
        : point; // No smoothing if buffer too small
      
      smoothedPoints.push(smoothed);
      smoothingBufferRef.current.push(smoothed);
      
      // Keep buffer small (max 3 points) for performance
      if (smoothingBufferRef.current.length > 3) {
        smoothingBufferRef.current.shift();
      }
    }

    // Add points to stroke
    for (const smoothedPoint of smoothedPoints) {
      stroke.points.push(smoothedPoint);
    }
    lastPointRef.current = smoothedPoints[smoothedPoints.length - 1] || p;

    // OPTIMIZATION: Batch RAF calls - only schedule if not already scheduled
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        const ctx = ctxRef.current || canvasRef.current?.getContext('2d');
        if (!ctx || !stroke || stroke.points.length < 2) {
          rafIdRef.current = null;
          return;
        }

        // Process any pending points first
        if (pendingPointsRef.current.length > 0) {
          const pending = pendingPointsRef.current;
          pendingPointsRef.current = [];
          pending.forEach(pendingPoint => {
            const last = stroke.points[stroke.points.length - 1];
            stroke.points.push(pendingPoint);
            lastPointRef.current = pendingPoint;
          });
        }

        const lastDrawnIndex = (stroke as any).lastDrawnIndex || 0;
        const pointsToDraw = stroke.points.slice(lastDrawnIndex);
        
        if (pointsToDraw.length < 2) {
          rafIdRef.current = null;
          return;
        }

        // OPTIMIZATION: Cache context state to avoid repeated getContext calls
        // Only save/restore when tool settings change
        const needsSave = !(stroke as any).ctxStateSet;
        if (needsSave) ctx.save();

        // Set context state once per stroke
        if (!(stroke as any).ctxStateSet) {
          if (stroke.tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.globalAlpha = stroke.opacity;
            ctx.lineWidth = stroke.width * 4;
          } else if (stroke.tool === 'highlighter') {
            ctx.globalCompositeOperation = 'multiply';
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width * 6;
            ctx.lineCap = 'butt';
            ctx.lineJoin = 'round';
          } else if (stroke.tool === 'pencil') {
            ctx.globalCompositeOperation = 'source-over';
            const pattern = getPattern(ctx, stroke.color, 0.9);
            ctx.strokeStyle = pattern || stroke.color;
            ctx.globalAlpha = 1;
            ctx.lineWidth = Math.max(0.8, stroke.width * 0.9);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
          } else {
            // Default Pen
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = stroke.opacity;
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
          }
          (stroke as any).ctxStateSet = true;
        }

        // Draw smooth curve - optimized for performance
        ctx.beginPath();
        const startPoint = lastDrawnIndex > 0 ? stroke.points[lastDrawnIndex - 1] : pointsToDraw[0];
        ctx.moveTo(startPoint.x, startPoint.y);

        // OPTIMIZATION: Simplified curve drawing for speed
        // Use simpler curves during drawing, complex smoothing at end
        for (let i = 1; i < pointsToDraw.length; i++) {
          const p0 = i === 1 && lastDrawnIndex > 0 
            ? stroke.points[lastDrawnIndex - 1] 
            : pointsToDraw[i - 1];
          const p1 = pointsToDraw[i];
          const p2 = i < pointsToDraw.length - 1 ? pointsToDraw[i + 1] : undefined;

          // Simplified control point calculation for speed
          const control = p2 
            ? CanvasService.getBezierControlPoint(p0, p1, p2)
            : { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
          
          const midX = (p0.x + p1.x) / 2;
          const midY = (p0.y + p1.y) / 2;

          // Adjust line width for pen tool
          if (stroke.tool === 'pen') {
            const pressure = p1.pressure || 0.5;
            const pressureFactor = 0.7 + (pressure * 0.6);
            ctx.lineWidth = stroke.width * pressureFactor;
          }

          ctx.quadraticCurveTo(control.x, control.y, midX, midY);
        }

        // Draw to final point
        const finalPoint = pointsToDraw[pointsToDraw.length - 1];
        ctx.lineTo(finalPoint.x, finalPoint.y);
        ctx.stroke();
        
        if (needsSave) ctx.restore();
        
        (stroke as any).lastDrawnIndex = stroke.points.length;
        rafIdRef.current = null;
      });
    }
  }, [width, tool, getPattern]);

  const endStroke = useCallback(() => {
    // Cancel any pending animation frame and process immediately
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    const stroke = currentStrokeRef.current; if (!stroke) return;
    
    // Process any remaining pending points
    if (pendingPointsRef.current.length > 0) {
      pendingPointsRef.current.forEach(pendingPoint => {
        stroke.points.push(pendingPoint);
      });
      pendingPointsRef.current = [];
    }
    
    currentStrokeRef.current = null; 
    lastPointRef.current = null;
    
    // OPTIMIZATION: Apply heavy smoothing only at end (not during drawing)
    // This gives smooth result without lag during drawing
    const smoothed = { ...stroke, points: StrokeEngine.smooth(stroke.points) };
    
    // Clear buffers
    smoothingBufferRef.current = [];
    lastProcessedTimeRef.current = 0;
    
    // Redraw the entire smoothed stroke with final smoothing
    redrawAll();
    
    // Persist via command (async, non-blocking)
    historyRef.current.push(addStrokeCommand(smoothed));
  }, [addStrokeCommand, redrawAll]);

  const clearCanvas = useCallback(() => {
    historyRef.current.push(clearCommand());
    const c = canvasRef.current; const ctx = c?.getContext('2d');
    if (ctx) { ctx.clearRect(0, 0, c!.width, c!.height); }
    drawBackground();
  }, [clearCommand, drawBackground]);

  const undo = useCallback(() => historyRef.current.undo(), []);
  const redo = useCallback(() => historyRef.current.redo(), []);

  useEffect(() => { redrawAll(); }, [strokes, redrawAll]);

  return {
    canvasRef,
    backgroundCanvasRef: bgRef,
    containerRef,
    config,
    setConfig,
    strokes,
    beginStroke,
    extendStroke,
    endStroke,
    clearCanvas,
    undo,
    redo,
    resizeToContainer,
  };
}

export default useCanvas;


