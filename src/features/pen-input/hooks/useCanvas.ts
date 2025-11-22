import { useCallback, useEffect, useRef, useState } from 'react';
import { StrokeEngine } from '../services/strokeEngine';
import History, { Command } from '../services/history.service';
import { saveStroke, loadAll } from '@/lib/localStore';
import type { Stroke, StrokePoint } from '../types/pen.types';
import type { CanvasConfig } from '../types/canvas.types';
import { usePenTool } from '../context/PenToolContext';
import { getPaperTemplate } from '../templates/paper-templates';
import { LedgerFormatId } from '@/features/ledger-formats';

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

  const redrawAll = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    strokes.forEach(s => {
      if (s.points.length < 2) return;
      ctx.save();
      ctx.globalAlpha = s.opacity;
      ctx.strokeStyle = s.color;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) {
        const p = s.points[i - 1]; const q = s.points[i];
        const midX = (p.x + q.x) / 2, midY = (p.y + q.y) / 2;
        ctx.lineWidth = s.width; // precomputed width per point can be added later
        ctx.quadraticCurveTo(p.x, p.y, midX, midY);
      }
      ctx.stroke();
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
    const stroke: Stroke = {
      id: `s_${Date.now()}_${Math.random()}`,
      tool,
      color,
      width,
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
    const v = StrokeEngine.velocityBetween(last, p);
    const dyn = StrokeEngine.widthFromVelocity(v, Math.max(1, width * 0.5), width * 1.5);
    stroke.width = dyn; // simple per-stroke width mod; can be per-point later
    stroke.points.push(p);
    lastPointRef.current = p;
    // Draw incremental segment
    const c = canvasRef.current; const ctx = c?.getContext('2d');
    if (ctx && stroke.points.length > 1) {
      const q = stroke.points[stroke.points.length - 2];
      ctx.save();
      ctx.globalAlpha = stroke.opacity;
      ctx.strokeStyle = stroke.color;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.lineWidth = stroke.width;
      ctx.beginPath();
      const midX = (q.x + p.x) / 2, midY = (q.y + p.y) / 2;
      ctx.moveTo(q.x, q.y);
      ctx.quadraticCurveTo(q.x, q.y, midX, midY);
      ctx.stroke();
      ctx.restore();
    }
  }, [width]);

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


