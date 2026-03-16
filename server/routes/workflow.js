import { Router } from 'express';
import {
  cleanupWorkflowHistory,
  exportWorkflowCsv,
  getWorkflowAnalytics,
  getWorkflowHistoryByEdge,
  getWorkflowHistoryRecent,
} from '../models/WorkflowHistory.js';

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
  const csv = exportWorkflowCsv(Number(req.query.limit || 1000));
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="workflow-history.csv"');
  res.send(csv);
});

router.post('/workflow/cleanup', (req, res) => {
  const retentionDays = Number(req.body?.retentionDays || 30);
  const deleted = cleanupWorkflowHistory(retentionDays);
  res.json({ ok: true, retentionDays, deleted });
});

export default router;
