/**
 * OCR Results Toast
 * 
 * Small ephemeral notification showing OCR recognition summary.
 * Provides quick action to open correction overlay.
 * 
 * Features:
 * - Shows count and average confidence
 * - Action button to open corrections
 * - Auto-dismiss after delay
 * - Positioned at top-right
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OCRResultsSummary {
  count: number;
  averageConfidence: number;
  hasLowConfidence: boolean; // Any result < 0.6
}

interface OCRResultsToastProps {
  summary: OCRResultsSummary;
  onOpenCorrections: () => void;
  onDismiss: () => void;
  autoDismissMs?: number; // Auto-dismiss after this many ms (0 = no auto-dismiss)
}

export function OCRResultsToast({
  summary,
  onOpenCorrections,
  onDismiss,
  autoDismissMs = 5000
}: OCRResultsToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onDismiss(), 200); // Wait for fade animation
  }, [onDismiss]);

  useEffect(() => {
    if (autoDismissMs > 0) {
      // Progress bar countdown
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (autoDismissMs / 100));
          if (newProgress <= 0) {
            clearInterval(interval);
            handleDismiss();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [autoDismissMs, handleDismiss]);

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="w-5 h-5 text-green-600" />;
    return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
      <Card className="p-4 bg-white dark:bg-gray-900 shadow-xl min-w-[320px] max-w-[400px] relative overflow-hidden">
        {/* Progress bar */}
        {autoDismissMs > 0 && (
          <div 
            className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        )}

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {getConfidenceIcon(summary.averageConfidence)}
          <div className="flex-1">
            <h3 className="font-semibold text-sm">
              OCR Recognition Complete
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {summary.count} text box{summary.count !== 1 ? 'es' : ''} detected
            </p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="flex items-center gap-3 mb-3 pl-8">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Confidence:</span>
            <Badge 
              variant="outline"
              className={cn(
                "text-xs font-semibold",
                getConfidenceColor(summary.averageConfidence)
              )}
            >
              {Math.round(summary.averageConfidence * 100)}%
            </Badge>
          </div>

          {summary.hasLowConfidence && (
            <Badge variant="outline" className="text-xs text-yellow-600">
              Some low confidence
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pl-8">
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenCorrections}
            className="flex-1 gap-2"
          >
            <Edit className="w-3 h-3" />
            Review & Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
          >
            Accept
          </Button>
        </div>

        {/* Tip */}
        {summary.hasLowConfidence && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 pl-8">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> Review low-confidence results to improve accuracy
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default OCRResultsToast;

