export default function AgentDetails({ agent, onAction }) {
  if (!agent) return <div className="text-slate-400">Select an agent</div>;

  return (
    <div className="rounded-xl bg-slate-900 p-4 border border-slate-700">
      <h2 className="text-xl font-bold text-white">{agent.name}</h2>
      <p className="text-slate-400 text-sm">{agent.role}</p>
      <p className="text-slate-200 mt-3">{agent.currentTask}</p>

      <div className="mt-4">
        <div className="w-full h-2 bg-slate-700 rounded-full">
          <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${agent.progress}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-1">Progress: {agent.progress}%</p>
      </div>

      <p className="text-xs text-slate-500 mt-4">Last active: {new Date(agent.lastActive).toLocaleString()}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={() => onAction(agent.id, 'approve')} className="btn">Approve</button>
        <button onClick={() => onAction(agent.id, 'reject')} className="btn">Reject</button>
        <button onClick={() => onAction(agent.id, 'pause')} className="btn">Pause</button>
        <button onClick={() => onAction(agent.id, 'resume')} className="btn">Resume</button>
      </div>
    </div>
  );
}
