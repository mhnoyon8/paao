import { useEffect, useMemo, useState } from 'react';

function keyFor(panel) {
  return `paao-chat-${panel}`;
}

function logColor(level) {
  if (level === 'error') return 'text-red-400';
  if (level === 'warn') return 'text-yellow-300';
  return 'text-slate-200';
}

export default function ChatPanel({ socket }) {
  const [active, setActive] = useState('aether');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState({ aether: [], orion: [] });
  const [typing, setTyping] = useState({ aether: false, orion: false });
  const [unread, setUnread] = useState({ aether: 0, orion: 0 });
  const [logs, setLogs] = useState([]);

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
    setUnread((u) => ({ ...u, [active]: 0 }));
  }, [active]);

  useEffect(() => {
    if (!socket) return;

    const onSnapshot = (payload) => setMessages(payload);
    const onUpdate = (payload) => {
      setMessages((prev) => ({
        ...prev,
        [payload.panel]: [...(prev[payload.panel] || []), payload.message],
      }));
      if (payload.panel !== active) {
        setUnread((u) => ({ ...u, [payload.panel]: (u[payload.panel] || 0) + 1 }));
      }
    };
    const onTyping = ({ panel, typing }) => setTyping((t) => ({ ...t, [panel]: typing }));
    const onLogs = (payload) => setLogs(payload || []);

    socket.on('chat:snapshot', onSnapshot);
    socket.on('chat:update', onUpdate);
    socket.on('chat:typing', onTyping);
    socket.on('logs:update', onLogs);

    return () => {
      socket.off('chat:snapshot', onSnapshot);
      socket.off('chat:update', onUpdate);
      socket.off('chat:typing', onTyping);
      socket.off('logs:update', onLogs);
    };
  }, [socket, active]);

  const current = useMemo(() => messages[active] || [], [messages, active]);

  const sendTyping = (v) => socket?.emit('chat:typing', { panel: active, typing: v });

  const send = () => {
    if (!input.trim()) return;
    const msg = { sender: 'user', text: input.trim(), at: new Date().toISOString() };
    socket?.emit('chat:send', { panel: active, message: msg });
    setInput('');
    sendTyping(false);
  };

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-700 p-4 mt-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">Dual Chat Boxes</h3>
      <div className="grid md:grid-cols-2 gap-3">
        {['aether', 'orion'].map((panel) => (
          <button
            key={panel}
            onClick={() => setActive(panel)}
            className={`text-left p-2 rounded-lg border relative ${active === panel ? 'border-cyan-400 bg-slate-800' : 'border-slate-700 bg-slate-900'}`}
          >
            <p className="font-semibold">{panel === 'aether' ? 'Aether Chat' : 'Orion Panel'}</p>
            <p className="text-xs text-slate-400">{(messages[panel] || []).length} messages</p>
            {unread[panel] > 0 && (
              <span className="absolute top-2 right-2 text-xs bg-red-500 text-white rounded-full px-2 py-0.5">{unread[panel]}</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-3 h-52 overflow-auto rounded-lg border border-slate-700 p-3 bg-slate-950 space-y-2">
        {current.length === 0 && <p className="text-xs text-slate-500">No messages yet.</p>}
        {current.map((m, i) => (
          <div key={i} className="text-sm">
            <div>
              <span className="text-cyan-300">{m.sender}:</span> <span className="text-slate-200">{m.text}</span>
            </div>
            <div className="text-[11px] text-slate-500">{new Date(m.at).toLocaleTimeString()}</div>
          </div>
        ))}
        {typing[active] && <p className="text-xs text-slate-400 italic">typing...</p>}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); sendTyping(!!e.target.value.trim()); }}
          placeholder={`Message ${active}...`}
          className="flex-1 rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
        />
        <button onClick={send} className="btn">Send</button>
      </div>

      <div className="mt-4 rounded-lg border border-slate-700 p-3 bg-slate-950">
        <h4 className="text-sm font-semibold text-slate-200 mb-2">Live Logs (Orion)</h4>
        <div className="max-h-40 overflow-auto space-y-1 text-xs font-mono">
          {logs.length === 0 && <p className="text-slate-500">No logs yet...</p>}
          {logs.map((l, idx) => (
            <p key={idx} className={logColor(l.level)}>{l.line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
