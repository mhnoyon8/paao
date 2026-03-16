const styles = {
  success: 'border-emerald-500 text-emerald-200',
  error: 'border-red-500 text-red-200',
  loading: 'border-cyan-500 text-cyan-200',
  warning: 'border-amber-500 text-amber-200',
};

const icons = {
  success: '✅',
  error: '❌',
  loading: '⏳',
  warning: '⚠️',
};

export default function Toast({ toasts, onClose }) {
  return (
    <div className="fixed top-4 right-4 z-[90] space-y-2 w-[300px]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-[toastIn_.2s_ease-out] rounded-lg border bg-slate-900/95 px-3 py-2 shadow-lg ${styles[t.type] || styles.success}`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm"><span className="mr-2">{icons[t.type] || '✅'}</span>{t.message}</p>
            <button className="text-xs text-slate-400 hover:text-white" onClick={() => onClose(t.id)}>✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}
