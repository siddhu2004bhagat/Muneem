/**
 * Text Correction Overlay
 * 
 * Editable overlay that allows users to correct OCR recognition errors.
 * Positioned absolutely over the canvas using bounding boxes.
 * 
 * Features:
 * - Real-time inline editing
 * - Confidence badges
 * - Visual highlights on hover
 * - Batch confirm/cancel actions
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Check, X, Edit2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CorrectionBox {
  id: string;
  rect: { x: number; y: number; width: number; height: number };
  text: string;
  confidence: number;
  type?: 'tesseract' | 'tflite' | 'merged';
}

interface TextCorrectionOverlayProps {
  boxes: CorrectionBox[];
  canvasRect?: DOMRect; // Canvas bounding rect for positioning
  onConfirm: (boxes: CorrectionBox[]) => void;
  onCancel?: () => void;
  onEdit?: (id: string, newText: string) => void;
  onHighlight?: (id: string | null) => void; // Highlight strokes on canvas
}

export function TextCorrectionOverlay({
  boxes,
  canvasRect,
  onConfirm,
  onCancel,
  onEdit,
  onHighlight
}: TextCorrectionOverlayProps) {
  const [editedBoxes, setEditedBoxes] = useState<Map<string, string>>(new Map());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Notify parent of hover for canvas highlighting
  useEffect(() => {
    onHighlight?.(hoveredId);
  }, [hoveredId, onHighlight]);

  const handleEdit = (id: string, newText: string) => {
    const updated = new Map(editedBoxes);
    updated.set(id, newText);
    setEditedBoxes(updated);
    onEdit?.(id, newText);
  };

  const handleConfirmAll = () => {
    const finalBoxes = boxes.map(box => ({
      ...box,
      text: editedBoxes.get(box.id) ?? box.text
    }));
    onConfirm(finalBoxes);
  };

  const handleAcceptBox = (id: string) => {
    // Just remove from editing state (keep original text)
    setEditingId(null);
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'tflite': return '🔢'; // Numbers/symbols
      case 'tesseract': return '📝'; // Text
      case 'merged': return '🔀'; // Merged result
      default: return '🔍';
    }
  };

  // If no canvas rect provided, use full viewport
  const baseRect = canvasRect || new DOMRect(0, 0, window.innerWidth, window.innerHeight);

  if (boxes.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="p-6">
          <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
          <p className="text-center">No text recognized</p>
          <Button onClick={onCancel} className="mt-4 w-full">Close</Button>
        </Card>
      </div>
    );
  }

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 pointer-events-none"
      style={{
        left: baseRect.left,
        top: baseRect.top,
        width: baseRect.width,
        height: baseRect.height
      }}
    >
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/20 pointer-events-auto" onClick={onCancel} />

      {/* Correction boxes */}
      {boxes.map((box) => {
        const isEditing = editingId === box.id;
        const currentText = editedBoxes.get(box.id) ?? box.text;
        const hasEdits = editedBoxes.has(box.id);

        return (
          <div
            key={box.id}
            className={cn(
              "absolute pointer-events-auto transition-all",
              hoveredId === box.id && "ring-2 ring-primary"
            )}
            style={{
              left: box.rect.x,
              top: box.rect.y,
              width: Math.max(box.rect.width, 100), // Min width for usability
              minHeight: box.rect.height
            }}
            onMouseEnter={() => setHoveredId(box.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <Card className="p-2 bg-white/95 dark:bg-gray-900/95 shadow-lg backdrop-blur-sm">
              {/* Header: confidence + type */}
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs">{getTypeIcon(box.type)}</span>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", getConfidenceColor(box.confidence))}
                  >
                    {Math.round(box.confidence * 100)}%
                  </Badge>
                </div>
                {hasEdits && (
                  <Badge variant="secondary" className="text-xs">
                    Edited
                  </Badge>
                )}
              </div>

              {/* Text input/display */}
              {isEditing ? (
                <Input
                  value={currentText}
                  onChange={(e) => handleEdit(box.id, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setEditingId(null);
                    } else if (e.key === 'Escape') {
                      // Revert changes
                      const updated = new Map(editedBoxes);
                      updated.delete(box.id);
                      setEditedBoxes(updated);
                      setEditingId(null);
                    }
                  }}
                  autoFocus
                  className="text-sm"
                />
              ) : (
                <div 
                  className="text-sm font-medium mb-2 cursor-text p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  onClick={() => setEditingId(box.id)}
                >
                  {currentText || <span className="text-gray-400 italic">Empty</span>}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={isEditing ? "default" : "ghost"}
                  onClick={() => setEditingId(isEditing ? null : box.id)}
                  className="flex-1"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  {isEditing ? 'Done' : 'Edit'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAcceptBox(box.id)}
                  className="flex-1"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Accept
                </Button>
              </div>
            </Card>
          </div>
        );
      })}

      {/* Bottom action bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <Card className="p-3 bg-white/95 dark:bg-gray-900/95 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              {boxes.length} text box{boxes.length !== 1 ? 'es' : ''} • 
              {editedBoxes.size > 0 ? ` ${editedBoxes.size} edited` : ' No edits'}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onCancel}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAll}
                className="gap-2 gradient-hero"
              >
                <Check className="w-4 h-4" />
                Confirm All
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <Card className="p-2 bg-white/90 dark:bg-gray-900/90 text-xs text-muted-foreground">
          <div className="font-semibold mb-1">Keyboard Shortcuts:</div>
          <div>• Click box to edit</div>
          <div>• <kbd className="px-1 bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd> to save</div>
          <div>• <kbd className="px-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> to cancel</div>
        </Card>
      </div>
    </div>
  );
}

export default TextCorrectionOverlay;

