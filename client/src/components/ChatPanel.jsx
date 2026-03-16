import { useEffect, useMemo, useState } from 'react';

function keyFor(panel) {
  return `paao-chat-${panel}`;
}

export default function ChatPanel({ socket }) {
  const [active, setActive] = useState('aether');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState({ aether: [], orion: [] });

  useEffect(() => {
    const cached = {
      aether: JSON.parse(localStorage.getItem(keyFor('aether')) || '[]'),
      orion: JSON.parse(localStorage.getItem(keyFor('orion')) || '[]'),
    };
    setMessages(cached);
  }, []);

  useEffect(() => {
    localStorage.setItem(keyFor('aether'), JSON.stringify(messages.aether || []));
    localStorage.setItem(keyFor('orion'), JSON.stringify(messages.orion || []));
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const onSnapshot = (payload) => setMessages(payload);
    const onUpdate = (payload) => {
      setMessages((prev) => ({
        ...prev,
        [payload.panel]: [...(prev[payload.panel] || []), payload.message],
      }));
    };

    socket.on('chat:snapshot', onSnapshot);
    socket.on('chat:update', onUpdate);

    return () => {
      socket.off('chat:snapshot', onSnapshot);
      socket.off('chat:update', onUpdate);
    };
  }, [socket]);

  const current = useMemo(() => messages[active] || [], [messages, active]);

  const send = () => {
    if (!input.trim()) return;
    const msg = {
      sender: 'user',
      text: input.trim(),
      at: new Date().toISOString(),
    };
    socket?.emit('chat:send', { panel: active, message: msg });
    setInput('');
  };

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-700 p-4 mt-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">Dual Chat Boxes</h3>
      <div className="grid md:grid-cols-2 gap-3">
        {['aether', 'orion'].map((panel) => (
          <button
            key={panel}
            onClick={() => setActive(panel)}
            className={`text-left p-2 rounded-lg border ${active === panel ? 'border-cyan-400 bg-slate-800' : 'border-slate-700 bg-slate-900'}`}
          >
            <p className="font-semibold">{panel === 'aether' ? 'Aether Chat' : 'Orion Panel'}</p>
            <p className="text-xs text-slate-400">{(messages[panel] || []).length} messages</p>
          </button>
        ))}
      </div>

      <div className="mt-3 h-48 overflow-auto rounded-lg border border-slate-700 p-3 bg-slate-950 space-y-2">
        {current.length === 0 && <p className="text-xs text-slate-500">No messages yet.</p>}
        {current.map((m, i) => (
          <div key={i} className="text-sm">
            <span className="text-cyan-300">{m.sender}:</span> <span className="text-slate-200">{m.text}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${active}...`}
          className="flex-1 rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
        />
        <button onClick={send} className="btn">Send</button>
      </div>
    </div>
  );
}
