"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

// Protege as rotas do app: sem sessão, manda para /login.
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { authed, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !authed) router.replace("/login");
  }, [hydrated, authed, router]);

  if (hydrated && !authed) return null;
  return <>{children}</>;
}
