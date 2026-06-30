import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// Lê/grava o estado do app no Supabase, sempre scopeado pelo userId do Clerk.
// Nunca confia em um userId vindo do corpo da requisição — usa só o da sessão autenticada.
export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const supa = getSupabaseAdmin();
  if (!supa) return Response.json({ state: null, disabled: true });

  const { data, error } = await supa
    .from("harmony_state")
    .select("state")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ state: data?.state ?? null });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const supa = getSupabaseAdmin();
  if (!supa) return Response.json({ ok: false, disabled: true });

  const body = (await req.json().catch(() => null)) as { state?: unknown } | null;
  if (!body || typeof body.state !== "object" || body.state === null) {
    return Response.json({ error: "bad-request" }, { status: 400 });
  }

  const { error } = await supa
    .from("harmony_state")
    .upsert({ user_id: userId, state: body.state }, { onConflict: "user_id" });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
