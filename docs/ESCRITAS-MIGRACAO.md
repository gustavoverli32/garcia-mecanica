# Migração de escritas

## Implementado

- Clientes: criação
- Ordens de serviço: criação
- Faturamentos: criação
- Despesas: criação e atualização
- Funcionários: criação

Todas as operações exigem uma sessão válida do Supabase Auth.

## Ainda não ativado

As telas modulares continuam somente leitura. O adaptador de escrita está isolado
para revisão dos payloads e validação de RLS antes de ser conectado a botões ou
formulários.

Exclusões não foram implementadas nesta etapa.
