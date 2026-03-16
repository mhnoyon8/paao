import jwt from 'jsonwebtoken';

const secret = process.env.AUTH_JWT_SECRET || 'dev-secret-change-me';

function users() {
  try {
    const raw = process.env.AUTH_USERS_JSON || '{"admin":"admin123"}';
    return JSON.parse(raw);
  } catch {
    return { admin: 'admin123' };
  }
}

export function authenticate(username, password) {
  const u = users();
  if (!u[username] || u[username] !== password) return null;
  return jwt.sign({ sub: username }, secret, { expiresIn: '12h' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}
