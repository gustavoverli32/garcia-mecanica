'use client';

import { useState } from 'react';
import { createBrowserClient } from '../lib/supabase/client';

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    const client = createBrowserClient();
    if (!client) return;
    setLoading(true);
    await client.auth.signOut();
    window.location.href = '/login';
  }

  return <button type="button" onClick={logout} disabled={loading} className="logout-button">{loading ? 'Saindo…' : 'Sair'}</button>;
}
