'use client';

import { createBrowserClient as createClient } from '../lib/supabase/client';

export function createBrowserClient() {
  return createClient();
}
