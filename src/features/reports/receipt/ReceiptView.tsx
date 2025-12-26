import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { formatCurrency, formatDate } from '@/lib/gst';

export function ReceiptView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const autoPrint = searchParams.get('autoprint') === 'true';

  const entry = useLiveQuery(async () => {
    if (!id) return null;
    if (id === 'demo') {
      return {
        id: 12345,
        date: new Date(),
        type: 'SALE',
        description: 'Demo Transaction Items',
        amount: 500,
        gstAmount: 25,
        gstRate: 5,
        partyName: 'Cash Sale'
      };
    }
    return await db.ledger.get(parseInt(id));
  }, [id]);

  useEffect(() => {
    if (entry && autoPrint) {
      // Small delay to ensure render
      setTimeout(() => {
        window.print();
        // Optional: window.close(); // Uncomment if you want to auto-close
      }, 500);
    }
  }, [entry, autoPrint]);

  if (!entry) return <div>Loading receipt...</div>;

  return (
    <div className="receipt-container font-mono text-xs text-black bg-white p-2 max-w-[58mm] mx-auto">
      {/* Print Styles */}
      <style>{`
        @media print {
          @page { margin: 0; size: 58mm auto; }
          body { margin: 0; padding: 0; background: white; }
          .no-print { display: none; }
          .receipt-container { 
            width: 100%; 
            max-width: 58mm; 
            margin: 0; 
            padding: 2mm;
            border: none;
          }
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-4 border-b border-black pb-2 border-dashed">
        <h1 className="text-base font-bold uppercase">MUNEEM</h1>
        <p className="text-[10px]">Professional Accounting</p>
        <p className="text-[10px] mt-1">Ph: +91 98765 43210</p>
      </div>

      {/* Transaction Details */}
      <div className="mb-2 space-y-1">
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{formatDate(entry.date)}</span>
        </div>
        <div className="flex justify-between">
          <span>Rcpt #:</span>
          <span>TRX-{entry.id}</span>
        </div>
        <div className="flex justify-between">
          <span>Type:</span>
          <span className="uppercase font-bold">{entry.type}</span>
        </div>
      </div>

      <div className="border-b border-black border-dashed my-2"></div>

      {/* Items (Mocked since we store flat entries mostly, but structure is here) */}
      <div className="mb-2">
        <div className="font-bold mb-1">{entry.description}</div>
        {/* If we had sub-items, loop here. For now, showing breakdown */}
        <div className="flex justify-between pl-2 text-[10px]">
          <span>Amount</span>
          <span>{formatCurrency(entry.amount)}</span>
        </div>
        {entry.gstAmount > 0 && (
          <div className="flex justify-between pl-2 text-[10px]">
            <span>GST ({entry.gstRate}%)</span>
            <span>{formatCurrency(entry.gstAmount)}</span>
          </div>
        )}
      </div>

      <div className="border-b border-black border-dashed my-2"></div>

      {/* Total */}
      <div className="flex justify-between font-bold text-sm mb-4">
        <span>TOTAL</span>
        <span>{formatCurrency(entry.amount + entry.gstAmount)}</span>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] space-y-1">
        <p>Thank you for your business!</p>
        <p className="text-[8px] text-gray-500">Powred by DigBahi</p>
      </div>

      <div className="no-print mt-4 text-center">
        <button
          onClick={() => window.print()}
          className="bg-black text-white px-4 py-2 rounded text-xs"
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
}
