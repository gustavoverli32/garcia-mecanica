import { createClient } from '@supabase/supabase-js';
import { SupabaseReadRepository } from './supabase-read-repository';

export function createReadRepositoryFromEnv(): SupabaseReadRepository {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  // O adaptador exposto aqui só possui métodos de leitura.
  return new SupabaseReadRepository(createClient(url, key));
}
