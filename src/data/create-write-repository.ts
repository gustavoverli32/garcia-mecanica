'use client';

import { createClient } from '../lib/supabase/client';
import { SupabaseWriteRepository } from './supabase-write-repository';

export function createWriteRepository(): SupabaseWriteRepository | null {
  const client = createClient();
  return client ? new SupabaseWriteRepository(client) : null;
}
