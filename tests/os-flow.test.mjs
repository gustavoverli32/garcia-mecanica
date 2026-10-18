import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test } from 'node:test';

const sourceDir = resolve('src/legacy/source');
const files = (await readdir(sourceDir)).filter(name => /^(0[4-9]|1[01])-.*\.js$/.test(name)).sort();
const source = (await Promise.all(files.map(name => readFile(resolve(sourceDir, name), 'utf8')))).join('\n');
const Component = new Function('DCLogic', `${source}\nreturn Component;`)(class {});

function fixture() {
  const app = new Component();
  app.state = {
    ordens: [
      { id: 3, cliente_id: 1, clientes: { nome: 'Cliente <Teste>' }, status: 'Aguardando', data: '2026-10-18', veiculo: 'Carro A', servico: 'Troca de óleo', valor: 100 },
      { id: 2, cliente_id: 1, clientes: { nome: 'Cliente <Teste>' }, status: 'Aguardando Pagamento', data: '2026-10-17', veiculo: 'Carro B', servico: 'Revisão', valor: 200 },
      { id: 1, cliente_id: 1, clientes: { nome: 'Cliente <Teste>' }, status: 'Concluída', data: '2026-09-01', veiculo: 'Carro C', servico: 'Alinhamento', valor: 80 },
    ],
    clientes: [{ id: 1, nome: 'Cliente <Teste>', telefone: '0000-0000', email: 'cliente@example.test' }],
    osMonthFilter: '', osPeriodFilter: 'todos',
  };
  return app;
}

test('fluxo separa OS abertas por etapa e mantém concluídas no histórico', () => {
  const app = fixture();
  const el = { innerHTML: '' };
  app._renderOSFlow(el);
  assert.match(el.innerHTML, /2 OS abertas/);
  assert.match(el.innerHTML, /1 concluídas/);
  assert.match(el.innerHTML, /Aguardando pagamento/);
  assert.match(el.innerHTML, /gm-os-history-item/);
  assert.match(el.innerHTML, /Abrir atendimento da OS 3/);
  assert.match(el.innerHTML, /Abrir atendimento da OS 1/);
  assert.doesNotMatch(el.innerHTML, /Cliente <Teste>/);
  assert.match(el.innerHTML, /Cliente &lt;Teste&gt;/);
});

test('filtros do histórico não ocultam atendimentos abertos', () => {
  const app = fixture();
  app.state.osMonthFilter = '2026-10';
  const el = { innerHTML: '' };
  app._renderOSFlow(el);
  assert.match(el.innerHTML, /2 OS abertas/);
  assert.doesNotMatch(el.innerHTML, /gm-os-history-item/);
  assert.match(el.innerHTML, /Nenhuma OS concluída encontrada/);
});

test('card abre dados existentes e ações legadas sem escrever no banco', () => {
  const app = fixture();
  const oldDocument = globalThis.document;
  globalThis.document = { getElementById: () => ({ style: {} }) };
  app._getObs = () => '';
  let modal = '';
  app._openModal = html => { modal = html; };
  try {
    app._abrirAtendimento(3);
    assert.match(modal, /cliente@example\.test/);
    assert.match(modal, /Ver histórico completo do cliente/);
    assert.match(modal, /Editar OS e status/);
    assert.match(modal, /Gerar orçamento/);
    assert.match(modal, /Cobrar via PIX/);
    assert.doesNotMatch(modal, /Cliente <Teste>/);
  } finally {
    globalThis.document = oldDocument;
  }
});
