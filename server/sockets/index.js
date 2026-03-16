import fs from 'node:fs';
import path from 'node:path';
import db from '../services/db.js';
import { normalizeAgent } from '../models/Agent.js';
import { insertWorkflowHistory, getWorkflowHistoryByEdge } from '../models/WorkflowHistory.js';
import { sendTelegram } from '../services/telegram.js';

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
    let logsPaused = false;
    const rows = db.prepare('SELECT * FROM agents ORDER BY name').all().map(normalizeAgent);
    socket.emit('agents:snapshot', rows);
    socket.emit('workflow:snapshot', workflowEdges);
    socket.emit('chat:snapshot', chatStore);

    socket.on('workflow:details:request', ({ edgeId, from, to }) => {
      const edge = workflowEdges.find((e) => `${e.from}->${e.to}` === edgeId) || { from, to, label: 'handoff' };
      const payload = {
        edgeId: edgeId || `${edge.from}->${edge.to}`,
        from: edge.from,
        to: edge.to,
        task: `${edge.label} task transfer`,
        dataSizeKb: Math.floor(Math.random() * 120) + 10,
        timestamp: new Date().toISOString(),
        status: 'delivered',
      };

      const id = insertWorkflowHistory({
        edgeId: payload.edgeId,
        fromAgent: payload.from,
        toAgent: payload.to,
        taskDescription: payload.task,
        dataSize: payload.dataSizeKb,
        timestamp: payload.timestamp,
        status: payload.status,
      });

      const item = { id, edgeId: payload.edgeId, fromAgent: payload.from, toAgent: payload.to, taskDescription: payload.task, dataSize: payload.dataSizeKb, timestamp: payload.timestamp, status: payload.status };
      io.emit('workflow:new', item);
      sendTelegram(`🔁 Workflow: ${item.fromAgent} → ${item.toAgent}\nTask: ${item.taskDescription}\nData: ${item.dataSize}KB`, { agentId: item.toAgent }).catch(() => {});

      const history = getWorkflowHistoryByEdge(payload.edgeId);
      socket.emit('workflow:details', { ...payload, history });
    });

    socket.on('chat:typing', ({ panel, typing }) => {
      socket.broadcast.emit('chat:typing', { panel, typing: !!typing });
    });

    socket.on('logs:pause', () => { logsPaused = true; });
    socket.on('logs:resume', () => { logsPaused = false; });

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
      if (logsPaused) return;
      const p = latestOpenClawLogPath();
      const lines = readTailLines(p, 8).map((line) => ({ line, level: classifyLog(line) }));
      socket.emit('logs:update', lines);
    }, 5000);

    socket.on('disconnect', () => clearInterval(timer));
  });
}
