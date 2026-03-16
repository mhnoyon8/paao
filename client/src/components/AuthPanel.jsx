import { useState } from 'react';

export default function AuthPanel({ apiBase, token, onToken, onToast }) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');

  const login = async () => {
    try {
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.token) throw new Error('login failed');
      onToken(data.token);
      localStorage.setItem('paao-token', data.token);
      onToast?.('Logged in', 'success');
      setOpen(false);
    } catch {
      onToast?.('Login failed', 'error');
    }
  };

  const logout = () => {
    onToken('');
    localStorage.removeItem('paao-token');
    onToast?.('Logged out', 'warning');
  };

  return (
    <div className="relative">
      <button className="btn" onClick={() => setOpen((v) => !v)}>{token ? 'User ✓' : 'Login'}</button>
      {token && <button className="btn ml-2" onClick={logout}>Logout</button>}
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-700 bg-slate-900 p-3 z-20">
          <p className="text-sm font-semibold mb-2">Multi-user Login</p>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full mb-2 rounded bg-slate-800 border border-slate-600 px-2 py-1 text-sm" placeholder="username" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-2 rounded bg-slate-800 border border-slate-600 px-2 py-1 text-sm" placeholder="password" />
          <button className="btn w-full" onClick={login}>Sign in</button>
        </div>
      )}
    </div>
  );
}
