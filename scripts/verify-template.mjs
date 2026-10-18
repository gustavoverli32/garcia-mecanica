import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const bundle = await readFile(resolve(root, 'index.html'), 'utf8');
const extracted = await readFile(resolve(root, 'src/legacy/template.html'), 'utf8');
const match = bundle.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/);

if (!match) throw new Error('Bloco __bundler/template não encontrado.');

const embedded = JSON.parse(match[1].trim());
if (embedded !== extracted) {
  throw new Error('A fonte extraída diverge do template embutido no bundle. Execute npm run extract:template.');
}

console.log('Template legado sincronizado com index.html.');
