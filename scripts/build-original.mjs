import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { imageMarker, parts } from './original-parts.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = resolve(root, 'index.html');
const templatePath = resolve(root, 'src/legacy/template.html');
const sourceDir = resolve(root, 'src/legacy/source');
const assetPath = resolve(root, 'src/legacy/assets/car-image.base64');
const tag = /(<script type="__bundler\/template">\s*)("[\s\S]*?")(\s*<\/script>)/;

const fragments = await Promise.all(parts.map((part) => readFile(resolve(sourceDir, part), 'utf8')));
const image = await readFile(assetPath, 'utf8');
if (!/^[A-Za-z0-9+/=]+$/.test(image)) throw new Error('Imagem original inválida.');
const joined = fragments.join('');
if (joined.split(imageMarker).length !== 2) throw new Error('O marcador da imagem deve existir exatamente uma vez.');
const template = joined.replace(imageMarker, image);
const index = await readFile(indexPath, 'utf8');
const match = index.match(tag);
if (!match) throw new Error('Template embutido não encontrado no index.html.');
const embedded = JSON.parse(match[2]);
const extracted = await readFile(templatePath, 'utf8');
const normalizeNewlines = (value) => value.replace(/\r\n/g, '\n');
const extractedMatches = normalizeNewlines(template) === normalizeNewlines(extracted);

if (process.argv.includes('--check')) {
  if (template !== embedded || !extractedMatches) {
    const firstDifference = (a, b) => {
      let i = 0;
      while (i < a.length && i < b.length && a[i] === b[i]) i++;
      return i;
    };
    throw new Error(`Fontes divergentes: bundle=${template !== embedded} (posição ${firstDifference(template, embedded)}), template=${!extractedMatches} (posição ${firstDifference(normalizeNewlines(template), normalizeNewlines(extracted))}).`);
  }
  console.log('Build original idêntico ao publicado: HTML, CSS, JavaScript e dados preservados.');
} else {
  // The exported bundler escapes closing HTML tags inside its JSON payload.
  // Keep the existing payload untouched when the source has not changed.
  const encoded = template === embedded ? match[2] : JSON.stringify(template).replace(/<\//g, '<\\u002F');
  if (template !== embedded) await writeFile(indexPath, index.replace(tag, (_, before, _payload, after) => before + encoded + after), 'utf8');
  if (!extractedMatches) {
    const output = extracted.includes('\r\n') ? template.replace(/\n/g, '\r\n') : template;
    await writeFile(templatePath, output, 'utf8');
  }
  console.log(template === embedded ? 'Bundle original já está sincronizado.' : 'Bundle original reconstruído a partir do código-fonte.');
}
