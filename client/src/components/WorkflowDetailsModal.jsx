import { useEffect, useState } from 'react';

export default function WorkflowDetailsModal({ open, details, onClose, apiBase, socket }) {
  const [tab, setTab] = useState('current');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !details?.edgeId) return;
    let mounted = true;
    setLoading(true);
    fetch(`${apiBase}/api/workflow/history/${encodeURIComponent(details.edgeId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        setHistory(d.items || []);
      })
      .catch(() => {
        if (!mounted) return;
        setHistory([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [open, details?.edgeId, apiBase]);

  useEffect(() => {
    if (!socket || !open || !details?.edgeId) return;
    const onNew = (item) => {
      if (item.edgeId !== details.edgeId) return;
      setHistory((prev) => [item, ...prev]);
    };
    socket.on('workflow:new', onNew);
    return () => socket.off('workflow:new', onNew);
  }, [socket, open, details?.edgeId]);

  if (!open || !details) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-xl bg-slate-900 border border-slate-700 p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Workflow Details</h3>
          <button className="btn" onClick={onClose}>Close</button>
        </div>

        <div className="mt-3 flex gap-2">
          <button className={`btn ${tab==='current' ? 'border-cyan-400' : ''}`} onClick={() => setTab('current')}>Current Flow</button>
          <button className={`btn ${tab==='history' ? 'border-cyan-400' : ''}`} onClick={() => setTab('history')}>History</button>
        </div>

        {tab === 'current' && (
          <div className="mt-4 space-y-2 text-sm">
            <p><span className="text-slate-400">Transfer:</span> <span className="text-cyan-300">{details.from}</span> → <span className="text-cyan-300">{details.to}</span></p>
            <p><span className="text-slate-400">Task:</span> <span className="text-slate-100">{details.task}</span></p>
            <p><span className="text-slate-400">Data Sent:</span> <span className="text-emerald-300">{details.dataSizeKb} KB</span></p>
            <p><span className="text-slate-400">Timestamp:</span> <span className="text-slate-100">{new Date(details.timestamp).toLocaleString()}</span></p>
            <p><span className="text-slate-400">Status:</span> <span className="text-amber-300">{details.status}</span></p>
          </div>
        )}

        {tab === 'history' && (
          <div className="mt-4">
            {loading ? (
              <div className="text-slate-300 text-sm">⏳ Loading history...</div>
            ) : (
              <div className="overflow-auto max-h-72 border border-slate-700 rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-slate-800 text-slate-300">
                    <tr>
                      <th className="text-left p-2">Time</th>
                      <th className="text-left p-2">Task</th>
                      <th className="text-left p-2">Size</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, idx) => (
                      <tr key={h.id || idx} className="border-t border-slate-800">
                        <td className="p-2 text-slate-300">{new Date(h.timestamp).toLocaleString()}</td>
                        <td className="p-2 text-slate-200">{h.taskDescription}</td>
                        <td className="p-2 text-emerald-300">{h.dataSize} KB</td>
                        <td className="p-2 text-amber-300">{h.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
