-- Harmony — schema do Supabase
-- Abordagem: 1 linha por usuário com o estado do app em JSONB (config, lançamentos,
-- rendaMes, mesAtual). Simples, casa com o store atual e protegido por RLS.
-- Rode este SQL no Supabase: SQL Editor → New query → Run.

create table if not exists public.harmony_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  state      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.harmony_state enable row level security;

-- cada usuário só enxerga/edita o próprio estado
drop policy if exists "harmony_state_select_own" on public.harmony_state;
create policy "harmony_state_select_own" on public.harmony_state
  for select using (auth.uid() = user_id);

drop policy if exists "harmony_state_insert_own" on public.harmony_state;
create policy "harmony_state_insert_own" on public.harmony_state
  for insert with check (auth.uid() = user_id);

drop policy if exists "harmony_state_update_own" on public.harmony_state;
create policy "harmony_state_update_own" on public.harmony_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- atualiza updated_at automaticamente
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
