import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente Supabase para uso EXCLUSIVO no servidor (Route Handlers / Server Actions).
// Usa a service_role key, que ignora RLS — por isso nunca pode ser importado por código
// client ("use client"). O import "server-only" acima quebra o build se isso acontecer.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdminEnabled = Boolean(url && serviceKey);

let admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!supabaseAdminEnabled) return null;
  if (!admin) {
    admin = createClient(url as string, serviceKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}
