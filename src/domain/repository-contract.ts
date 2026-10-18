import type { GarciaDataSnapshot, Identifier } from './entities';

/** Tabelas existentes. Os nomes são deliberadamente imutáveis durante a migração. */
export const LEGACY_TABLES = Object.freeze([
  'clientes',
  'ordens',
  'faturamentos',
  'despesas',
  'funcionarios',
  'recomendacoes_ia',
  'agendamentos',
  'servicos',
] as const);

export type LegacyTable = (typeof LEGACY_TABLES)[number];

/**
 * Fronteira de dados para a futura aplicação.
 * A implementação inicial será somente leitura; mutações continuam no legado
 * até haver testes e aprovação explícita para cada fluxo.
 */
export interface GarciaReadRepository {
  loadSnapshot(): Promise<GarciaDataSnapshot>;
  findById(table: LegacyTable, id: Identifier): Promise<Record<string, unknown> | null>;
}
