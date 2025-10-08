import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';

export function UPIIntegration() {
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReconcile = async () => {
    if (!upiId || !amount) {
      toast.error('Please enter UPI ID and amount');
      return;
    }

    setLoading(true);
    
    // Simulate UPI transaction reconciliation (stub for MVP)
    setTimeout(() => {
      toast.success(`UPI transaction reconciled: ₹${amount} from ${upiId}`);
      setLoading(false);
      setUpiId('');
      setAmount('');
    }, 1500);
  };

  return (
    <Card className="p-6 shadow-medium gradient-card animate-scale-in hover-lift">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(145_70%_32%)] to-[hsl(145_75%_42%)] shadow-glow">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-[hsl(145_70%_32%)] to-[hsl(40_98%_48%)] bg-clip-text text-transparent">
            UPI Integration
          </h3>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Reconcile UPI payments with ledger entries (Demo mode - PhonePe/GooglePay integration coming soon)
        </p>

        <div className="space-y-3">
          <div>
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              placeholder="merchant@paytm"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="touch-friendly"
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount (₹)</Label>
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

        <Button
          onClick={handleReconcile}
          disabled={loading}
          className="w-full gradient-hero touch-friendly hover-glow hover-scale"
          size="lg"
        >
          {loading ? 'Reconciling...' : 'Reconcile Transaction'}
        </Button>
      </div>
    </Card>
  );
}
