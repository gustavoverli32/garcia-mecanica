import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const files = ['src/data/supabase-read-repository.ts', 'src/data/create-read-repository.ts', 'src/data/snapshot-service.ts'];
const forbidden = /\.(insert|update|upsert|delete)\s*\(/;

for (const relative of files) {
  const source = await readFile(resolve(root, relative), 'utf8');
  if (forbidden.test(source)) throw new Error(`Operação de escrita encontrada em ${relative}`);
}

console.log('Camada modular permanece somente leitura.');
