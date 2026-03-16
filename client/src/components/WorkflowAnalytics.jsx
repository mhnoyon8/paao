import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function toDateInput(d) {
  return d.toISOString().slice(0, 10);
}

export default function WorkflowAnalytics({ apiBase, onToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cleanup, setCleanup] = useState({ lastRunAt: null, lastDeleted: 0, history: [] });
  const [fromDate, setFromDate] = useState(toDateInput(new Date(Date.now() - 7 * 86400000)));
  const [toDate, setToDate] = useState(toDateInput(new Date()));

  const loadCleanupStatus = async () => {
    try {
      const res = await fetch(`${apiBase}/api/workflow/cleanup/status`);
      const json = await res.json();
      setCleanup(json || { lastRunAt: null, lastDeleted: 0, history: [] });
    } catch {
      // silent
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/workflow/analytics?days=7`);
      const json = await res.json();
      setData(json);
    } catch {
      onToast?.('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadCleanupStatus();
  }, []);

  const doCleanup = async () => {
    try {
      const res = await fetch(`${apiBase}/api/workflow/cleanup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retentionDays: 30 }),
      });
      const out = await res.json();
      onToast?.(`Cleanup done. Deleted ${out.deleted}`, 'success');
      setCleanup(out.status || cleanup);
      load();
    } catch {
      onToast?.('Cleanup failed', 'error');
    }
  };

  const exportUrl = useMemo(() => {
    const fromIso = `${fromDate}T00:00:00.000Z`;
    const toIso = `${toDate}T23:59:59.999Z`;
    return `${apiBase}/api/workflow/export.csv?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}&limit=5000`;
  }, [apiBase, fromDate, toDate]);

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-700 p-4 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Workflow Analytics (7d)</h3>
        <div className="flex gap-2">
          <button className="btn" onClick={doCleanup}>Cleanup 30d+</button>
        </div>
      </div>

      {loading && <p className="text-xs text-slate-400 mt-2">Loading analytics...</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="rounded bg-slate-800 p-3">
              <p className="text-xs text-slate-400">Total Transfers</p>
              <p className="text-xl font-bold">{data.summary?.totalTransfers || 0}</p>
            </div>
            <div className="rounded bg-slate-800 p-3">
              <p className="text-xs text-slate-400">Total Data</p>
              <p className="text-xl font-bold">{data.summary?.totalDataSize || 0} KB</p>
            </div>
          </div>

          <div className="mt-3 h-48 rounded bg-slate-800 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(data.byEdge || []).map((x) => ({ edge: x.edgeId, transfers: x.transfers }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="edge" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <YAxis tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} />
                <Bar dataKey="transfers" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 max-h-40 overflow-auto border border-slate-700 rounded">
            <table className="w-full text-xs">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="text-left p-2">Edge</th>
                  <th className="text-left p-2">Transfers</th>
                  <th className="text-left p-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {(data.byEdge || []).map((r) => (
                  <tr key={r.edgeId} className="border-t border-slate-800">
                    <td className="p-2">{r.edgeId}</td>
                    <td className="p-2">{r.transfers}</td>
                    <td className="p-2">{r.totalDataSize || 0} KB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg border border-slate-700 p-3 bg-slate-950">
            <h4 className="text-sm font-semibold text-slate-200 mb-2">Export Date Range</h4>
            <div className="flex flex-wrap items-center gap-2">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded bg-slate-800 border border-slate-600 px-2 py-1 text-xs" />
              <span className="text-slate-400 text-xs">to</span>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded bg-slate-800 border border-slate-600 px-2 py-1 text-xs" />
              <a className="btn" href={exportUrl} target="_blank" rel="noreferrer">Export CSV</a>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-700 p-3 bg-slate-950">
            <h4 className="text-sm font-semibold text-slate-200 mb-2">Cleanup Job Status</h4>
            <p className="text-xs text-slate-300">Last run: {cleanup.lastRunAt ? new Date(cleanup.lastRunAt).toLocaleString() : 'N/A'}</p>
            <p className="text-xs text-slate-300">Last deleted: {cleanup.lastDeleted || 0}</p>
            <div className="mt-2 max-h-24 overflow-auto text-xs space-y-1">
              {(cleanup.history || []).slice(0, 5).map((h, i) => (
                <p key={i} className="text-slate-400">{new Date(h.at).toLocaleString()} — deleted {h.deleted}</p>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
