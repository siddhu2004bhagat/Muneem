import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eraser, Pen, Highlighter, Scissors, Undo2, Redo2, BarChart3, Brain, Upload, ScanText, Loader2 } from 'lucide-react';
import { usePenTool } from '../context/PenToolContext';
import { toast } from 'sonner';

const COLORS = ['#000000', '#2E7D32', '#1976D2', '#D32F2F', '#9C27B0', '#FBC02D'];

interface Props {
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onRecognize?: () => void; // NEW: Trigger OCR recognition
  isRecognizing?: boolean; // NEW: Show loading state
}

const ToolPalette: React.FC<Props> = ({ onUndo, onRedo, onClear, onRecognize, isRecognizing }) => {
  const { tool, setTool, color, setColor, width, setWidth, opacity, setOpacity, mode, setMode } = usePenTool();
  
  // NEW: Toggle for auto-showing correction overlay
  const [showCorrectionsOnRecognize, setShowCorrectionsOnRecognize] = useState(() => {
    const saved = localStorage.getItem('digbahi_show_corrections_overlay');
    return saved !== null ? saved === 'true' : true; // Default: true
  });

  const handleToggleCorrections = (checked: boolean) => {
    setShowCorrectionsOnRecognize(checked);
    localStorage.setItem('digbahi_show_corrections_overlay', checked.toString());
    toast.info(checked ? 'Corrections overlay enabled' : 'Corrections overlay disabled');
  };

  return (
    <div className="fixed bottom-4 right-4 bg-background/90 backdrop-blur-md border rounded-xl shadow-lg p-2 flex items-center gap-2 z-40">
      <div className="flex gap-1">
        <Button size="sm" variant={tool === 'pen' ? 'default' : 'ghost'} onClick={() => setTool('pen')} title="Pen"><Pen className="w-4 h-4"/></Button>
        <Button size="sm" variant={tool === 'pencil' ? 'default' : 'ghost'} onClick={() => setTool('pencil')} title="Pencil"><Pen className="w-4 h-4 rotate-12"/></Button>
        <Button size="sm" variant={tool === 'highlighter' ? 'default' : 'ghost'} onClick={() => setTool('highlighter')} title="Highlighter"><Highlighter className="w-4 h-4"/></Button>
        <Button size="sm" variant={tool === 'eraser' ? 'default' : 'ghost'} onClick={() => setTool('eraser')} title="Eraser"><Eraser className="w-4 h-4"/></Button>
        <Button size="sm" variant={tool === 'lasso' ? 'default' : 'ghost'} onClick={() => setTool('lasso')} title="Lasso"><Scissors className="w-4 h-4"/></Button>
      </div>

      <div className="h-6 w-px bg-border mx-1"/>

      {/* Modes: Draw / Shape / OCR */}
      <div className="flex gap-1">
        <Button size="sm" variant={mode === 'draw' ? 'default' : 'ghost'} onClick={() => setMode('draw')} title="Draw">✏️</Button>
        <Button size="sm" variant={mode === 'shape' ? 'default' : 'ghost'} onClick={() => setMode('shape')} title="Shape Snap">📐</Button>
        <Button size="sm" variant={mode === 'ocr' ? 'default' : 'ghost'} onClick={() => setMode('ocr')} title="OCR">🔠</Button>
      </div>

      <div className="flex gap-1">
        {COLORS.map(c => (
          <button key={c} aria-label={`color-${c}`} onClick={() => setColor(c)} className={`w-5 h-5 rounded-full border ${color === c ? 'ring-2 ring-primary' : ''}`} style={{ backgroundColor: c }}/>
        ))}
      </div>

      <div className="h-6 w-px bg-border mx-1"/>

      <div className="flex items-center gap-2 min-w-[140px]">
        <span className="text-xs text-muted-foreground">Nib</span>
        <Slider value={[width]} min={1} max={12} step={1} onValueChange={([v]) => setWidth(v)} className="w-24"/>
      </div>

      <div className="flex items-center gap-2 min-w-[140px]">
        <span className="text-xs text-muted-foreground">Opacity</span>
        <Slider value={[opacity]} min={0.1} max={1} step={0.05} onValueChange={([v]) => setOpacity(v)} className="w-24"/>
      </div>

      <div className="h-6 w-px bg-border mx-1"/>

      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={onUndo} title="Undo (Z)"><Undo2 className="w-4 h-4"/></Button>
        <Button size="sm" variant="ghost" onClick={onRedo} title="Redo (Shift+Z)"><Redo2 className="w-4 h-4"/></Button>
        <Button size="sm" variant="outline" onClick={onClear} title="Clear">Clear</Button>
      </div>

      <div className="h-6 w-px bg-border mx-1"/>

      {/* NEW: Recognize Button (Hybrid OCR) */}
      <div className="flex flex-col gap-1">
        <Button 
          size="sm" 
          variant={isRecognizing ? "default" : "outline"}
          onClick={onRecognize}
          disabled={isRecognizing || !onRecognize}
          title="Recognize Handwriting (Hybrid OCR)"
          className="gap-2"
        >
          {isRecognizing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Recognizing...
            </>
          ) : (
            <>
              <ScanText className="w-4 h-4" />
              Recognize
            </>
          )}
        </Button>
        
        {/* Toggle for correction overlay */}
        <div className="flex items-center gap-2 px-2">
          <Switch
            id="show-corrections"
            checked={showCorrectionsOnRecognize}
            onCheckedChange={handleToggleCorrections}
            className="scale-75"
          />
          <Label htmlFor="show-corrections" className="text-xs cursor-pointer">
            Show corrections
          </Label>
        </div>
      </div>

      <div className="h-6 w-px bg-border mx-1"/>

      {/* Backup / Restore / Sync / AI Learning */}
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" title="Backup" onClick={() => document.dispatchEvent(new CustomEvent('digbahi:backup'))}>Backup</Button>
        <Button size="sm" variant="ghost" title="Restore" onClick={() => document.dispatchEvent(new CustomEvent('digbahi:restore'))}>Restore</Button>
        <Button size="sm" variant="ghost" title="Sync" onClick={() => document.dispatchEvent(new CustomEvent('digbahi:sync'))}>Sync</Button>
        <Button size="sm" variant="ghost" title="Run AI Analysis" onClick={() => document.dispatchEvent(new CustomEvent('digbahi:ai-refresh'))}>
          <BarChart3 className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" title="Train AI Model" onClick={() => document.dispatchEvent(new CustomEvent('digbahi:ai-train'))}>
          <Brain className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" title="Sync AI Model" onClick={() => document.dispatchEvent(new CustomEvent('digbahi:ai-sync'))}>
          <Upload className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ToolPalette;


