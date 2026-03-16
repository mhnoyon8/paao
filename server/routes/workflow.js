import { Router } from 'express';
import {
  cleanupWorkflowHistory,
  exportWorkflowCsv,
  getWorkflowAnalytics,
  getWorkflowHistoryByEdge,
  getWorkflowHistoryRecent,
} from '../models/WorkflowHistory.js';
import { getCleanupStatus, recordCleanupRun } from '../services/cleanupStatus.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/workflow/history/recent', (_req, res) => {
  const rows = getWorkflowHistoryRecent(20);
  res.json({ items: rows });
});

router.get('/workflow/history/:edgeId', (req, res) => {
  const rows = getWorkflowHistoryByEdge(req.params.edgeId);
  res.json({ edgeId: req.params.edgeId, items: rows });
});

router.get('/workflow/analytics', (req, res) => {
  const days = Number(req.query.days || 7);
  res.json(getWorkflowAnalytics(days));
});

router.get('/workflow/export.csv', (req, res) => {
  const limit = Number(req.query.limit || 1000);
  const from = req.query.from ? String(req.query.from) : null;
  const to = req.query.to ? String(req.query.to) : null;
  const csv = exportWorkflowCsv(limit, from, to);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="workflow-history.csv"');
  res.send(csv);
});

router.post('/workflow/cleanup', requireAuth, (req, res) => {
  const retentionDays = Number(req.body?.retentionDays || 30);
  const deleted = cleanupWorkflowHistory(retentionDays);
  recordCleanupRun(deleted);
  res.json({ ok: true, retentionDays, deleted, status: getCleanupStatus() });
});

router.get('/workflow/cleanup/status', (_req, res) => {
  res.json(getCleanupStatus());
});

export default router;
