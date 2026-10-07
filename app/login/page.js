'use client';
import { useState } from 'react';

export default function Login() {
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  async function submit(e) {
    e.preventDefault();
    const r = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ password }) });
    if (r.ok) location.href = '/';
    else setErr('Wrong password');
  }
  return (
    <div className="wrap" style={{ maxWidth: 360, marginTop: 100 }}>
      <form className="panel" onSubmit={submit}>
        <h1>Admin Login</h1><br />
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label><br />
        <button>Login</button>
        <p className="err">{err}</p>
      </form>
    </div>
  );
}
