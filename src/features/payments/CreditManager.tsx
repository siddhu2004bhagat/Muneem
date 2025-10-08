import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserCheck } from 'lucide-react';

interface CreditEntry {
  id: number;
  customerName: string;
  amount: number;
  date: string;
  status: 'pending' | 'paid';
  otpVerified: boolean;
}

export function CreditManager() {
  const [entries, setEntries] = useState<CreditEntry[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);

  useEffect(() => {
    // Load mock credit entries
    const mockEntries: CreditEntry[] = [
      { id: 1, customerName: 'Rajesh Kumar', amount: 5000, date: '2025-09-25', status: 'pending', otpVerified: true },
      { id: 2, customerName: 'Priya Sharma', amount: 3500, date: '2025-09-28', status: 'paid', otpVerified: true },
    ];
    setEntries(mockEntries);
  }, []);

  const handleRequestOTP = () => {
    if (!customerName || !amount) {
      toast.error('Please enter customer name and amount');
      return;
    }
    
    // Simulate OTP request (Web OTP API stub)
    setShowOTP(true);
    toast.success('OTP sent to customer (Demo mode)');
  };

  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    // Simulate OTP verification
    const newEntry: CreditEntry = {
      id: entries.length + 1,
      customerName,
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      otpVerified: true
    };

    setEntries([...entries, newEntry]);
    toast.success('Credit sale recorded with customer consent');
    
    // Reset form
    setCustomerName('');
    setAmount('');
    setOtp('');
    setShowOTP(false);
  };

  const handleMarkPaid = (id: number) => {
    setEntries(entries.map(e => 
      e.id === id ? { ...e, status: 'paid' as const } : e
    ));
    toast.success('Payment recorded');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="p-6 shadow-medium gradient-card animate-scale-in hover-lift">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(145_70%_32%)] to-[hsl(145_75%_42%)] shadow-glow">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-[hsl(145_70%_32%)] to-[hsl(40_98%_48%)] bg-clip-text text-transparent">
              Credit Management
            </h3>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Track credit sales with OTP-based customer consent
          </p>

          <div className="space-y-3">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="touch-friendly"
                disabled={showOTP}
              />
            </div>

            <div>
              <Label htmlFor="creditAmount">Credit Amount (₹)</Label>
              <Input
                id="creditAmount"
                type="number"
                placeholder="5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="touch-friendly"
                disabled={showOTP}
              />
            </div>

            {!showOTP ? (
              <Button
                onClick={handleRequestOTP}
                className="w-full gradient-hero touch-friendly hover-glow hover-scale"
                size="lg"
              >
                Request Customer OTP
              </Button>
            ) : (
              <>
                <div>
                  <Label htmlFor="otp">Customer OTP</Label>
                  <Input
                    id="otp"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="touch-friendly"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleVerifyOTP}
                    className="flex-1 gradient-hero touch-friendly hover-glow hover-scale"
                    size="lg"
                  >
                    Verify & Record
                  </Button>
                  <Button
                    onClick={() => setShowOTP(false)}
                    variant="outline"
                    className="flex-1 touch-friendly hover-lift"
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-medium gradient-card animate-slide-in hover-lift">
        <h4 className="text-lg font-bold mb-4 bg-gradient-to-r from-[hsl(145_70%_32%)] to-[hsl(40_98%_48%)] bg-clip-text text-transparent">
          Credit Ledger
        </h4>
        <div className="border rounded-lg overflow-hidden shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.customerName}</TableCell>
                  <TableCell>₹{entry.amount.toFixed(2)}</TableCell>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>
                    <Badge className={entry.status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>
                      {entry.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {entry.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkPaid(entry.id)}
                        className="touch-friendly hover-scale gradient-hero"
                      >
                        Mark Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
