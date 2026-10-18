'use client';

import { createBrowserClient } from '../lib/supabase/client';
import { SupabaseWriteRepository } from './supabase-write-repository';

export function createWriteRepository(): SupabaseWriteRepository | null {
  const client = createBrowserClient();
  return client ? new SupabaseWriteRepository(client) : null;
}
