import { useState, useEffect, useMemo } from 'react';
import { generateGSTR1, generateGSTR3B, isHeuristicMode } from './services/gst.service';
import type { GSTR1Row, GSTR3BSummary } from './types/gst.types';

export default function GSTReports() {
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [gstr1, setGstr1] = useState<GSTR1Row[]>([]);
  const [gstr3b, setGstr3b] = useState<GSTR3BSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(null);
    (async () => {
      try {
        const [r1, r3] = await Promise.all([generateGSTR1(period), generateGSTR3B(period)]);
        if (active) { setGstr1(r1); setGstr3b(r3); }
      } catch (err: unknown) {
        console.error('[GST] Load failed:', err);
        if (active) setError((err as Error).message || 'Failed to load');
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [period]);

  const totalLiability = useMemo(() => gstr3b?.netGSTLiability ?? 0, [gstr3b]);

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">GST Reports</h2>
        <input
          type="month"
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="border rounded px-3 py-1"
        />
      </div>

      {isHeuristicMode(gstr1) && (
        <div className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-1 rounded">
          ⚠️ Some entries lack GST fields — values estimated.
        </div>
      )}
      <p className="text-[11px] text-gray-400 mt-1">All amounts rounded to 2 decimals.</p>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {gstr3b && (
        <div className="border rounded-lg p-3 bg-white shadow-sm">
          <h3 className="font-medium mb-2">GSTR-3B Summary ({period})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <div>Outward Taxable: ₹{gstr3b.outwardTaxable.toFixed(2)}</div>
            <div>Outward GST: ₹{gstr3b.outwardGST.toFixed(2)}</div>
            <div>Inward Taxable: ₹{gstr3b.inwardTaxable.toFixed(2)}</div>
            <div>Inward GST: ₹{gstr3b.inwardGST.toFixed(2)}</div>
            <div className="text-blue-600 font-medium col-span-2 md:col-span-1">
              Net Liability: ₹{totalLiability.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      <div className="border rounded-lg p-3 bg-white shadow-sm overflow-x-auto">
        <h3 className="font-medium mb-3">GSTR-1 (Sales)</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : gstr1.length > 0 ? (
          <table className="w-full text-sm border">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-right">Rate</th>
                <th className="p-2 text-right">Taxable</th>
                <th className="p-2 text-right">GST</th>
                <th className="p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {gstr1.map((e, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{e.invoiceDate}</td>
                  <td className="p-2">{e.description || '-'}</td>
                  <td className="p-2 text-right">{e.gstRate}%</td>
                  <td className="p-2 text-right">₹{e.taxableAmount.toFixed(2)}</td>
                  <td className="p-2 text-right">₹{e.gstAmount.toFixed(2)}</td>
                  <td className="p-2 text-right">₹{e.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">No sales data for this period.</p>
        )}
      </div>
    </div>
  );
}
