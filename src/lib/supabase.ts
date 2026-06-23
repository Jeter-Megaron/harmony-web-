import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente Supabase (lado do cliente). Só ativa quando as variáveis públicas existem;
// sem elas, o app continua funcionando localmente (localStorage).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && anon);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseEnabled) return null;
  if (!client) {
    client = createClient(url as string, anon as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}
