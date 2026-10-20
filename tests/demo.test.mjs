import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildDemoHtml, createDemoServer } from '../scripts/serve-demo.mjs';

test('modo demonstração não aponta para o Supabase real', async () => {
  const html = await buildDemoHtml();
  assert.doesNotMatch(html, /qjdvrqlcblkynheitkuk/);
  assert.match(html, /MODO DEMONSTRA/);
});

test('modo demonstração lê dados fictícios e recusa gravações', async () => {
  const server = createDemoServer('<html></html>').listen(0, '127.0.0.1');
  await new Promise((done) => server.once('listening', done));
  const base = `http://127.0.0.1:${server.address().port}/demo-supabase/rest/v1`;
  try {
    const clientes = await (await fetch(`${base}/clientes?select=*&order=nome.asc`)).json();
    assert.ok(clientes.length > 0);
    assert.ok(clientes.every((c) => c.nome.includes('(exemplo)')));
    for (const method of ['POST', 'PATCH', 'PUT', 'DELETE']) {
      const response = await fetch(`${base}/clientes?id=eq.1`, { method, body: '{}' });
      assert.equal(response.status, 403, method);
    }
  } finally {
    server.close();
  }
});
