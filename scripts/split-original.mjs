import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { imageMarker, parts } from './original-parts.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = resolve(root, 'src/legacy/source');
const assetPath = resolve(root, 'src/legacy/assets/car-image.base64');
const original = await readFile(resolve(root, 'index.html'), 'utf8');
const payload = original.match(/<script type="__bundler\/template">\s*("[\s\S]*?")\s*<\/script>/)?.[1];
if (!payload) throw new Error('Template original não encontrado.');
const template = JSON.parse(payload);

// Bootstrap only. An existing source tree is never overwritten from the bundle.
try { await access(resolve(sourceDir, parts[0])); throw new Error('As fontes já existem; edição deve ser feita nelas.'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }

const scriptTag = '<script type="text/x-dc" data-dc-script="">';
const boundaries = [
  '</style>',
  '</helmet>',
  scriptTag,
  '  _modalOS(){',
  '  _modalCli(){',
  '  _editarOS(id){',
  '  _months6(){',
  '  _modalFunc(){',
  '  excluirOS(id){',
  '  _toggleAI(){',
  '</script>',
];

const slices = [];
let start = 0;
for (const marker of boundaries) {
  const found = template.indexOf(marker, start);
  if (found < 0) throw new Error(`Limite do código original não encontrado: ${marker}`);
  // HTML tags belong to the preceding fragment; method declarations to the next.
  const end = marker === '</style>' || marker === '</helmet>' || marker === scriptTag
    ? found + marker.length
    : found;
  slices.push(template.slice(start, end));
  start = end;
}
slices.push(template.slice(start));
if (slices.length !== parts.length || slices.join('') !== template) throw new Error('A separação não preservou o template.');

const imageMatch = slices[3].match(/(_CAR_IMG\s*=\s*'data:image\/png;base64,)([A-Za-z0-9+/=]+)(';)/);
if (!imageMatch) throw new Error('Imagem embutida original não encontrada.');
const image = imageMatch[2];
slices[3] = slices[3].replace(imageMatch[0], imageMatch[1] + imageMarker + imageMatch[3]);

await mkdir(sourceDir, { recursive: true });
await mkdir(dirname(assetPath), { recursive: true });
await writeFile(assetPath, image, 'utf8');
for (let i = 0; i < parts.length; i++) await writeFile(resolve(sourceDir, parts[i]), slices[i], 'utf8');
console.log(`Código original separado em ${parts.length} partes sem alterações no bundle.`);
