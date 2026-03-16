import db from '../services/db.js';
import { normalizeAgent } from '../models/Agent.js';

export function initSockets(io) {
  io.on('connection', (socket) => {
    const rows = db.prepare('SELECT * FROM agents ORDER BY name').all().map(normalizeAgent);
    socket.emit('agents:snapshot', rows);
  });
}
