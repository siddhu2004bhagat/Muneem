import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Eye } from 'lucide-react';
import { LedgerFormat } from '../types/format.types';

interface FormatCardProps {
  format: LedgerFormat;
  selected: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

export function FormatCard({ format, selected, onSelect, onPreview }: FormatCardProps) {
  return (
    <Card 
      className={`
        p-5 cursor-pointer transition-all hover:shadow-lg
        ${selected ? 'ring-2 ring-primary border-primary shadow-md' : 'border-border'}
      `}
      onClick={onSelect}
    >
      {/* Header with Icon and Name */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-4xl">{format.icon}</div>
          <div>
            <h3 className="font-bold text-lg text-foreground">{format.name}</h3>
            <p className="text-sm text-muted-foreground">{format.nameHindi}</p>
          </div>
        </div>
        {selected && (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4">
        {format.description}
      </p>

      {/* Features */}
      <div className="flex flex-wrap gap-2 mb-4">
        {format.features.slice(0, 3).map((feature, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            ✓ {feature}
          </Badge>
        ))}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-4">
        {format.recommended && (
          <Badge variant="default" className="text-xs">
            ⭐ Recommended
          </Badge>
        )}
        <Badge variant="outline" className="text-xs">
          {format.popularity}% popular
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={selected ? "default" : "outline"}
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {selected ? 'Selected' : 'Select'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
