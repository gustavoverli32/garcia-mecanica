import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = resolve(root, process.env.GARCIA_BUNDLE ?? 'index.html');
const outputPath = resolve(root, process.env.GARCIA_TEMPLATE_OUTPUT ?? 'src/legacy/template.html');
const html = await readFile(sourcePath, 'utf8');
const match = html.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/);

if (!match) throw new Error('Bloco __bundler/template não encontrado.');

const template = JSON.parse(match[1].trim());
if (typeof template !== 'string' || template.length === 0) {
  throw new Error('Template do bundle inválido ou vazio.');
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, template, 'utf8');
console.log(`Template extraído para ${outputPath}`);
