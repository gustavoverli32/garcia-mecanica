import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const index = await readFile(resolve(root, 'index.html'), 'utf8');
const normalized = index.replace(/\r\n/g, '\n');
const actual = createHash('sha256').update(normalized).digest('hex');
const approved = '7aae785b1268fd546a88c238ef4de43af93d59cde1bd7ada992d890f78de70a2';
if (actual !== approved) {
  throw new Error('O bundle publicado mudou. Revise visual, comportamento e dados antes de atualizar a referência aprovada.');
}
console.log('Bundle aprovado preservado, incluindo o fluxo de OS validado.');
