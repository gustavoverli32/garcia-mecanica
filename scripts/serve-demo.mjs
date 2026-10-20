// Modo demonstração: serve a aplicação original com dados fictícios.
// O endereço do Supabase é trocado por uma API falsa deste próprio servidor, então
// nenhuma requisição chega ao banco real e toda gravação é recusada.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tables } from './demo-data.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REAL_URL = "_URL = 'https://qjdvrqlcblkynheitkuk.supabase.co';";
const DEMO_URL = "_URL = location.origin + '/demo-supabase';";
const REAL_HOST = 'qjdvrqlcblkynheitkuk';
const tag = /(<script type="__bundler\/template">\s*)("[\s\S]*?")(\s*<\/script>)/;
const banner = '<div style="position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:99999;'
  + 'background:#7c3aed;color:#fff;font:600 11px/1 sans-serif;padding:5px 10px;border-radius:0 0 8px 8px;'
  + 'pointer-events:none;letter-spacing:.04em;">MODO DEMONSTRAÇÃO · dados fictícios · nada é salvo</div>';

export async function buildDemoHtml() {
  const index = await readFile(resolve(root, 'index.html'), 'utf8');
  const match = index.match(tag);
  if (!match) throw new Error('Template do bundle não encontrado em index.html.');
  const template = JSON.parse(match[2]);
  if (!template.includes(REAL_URL)) throw new Error('Endereço do Supabase não encontrado; modo demonstração recusado por segurança.');
  const demo = template.replace(REAL_URL, DEMO_URL).replace('<body>', '<body>' + banner);
  if (demo.includes(REAL_HOST)) throw new Error('O template ainda aponta para o Supabase real; modo demonstração recusado.');
  const encoded = JSON.stringify(demo).replace(/<\//g, '<\\u002F');
  return index.replace(tag, (_, before, _payload, after) => before + encoded + after);
}

const json = (response, status, body, extra = {}) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra });
  response.end(JSON.stringify(body));
};

// Subconjunto do PostgREST usado pelo app: filtros eq, order e limit.
function query(table, params, wantsObject) {
  let rows = [...(tables[table] ?? [])];
  for (const [key, value] of params) {
    if (['select', 'order', 'limit', 'offset'].includes(key)) continue;
    if (value.startsWith('eq.')) rows = rows.filter((row) => String(row[key]) === value.slice(3));
  }
  const order = params.get('order');
  if (order) {
    const [column, direction] = order.split(',')[0].split('.');
    const sign = direction === 'desc' ? -1 : 1;
    rows.sort((a, b) => (a[column] > b[column] ? sign : a[column] < b[column] ? -sign : 0));
  }
  const limit = Number(params.get('limit'));
  if (limit > 0) rows = rows.slice(0, limit);
  return wantsObject ? rows[0] ?? null : rows;
}

function handleApi(request, response, url) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, PATCH, PUT, DELETE, OPTIONS',
  };
  if (request.method === 'OPTIONS') { response.writeHead(204, cors).end(); return; }
  const path = url.pathname.replace('/demo-supabase', '');
  if (path.startsWith('/functions/v1/')) {
    json(response, 200, {
      resposta: 'Modo demonstração: o assistente de IA não é chamado aqui.',
      recomendacoes: [],
    }, cors);
    return;
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    console.log(`Gravação bloqueada: ${request.method} ${path}`);
    json(response, 403, {
      message: 'modo demonstração, gravações desativadas. Nada foi salvo.',
      code: 'DEMO_READ_ONLY',
    }, cors);
    return;
  }
  const table = path.match(/^\/rest\/v1\/([a-z_]+)/)?.[1];
  if (!table) { json(response, 404, { message: 'Rota não suportada no modo demonstração.' }, cors); return; }
  const wantsObject = String(request.headers.accept ?? '').includes('vnd.pgrst.object');
  const body = query(table, url.searchParams, wantsObject);
  const count = Array.isArray(body) ? body.length : body ? 1 : 0;
  json(response, 200, body, { ...cors, 'Content-Range': `0-${Math.max(count - 1, 0)}/${count}` });
}

const statics = new Map([
  ['/manifest.json', ['manifest.json', 'application/manifest+json; charset=utf-8']],
  ['/icon-192.png', ['icon-192.png', 'image/png']],
  ['/icon-512.png', ['icon-512.png', 'image/png']],
]);

export function createDemoServer(html) {
  return createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    if (url.pathname.startsWith('/demo-supabase/')) { handleApi(request, response, url); return; }
    if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405).end(); return; }
    if (url.pathname === '/' || url.pathname === '/index.html') {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(request.method === 'HEAD' ? undefined : html);
      return;
    }
    // sw.js não é servido para o modo demonstração não ficar em cache no navegador.
    const file = statics.get(url.pathname);
    if (!file) { response.writeHead(404).end(); return; }
    const body = await readFile(resolve(root, file[0]));
    response.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : body);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const optionIndex = process.argv.findIndex((arg) => arg === '-p' || arg === '--port');
  const port = Number(optionIndex >= 0 ? process.argv[optionIndex + 1] : process.env.PORT ?? 3100);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Porta inválida.');
  await import('./build-original.mjs');
  const html = await buildDemoHtml();
  createDemoServer(html).listen(port, '127.0.0.1', () => {
    console.log(`\nModo demonstração da Garcia: http://localhost:${port}/`);
    console.log('Senha de acesso: a mesma do sistema. Dados fictícios; nenhuma gravação chega ao Supabase.\n');
  });
}
