-- Tabela dos relatos do assistente de melhorias (botão flutuante).
-- Rodar UMA vez no Supabase: Dashboard > SQL Editor > colar e executar.
-- Qualquer usuário do app pode só INSERIR relatos. Só o administrador (usuário do Supabase Auth
-- marcado com role "admin", passo 2 abaixo) pode LER. Ninguém pelo app pode alterar nem apagar.
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

drop policy if exists "melhorias_select_admin" on public.melhorias_plataforma;
create policy "melhorias_select_admin" on public.melhorias_plataforma
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant insert on public.melhorias_plataforma to anon, authenticated;
grant select on public.melhorias_plataforma to authenticated;

-- PASSO 2 (uma vez): crie seu usuário em Authentication > Users > "Add user" (e-mail + senha,
-- marque "Auto Confirm User"). Depois troque o e-mail abaixo pelo seu e rode esta linha:
-- update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'
--   where email = 'SEU_EMAIL_AQUI';
-- (o papel "admin" fica em app_metadata, que o próprio usuário não consegue alterar.)

-- ROLLBACK (apaga a tabela e todos os relatos; o usuário admin pode ser removido em Authentication > Users):
-- drop table if exists public.melhorias_plataforma;
