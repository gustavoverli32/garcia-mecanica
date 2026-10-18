import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const template = html.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/)?.[1]?.trim();

if (!template) throw new Error('Template do bundle não encontrado.');

const source = JSON.parse(template);
const metrics = {
  bundleBytes: Buffer.byteLength(html),
  templateBytes: Buffer.byteLength(source),
  inlineScripts: (source.match(/<script(?:\s|>)/gi) ?? []).length,
  inlineStyles: (source.match(/<style(?:\s|>)/gi) ?? []).length,
  supabaseReferences: (source.match(/supabase/gi) ?? []).length,
  persistenceMethods: (source.match(/_save[A-Za-z]+|_salvar[A-Za-z]+/g) ?? []).length,
};

console.log(JSON.stringify(metrics, null, 2));
