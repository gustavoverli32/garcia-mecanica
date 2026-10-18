import { createClient } from '@supabase/supabase-js';

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const tables = ['clientes', 'ordens', 'faturamentos', 'despesas', 'funcionarios'];
const results = {};
for (const table of tables) {
  const { count, error } = await client.from(table).select('*', { count: 'exact', head: true });
  if (error) throw new Error(`${table}: ${error.message}`);
  results[table] = count;
}
console.log(JSON.stringify({ readOnlyCounts: results }));
