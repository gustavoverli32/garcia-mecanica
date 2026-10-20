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

// Assistente de melhorias: login de desenvolvedor (senha DEV), relatos guardados só em memória
// e uma "IA" simulada que classifica o relato por palavras-chave.
export const DEMO_DEV_PASSWORD = 'DEV';
const DEMO_ADMIN_TOKEN = 'demo-admin-token';
const readBody = (request) => new Promise((done) => {
  let raw = '';
  request.on('data', (chunk) => { raw += chunk; });
  request.on('end', () => { try { done(JSON.parse(raw || '{}')); } catch { done({}); } });
});

function iaSimulada(pergunta) {
  const relato = (pergunta.match(/Relato do usuário: """([\s\S]*)"""/)?.[1] ?? pergunta).trim();
  const texto = relato.toLowerCase();
  const tipo = /erro|problema|não consegui|nao consegui|travou|bug|não salva|não funciona/.test(texto) ? 'problema'
    : /seria bom|sugest|poderia|gostaria|melhor se/.test(texto) ? 'sugestao' : 'duvida';
  const area = /\bos\b|ordem de serviço|ordem de servico/.test(texto) ? 'Ordens de Serviço'
    : /cliente/.test(texto) ? 'Clientes' : /despesa/.test(texto) ? 'Despesas'
    : /receita|pagamento|financeiro/.test(texto) ? 'Financeiro' : (pergunta.match(/tela "([^"]*)"/)?.[1] || 'Geral');
  return JSON.stringify({
    tipo,
    area,
    resumo: relato.slice(0, 140),
    proposta: `(Proposta simulada no modo demonstração) Revisar o fluxo de ${area} para resolver: "${relato.slice(0, 80)}".`,
  });
}

async function handleAuth(request, response, path, cors) {
  const body = await readBody(request);
  if (!path.startsWith('/auth/v1/token') || body.password !== DEMO_DEV_PASSWORD) {
    json(response, 400, { error: 'invalid_grant', error_description: 'Invalid login credentials' }, cors);
    return;
  }
  const now = Math.floor(Date.now() / 1000);
  json(response, 200, {
    access_token: DEMO_ADMIN_TOKEN, token_type: 'bearer', expires_in: 3600, expires_at: now + 3600, refresh_token: 'demo',
    user: { id: 'demo-dev', aud: 'authenticated', role: 'authenticated', email: body.email || 'dev@demo',
      app_metadata: { role: 'admin' }, user_metadata: {}, created_at: new Date().toISOString() },
  }, cors);
}

async function handleApi(request, response, url) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, PATCH, PUT, DELETE, OPTIONS',
  };
  if (request.method === 'OPTIONS') { response.writeHead(204, cors).end(); return; }
  const path = url.pathname.replace('/demo-supabase', '');
  if (path.startsWith('/auth/v1/')) {
    if (path.startsWith('/auth/v1/logout')) { response.writeHead(204, cors).end(); return; }
    await handleAuth(request, response, path, cors);
    return;
  }
  if (path.startsWith('/functions/v1/assistente-ia')) {
    const { pergunta = '' } = await readBody(request);
    json(response, 200, { resposta: iaSimulada(pergunta) }, cors);
    return;
  }
  const isAdmin = String(request.headers.authorization ?? '').includes(DEMO_ADMIN_TOKEN);
  const tabelaDev = path.match(/^\/rest\/v1\/(melhorias_plataforma|acessos_plataforma)$/)?.[1];
  if (tabelaDev) {
    if (request.method === 'POST') {
      const row = await readBody(request);
      tables[tabelaDev].unshift({ ...row, id: Date.now(), created_at: new Date().toISOString(),
        ...(tabelaDev === 'melhorias_plataforma' ? { status: 'novo' } : {}) });
      if (tabelaDev === 'melhorias_plataforma') console.log(`Relato registrado (só em memória): ${row.tipo} — ${row.area}`);
      json(response, 201, [], cors);
      return;
    }
    // Como a RLS real: só o desenvolvedor logado lê relatos e acessos.
    if (!isAdmin) { json(response, 200, [], cors); return; }
  }
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
    if (url.pathname.startsWith('/demo-supabase/')) { await handleApi(request, response, url); return; }
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
    console.log('Senha de acesso: a mesma do sistema. Desenvolvedor (ícone no canto do login): senha DEV.');
    console.log('Dados fictícios; nenhuma gravação chega ao Supabase. Relatos do assistente ficam só na memória.\n');
  });
}
