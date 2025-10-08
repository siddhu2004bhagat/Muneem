import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { db, LedgerEntry } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { calculateGST, GST_RATES, GSTRate } from '@/lib/gst';
import { toast } from 'sonner';
import { Calendar, FileText, DollarSign, Percent } from 'lucide-react';

interface EntryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function EntryForm({ onSuccess, onCancel }: EntryFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<LedgerEntry['type']>('sale');
  const [gstRate, setGstRate] = useState<GSTRate>(18);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = getCurrentUser();
      if (!user || !user.id) {
        toast.error('User not authenticated');
        return;
      }

      const baseAmount = parseFloat(amount);
      const gstCalc = calculateGST(baseAmount, gstRate);

      const entry: LedgerEntry = {
        date,
        description,
        amount: baseAmount,
        type,
        gstRate,
        gstAmount: gstCalc.gstAmount,
        userId: user.id,
        createdAt: new Date()
      };

      await db.ledger.add(entry);
      toast.success('Entry added successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to add entry');
    } finally {
      setLoading(false);
    }
  };

  const previewGST = amount ? calculateGST(parseFloat(amount) || 0, gstRate) : null;

  return (
    <Card className="p-6 shadow-strong gradient-card animate-scale-in">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-[hsl(145_70%_32%)] to-[hsl(40_98%_48%)] bg-clip-text text-transparent mb-6">
        Add New Entry
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="touch-friendly"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as LedgerEntry['type'])}>
              <SelectTrigger className="touch-friendly">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="receipt">Receipt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Description
          </Label>
          <Input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter transaction details"
            required
            className="touch-friendly"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Amount (₹)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="touch-friendly"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gstRate" className="flex items-center gap-2">
              <Percent className="w-4 h-4" />
              GST Rate
            </Label>
            <Select value={gstRate.toString()} onValueChange={(v) => setGstRate(parseInt(v) as GSTRate)}>
              <SelectTrigger className="touch-friendly">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GST_RATES.map(rate => (
                  <SelectItem key={rate} value={rate.toString()}>{rate}%</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {previewGST && (
          <Card className="p-4 bg-gradient-to-br from-[hsl(145_70%_32%_/_0.1)] to-[hsl(40_98%_48%_/_0.1)] border-primary/30 animate-fade-in shadow-glow">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Amount:</span>
                <span className="font-medium">₹{previewGST.baseAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST ({previewGST.gstRate}%):</span>
                <span className="font-medium">₹{previewGST.gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-primary/20 pt-2 mt-2">
                <span className="font-bold">Total Amount:</span>
                <span className="font-bold text-primary animate-pulse-glow">₹{previewGST.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 gradient-hero touch-friendly hover-glow hover-scale"
            size="lg"
          >
            {loading ? 'Saving...' : 'Save Entry'}
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1 touch-friendly hover-lift"
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
