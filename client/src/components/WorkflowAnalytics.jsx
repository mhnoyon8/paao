import { useEffect, useState } from 'react';

export default function WorkflowAnalytics({ apiBase, onToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => { load(); }, []);

  const doCleanup = async () => {
    try {
      const res = await fetch(`${apiBase}/api/workflow/cleanup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retentionDays: 30 }),
      });
      const out = await res.json();
      onToast?.(`Cleanup done. Deleted ${out.deleted}`, 'success');
      load();
    } catch {
      onToast?.('Cleanup failed', 'error');
    }
  };

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-700 p-4 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Workflow Analytics (7d)</h3>
        <div className="flex gap-2">
          <a className="btn" href={`${apiBase}/api/workflow/export.csv`} target="_blank" rel="noreferrer">Export CSV</a>
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
        </>
      )}
    </div>
  );
}
