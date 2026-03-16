import { useCallback, useEffect, useState } from 'react';
import OfficeCanvas from './components/OfficeCanvas';
import AgentDetails from './components/AgentDetails';
import WorkflowArrows from './components/WorkflowArrows';
import ChatPanel from './components/ChatPanel';
import WorkflowDetailsModal from './components/WorkflowDetailsModal';
import Toast from './components/Toast';
import useSocket from './hooks/useSocket';
import useToast from './hooks/useToast';

const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export default function App() {
  const [agents, setAgents] = useState([]);
  const [workflow, setWorkflow] = useState([]);
  const [selected, setSelected] = useState(null);
  const [workflowDetails, setWorkflowDetails] = useState(null);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const { toasts, pushToast, removeToast, updateToast } = useToast();

  const loadAgents = async () => {
    try {
      const res = await fetch(`${API}/api/agents`);
      if (!res.ok) throw new Error('Failed to load agents');
      const data = await res.json();
      setAgents(data);
      if (!selected && data[0]) setSelected(data[0]);
    } catch {
      pushToast('Failed to load agents', 'error');
    }
  };

  useEffect(() => { loadAgents(); }, []);

  const onEvent = useCallback((type, payload) => {
    if (type === 'agents:snapshot') setAgents(payload);
    if (type === 'agent:update') {
      setAgents((prev) => prev.map((x) => x.id === payload.id ? payload : x));
      setSelected((s) => (s?.id === payload.id ? payload : s));
    }
    if (type === 'workflow:snapshot') setWorkflow(payload);
    if (type === 'workflow:details') {
      setWorkflowDetails(payload);
      setWorkflowModalOpen(true);
    }
    if (type === 'socket:disconnect') pushToast('Connection lost. Reconnecting...', 'warning', 4000);
    if (type === 'socket:connect') pushToast('Reconnected', 'success', 1200);
  }, [pushToast]);

  const socket = useSocket(onEvent);

  const onAction = async (id, action) => {
    const loadingId = pushToast('অপেক্ষা করুন...', 'loading', 0);
    try {
      const res = await fetch(`${API}/api/agent/${id}/${action}`, { method: 'POST' });
      if (!res.ok) throw new Error('request failed');
      const okMap = {
        approve: 'Approved! ✅',
        reject: 'Rejected ✅',
        pause: 'Paused ✅',
        resume: 'Resumed ✅',
      };
      updateToast(loadingId, { type: 'success', message: okMap[action] || 'Done ✅' });
      setTimeout(() => removeToast(loadingId), 1200);
    } catch {
      updateToast(loadingId, { type: 'error', message: `Failed to ${action}` });
      setTimeout(() => removeToast(loadingId), 2500);
    }
  };

  const onWorkflowClick = (item) => {
    if (item.type === 'edge' && socket) {
      socket.emit('workflow:details:request', { edgeId: item.edgeId, from: item.from, to: item.to });
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold">Pixel Art Agent Office (PAAO)</h1>
      <p className="text-slate-400 mt-1">Real-time OpenClaw agent dashboard</p>

      <WorkflowArrows agents={agents} workflow={workflow} onEdgeClick={onWorkflowClick} />

      <div className="mt-2 grid lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2"><OfficeCanvas agents={agents} onSelect={setSelected} /></section>
        <section><AgentDetails agent={selected} onAction={onAction} /></section>
      </div>

      <ChatPanel socket={socket} />
      <WorkflowDetailsModal
        open={workflowModalOpen}
        details={workflowDetails}
        onClose={() => setWorkflowModalOpen(false)}
      />
      <Toast toasts={toasts} onClose={removeToast} />
    </main>
  );
}
