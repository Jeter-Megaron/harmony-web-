-- Harmony — schema do Supabase (auth = Clerk)
-- Abordagem: 1 linha por usuário com o estado do app em JSONB (config, lançamentos,
-- rendaMes, mesAtual). O acesso é SÓ pelo servidor (Next.js Route Handler /api/state)
-- usando a service_role key, scopeado pelo userId do Clerk. O navegador nunca toca no banco.
-- Rode este SQL no Supabase: SQL Editor → New query → Run.

create table if not exists public.harmony_state (
  user_id    text primary key,        -- id do usuário no Clerk (ex.: user_2abc...)
  state      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Tranca a tabela: RLS ligado e SEM policies públicas.
-- A service_role (usada só no servidor) ignora RLS; anon/authenticated não enxergam nada.
alter table public.harmony_state enable row level security;
revoke all on public.harmony_state from anon, authenticated;

-- atualiza updated_at automaticamente em cada UPDATE
create or replace function public.harmony_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists harmony_state_touch on public.harmony_state;
create trigger harmony_state_touch
  before update on public.harmony_state
  for each row execute function public.harmony_touch_updated_at();
