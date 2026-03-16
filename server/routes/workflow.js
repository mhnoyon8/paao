import { Router } from 'express';
import { getWorkflowHistoryByEdge, getWorkflowHistoryRecent } from '../models/WorkflowHistory.js';

const router = Router();

router.get('/workflow/history/recent', (_req, res) => {
  const rows = getWorkflowHistoryRecent(20);
  res.json({ items: rows });
});

router.get('/workflow/history/:edgeId', (req, res) => {
  const rows = getWorkflowHistoryByEdge(req.params.edgeId);
  res.json({ edgeId: req.params.edgeId, items: rows });
});

export default router;
