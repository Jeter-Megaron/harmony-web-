"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Auth local (stub) até a integração com Supabase. localStorage: "1" logado / "0" deslogado.
const KEY = "harmony-auth-v1";

interface Auth {
  authed: boolean;
  hydrated: boolean;
  login: () => void;
  logout: () => void;
}

const Ctx = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(true); // padrão logado (não bloqueia quem já usa)
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setAuthed(localStorage.getItem(KEY) !== "0");
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const login = () => {
    try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    setAuthed(true);
  };
  const logout = () => {
    try { localStorage.setItem(KEY, "0"); } catch { /* ignore */ }
    setAuthed(false);
  };

  return <Ctx.Provider value={{ authed, hydrated, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return c;
}
