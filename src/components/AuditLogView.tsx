import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import auditService, { AuditRow } from '@/services/audit.service';


const AuditLogView: React.FC = () => {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [q, setQ] = useState('');

  const fetchLogs = async () => {
    setRows(await auditService.fetchRecent());
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = rows.filter(r => !q || r.action.includes(q) || r.resource.includes(q) || String(r.user_id).includes(q));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Filter…" className="border rounded px-2 py-1 text-sm"/>
        <Button size="sm" variant="outline" onClick={fetchLogs}>Refresh</Button>
      </div>
      <div className="border rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Action</th>
              <th className="p-2 text-left">Resource</th>
              <th className="p-2 text-left">Device</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-2 whitespace-nowrap">{new Date(r.timestamp).toLocaleString()}</td>
                <td className="p-2">{r.user_id}</td>
                <td className="p-2">{r.action}</td>
                <td className="p-2">{r.resource}</td>
                <td className="p-2">{r.device_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogView;


