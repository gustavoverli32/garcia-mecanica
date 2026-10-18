/**
 * Contratos da aplicação atual.
 *
 * Estes tipos descrevem o payload existente; não são uma proposta de alteração
 * do schema do Supabase. Campos desconhecidos permanecem opcionais para que a
 * migração não force uma transformação dos registros legados.
 */
export type Identifier = number | string;

export interface Cliente {
  id: Identifier;
  nome: string;
  telefone?: string | null;
  email?: string | null;
  [key: string]: unknown;
}

export interface OrdemServico {
  id: Identifier;
  cliente_id?: Identifier | null;
  status?: string | null;
  valor?: number | string | null;
  valor_pago?: number | string | null;
  status_pagamento?: string | null;
  [key: string]: unknown;
}

export interface Faturamento {
  id: Identifier;
  cliente_id?: Identifier | null;
  valor?: number | string | null;
  data?: string | null;
  forma?: string | null;
  status?: string | null;
  [key: string]: unknown;
}

export interface Despesa {
  id: Identifier;
  valor?: number | string | null;
  data?: string | null;
  descricao?: string | null;
  [key: string]: unknown;
}

export interface Funcionario {
  id: Identifier;
  nome: string;
  comissao?: number | string | null;
  [key: string]: unknown;
}

export interface GarciaDataSnapshot {
  clientes: Cliente[];
  ordens: OrdemServico[];
  faturamentos: Faturamento[];
  despesas: Despesa[];
  funcionarios: Funcionario[];
}
