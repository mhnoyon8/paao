import fs from 'node:fs';
import path from 'node:path';
import db from '../services/db.js';
import { normalizeAgent } from '../models/Agent.js';

const chatStore = {
  aether: [
    { sender: 'aether', text: 'Welcome to Aether chat.', at: new Date().toISOString() },
  ],
  orion: [
    { sender: 'orion', text: 'Orion panel ready for operations.', at: new Date().toISOString() },
  ],
};

const workflowEdges = [
  { from: 'aether', to: 'orion', label: 'planning' },
  { from: 'orion', to: 'pulse', label: 'handoff' },
  { from: 'pulse', to: 'trace', label: 'qa-check' },
];

function latestOpenClawLogPath() {
  const dir = '/tmp/openclaw';
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => f.startsWith('openclaw-') && f.endsWith('.log')).sort();
  if (!files.length) return null;
  return path.join(dir, files[files.length - 1]);
}

function readTailLines(filePath, limit = 20) {
  if (!filePath || !fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf-8');
  return raw.split('\n').filter(Boolean).slice(-limit);
}

function classifyLog(line) {
  const l = line.toLowerCase();
  if (l.includes('error')) return 'error';
  if (l.includes('warn')) return 'warn';
  return 'info';
}

export function initSockets(io) {
  io.on('connection', (socket) => {
    const rows = db.prepare('SELECT * FROM agents ORDER BY name').all().map(normalizeAgent);
    socket.emit('agents:snapshot', rows);
    socket.emit('workflow:snapshot', workflowEdges);
    socket.emit('chat:snapshot', chatStore);

    socket.on('workflow:details:request', ({ edgeId, from, to }) => {
      const edge = workflowEdges.find((e) => `${e.from}->${e.to}` === edgeId) || { from, to, label: 'handoff' };
      socket.emit('workflow:details', {
        from: edge.from,
        to: edge.to,
        task: `${edge.label} task transfer`,
        dataSizeKb: Math.floor(Math.random() * 120) + 10,
        timestamp: new Date().toISOString(),
        status: 'delivered',
      });
    });

    socket.on('chat:typing', ({ panel, typing }) => {
      socket.broadcast.emit('chat:typing', { panel, typing: !!typing });
    });

    socket.on('chat:send', ({ panel, message }) => {
      if (!chatStore[panel]) return;
      const msg = { ...message, sender: message.sender || 'user', at: message.at || new Date().toISOString() };
      chatStore[panel].push(msg);
      io.emit('chat:update', { panel, message: msg });

      const botReply = {
        sender: panel,
        text: panel === 'aether' ? 'Aether received. Working on it.' : 'Orion received. Monitoring চলছে।',
        at: new Date().toISOString(),
      };
      chatStore[panel].push(botReply);
      io.emit('chat:update', { panel, message: botReply });
    });

    const timer = setInterval(() => {
      const p = latestOpenClawLogPath();
      const lines = readTailLines(p, 8).map((line) => ({ line, level: classifyLog(line) }));
      socket.emit('logs:update', lines);
    }, 5000);

    socket.on('disconnect', () => clearInterval(timer));
  });
}
