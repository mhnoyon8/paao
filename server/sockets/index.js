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

export function initSockets(io) {
  io.on('connection', (socket) => {
    const rows = db.prepare('SELECT * FROM agents ORDER BY name').all().map(normalizeAgent);
    socket.emit('agents:snapshot', rows);
    socket.emit('workflow:snapshot', workflowEdges);
    socket.emit('chat:snapshot', chatStore);

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
  });
}
