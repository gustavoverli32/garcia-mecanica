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

test('cards ativos podem ser arrastados e o cliente abre seu perfil', () => {
  const app = fixture();
  const el = { innerHTML: '' };
  app._renderOSFlow(el);
  assert.match(el.innerHTML, /draggable="true"/);
  assert.match(el.innerHTML, /_soltarOSEtapa\(event,'Aguardando Pagamento'\)/);
  assert.match(el.innerHTML, /Clique para abrir ou arraste/);
  const oldDocument = globalThis.document;
  globalThis.document = { getElementById: () => ({ style: {} }) };
  app._getObs = () => '';
  let modal = '';
  app._openModal = html => { modal = html; };
  try {
    app._abrirAtendimento(2);
    assert.match(modal, /gm-os-client-link/);
    assert.match(modal, /_modalHistoricoCliente\(1\)/);
    assert.match(modal, /Avançar etapa/);
    assert.match(modal, /Voltar etapa/);
    assert.match(modal, /Marcar como pago/);
  } finally { globalThis.document = oldDocument; }
});

test('mudança de etapa atualiza somente status e não toca em pagamento', async () => {
  const app = fixture();
  const writes = [];
  app._db = { from: table => {
    assert.equal(table, 'ordens');
    return { update: payload => {
      writes.push(payload);
      return { eq: (column, id) => {
        assert.equal(column, 'id'); assert.equal(id, 3);
        return { select: async () => ({ data: [{ id, status: payload.status }], error: null }) };
      } };
    } };
  } };
  app._load = async () => {};
  app._toast = () => {};
  assert.equal(await app._moverOSEtapa(3, 'Em Andamento'), true);
  assert.deepEqual(writes, [{ status: 'Em Andamento' }]);
  assert.equal(await app._moverOSEtapa(1, 'Aguardando'), false);
  assert.equal(await app._moverOSEtapa(3, 'Concluída'), false);
  assert.equal(writes.length, 1);
});

test('erro ao mover etapa mantém estado e avisa usuário', async () => {
  const app = fixture();
  app._db = { from: () => ({ update: () => ({ eq: () => ({ select: async () => ({ data: null, error: new Error('RLS') }) }) }) }) };
  let message = '';
  app._toast = text => { message = text; };
  assert.equal(await app._moverOSEtapa(3, 'Em Andamento'), false);
  assert.equal(app.state.ordens[0].status, 'Aguardando');
  assert.match(message, /Não foi possível mudar/);
});

test('nota final é gerada apenas para OS concluída e paga, com campos escapados', () => {
  const app = fixture();
  app.state.ordens[2].status_pagamento = 'Pago';
  app.state.ordens[2].valor_pago = 80;
  const oldDocument = globalThis.document;
  globalThis.document = { querySelector: () => ({ src: 'https://example.test/logo.png' }), getElementById: () => ({ style: {} }) };
  app._openModal = html => { app.modal = html; };
  try {
    app._modalNotaOS(2);
    assert.equal(app.modal, undefined);
    app._modalNotaOS(1);
    assert.match(app.modal, /Imprimir \/ salvar PDF/);
    assert.match(app.modal, /anexe manualmente o PDF/);
    const html = app._notaOSHTML(app.state.ordens[2]);
    assert.match(html, /Cliente &lt;Teste&gt;/);
    assert.doesNotMatch(html, /Cliente <Teste>/);
    assert.match(html, /PAGO/);
  } finally { globalThis.document = oldDocument; }
});

test('pagamento exige valor válido e forma escolhida antes de escrever', async () => {
  const app = fixture();
  let writes = 0;
  app._db = { from: () => { writes++; throw new Error('Não deveria escrever'); } };
  app._toast = () => {};
  const oldDocument = globalThis.document;
  const fields = { 'pg-valor': { value: '200' }, 'pg-forma-sel': { value: '' } };
  globalThis.document = { getElementById: id => fields[id] };
  try {
    await app._confirmarPagamento(2, true);
    assert.equal(writes, 0);
    fields['pg-forma-sel'].value = 'Pix';
    fields['pg-valor'].value = '201';
    await app._confirmarPagamento(2, true);
    assert.equal(writes, 0);
  } finally { globalThis.document = oldDocument; }
});

test('pagamento confirmado gera uma receita e libera nota; clique duplo é ignorado', async () => {
  const app = fixture();
  const writes = [];
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  app._db = { from: table => ({
    update: payload => ({ eq: async () => { writes.push({ table, payload }); await pending; return { error: null }; } }),
    insert: async payload => { writes.push({ table, payload }); return { error: null }; },
  }) };
  app._mecDaOS = () => null;
  app._today = () => '2026-10-18';
  app._toast = () => {};
  app._closeModal = () => {};
  app._load = async () => {
    Object.assign(app.state.ordens[1], { status: 'Concluída', status_pagamento: 'Pago', valor_pago: 200 });
  };
  let noted = 0;
  app._modalNotaOS = () => { noted++; };
  const oldDocument = globalThis.document;
  const fields = { 'pg-valor': { value: '200' }, 'pg-forma-sel': { value: 'Pix' } };
  globalThis.document = { getElementById: id => fields[id] };
  try {
    const first = app._confirmarPagamento(2, true);
    await app._confirmarPagamento(2, true);
    release();
    await first;
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(writes.length, 2);
    assert.deepEqual(writes[0], { table: 'ordens', payload: { status: 'Concluída', valor_pago: 200, status_pagamento: 'Pago' } });
    assert.equal(writes[1].table, 'faturamentos');
    assert.equal(writes[1].payload.valor, 200);
    assert.equal(noted, 1);
  } finally { globalThis.document = oldDocument; }
});

test('cobrança PIX usa somente o saldo restante e não confirma pagamento', () => {
  const app = fixture();
  app.state.ordens[1].valor_pago = 50;
  const oldWindow = globalThis.window;
  let opened = '';
  globalThis.window = { open: url => { opened = url; }, _pixPayload: 'PIX-TESTE' };
  try {
    app._whatsappPIX(2);
    const message = decodeURIComponent(new URL(opened).searchParams.get('text'));
    assert.match(message, /R\$ 150,00/);
    assert.doesNotMatch(message, /R\$ 200,00/);
  } finally { globalThis.window = oldWindow; }
});

test('nota mostra forma de pagamento registrada e cancelar marcação não conclui a OS', () => {
  const app = fixture();
  app.state.faturamentos = [{ os_id: 1, status: 'Pago', forma: 'Pix', valor: 80 }];
  app.state.ordens[2].status_pagamento = 'Pago';
  app.state.ordens[2].valor_pago = 80;
  app._mecDaOS = () => null;
  const oldDocument = globalThis.document;
  globalThis.document = { querySelector: () => null, getElementById: () => ({ style: {} }) };
  let modal = '';
  app._openModal = html => { modal = html; };
  try {
    assert.match(app._notaOSHTML(app.state.ordens[2]), /PAGO · R\$\s*80,00 · Pix/);
    app._modalPagamento(2, true);
    assert.match(modal, /Cancelar/);
    assert.doesNotMatch(modal, /_confirmarPagamento\(2,false\)/);
  } finally { globalThis.document = oldDocument; }
});
