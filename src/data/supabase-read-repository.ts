import type { Cliente, Despesa, Faturamento, Funcionario, GarciaDataSnapshot, Identifier, OrdemServico } from '../domain/entities';
import { LEGACY_TABLES, type GarciaReadRepository, type LegacyTable } from '../domain/repository-contract';

type QueryResult<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>;

export interface ReadOnlySupabaseClient {
  from(table: LegacyTable): {
    select(columns?: string): {
      order(column: string, options?: { ascending?: boolean }): QueryResult<unknown>;
    };
  };
}

const tableSet = new Set<string>(LEGACY_TABLES);

function assertKnownTable(table: LegacyTable): void {
  if (!tableSet.has(table)) throw new Error(`Tabela não permitida: ${table}`);
}

function unwrap<T>(table: LegacyTable, result: { data: unknown[] | null; error: { message: string } | null }): T[] {
  if (result.error) throw new Error(`Falha ao ler ${table}: ${result.error.message}`);
  return (result.data ?? []) as T[];
}

/** Adaptador somente leitura para o schema atual. */
export class SupabaseReadRepository implements GarciaReadRepository {
  constructor(private readonly client: ReadOnlySupabaseClient) {}

  async loadSnapshot(): Promise<GarciaDataSnapshot> {
    const [ordens, clientes, faturamentos, despesas, funcionarios] = await Promise.all([
      this.read<OrdemServico>('ordens', 'id', false),
      this.read<Cliente>('clientes', 'nome', true),
      this.read<Faturamento>('faturamentos', 'data', false),
      this.read<Despesa>('despesas', 'data', false),
      this.read<Funcionario>('funcionarios', 'nome', true),
    ]);
    return { clientes, ordens, faturamentos, despesas, funcionarios };
  }

  async findById(table: LegacyTable, id: Identifier): Promise<Record<string, unknown> | null> {
    const rows = await this.read<Record<string, unknown>>(table, 'id', true);
    return rows.find((row) => String(row.id) === String(id)) ?? null;
  }

  private async read<T>(table: LegacyTable, orderColumn: string, ascending: boolean): Promise<T[]> {
    assertKnownTable(table);
    const result = await this.client.from(table).select('*').order(orderColumn, { ascending });
    return unwrap<T>(table, result);
  }
}
