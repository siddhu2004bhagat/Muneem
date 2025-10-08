import React, { createContext, useContext, useMemo, useState } from 'react';
import type { DrawingTool } from '../pen.types';

interface PenToolState {
  tool: DrawingTool;
  color: string;
  width: number; // nib size
  opacity: number;
  mode: 'draw' | 'shape' | 'ocr';
  setTool: (t: DrawingTool) => void;
  setColor: (c: string) => void;
  setWidth: (w: number) => void;
  setOpacity: (o: number) => void;
  setMode: (m: 'draw' | 'shape' | 'ocr') => void;
}

const PenToolContext = createContext<PenToolState | null>(null);

export const PenToolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tool, setTool] = useState<DrawingTool>('pen');
  const [color, setColor] = useState<string>('#000000');
  const [width, setWidth] = useState<number>(3);
  const [opacity, setOpacity] = useState<number>(1);
  const [mode, setMode] = useState<'draw' | 'shape' | 'ocr'>('draw');

  const value = useMemo(() => ({ tool, color, width, opacity, mode, setTool, setColor, setWidth, setOpacity, setMode }), [tool, color, width, opacity, mode]);
  return <PenToolContext.Provider value={value}>{children}</PenToolContext.Provider>;
};

export function usePenTool() {
  const ctx = useContext(PenToolContext);
  if (!ctx) throw new Error('usePenTool must be used within PenToolProvider');
  return ctx;
}

export default PenToolContext;


