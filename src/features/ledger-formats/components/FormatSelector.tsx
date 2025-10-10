import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Store, Utensils, Factory, Briefcase, Hammer, Package } from 'lucide-react';
import { FormatCard } from './FormatCard';
import { FormatPreview } from './FormatPreview';
import { ALL_FORMATS, getRecommendedFormats } from '../config/formats.config';
import { LedgerFormat, LedgerFormatId, IndustryType } from '../types/format.types';

interface FormatSelectorProps {
  currentFormat?: LedgerFormatId;
  onFormatSelect: (formatId: LedgerFormatId) => void;
  onClose?: () => void;
}

const INDUSTRIES = [
  { id: 'retail', name: 'Retail Shop', nameHindi: 'खुदरा दुकान', icon: Store },
  { id: 'restaurant', name: 'Restaurant/Hotel', nameHindi: 'रेस्टोरेंट/होटल', icon: Utensils },
  { id: 'manufacturing', name: 'Manufacturing', nameHindi: 'विनिर्माण', icon: Factory },
  { id: 'services', name: 'Services', nameHindi: 'सेवाएं', icon: Briefcase },
  { id: 'contractor', name: 'Contractor', nameHindi: 'ठेकेदार', icon: Hammer },
  { id: 'wholesale', name: 'Wholesale', nameHindi: 'थोक', icon: Package },
];

export function FormatSelector({ currentFormat, onFormatSelect, onClose }: FormatSelectorProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>('retail');
  const [selectedFormat, setSelectedFormat] = useState<LedgerFormatId>(currentFormat || 'traditional-khata');
  const [previewFormat, setPreviewFormat] = useState<LedgerFormat | null>(null);
  const [step, setStep] = useState<'industry' | 'format' | 'customize'>(
    currentFormat ? 'format' : 'industry'
  );

  const recommendedFormats = getRecommendedFormats(selectedIndustry);

  const handleIndustrySelect = (industry: IndustryType) => {
    setSelectedIndustry(industry);
    setStep('format');
  };

  const handleFormatSelect = (formatId: LedgerFormatId) => {
    setSelectedFormat(formatId);
  };

  const handleConfirm = () => {
    onFormatSelect(selectedFormat);
    if (onClose) onClose();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-3xl font-bold text-foreground mb-2">Choose Your Ledger Format</h2>
          <p className="text-muted-foreground">
            Select the format that feels most comfortable for your business
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            अपने व्यवसाय के लिए सबसे आरामदायक प्रारूप चुनें
          </p>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center space-x-2">
          <Badge variant={step === 'industry' ? 'default' : 'outline'}>1. Industry</Badge>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <Badge variant={step === 'format' ? 'default' : 'outline'}>2. Format</Badge>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <Badge variant={step === 'customize' ? 'default' : 'outline'}>3. Customize</Badge>
        </div>

        <Tabs value={step} onValueChange={(value) => setStep(value as 'industry' | 'format' | 'customize')}>
          {/* Step 1: Industry Selection */}
          <TabsContent value="industry" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">What type of business do you have?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                आपका व्यवसाय किस प्रकार का है?
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {INDUSTRIES.map((industry) => {
                  const Icon = industry.icon;
                  return (
                    <Card
                      key={industry.id}
                      className={`
                        p-4 cursor-pointer transition-all hover:shadow-md
                        ${selectedIndustry === industry.id ? 'ring-2 ring-primary border-primary' : ''}
                      `}
                      onClick={() => handleIndustrySelect(industry.id as IndustryType)}
                    >
                      <Icon className="w-8 h-8 mb-2 text-primary" />
                      <h4 className="font-semibold text-sm">{industry.name}</h4>
                      <p className="text-xs text-muted-foreground">{industry.nameHindi}</p>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={() => setStep('format')}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Step 2: Format Selection */}
          <TabsContent value="format" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">Select Your Ledger Format</h3>
                  <p className="text-sm text-muted-foreground">
                    Recommended for {INDUSTRIES.find(i => i.id === selectedIndustry)?.name}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep('industry')}>
                  Change Industry
                </Button>
              </div>

              {/* Recommended Formats First */}
              {recommendedFormats.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    ⭐ Recommended for you
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {recommendedFormats.slice(0, 2).map((format) => (
                      <FormatCard
                        key={format.id}
                        format={format}
                        selected={selectedFormat === format.id}
                        onSelect={() => handleFormatSelect(format.id)}
                        onPreview={() => setPreviewFormat(format)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Formats */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  All formats
                </h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ALL_FORMATS.map((format) => (
                    <FormatCard
                      key={format.id}
                      format={format}
                      selected={selectedFormat === format.id}
                      onSelect={() => handleFormatSelect(format.id)}
                      onPreview={() => setPreviewFormat(format)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep('industry')}>
                  Back
                </Button>
                <Button onClick={handleConfirm}>
                  Confirm & Start Using
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewFormat} onOpenChange={() => setPreviewFormat(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span className="text-2xl">{previewFormat?.icon}</span>
              <span>{previewFormat?.name}</span>
            </DialogTitle>
            <DialogDescription>
              {previewFormat?.description}
            </DialogDescription>
          </DialogHeader>
          {previewFormat && <FormatPreview format={previewFormat} />}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setPreviewFormat(null)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                if (previewFormat) {
                  handleFormatSelect(previewFormat.id);
                  setPreviewFormat(null);
                }
              }}
            >
              Use This Format
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
