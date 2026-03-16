import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';

const router = Router();

function latestOpenClawLogPath() {
  const dir = '/tmp/openclaw';
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => f.startsWith('openclaw-') && f.endsWith('.log')).sort();
  if (!files.length) return null;
  return path.join(dir, files[files.length - 1]);
}

router.get('/logs/orion', (_req, res) => {
  const p = latestOpenClawLogPath();
  if (!p) return res.json({ logs: [] });
  const lines = fs.readFileSync(p, 'utf-8').split('\n').filter(Boolean).slice(-50);
  res.json({ logs: lines });
});

export default router;
