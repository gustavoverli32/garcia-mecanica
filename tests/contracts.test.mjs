import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const source = (path) => readFile(new URL(path, root), 'utf8');

test('repositório de leitura não contém mutações Supabase', async () => {
  const code = await source('src/data/supabase-read-repository.ts');
  assert.doesNotMatch(code, /\.(insert|update|upsert|delete)\s*\(/);
});

test('repositório de escrita exige usuário autenticado', async () => {
  const code = await source('src/data/supabase-write-repository.ts');
  assert.match(code, /auth\.getUser\(\)/);
  assert.match(code, /requireUser/);
  assert.doesNotMatch(code, /delete[A-Z]\w*\s*\(/);
});

test('rotas modulares principais existem', async () => {
  for (const route of ['clientes', 'os', 'financeiro', 'funcionarios', 'configuracoes', 'login']) {
    assert.match(await source(`src/app/${route}/page.tsx`), /export default/);
  }
});

test('middleware protege rotas modulares', async () => {
  const code = await source('middleware.ts');
  assert.match(code, /\/login/);
  assert.match(code, /getUser\(\)/);
  assert.match(code, /NextResponse\.redirect/);
});

test('navegação mantém os destinos funcionais do painel', async () => {
  const code = await source('src/app/dashboard.tsx');
  for (const path of ['/', '/os', '/clientes', '/financeiro', '/funcionarios', '/configuracoes']) {
    assert.match(code, new RegExp(`href=["']${path.replace('/', '\\/')}`));
  }
});
