import { useState, useEffect } from 'react';
import { db, LedgerEntry } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/gst';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { LedgerFormatId, getFormatById } from '@/features/ledger-formats';

interface LedgerTableProps {
  onAddEntry: () => void;
  refresh: number;
}

export function LedgerTable({ onAddEntry, refresh }: LedgerTableProps) {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get selected format from localStorage
  const selectedFormatId = (localStorage.getItem('digbahi_format') || 'traditional-khata') as LedgerFormatId;
  const format = getFormatById(selectedFormatId);

  useEffect(() => {
    loadEntries();
  }, [refresh]);

  async function loadEntries() {
    try {
      const allEntries = await db.ledger.orderBy('date').reverse().toArray();
      setEntries(allEntries);
    } catch (error) {
      toast.error('Failed to load ledger entries');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number | undefined) {
    if (!id) return;
    
    if (confirm('Delete this entry?')) {
      try {
        await db.ledger.delete(id);
        await loadEntries();
        toast.success('Entry deleted');
      } catch (error) {
        toast.error('Failed to delete entry');
      }
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-success/10 text-success';
      case 'purchase': return 'bg-info/10 text-info';
      case 'expense': return 'bg-destructive/10 text-destructive';
      case 'receipt': return 'bg-accent/10 text-accent';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading ledger...</div>;
  }

  // Render table based on format
  const renderFormatTable = () => {
    if (!format) return renderDefaultTable();
    
    switch (format.id) {
      case 'cash-book':
        return renderCashBookTable();
      case 'double-entry':
        return renderDoubleEntryTable();
      case 'party-ledger':
        return renderPartyLedgerTable();
      default:
        return renderTraditionalTable();
    }
  };

  const renderTraditionalTable = () => (
    <div className="border rounded-lg shadow-md overflow-hidden bg-[#fefce8]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b-2 border-amber-200">
            <TableHead className="font-bold text-gray-800">Date</TableHead>
            <TableHead className="font-bold text-gray-800">Party Name</TableHead>
            <TableHead className="font-bold text-gray-800">Details</TableHead>
            <TableHead className="text-right font-bold text-gray-800">Amount</TableHead>
            <TableHead className="text-right font-bold text-gray-800">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, idx) => (
            <TableRow key={entry.id} className="border-b border-amber-100 hover:bg-amber-50/50">
              <TableCell className="font-mono">{formatDate(entry.date)}</TableCell>
              <TableCell className="font-medium">{entry.partyName || '-'}</TableCell>
              <TableCell>{entry.description}</TableCell>
              <TableCell className="text-right font-semibold" style={{ color: entry.type === 'sale' || entry.type === 'receipt' ? '#059669' : '#dc2626' }}>
                {formatCurrency(entry.amount + entry.gstAmount)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Edit className="w-3 h-3" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(entry.id)} className="h-7 w-7 p-0 text-destructive"><Trash2 className="w-3 h-3" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderCashBookTable = () => {
    const totalIn = entries.filter(e => e.type === 'sale' || e.type === 'receipt').reduce((sum, e) => sum + e.amount + e.gstAmount, 0);
    const totalOut = entries.filter(e => e.type === 'purchase' || e.type === 'expense').reduce((sum, e) => sum + e.amount + e.gstAmount, 0);
    
    return (
      <div className="border rounded-lg shadow-md overflow-hidden bg-[#fffbeb]">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 border-b-2 border-orange-200">
          <div className="flex justify-between text-sm font-semibold">
            <span>Opening Balance: {formatCurrency(0)}</span>
            <span>Closing Balance: {formatCurrency(totalIn - totalOut)}</span>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-orange-50 to-amber-50">
              <TableHead className="font-bold text-gray-800 w-1/5">Date</TableHead>
              <TableHead className="font-bold text-gray-800 w-2/5">Cash In (Receipt)</TableHead>
              <TableHead className="font-bold text-gray-800 w-2/5">Cash Out (Payment)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map(entry => (
              <TableRow key={entry.id} className="border-b border-orange-100">
                <TableCell className="font-mono">{formatDate(entry.date)}</TableCell>
                <TableCell className="text-green-700 font-semibold">
                  {(entry.type === 'sale' || entry.type === 'receipt') ? formatCurrency(entry.amount + entry.gstAmount) : '-'}
                </TableCell>
                <TableCell className="text-red-700 font-semibold">
                  {(entry.type === 'purchase' || entry.type === 'expense') ? formatCurrency(entry.amount + entry.gstAmount) : '-'}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-orange-100 font-bold">
              <TableCell>Total:</TableCell>
              <TableCell className="text-green-700">{formatCurrency(totalIn)}</TableCell>
              <TableCell className="text-red-700">{formatCurrency(totalOut)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderDoubleEntryTable = () => {
    const totalDebit = entries.filter(e => e.type === 'purchase' || e.type === 'expense').reduce((sum, e) => sum + e.amount + e.gstAmount, 0);
    const totalCredit = entries.filter(e => e.type === 'sale' || e.type === 'receipt').reduce((sum, e) => sum + e.amount + e.gstAmount, 0);
    
    return (
      <div className="border rounded-lg shadow-md overflow-hidden bg-[#f0fdf4]">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
              <TableHead className="font-bold text-gray-800">Date</TableHead>
              <TableHead className="font-bold text-gray-800 text-right">Jama (Credit)</TableHead>
              <TableHead className="font-bold text-gray-800 text-right">Kharcha (Debit)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map(entry => (
              <TableRow key={entry.id} className="border-b border-green-100">
                <TableCell className="font-mono">{formatDate(entry.date)}<br/><span className="text-xs text-gray-500">{entry.description}</span></TableCell>
                <TableCell className="text-right text-green-700 font-semibold">
                  {(entry.type === 'sale' || entry.type === 'receipt') ? formatCurrency(entry.amount + entry.gstAmount) : '-'}
                </TableCell>
                <TableCell className="text-right text-red-700 font-semibold">
                  {(entry.type === 'purchase' || entry.type === 'expense') ? formatCurrency(entry.amount + entry.gstAmount) : '-'}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-green-100 font-bold border-t-2 border-green-300">
              <TableCell>Total:</TableCell>
              <TableCell className="text-right text-green-700">{formatCurrency(totalCredit)}</TableCell>
              <TableCell className="text-right text-red-700">{formatCurrency(totalDebit)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderPartyLedgerTable = () => (
    <div className="border rounded-lg shadow-md overflow-hidden bg-[#f0f9ff]">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200">
            <TableHead className="font-bold text-gray-800">Date</TableHead>
            <TableHead className="font-bold text-gray-800">Party Name</TableHead>
            <TableHead className="font-bold text-gray-800 text-right">Given (Sale)</TableHead>
            <TableHead className="font-bold text-gray-800 text-right">Received (Payment)</TableHead>
            <TableHead className="font-bold text-gray-800 text-right">Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, idx) => {
            const prevBalance = entries.slice(0, idx).reduce((sum, e) => {
              if (e.type === 'sale') return sum + e.amount + e.gstAmount;
              if (e.type === 'receipt') return sum - (e.amount + e.gstAmount);
              return sum;
            }, 0);
            const currentBalance = prevBalance + (entry.type === 'sale' ? entry.amount + entry.gstAmount : -(entry.amount + entry.gstAmount));
            
            return (
              <TableRow key={entry.id} className="border-b border-blue-100">
                <TableCell className="font-mono">{formatDate(entry.date)}</TableCell>
                <TableCell className="font-medium">{entry.partyName || '-'}</TableCell>
                <TableCell className="text-right text-orange-600 font-semibold">
                  {entry.type === 'sale' ? formatCurrency(entry.amount + entry.gstAmount) : '-'}
                </TableCell>
                <TableCell className="text-right text-green-600 font-semibold">
                  {entry.type === 'receipt' ? formatCurrency(entry.amount + entry.gstAmount) : '-'}
                </TableCell>
                <TableCell className="text-right font-bold" style={{ color: currentBalance > 0 ? '#ea580c' : '#16a34a' }}>
                  {formatCurrency(Math.abs(currentBalance))} {currentBalance > 0 ? '(Due)' : '(Advance)'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  const renderDefaultTable = () => renderTraditionalTable();

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[hsl(145_70%_32%)] to-[hsl(40_98%_48%)] bg-clip-text text-transparent">
            Ledger Entries
          </h2>
          {format && (
            <p className="text-sm text-muted-foreground mt-1">
              {format.icon} {format.name} Format
            </p>
          )}
        </div>
        <Button onClick={onAddEntry} className="gradient-hero touch-friendly hover-glow hover-scale">
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card className="p-8 text-center gradient-card shadow-medium animate-scale-in">
          <p className="text-muted-foreground mb-4">No entries yet. Create your first transaction!</p>
          <Button onClick={onAddEntry} variant="outline" className="hover-lift">
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </Card>
      ) : (
        renderFormatTable()
      )}
    </div>
  );
}
