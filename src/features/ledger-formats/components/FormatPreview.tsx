import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LedgerFormat } from '../types/format.types';
import { formatCurrency } from '@/lib/gst';

interface FormatPreviewProps {
  format: LedgerFormat;
}

export function FormatPreview({ format }: FormatPreviewProps) {
  const { template, sampleEntries } = format;

  return (
    <div className="space-y-6">
      {/* Format Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Layout</h4>
          <Badge>{template.layout}</Badge>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Ruling</h4>
          <Badge>{template.ruling}</Badge>
        </div>
      </div>

      {/* Features List */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Features</h4>
        <div className="flex flex-wrap gap-2">
          {format.features.map((feature, index) => (
            <Badge key={index} variant="secondary">
              ✓ {feature}
            </Badge>
          ))}
        </div>
      </div>

      {/* Sample Preview */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Sample Preview</h4>
        <Card 
          className="p-6 overflow-auto"
          style={{ 
            backgroundColor: template.colors.background,
            borderColor: template.colors.lines
          }}
        >
          {/* Ledger Header */}
          <div 
            className="grid gap-2 pb-3 mb-4 font-semibold border-b-2"
            style={{ 
              gridTemplateColumns: template.columns.map(col => `${col.width}%`).join(' '),
              borderColor: template.colors.accent
            }}
          >
            {template.columns.map((column) => (
              <div 
                key={column.id}
                className={`text-sm uppercase tracking-wide ${
                  column.align === 'right' ? 'text-right' : 
                  column.align === 'center' ? 'text-center' : 'text-left'
                }`}
                style={{ color: template.colors.text }}
              >
                {column.label}
                <div className="text-xs font-normal opacity-70">{column.labelHindi}</div>
              </div>
            ))}
          </div>

          {/* Sample Entries */}
          <div className="space-y-3">
            {sampleEntries.map((entry, index) => (
              <div 
                key={index}
                className="grid gap-2 py-2 border-b"
                style={{ 
                  gridTemplateColumns: template.columns.map(col => `${col.width}%`).join(' '),
                  borderColor: template.colors.lines
                }}
              >
                {template.columns.map((column) => {
                  let content = '';
                  
                  switch (column.id) {
                    case 'date':
                      content = entry.date;
                      break;
                    case 'party':
                      content = entry.party || '-';
                      break;
                    case 'details':
                      content = entry.details;
                      break;
                    case 'amount':
                      content = formatCurrency(entry.amount);
                      break;
                    case 'time':
                      content = entry.date;
                      break;
                    case 'type':
                      content = entry.type === 'income' ? 'Sale' : 'Expense';
                      break;
                    case 'jama':
                      content = entry.type === 'income' ? formatCurrency(entry.amount) : '-';
                      break;
                    case 'kharcha':
                      content = entry.type === 'expense' ? formatCurrency(entry.amount) : '-';
                      break;
                    case 'cashIn':
                      content = entry.type === 'income' ? formatCurrency(entry.amount) : '-';
                      break;
                    case 'cashOut':
                      content = entry.type === 'expense' ? formatCurrency(entry.amount) : '-';
                      break;
                    case 'given':
                      content = entry.type === 'income' ? formatCurrency(entry.amount) : '-';
                      break;
                    case 'received':
                      content = entry.type === 'expense' ? formatCurrency(entry.amount) : '-';
                      break;
                    case 'entry':
                      content = `${entry.party || ''} - ${entry.details}`;
                      break;
                    default:
                      content = '-';
                  }
                  
                  return (
                    <div 
                      key={column.id}
                      className={`text-sm ${
                        column.align === 'right' ? 'text-right' : 
                        column.align === 'center' ? 'text-center' : 'text-left'
                      }`}
                      style={{ 
                        color: entry.type === 'income' ? template.colors.income : template.colors.expense
                      }}
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Totals Footer (for some formats) */}
          {['double-entry', 'cash-book'].includes(format.id) && (
            <div 
              className="grid gap-2 pt-4 mt-4 font-semibold border-t-2"
              style={{ 
                gridTemplateColumns: template.columns.map(col => `${col.width}%`).join(' '),
                borderColor: template.colors.accent
              }}
            >
              <div style={{ color: template.colors.text }}>Total:</div>
              {template.layout === 'double' && (
                <>
                  <div className="text-right" style={{ color: template.colors.income }}>
                    {formatCurrency(sampleEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0))}
                  </div>
                  <div className="text-right" style={{ color: template.colors.expense }}>
                    {formatCurrency(sampleEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0))}
                  </div>
                </>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Industries */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Best For</h4>
        <div className="flex flex-wrap gap-2">
          {format.industries.map((industry, index) => (
            <Badge key={index} variant="outline">
              {industry}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
