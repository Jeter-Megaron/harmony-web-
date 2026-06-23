# Harmony — Supabase + Deploy (passo a passo)

Arquitetura escolhida: **auth do Supabase** (e-mail/senha + Google) + **1 linha por usuário** com o
estado do app em **JSONB** (casa com o store atual; protegido por RLS). Cliente roda no front com a
**anon key** (pública). A `service_role` key **nunca** vai pro front.

## 1. Criar o projeto Supabase
1. Acesse https://supabase.com → New project (free tier serve).
2. Escolha nome/senha do banco e uma região (ex.: São Paulo).

## 2. Rodar o schema
1. No projeto: **SQL Editor → New query**.
2. Cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e **Run**.
   (Cria a tabela `harmony_state` com RLS por usuário.)

## 3. Habilitar autenticação
1. **Authentication → Providers → Email**: deixe ligado (confirme se quer exigir verificação de e-mail).
2. **Authentication → Providers → Google**: ligar e preencher o OAuth (Client ID/Secret do Google Cloud).
   - Em produção, adicione a **Redirect URL** que o Supabase mostra ao app/Vercel.
   - (Dá pra começar só com e-mail/senha e ligar o Google depois.)

## 4. Pegar as chaves públicas
**Project Settings → API**:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Copie o `.env.local.example` para `.env.local` e cole os valores (ou me mande que eu configuro):
```
cp .env.local.example .env.local
```

## 5. Deploy na Vercel
1. Suba o `harmony-web` para um repositório no GitHub.
2. https://vercel.com → New Project → importe o repo (root = `gestao-financeira/harmony-web`).
3. Em **Environment Variables**, adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy. (Depois, pegue a URL de produção e adicione nas Redirect URLs do Google no Supabase.)

## O que falta no código (faço quando você me passar URL + anon key)
- Trocar o auth-stub local pelo **Supabase Auth** real (login/cadastro/Google/logout).
- Sincronizar o store com `harmony_state` (carrega no login, salva ao alterar; localStorage vira cache).
- Testar o fluxo conectado e então publicar.
