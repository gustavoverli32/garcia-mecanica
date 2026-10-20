// Dados fictícios do modo demonstração. Nenhum registro aqui existe no Supabase real.
const hoje = new Date();
const dia = (offset) => {
  const d = new Date(hoje);
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
};

export const clientes = [
  { id: 1, nome: 'João Pereira (exemplo)', telefone: '(11) 90000-0001', email: 'joao@exemplo.test' },
  { id: 2, nome: 'Maria Souza (exemplo)', telefone: '(11) 90000-0002', email: 'maria@exemplo.test' },
  { id: 3, nome: 'Carlos Lima (exemplo)', telefone: '(11) 90000-0003', email: '' },
  { id: 4, nome: 'Fernanda Alves (exemplo)', telefone: '(11) 90000-0004', email: 'fernanda@exemplo.test' },
];

export const funcionarios = [
  { id: 1, nome: 'Pedro (mecânico exemplo)', cargo: 'Mecânico', salario: 3000, comissao: 10, status: 'Ativo' },
  { id: 2, nome: 'Ana (atendente exemplo)', cargo: 'Atendente', salario: 2200, comissao: 0, status: 'Ativo' },
];

export const ordens = [
  { id: 106, cliente_id: 4, mecanico_id: 1, status: 'Aguardando', data: dia(0), veiculo: 'Corolla 2018', placa: 'DEM0A06', servico: 'Diagnóstico de barulho na suspensão', valor: 150, valor_pago: 0, status_pagamento: 'Pendente' },
  { id: 105, cliente_id: 1, mecanico_id: 1, status: 'Em Andamento', data: dia(1), veiculo: 'Gol 1.6 2015', placa: 'DEM0A05', servico: 'Troca de pastilhas de freio', valor: 450, valor_pago: 0, status_pagamento: 'Pendente' },
  { id: 104, cliente_id: 2, mecanico_id: 1, status: 'Aguardando Peça', data: dia(2), veiculo: 'Onix 2020', placa: 'DEM0A04', servico: 'Troca de embreagem', valor: 1800, valor_pago: 500, status_pagamento: 'Parcial' },
  { id: 103, cliente_id: 3, mecanico_id: 1, status: 'Aguardando', data: dia(2), veiculo: 'HB20 2019', placa: 'DEM0A03', servico: 'Revisão 40 mil km', valor: 690, valor_pago: 0, status_pagamento: 'Pendente' },
  { id: 102, cliente_id: 1, mecanico_id: 1, status: 'Aguardando Pagamento', data: dia(5), veiculo: 'Gol 1.6 2015', placa: 'DEM0A05', servico: 'Alinhamento e balanceamento', valor: 180, valor_pago: 0, status_pagamento: 'Pendente' },
  { id: 101, cliente_id: 2, mecanico_id: 1, status: 'Concluída', data: dia(15), veiculo: 'Onix 2020', placa: 'DEM0A04', servico: 'Troca de óleo e filtro', valor: 250, valor_pago: 250, status_pagamento: 'Pago' },
  { id: 100, cliente_id: 4, mecanico_id: 1, status: 'Concluída', data: dia(40), veiculo: 'Corolla 2018', placa: 'DEM0A06', servico: 'Troca de correia dentada', valor: 1200, valor_pago: 1200, status_pagamento: 'Pago' },
];

export const faturamentos = [
  { id: 1, cliente_id: 2, os_id: 101, valor: 250, data: dia(15), forma: 'Pix', status: 'Pago' },
  { id: 2, cliente_id: 2, os_id: 104, valor: 500, data: dia(2), forma: 'Cartão', status: 'Pago' },
  { id: 3, cliente_id: 4, os_id: 100, valor: 1200, data: dia(40), forma: 'Dinheiro', status: 'Pago' },
];

export const despesas = [
  { id: 1, descricao: 'Aluguel (exemplo)', valor: 2500, data: dia(10), tipo: 'Fixa', cat: 'Aluguel', recorrente: true },
  { id: 2, descricao: 'Peças fornecedor (exemplo)', valor: 830, data: dia(6), tipo: 'Variável', cat: 'Peças' },
];

export const servicos = [
  { id: 1, nome: 'Troca de óleo', valor: 250 },
  { id: 2, nome: 'Alinhamento e balanceamento', valor: 180 },
  { id: 3, nome: 'Revisão completa', valor: 690 },
];

export const agendamentos = [
  { id: 1, cliente_id: 2, veiculo: 'Onix 2020', placa: 'DEM0A04', data_agendada: dia(-20), descricao: 'Próxima troca de óleo', status: 'Pendente' },
];

export const recomendacoes_ia = [];

export const melhorias_plataforma = [
  { id: 2, created_at: '2026-10-19T10:00:00Z', tipo: 'problema', area: 'Ordens de Serviço', pagina: 'Ordens de Serviço', status: 'novo',
    relato: 'Não consegui cadastrar a OS do cliente (exemplo), deu erro ao salvar com dois serviços.',
    resumo: 'Erro ao salvar OS com dois serviços.', proposta: 'Validar cada serviço antes de salvar e mostrar qual campo está com problema.' },
  { id: 1, created_at: '2026-10-18T14:20:00Z', tipo: 'sugestao', area: 'Clientes', pagina: 'Clientes', status: 'novo',
    relato: 'Seria bom poder buscar cliente pela placa do carro.',
    resumo: 'Buscar cliente pela placa.', proposta: 'Adicionar a placa como critério na busca de clientes.' },
];

// Acessos fictícios dos últimos 14 dias para o Dashboard DEV.
const telas = ['dashboard', 'os', 'os', 'os', 'clientes', 'receitas', 'despesas', 'financeiro'];
export const acessos_plataforma = [];
for (let dia = 13; dia >= 0; dia -= 1) {
  const aberturas = 2 + ((dia * 7) % 5);
  for (let i = 0; i < aberturas; i += 1) {
    const quando = new Date(Date.now() - dia * 864e5);
    quando.setHours(8 + ((i * 3 + dia) % 10), (i * 17) % 60, 0, 0);
    if (quando > new Date()) continue;
    const sessao = `demo-${dia}-${i}`;
    const dispositivo = (i + dia) % 3 === 0 ? 'celular' : 'computador';
    const base = { tipo: 'equipe', dispositivo, navegador: dispositivo === 'celular' ? 'Safari' : 'Chrome', sessao };
    acessos_plataforma.push({ ...base, id: acessos_plataforma.length + 1, evento: 'abertura', pagina: 'dashboard', created_at: quando.toISOString() });
    for (let t = 0; t < 3; t += 1) {
      acessos_plataforma.push({ ...base, id: acessos_plataforma.length + 1, evento: 'tela', pagina: telas[(i + t + dia) % telas.length],
        created_at: new Date(quando.getTime() + (t + 1) * 60000).toISOString() });
    }
  }
}
acessos_plataforma.reverse();

const nomeCliente = (id) => ({ nome: clientes.find((c) => c.id === id)?.nome ?? '' });

// Simula os joins `clientes!inner(nome)` usados pelo app.
export const tables = {
  clientes,
  funcionarios,
  ordens: ordens.map((o) => ({ ...o, clientes: nomeCliente(o.cliente_id) })),
  faturamentos: faturamentos.map((f) => ({ ...f, clientes: nomeCliente(f.cliente_id) })),
  despesas,
  servicos,
  agendamentos,
  recomendacoes_ia,
  melhorias_plataforma,
  acessos_plataforma,
};
