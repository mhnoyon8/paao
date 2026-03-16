export default function WorkflowDetailsModal({ open, details, onClose }) {
  if (!open || !details) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-slate-900 border border-slate-700 p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Workflow Details</h3>
          <button className="btn" onClick={onClose}>Close</button>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <p><span className="text-slate-400">Transfer:</span> <span className="text-cyan-300">{details.from}</span> → <span className="text-cyan-300">{details.to}</span></p>
          <p><span className="text-slate-400">Task:</span> <span className="text-slate-100">{details.task}</span></p>
          <p><span className="text-slate-400">Data Sent:</span> <span className="text-emerald-300">{details.dataSizeKb} KB</span></p>
          <p><span className="text-slate-400">Timestamp:</span> <span className="text-slate-100">{new Date(details.timestamp).toLocaleString()}</span></p>
          <p><span className="text-slate-400">Status:</span> <span className="text-amber-300">{details.status}</span></p>
        </div>
      </div>
    </div>
  );
}
