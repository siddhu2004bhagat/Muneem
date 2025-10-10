import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, Info, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConsentModalProps {
  open: boolean;
  onConsent: (granted: boolean) => void;
  title?: string;
  description?: string;
  consentType: 'ocr_telemetry' | 'federated_learning' | 'analytics';
}

const CONSENT_DETAILS = {
  ocr_telemetry: {
    title: 'OCR Telemetry Consent',
    description: 'Help us improve handwriting recognition accuracy',
    whatWeCollect: [
      'Recognized text from your handwriting',
      'Your manual corrections to improve accuracy',
      'Confidence scores and recognition metadata',
      'Device type and screen DPI (for optimization)',
    ],
    whatWeDoNot: [
      'Never upload your data to external servers',
      'Never share your data with third parties',
      'Never use your data for advertising',
    ],
    benefits: [
      'Adaptive learning: System improves as you correct errors',
      'Personalized recognition: Better accuracy over time',
      'Debug capability: Review and export your telemetry data',
    ],
    privacy: 'All data is encrypted with AES-GCM and stored locally on your device only.',
  },
  federated_learning: {
    title: 'Federated Learning Consent',
    description: 'Contribute to improving the OCR model without sharing raw data',
    whatWeCollect: [
      'Model weight updates (encrypted)',
      'Aggregate statistics only',
      'No raw text or handwriting images',
    ],
    whatWeDoNot: [
      'Never access your raw handwriting or text',
      'Never identify individual users',
      'Never store unencrypted data',
    ],
    benefits: [
      'Community benefit: Help improve the model for all users',
      'Better multilingual support (Hindi + English)',
      'Privacy-preserving: Only encrypted updates shared',
    ],
    privacy: 'Uses secure aggregation (AES-GCM + PBKDF2) to protect your privacy. Only encrypted model deltas are shared, never raw data.',
  },
  analytics: {
    title: 'Analytics Consent',
    description: 'Help us understand how you use DigBahi',
    whatWeCollect: [
      'Feature usage statistics',
      'Performance metrics (latency, errors)',
      'Session duration and frequency',
    ],
    whatWeDoNot: [
      'Never track your financial data',
      'Never track your location',
      'Never use cookies or fingerprinting',
    ],
    benefits: [
      'Better features: We focus on what you use most',
      'Bug fixes: We can identify and fix issues faster',
      'Performance: We optimize based on real usage',
    ],
    privacy: 'All analytics are anonymous and aggregated. No personally identifiable information is collected.',
  },
};

export function ConsentModal({
  open,
  onConsent,
  title,
  description,
  consentType,
}: ConsentModalProps) {
  const [understood, setUnderstood] = useState(false);
  const details = CONSENT_DETAILS[consentType];

  const handleAccept = () => {
    onConsent(true);
    setUnderstood(false);
  };

  const handleDecline = () => {
    onConsent(false);
    setUnderstood(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => handleDecline()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-6 h-6 text-blue-600" />
            {title || details.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {description || details.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* What We Collect */}
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Info className="w-4 h-4" />
              What We Collect
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
              {details.whatWeCollect.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          {/* What We Don't Do */}
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-green-600" />
              What We Don't Do
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
              {details.whatWeDoNot.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <h4 className="font-semibold">Benefits to You</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
              {details.benefits.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Privacy Notice */}
          <Alert>
            <Shield className="w-4 h-4" />
            <AlertDescription className="text-sm">
              <strong>Privacy:</strong> {details.privacy}
            </AlertDescription>
          </Alert>

          {/* Consent Checkbox */}
          <div className="flex items-start space-x-2 pt-4 border-t">
            <Checkbox
              id="consent-understand"
              checked={understood}
              onCheckedChange={(checked) => setUnderstood(checked === true)}
            />
            <Label
              htmlFor="consent-understand"
              className="text-sm font-normal leading-relaxed cursor-pointer"
            >
              I understand and consent to the collection and use of this data as described above. I can revoke this consent at any time in Settings.
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleDecline}>
            Decline
          </Button>
          <Button onClick={handleAccept} disabled={!understood}>
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

