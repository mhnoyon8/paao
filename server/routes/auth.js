import { Router } from 'express';
import { authenticate, verifyToken } from '../services/auth.js';

const router = Router();

router.post('/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const token = authenticate(username, password);
  if (!token) return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  res.json({ ok: true, token, user: { username } });
});

router.get('/auth/me', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ ok: false });
  res.json({ ok: true, user: { username: payload.sub } });
});

export default router;
