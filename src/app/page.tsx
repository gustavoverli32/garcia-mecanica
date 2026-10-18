import { createReadRepositoryFromEnv } from '../data/create-read-repository';
import type { GarciaDataSnapshot } from '../domain/entities';
import { Dashboard } from './dashboard';

export const dynamic = 'force-dynamic';

export default async function Page() {
  let snapshot: GarciaDataSnapshot | null = null;
  let connection: 'online' | 'not-configured' | 'unavailable' = 'not-configured';

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      snapshot = await createReadRepositoryFromEnv().loadSnapshot();
      connection = 'online';
    } catch {
      connection = 'unavailable';
    }
  }

  return <Dashboard snapshot={snapshot} connection={connection} />;
}
