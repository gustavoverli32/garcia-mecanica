import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const index = await readFile(resolve(root, 'index.html'), 'utf8');
const normalized = index.replace(/\r\n/g, '\n');
const actual = createHash('sha256').update(normalized).digest('hex');
const approved = '57155517db39b71b3bf24793609d816dcf3c7dad5a5120c04d2bee744474785e';
if (actual !== approved) {
  throw new Error('O bundle publicado mudou. Revise visual, comportamento e dados antes de atualizar a referência aprovada.');
}
console.log('Bundle aprovado preservado, incluindo o fluxo de OS e o assistente de melhorias validados.');
