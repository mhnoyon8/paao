import { useCallback, useEffect, useState } from 'react';
import OfficeCanvas from './components/OfficeCanvas';
import AgentDetails from './components/AgentDetails';
import useSocket from './hooks/useSocket';

const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export default function App() {
  const [agents, setAgents] = useState([]);
  const [selected, setSelected] = useState(null);

  const loadAgents = async () => {
    const res = await fetch(`${API}/api/agents`);
    const data = await res.json();
    setAgents(data);
    if (!selected && data[0]) setSelected(data[0]);
  };

  useEffect(() => { loadAgents(); }, []);

  const onEvent = useCallback((type, payload) => {
    if (type === 'agents:snapshot') setAgents(payload);
    if (type === 'agent:update') {
      setAgents((prev) => prev.map((x) => x.id === payload.id ? payload : x));
      setSelected((s) => (s?.id === payload.id ? payload : s));
    }
  }, []);

  useSocket(onEvent);

  const onAction = async (id, action) => {
    await fetch(`${API}/api/agent/${id}/${action}`, { method: 'POST' });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold">Pixel Art Agent Office (PAAO)</h1>
      <p className="text-slate-400 mt-1">Real-time OpenClaw agent dashboard</p>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2"><OfficeCanvas agents={agents} onSelect={setSelected} /></section>
        <section><AgentDetails agent={selected} onAction={onAction} /></section>
      </div>
    </main>
  );
}
