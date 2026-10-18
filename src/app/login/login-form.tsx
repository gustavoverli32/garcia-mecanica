'use client';

import { FormEvent, useState } from 'react';
import { createBrowserClient } from '../../data/create-browser-client';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setMessage('');
    const client = createBrowserClient();
    if (!client) { setMessage('Configure as variáveis públicas do Supabase.'); setLoading(false); return; }
    const { error } = await client.auth.signInWithPassword({ email, password });
    setMessage(error ? 'Não foi possível entrar. Confira os dados e tente novamente.' : 'Login realizado.');
    setLoading(false);
  }

  return <main className="login-page"><section className="login-card"><div className="mark">G</div><p className="eyebrow">GARCIA AUTO MECÂNICA</p><h1>Entrar</h1><p className="sub">Acesso seguro pela autenticação do Supabase.</p><form onSubmit={submit}><label>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label><label>Senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label><button disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button></form>{message && <p className="message" role="status">{message}</p>}<a href="/">Voltar ao ambiente de validação</a></section><style>{styles}</style></main>;
}

const styles = `*{box-sizing:border-box}body{margin:0;background:#171717;color:#111827;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.login-page{min-height:100vh;display:grid;place-items:center;padding:20px}.login-card{width:min(100%,390px);background:#fff;border-radius:14px;padding:32px;box-shadow:0 18px 60px rgba(0,0,0,.25)}.mark{display:grid;place-items:center;width:42px;height:42px;border-radius:11px;background:#ffc107;font-weight:800}.eyebrow{color:#9ca3af;font-size:10px;letter-spacing:.14em;font-weight:700;margin:22px 0 6px}h1{margin:0;font-size:28px}.sub{color:#6b7280;font-size:13px;line-height:1.5}form{display:grid;gap:16px;margin-top:24px}label{display:grid;gap:7px;color:#374151;font-size:12px;font-weight:700}input{padding:11px 12px;border:1px solid #d1d5db;border-radius:8px;font:inherit;font-weight:400}button{border:0;border-radius:8px;background:#ffc107;padding:12px;font-weight:800;cursor:pointer}button:disabled{opacity:.6;cursor:wait}.message{color:#b45309;font-size:12px}a{color:#6b7280;font-size:12px;text-decoration:none}`;
