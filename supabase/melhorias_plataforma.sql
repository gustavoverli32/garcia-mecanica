-- Tabela dos relatos do assistente de melhorias (botão flutuante).
-- Rodar UMA vez no Supabase: Dashboard > SQL Editor > colar e executar.
-- O app (chave publishable/anon) só pode INSERIR e LER. Não pode alterar nem apagar.
-- Para desfazer: veja o bloco "ROLLBACK" no final.

create table if not exists public.melhorias_plataforma (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  tipo       text not null default 'sugestao' check (tipo in ('problema', 'sugestao', 'duvida')),
  area       text,
  pagina     text,
  relato     text not null check (char_length(relato) between 1 and 4000),
  resumo     text,
  proposta   text,
  status     text not null default 'novo'
);

alter table public.melhorias_plataforma enable row level security;

drop policy if exists "melhorias_insert" on public.melhorias_plataforma;
create policy "melhorias_insert" on public.melhorias_plataforma
  for insert to anon, authenticated
  with check (status = 'novo');

drop policy if exists "melhorias_select" on public.melhorias_plataforma;
create policy "melhorias_select" on public.melhorias_plataforma
  for select to anon, authenticated
  using (true);

grant insert, select on public.melhorias_plataforma to anon, authenticated;

-- ROLLBACK (apaga a tabela e todos os relatos):
-- drop table if exists public.melhorias_plataforma;
