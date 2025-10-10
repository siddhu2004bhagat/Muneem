import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { TemplateId, getTemplateThumbnail } from '../../templates';

interface TemplatePickerProps {
  currentTemplateId: TemplateId;
  onSelect: (templateId: TemplateId) => void;
  onClose?: () => void;
}

const TEMPLATES: Array<{ id: TemplateId; name: string; description: string }> = [
  { id: 'blank', name: 'Blank', description: 'Clean canvas with subtle paper texture' },
  { id: 'lined', name: 'Lined', description: 'Horizontal ruled lines for writing' },
  { id: 'columnar', name: 'Columnar', description: 'Columns for Date, Party, Amount, Notes' },
];

/**
 * TemplatePicker Component
 * 
 * Displays template options with thumbnails and allows selection.
 * Used in NotebookNav to change the current page's template.
 */
export const TemplatePicker: React.FC<TemplatePickerProps> = ({
  currentTemplateId,
  onSelect,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState<TemplateId>(currentTemplateId);
  const [thumbnails] = useState<Map<TemplateId, HTMLCanvasElement>>(() => {
    const map = new Map<TemplateId, HTMLCanvasElement>();
    TEMPLATES.forEach(template => {
      const thumbnail = getTemplateThumbnail(template.id, 120, 160);
      map.set(template.id, thumbnail);
    });
    return map;
  });

  const handleSelect = (templateId: TemplateId) => {
    setSelectedId(templateId);
    onSelect(templateId);
    onClose?.();
  };

  return (
    <div className="p-4 space-y-4 max-w-md">
      <div>
        <h3 className="text-lg font-semibold mb-1">Choose Template</h3>
        <p className="text-sm text-muted-foreground">
          Select a template for your page
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {TEMPLATES.map(template => {
          const isSelected = selectedId === template.id;
          const thumbnail = thumbnails.get(template.id);

          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSelect(template.id)}
            >
              <CardContent className="p-2">
                <div className="relative mb-2">
                  {/* Thumbnail preview */}
                  <div className="w-full aspect-[3/4] bg-muted rounded overflow-hidden flex items-center justify-center">
                    {thumbnail ? (
                      <canvas
                        ref={node => {
                          if (node && thumbnail) {
                            const ctx = node.getContext('2d');
                            if (ctx) {
                              node.width = thumbnail.width;
                              node.height = thumbnail.height;
                              ctx.drawImage(thumbnail, 0, 0);
                            }
                          }
                        }}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-muted-foreground text-xs">Loading...</div>
                    )}
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Template info */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-center">{template.name}</p>
                  <p className="text-[10px] text-muted-foreground text-center leading-tight">
                    {template.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {onClose && (
        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

export default TemplatePicker;

