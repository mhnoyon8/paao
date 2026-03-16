import { verifyToken } from '../services/auth.js';

export function requireAuth(req, res, next) {
  const must = String(process.env.AUTH_REQUIRED || 'false') === 'true';
  if (!must) return next();

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });
  req.user = { username: payload.sub };
  return next();
}
