import StatusIndicator from './StatusIndicator';

export default function AgentCard({ agent, onClick }) {
  return (
    <button onClick={() => onClick(agent)} className="w-full text-left rounded-xl bg-slate-900 p-4 border border-slate-700 hover:border-slate-500 transition">
      <div className={`pixel-agent ${agent.status}`} />
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="font-semibold text-white">{agent.name}</p>
        <StatusIndicator status={agent.status} />
      </div>
      <p className="text-slate-300 text-sm mt-1">{agent.role}</p>
      <p className="text-slate-400 text-xs mt-2 line-clamp-2">{agent.currentTask}</p>
    </button>
  );
}
