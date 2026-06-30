# Harmony — Supabase (persistência entre dispositivos)

**Arquitetura:** autenticação é o **Clerk**. O Supabase guarda **1 linha por usuário** com o estado
do app em **JSONB** (`config`, `lançamentos`, `rendaMes`, `mesAtual`). O banco é acessado **só pelo
servidor** (Next.js Route Handler `/api/state`) usando a **service_role key**, scopeado pelo `userId`
do Clerk. O navegador **nunca** fala direto com o Supabase, então a `service_role` (secreta) fica só
no servidor. O `localStorage` vira apenas cache local pra não "piscar" vazio no carregamento.

## 1. Criar o projeto Supabase
1. https://supabase.com → **New project** (free tier serve).
2. Escolha nome, senha do banco e região (ex.: São Paulo).

## 2. Rodar o schema
1. No projeto: **SQL Editor → New query**.
2. Cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e **Run**.
   - Cria a tabela `harmony_state` com `user_id text` (id do Clerk), RLS ligado e **trancada**
     (sem policies públicas — só a service_role enxerga).

## 3. Pegar as chaves
**Project Settings → API**:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **service_role** (em *Project API keys*, a secreta — clique em *Reveal*) → `SUPABASE_SERVICE_ROLE_KEY`
  - ⚠️ É **secreta**: nunca cole em chat, nunca versione, nunca exponha no front.

## 4. Local (.env.local)
Copie o exemplo e preencha:
```
cp .env.local.example .env.local
```
Preencha `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (além das chaves do Clerk que já existem).

## 5. Vercel (produção)
**Project → Settings → Environment Variables** (marque *Production*, *Preview* e *Development*):
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Depois **Redeploy**. (As chaves do Clerk já devem estar lá da etapa anterior.)

## Como funciona no código
- `supabase/schema.sql` — tabela + RLS trancada.
- `src/lib/supabase-server.ts` — client server-only com a service_role (`import "server-only"`).
- `src/app/api/state/route.ts` — `GET` lê / `POST` grava o estado do usuário autenticado (Clerk `auth()`).
- `src/lib/store.tsx` — no login busca `/api/state`; ao alterar dados, faz `POST` (debounced). localStorage = cache.

> Se as variáveis do Supabase não estiverem setadas, o app **continua funcionando** só com o cache
> local (sem sincronizar entre dispositivos) — `/api/state` responde `{ disabled: true }`.
