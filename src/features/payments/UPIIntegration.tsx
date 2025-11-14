import { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { CreditCard, Copy, ExternalLink, QrCode, CheckCircle, Clock } from 'lucide-react';

// Lazy load QR component
const UPIQRCode = lazy(() => import('./components/UPIQRCode'));
import { 
  createUPIIntent, 
  generateUPIIntentLink, 
  validateUPIId, 
  formatAmount,
  formatUPIIdForDisplay,
  enqueueReconcileRequest
} from './services/upi.service';
import { 
  saveUPIIntent, 
  updateUPIIntentStatus, 
  listUPIIntents 
} from '@/lib/db';
import type { UPIIntent } from './types/upi.types';
import { addEntry } from '@/services/ledger.service';
import { UPIList } from './UPIList';
import { scheduleUPIAutoSync, stopUPIAutoSync } from './services/upi-autosync.service';
import { ENABLE_UPI_AUTOSYNC } from './constants/upi-flags';

type UPIState = 'form' | 'generated' | 'completed';

export function UPIIntegration() {
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [payerName, setPayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<UPIState>('form');
  const [currentIntent, setCurrentIntent] = useState<UPIIntent | null>(null);
  const [upiIntents, setUpiIntents] = useState<UPIIntent[]>([]);

  // Load existing UPI intents
  useEffect(() => {
    loadUPIIntents();
  }, []);

  // AutoSync integration - background only, no UI changes
  useEffect(() => {
    if (ENABLE_UPI_AUTOSYNC) {
      scheduleUPIAutoSync(); // 60s default
    }
    return () => {
      stopUPIAutoSync();
    };
  }, []);

  const loadUPIIntents = async () => {
    try {
      const intents = await listUPIIntents();
      setUpiIntents(intents);
    } catch (error) {
      console.error('Failed to load UPI intents:', error);
    }
  };

  const handleGenerateUPILink = async () => {
    // Validate inputs
    if (!upiId || !amount) {
      toast.error('Please enter UPI ID and amount');
      return;
    }

    const validation = validateUPIId(upiId);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      // Create UPI intent
      const intent = createUPIIntent({
        upiId: upiId.trim(),
        amount: amountNum,
        note: note.trim() || undefined,
        payerName: payerName.trim() || undefined
      });

      // Save to IndexedDB
      await saveUPIIntent(intent);
      
      setCurrentIntent(intent);
      setState('generated');
      await loadUPIIntents();
      
      toast.success('UPI payment link generated!');
    } catch (error) {
      console.error('Failed to generate UPI link:', error);
      toast.error('Failed to generate UPI link');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUPIApp = () => {
    if (!currentIntent) return;
    
    const linkData = generateUPIIntentLink(currentIntent);
    window.location.href = linkData.link;
    
    // Update status to initiated
    updateUPIIntentStatus(currentIntent.id, 'initiated');
    toast.info('Opening UPI app... Complete payment and return to mark as paid.');
  };

  const handleCopyLink = async () => {
    if (!currentIntent) return;
    
    const linkData = generateUPIIntentLink(currentIntent);
    await navigator.clipboard.writeText(linkData.link);
    toast.success('UPI link copied to clipboard!');
  };

  const handleMarkAsPaid = async () => {
    if (!currentIntent) return;

    setLoading(true);

    try {
      // Update UPI intent status
      await updateUPIIntentStatus(currentIntent.id, 'reconciled');

      // Create ledger entry
      await addEntry({
        date: new Date().toISOString().split('T')[0],
        description: `UPI Payment from ${formatUPIIdForDisplay(currentIntent.upiId)}${currentIntent.note ? ` - ${currentIntent.note}` : ''}`,
        amount: currentIntent.amount,
        type: 'receipt'
      });

      // Enqueue for backend sync
      await enqueueReconcileRequest(currentIntent);

      setState('completed');
      await loadUPIIntents();
      
      toast.success(`UPI payment recorded: ${formatAmount(currentIntent.amount)} (manual reconciliation)`);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setState('form');
        setCurrentIntent(null);
        setUpiId('');
        setAmount('');
        setNote('');
        setPayerName('');
      }, 2000);
    } catch (error) {
      console.error('Failed to mark as paid:', error);
      toast.error('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setState('form');
    setCurrentIntent(null);
    setUpiId('');
    setAmount('');
    setNote('');
    setPayerName('');
  };

  return (
    <div className="space-y-6">
      {/* Main UPI Form */}
      <Card className="p-6 shadow-medium gradient-card animate-scale-in hover-lift">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(145_70%_32%)] to-[hsl(145_75%_42%)] shadow-glow">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-[hsl(145_70%_32%)] to-[hsl(40_98%_48%)] bg-clip-text text-transparent">
              UPI Payment (Reconcile-Only)
            </h3>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Generate UPI payment links and manually reconcile payments. No real payment processing yet.
          </p>

          {/* Step A: Form */}
          {state === 'form' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="upiId">UPI ID *</Label>
                  <Input
                    id="upiId"
                    placeholder="merchant@paytm"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="touch-friendly"
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="1000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="touch-friendly"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="payerName">Payer Name (Optional)</Label>
                <Input
                  id="payerName"
                  placeholder="Customer Name"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  className="touch-friendly"
                />
              </div>

              <div>
                <Label htmlFor="note">Payment Note (Optional)</Label>
                <Textarea
                  id="note"
                  placeholder="Payment for invoice #12345"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="touch-friendly"
                  rows={2}
                />
              </div>

              <Button
                onClick={handleGenerateUPILink}
                disabled={loading}
                className="w-full gradient-hero touch-friendly hover-glow hover-scale"
                size="lg"
              >
                {loading ? 'Generating...' : 'Generate UPI Link'}
              </Button>
            </div>
          )}

          {/* Step B: Generated Link */}
          {state === 'generated' && currentIntent && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200">UPI Link Generated</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Transaction Reference: <code className="bg-green-100 dark:bg-green-800 px-1 rounded">{currentIntent.txnRef}</code>
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    onClick={handleOpenUPIApp}
                    className="flex-1 gradient-hero touch-friendly hover-glow"
                    size="lg"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in UPI App
                  </Button>
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="touch-friendly"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-center">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3">Scan this QR to pay via any UPI app</p>
                    <Suspense fallback={<div className="flex items-center justify-center h-48"><QrCode className="w-16 h-16 text-gray-400 animate-pulse" /></div>}>
                      <UPIQRCode link={generateUPIIntentLink(currentIntent).link} refId={currentIntent.txnRef} />
                    </Suspense>
                    <p className="text-xs text-gray-400 mt-2">TxnRef: {currentIntent.txnRef}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  After completing payment in your UPI app, return here and mark as paid.
                </p>
                <Button
                  onClick={handleMarkAsPaid}
                  disabled={loading}
                  className="gradient-hero touch-friendly hover-glow"
                  size="lg"
                >
                  {loading ? 'Recording...' : 'Mark as Paid'}
                </Button>
              </div>
            </div>
          )}

          {/* Step C: Completed */}
          {state === 'completed' && (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-green-800 dark:text-green-200">Payment Recorded!</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  UPI payment has been reconciled and added to ledger.
                </p>
              </div>
              <Button
                onClick={handleReset}
                variant="outline"
                className="touch-friendly"
              >
                Create Another Payment
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Disclaimer */}
      <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-yellow-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800 dark:text-yellow-200">Manual Reconciliation</p>
            <p className="text-yellow-700 dark:text-yellow-300">
              This is manual reconciliation only. No bank verification or real-time payment processing yet.
            </p>
          </div>
        </div>
      </Card>

      {/* UPI History */}
      <UPIList onRefresh={loadUPIIntents} />
    </div>
  );
}
