import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'node:http';
import { Server } from 'socket.io';
import agentsRouter from './routes/agents.js';
import logsRouter from './routes/logs.js';
import workflowRouter from './routes/workflow.js';
import db from './services/db.js';
import { initSockets } from './sockets/index.js';
import { cleanupWorkflowHistory, initWorkflowHistoryTable } from './models/WorkflowHistory.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_ORIGIN || '*' } });

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
app.use((req, _res, next) => { req.io = io; next(); });
app.use('/api', agentsRouter);
app.use('/api', logsRouter);
app.use('/api', workflowRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as c FROM agents').get().c;
  if (count > 0) return;
  const insert = db.prepare('INSERT INTO agents (id,name,role,status,currentTask,progress,lastActive,assignedTo,conversations) VALUES (?,?,?,?,?,?,?,?,?)');
  const now = new Date().toISOString();
  const rows = [
    ['aether','Aether','Architect','working','Designing dashboard MVP',65,now,'Noyon','[]'],
    ['orion','Orion','Planner','waiting','Awaiting approval for rollout plan',40,now,'Noyon','[]'],
    ['pulse','Pulse','Analytics','calling','Client call about weekly metrics',20,now,'Client-01','[]'],
    ['muse','Muse','Content','idle','No active task',0,now,'','[]'],
    ['trace','Trace','QA','error','Build test failed on deployment',80,now,'DevOps','[]'],
  ];
  const tx = db.transaction((arr) => arr.forEach((r) => insert.run(...r)));
  tx(rows);
}

seedIfEmpty();
initWorkflowHistoryTable();
initSockets(io);

const PORT = Number(process.env.PORT || 8080);
const retentionDays = Number(process.env.WORKFLOW_RETENTION_DAYS || 30);
const cleanupEveryMs = Number(process.env.WORKFLOW_CLEANUP_INTERVAL_MS || 3600000);

setInterval(() => {
  const deleted = cleanupWorkflowHistory(retentionDays);
  if (deleted > 0) console.log(`[workflow-cleanup] deleted=${deleted} retentionDays=${retentionDays}`);
}, cleanupEveryMs);

server.listen(PORT, () => {
  console.log(`PAAO server running on :${PORT}`);
});
