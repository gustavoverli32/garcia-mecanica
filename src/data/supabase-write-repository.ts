import type { SupabaseClient } from '@supabase/supabase-js';
import type { Cliente, Despesa, Faturamento, Funcionario, Identifier, OrdemServico } from '../domain/entities';

type Row = Record<string, unknown>;

/**
 * Escritas da nova camada. Cada operação exige uma sessão Auth válida.
 * Exclusões não fazem parte desta primeira etapa para reduzir risco operacional.
 */
export class SupabaseWriteRepository {
  constructor(private readonly client: SupabaseClient) {}

  private async requireUser(): Promise<void> {
    const { data, error } = await this.client.auth.getUser();
    if (error || !data.user) throw new Error('Sessão Supabase Auth necessária para gravar dados.');
  }

  async createCliente(input: Pick<Cliente, 'nome' | 'telefone' | 'email'>): Promise<Cliente> {
    return this.insertOne('clientes', input);
  }

  async createOrdem(input: Omit<OrdemServico, 'id'>): Promise<OrdemServico> {
    return this.insertOne('ordens', input);
  }

  async createFaturamento(input: Omit<Faturamento, 'id'>): Promise<Faturamento> {
    return this.insertOne('faturamentos', input);
  }

  async createDespesa(input: Omit<Despesa, 'id'>): Promise<Despesa> {
    return this.insertOne('despesas', input);
  }

  async updateDespesa(id: Identifier, input: Partial<Omit<Despesa, 'id'>>): Promise<Despesa> {
    await this.requireUser();
    const { data, error } = await this.client.from('despesas').update(input).eq('id', id).select().single();
    if (error) throw new Error(`Falha ao atualizar despesa: ${error.message}`);
    return data as Despesa;
  }

  async createFuncionario(input: Omit<Funcionario, 'id'>): Promise<Funcionario> {
    return this.insertOne('funcionarios', input);
  }

  private async insertOne<T extends Row>(table: string, input: Row): Promise<T> {
    await this.requireUser();
    const { data, error } = await this.client.from(table).insert(input).select().single();
    if (error) throw new Error(`Falha ao gravar ${table}: ${error.message}`);
    return data as T;
  }
}
