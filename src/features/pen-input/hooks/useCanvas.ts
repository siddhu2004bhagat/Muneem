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

  const [config, setConfig] = useState<CanvasConfig>({
    width: 1024,
    height: 400,
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
    [c, b].forEach(el => {
      el.width = Math.max(1, rect.width) * dpr;
      el.height = Math.max(1, rect.height) * dpr;
      el.style.width = `${Math.max(1, rect.width)}px`;
      el.style.height = `${Math.max(1, rect.height)}px`;
      const ctx = el.getContext('2d');
      if (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.scale(dpr, dpr); }
    });
    drawBackground();
    redrawAll();
  }, [drawBackground]);

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

      // For Pen, we want variable width. 
      // Since quadraticCurveTo draws a continuous line, we can't easily change width mid-stroke 
      // without breaking it into segments. 
      // Breaking into segments (moveTo -> quadraticCurveTo -> stroke -> beginPath -> moveTo) 
      // is expensive but necessary for variable width in Canvas 2D without using polygons.

      if (s.tool === 'pen') {
        // Variable width rendering for Pen
        for (let i = 1; i < s.points.length; i++) {
          const p = s.points[i - 1];
          const q = s.points[i];

          // Reconstruct velocity
          const dist = Math.sqrt(Math.pow(q.x - p.x, 2) + Math.pow(q.y - p.y, 2));
          const time = q.timestamp - p.timestamp;
          const v = time > 0 ? dist / time : 0;

          // Calculate width - simplified for smoother feel
          const baseWidth = s.width;
          const pressure = q.pressure || 0.5;
          // Pressure range: 0.7x to 1.3x (tighter bounds, no velocity)
          const pressureFactor = 0.7 + (pressure * 0.6);
          const segmentWidth = baseWidth * pressureFactor;

          ctx.lineWidth = segmentWidth;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          const midX = (p.x + q.x) / 2, midY = (p.y + q.y) / 2;
          ctx.quadraticCurveTo(p.x, p.y, midX, midY);
          ctx.stroke();
        }
      } else {
        // Constant width for others (Pencil/Highlighter/Eraser)
        // Optimization: Draw as single path
        ctx.beginPath();
        ctx.moveTo(s.points[0].x, s.points[0].y);
        for (let i = 1; i < s.points.length; i++) {
          const p = s.points[i - 1]; const q = s.points[i];
          const midX = (p.x + q.x) / 2, midY = (p.y + q.y) / 2;
          ctx.quadraticCurveTo(p.x, p.y, midX, midY);
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
    // Log tool being used for debugging
    console.log(`[useCanvas] Starting stroke with tool: ${tool}, color: ${color}, width: ${width}`);
    
    const stroke: Stroke = {
      id: `s_${Date.now()}_${Math.random()}`,
      tool,
      color: tool === 'eraser' ? '#000000' : color, // Eraser doesn't use color but we store it
      width: tool === 'eraser' ? width * 4 : width, // Eraser is 4x wider for better visibility
      opacity,
      points: [p],
      timestamp: Date.now(),
    };
    currentStrokeRef.current = stroke;
    lastPointRef.current = p;
  }, [tool, color, width, opacity]);

  const extendStroke = useCallback((p: StrokePoint) => {
    const stroke = currentStrokeRef.current; if (!stroke) return;
    const last = lastPointRef.current || stroke.points[stroke.points.length - 1];

    // Calculate variable width based on pressure and velocity
    const v = StrokeEngine.velocityBetween(last, p);
    const pressure = p.pressure;

    // Base width logic
    let newWidth = width;
    if (tool === 'pen') {
      // Pen: Simplified pressure sensitivity (0.7x to 1.3x)
      // No velocity variation for smoother feel
      const pressureFactor = 0.7 + (pressure * 0.6);
      newWidth = width * pressureFactor;
    } else if (tool === 'pencil') {
      // Pencil: Constant width, texture provides variation
      newWidth = width * 0.8;
    }

    // Smooth width transition
    // stroke.width is the "base" width, but we want per-segment width.
    // Since we are drawing incrementally, we can change ctx.lineWidth!

    stroke.points.push(p);
    lastPointRef.current = p;

    // Draw incremental segment
    const c = canvasRef.current; const ctx = c?.getContext('2d');
    if (ctx && stroke.points.length > 1) {
      const q = stroke.points[stroke.points.length - 2];
      ctx.save();

      // iPad-like Physics & Rendering
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
      } else if (stroke.tool === 'pencil') {
        ctx.globalCompositeOperation = 'source-over';
        const pattern = getPattern(ctx, stroke.color, 0.9);
        ctx.strokeStyle = pattern || stroke.color;
        ctx.globalAlpha = 1;
        ctx.lineWidth = Math.max(0.8, stroke.width * 0.9); // Slightly thicker for visibility
        ctx.lineCap = 'round';
        // No shadow - keep it crisp
      } else {
        // Default Pen (Variable Width) - crisp and natural
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = stroke.opacity;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = newWidth; // Use calculated variable width
        ctx.lineCap = 'round';
        // No shadow - keep lines crisp
      }

      if (stroke.tool !== 'highlighter') {
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      } else {
        ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
      }

      ctx.beginPath();
      const midX = (q.x + p.x) / 2, midY = (q.y + p.y) / 2;
      ctx.moveTo(q.x, q.y);
      ctx.quadraticCurveTo(q.x, q.y, midX, midY);
      ctx.stroke();
      ctx.restore();
    }
  }, [width, tool]);

  const endStroke = useCallback(() => {
    const stroke = currentStrokeRef.current; if (!stroke) return;
    currentStrokeRef.current = null; lastPointRef.current = null;
    // Smooth and persist via command
    const smoothed = { ...stroke, points: StrokeEngine.smooth(stroke.points) };
    historyRef.current.push(addStrokeCommand(smoothed));
  }, [addStrokeCommand]);

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


