# Escopo do MVP

## Objetivo

Modernizar a experiência da Garcia Mecânica com a mesma organização de produto do
EconGNV, sem interromper a operação atual.

## Módulos

- Dashboard operacional
- Clientes e veículos
- Ordens de serviço
- Receitas e despesas
- Funcionários
- Configurações
- Assistente e recomendações financeiras

## Requisitos de qualidade

- Interface responsiva para desktop e celular.
- Identidade visual atual da Garcia preservada sem redesign.
- Dados persistidos no Supabase com as mesmas regras de segurança.
- Deploy com preview, validação e rollback.
- Nenhuma migração apaga ou transforma dados sem confirmação explícita.

## Fora do escopo

- Alteração ou limpeza dos dados existentes.
- Alteração de schema, RLS ou funções do Supabase.
- Redesign, troca de marca ou mudança do layout atual.
