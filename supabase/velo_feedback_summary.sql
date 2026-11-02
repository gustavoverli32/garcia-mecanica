-- Indicadores públicos mínimos para a central Vello.
-- Relatos, autores, páginas, resumos e propostas continuam protegidos pela RLS.
create or replace function public.velo_feedback_summary()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'project', 'Garcia Mecânica',
    'total', count(*),
    'open', count(*) filter (where lower(coalesce(status, '')) not in ('resolvido', 'concluido', 'concluído', 'fechado'))
  )
  from public.melhorias_plataforma;
$$;
revoke all on function public.velo_feedback_summary() from public;
grant execute on function public.velo_feedback_summary() to anon, authenticated;
comment on function public.velo_feedback_summary() is 'Public aggregate for Vello. No feedback row, author or message is returned.';
