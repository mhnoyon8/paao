import { Router } from 'express';
import db from '../services/db.js';
import { normalizeAgent } from '../models/Agent.js';
import { sendTelegram } from '../services/telegram.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const allStmt = db.prepare('SELECT * FROM agents ORDER BY name');
const oneStmt = db.prepare('SELECT * FROM agents WHERE id = ?');
const updateStmt = db.prepare('UPDATE agents SET status=?, lastActive=?, progress=? WHERE id=?');

router.get('/agents', (_req, res) => {
  const rows = allStmt.all().map(normalizeAgent);
  res.json(rows);
});

router.get('/agent/:id', (req, res) => {
  const row = oneStmt.get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Agent not found' });
  res.json(normalizeAgent(row));
});

function actionToStatus(action) {
  if (action === 'approve' || action === 'resume') return 'working';
  if (action === 'reject') return 'error';
  if (action === 'pause') return 'idle';
  return null;
}

['approve', 'reject', 'pause', 'resume'].forEach((action) => {
  router.post(`/agent/:id/${action}`, requireAuth, async (req, res) => {
    const status = actionToStatus(action);
    const row = oneStmt.get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Agent not found' });

    const nextProgress = action === 'approve' ? 100 : (action === 'resume' ? Math.max(10, row.progress) : row.progress);
    updateStmt.run(status, new Date().toISOString(), nextProgress, req.params.id);

    const updated = normalizeAgent(oneStmt.get(req.params.id));
    req.io.emit('agent:update', updated);

    sendTelegram(`🤖 ${updated.name} → ${action.toUpperCase()}\nTask: ${updated.currentTask || 'N/A'}`, { agentId: updated.id })
      .catch(() => {});

    res.json({ ok: true, agent: updated });
  });
});

export default router;
