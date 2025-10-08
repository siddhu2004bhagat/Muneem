import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { ALL_FORMATS } from '../config/formats.config';
import { LedgerFormat, LedgerFormatId } from '../types/format.types';
import { toast } from 'sonner';

interface SimpleFormatPickerProps {
  currentFormat?: LedgerFormatId;
  onFormatSelect: (formatId: LedgerFormatId) => void;
}

export function SimpleFormatPicker({ currentFormat = 'traditional-khata', onFormatSelect }: SimpleFormatPickerProps) {
  const [selected, setSelected] = useState<LedgerFormatId>(currentFormat);
  const [previewFormat, setPreviewFormat] = useState<LedgerFormat | null>(null);

  const handleSelect = (format: LedgerFormat) => {
    setSelected(format.id);
    onFormatSelect(format.id);
    toast.success(`Selected: ${format.name}`, {
      description: format.nameHindi
    });
  };

  // Show only the most popular/useful formats for regular users
  const simpleFormats = ALL_FORMATS.filter(f => 
    ['traditional-khata', 'cash-book', 'party-ledger'].includes(f.id)
  );

  return (
    <div className="space-y-6">
      {/* Simple Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Choose Your Ledger Format</h2>
        <p className="text-base text-muted-foreground">
          Pick the style that works best for your business
        </p>
      </div>

      {/* Big, Visual Cards - Easy to Click */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {simpleFormats.map((format) => {
          const isSelected = selected === format.id;
          
          return (
            <Card
              key={format.id}
              className={`
                relative p-8 cursor-pointer transition-all transform hover:scale-105
                ${isSelected ? 'ring-4 ring-primary border-primary shadow-2xl scale-105' : 'hover:shadow-xl'}
              `}
              onClick={() => handleSelect(format)}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute -top-3 -right-3 bg-primary text-white rounded-full p-3 shadow-lg">
                  <Check className="w-6 h-6" />
                </div>
              )}

              {/* Big Icon */}
              <div className="text-7xl mb-4 text-center">
                {format.icon}
              </div>

              {/* Names - English First */}
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold mb-1">{format.name}</h3>
                <p className="text-sm text-muted-foreground">{format.nameHindi}</p>
              </div>

              {/* Simple Description */}
              <p className="text-center text-sm text-muted-foreground mb-4 min-h-[60px]">
                {format.description}
              </p>

              {/* Popularity Badge */}
              {format.recommended && (
                <div className="flex items-center justify-center mb-4">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                    ⭐ Recommended
                  </span>
                </div>
              )}

              {/* Select Button */}
              <Button
                className={`w-full ${isSelected ? 'gradient-hero' : ''}`}
                size="lg"
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => handleSelect(format)}
              >
                {isSelected ? '✓ Selected' : 'Select This'}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Show More Options (Collapsed by default) */}
      <details className="max-w-4xl mx-auto">
        <summary className="cursor-pointer text-center text-muted-foreground hover:text-foreground p-4">
          <span className="text-base">More Options</span>
        </summary>
        
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {ALL_FORMATS.filter(f => !simpleFormats.includes(f)).map((format) => {
            const isSelected = selected === format.id;
            
            return (
              <Card
                key={format.id}
                className={`
                  p-6 cursor-pointer transition-all
                  ${isSelected ? 'ring-2 ring-primary border-primary' : ''}
                `}
                onClick={() => handleSelect(format)}
              >
                <div className="text-4xl mb-2 text-center">{format.icon}</div>
                <h4 className="text-lg font-semibold text-center mb-1">{format.name}</h4>
                <p className="text-xs text-muted-foreground text-center mb-3">{format.nameHindi}</p>
                <Button
                  className="w-full"
                  size="sm"
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => handleSelect(format)}
                >
                  {isSelected ? '✓ Selected' : 'Select'}
                </Button>
              </Card>
            );
          })}
        </div>
      </details>

      {/* Simple Instructions */}
      <Card className="max-w-2xl mx-auto p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h4 className="font-semibold text-lg mb-2">How to Use</h4>
            <ul className="space-y-2 text-sm">
              <li>✓ Click on any format card above to select it</li>
              <li>✓ Choose the format that matches your workflow</li>
              <li>✓ You can change it anytime in Settings</li>
            </ul>
            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
              <p><strong>Tip:</strong> Traditional Khata Book is recommended for most businesses.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
