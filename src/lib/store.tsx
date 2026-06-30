"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { computeCiclo, resolverFonte as resolver } from "@/rules";
import type { Config, Lancamento, FonteId, CategoriaRegra, CicloResult } from "@/rules";
import { config as seedConfig, lancamentos as seedLancamentos, rendaMes as seedRenda, MES_ATUAL, MESES } from "@/lib/data";

const KEY = "harmony-state-v3";

export interface RendaEntry {
  mes: string;
  fonteId: FonteId;
  fonteNome: string;
  valor: number;
  repete: boolean;
  acumula: boolean;
}

type RendaMes = Record<string, Partial<Record<FonteId, number>>>;
type SavedState = Partial<{ config: Config; lancamentos: Lancamento[]; rendaMes: RendaMes; mesAtual: string }>;
const normLanc = (xs: Lancamento[]) => xs.map((l) => ({ ...l, pago: l.pago ?? true, mes: l.mes ?? MES_ATUAL }));

interface Store {
  config: Config;
  lancamentos: Lancamento[];
  rendaMes: RendaMes;
  rendaEntries: RendaEntry[];
  mesAtual: string;
  meses: string[];
  ciclo: CicloResult;
  hydrated: boolean;
  modalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  setMesAtual: (m: string) => void;
  addLancamento: (l: Lancamento) => void;
  removeLancamento: (index: number) => void;
  togglePago: (index: number) => void;
  // fontes / renda
  setFonteValor: (id: FonteId, valor: number) => void;
  toggleAcumula: (id: FonteId) => void;
  toggleRepete: (id: FonteId) => void;
  setRenda: (mes: string, fonte: FonteId, valor: number) => void;
  removeRenda: (mes: string, fonte: FonteId) => void;
  // categorias (CRUD)
  addCategoria: (c: CategoriaRegra) => void;
  editCategoria: (original: string, c: CategoriaRegra) => void;
  removeCategoria: (categoria: string) => void;
  setTrava: (categoria: string, fonte: FonteId, travada: boolean) => void;
  resolverFonte: (categoria: string, override?: FonteId) => FonteId;
}

const Ctx = createContext<Store | null>(null);
const ORDER: FonteId[] = ["salario", "beneficio", "vale", "outros"];

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, user } = useUser();
  const [config, setConfig] = useState<Config>(seedConfig);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>(seedLancamentos);
  const [rendaMes, setRendaMes] = useState<RendaMes>(seedRenda);
  const [mesAtual, setMesAtual] = useState<string>(MES_ATUAL);
  const [hydrated, setHydrated] = useState(false);
  const [serverReady, setServerReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const userRef = useRef(user);
  userRef.current = user;
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // carrega o estado: cache local (pintura instantânea) → Supabase via /api/state (fonte da verdade entre dispositivos)
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setHydrated(true);
      return;
    }
    if (serverReady) return;

    const apply = (saved: SavedState | null | undefined) => {
      if (!saved || typeof saved !== "object") return;
      if (saved.config) setConfig(saved.config);
      if (saved.lancamentos) setLancamentos(normLanc(saved.lancamentos));
      if (saved.rendaMes) setRendaMes(saved.rendaMes);
      if (saved.mesAtual) setMesAtual(saved.mesAtual);
    };

    // 1) cache local por usuário — evita "piscar" vazio enquanto o servidor responde
    try {
      const raw = localStorage.getItem(`${KEY}-${user.id}`);
      if (raw) apply(JSON.parse(raw) as SavedState);
    } catch {
      /* ignore */
    }

    // 2) servidor (Supabase) — vence o cache local, sincroniza entre dispositivos
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/state");
        if (res.ok) {
          const json = (await res.json()) as { state?: SavedState | null };
          if (!cancelled && json?.state) apply(json.state);
        }
      } catch {
        /* offline / sem supabase: segue com o cache local */
      }
      if (!cancelled) {
        setServerReady(true);
        setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, user, serverReady]);

  // salva: cache local imediato + POST debounced p/ o Supabase (/api/state)
  useEffect(() => {
    if (!hydrated || !serverReady) return;
    const u = userRef.current;
    if (!u) return;
    const snapshot = { config, lancamentos, rendaMes, mesAtual };
    try {
      localStorage.setItem(`${KEY}-${u.id}`, JSON.stringify(snapshot));
    } catch {
      /* ignore */
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void fetch("/api/state", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ state: snapshot }),
      }).catch(() => {});
    }, 1000);
  }, [config, lancamentos, rendaMes, mesAtual, hydrated, serverReady]);

  // config efetiva do mês: entradaMensal = override do mês, senão padrão (se repete) ou 0
  const effectiveConfig = useMemo<Config>(
    () => ({
      ...config,
      fontes: config.fontes.map((f) => ({
        ...f,
        entradaMensal: rendaMes[mesAtual]?.[f.id] ?? (f.repeteMensal ? f.entradaMensal : 0),
      })),
    }),
    [config, rendaMes, mesAtual],
  );

  // só lançamentos pagos do mês selecionado contam no ciclo (saldos, cobertura, totais, relatórios)
  const ciclo = useMemo(
    () => computeCiclo(effectiveConfig, lancamentos.filter((l) => l.pago && (l.mes ?? MES_ATUAL) === mesAtual)),
    [effectiveConfig, lancamentos, mesAtual],
  );

  const meses = MESES;

  const rendaEntries = useMemo<RendaEntry[]>(() => {
    const rows: RendaEntry[] = [];
    for (const mes of Object.keys(rendaMes)) {
      const m = rendaMes[mes];
      for (const fid of ORDER) {
        const v = m[fid];
        if (v === undefined) continue;
        const f = config.fontes.find((x) => x.id === fid);
        if (!f) continue;
        rows.push({ mes, fonteId: fid, fonteNome: f.nome, valor: v, repete: f.repeteMensal, acumula: f.acumula });
      }
    }
    return rows;
  }, [rendaMes, config]);

  const store: Store = {
    config,
    lancamentos,
    rendaMes,
    rendaEntries,
    mesAtual,
    meses,
    ciclo,
    hydrated,
    modalOpen,
    openModal: () => setModalOpen(true),
    closeModal: () => setModalOpen(false),
    setMesAtual,
    addLancamento: (l) => setLancamentos((xs) => [...xs, l]),
    removeLancamento: (i) => setLancamentos((xs) => xs.filter((_, idx) => idx !== i)),
    togglePago: (i) => setLancamentos((xs) => xs.map((l, idx) => (idx === i ? { ...l, pago: !l.pago } : l))),
    setFonteValor: (id, valor) => setConfig((c) => ({ ...c, fontes: c.fontes.map((f) => (f.id === id ? { ...f, entradaMensal: valor } : f)) })),
    toggleAcumula: (id) => setConfig((c) => ({ ...c, fontes: c.fontes.map((f) => (f.id === id ? { ...f, acumula: !f.acumula } : f)) })),
    toggleRepete: (id) => setConfig((c) => ({ ...c, fontes: c.fontes.map((f) => (f.id === id ? { ...f, repeteMensal: !f.repeteMensal } : f)) })),
    setRenda: (mes, fonte, valor) => setRendaMes((r) => ({ ...r, [mes]: { ...(r[mes] ?? {}), [fonte]: valor } })),
    removeRenda: (mes, fonte) =>
      setRendaMes((r) => {
        const m = { ...(r[mes] ?? {}) };
        delete m[fonte];
        return { ...r, [mes]: m };
      }),
    addCategoria: (c) => setConfig((cfg) => (cfg.categorias.some((x) => x.categoria === c.categoria) ? cfg : { ...cfg, categorias: [...cfg.categorias, c] })),
    editCategoria: (original, c) => setConfig((cfg) => ({ ...cfg, categorias: cfg.categorias.map((x) => (x.categoria === original ? c : x)) })),
    removeCategoria: (categoria) => setConfig((cfg) => ({ ...cfg, categorias: cfg.categorias.filter((x) => x.categoria !== categoria) })),
    setTrava: (categoria, fonte, travada) =>
      setConfig((c) => {
        const exists = c.categorias.some((x) => x.categoria === categoria);
        const categorias = exists
          ? c.categorias.map((x) => (x.categoria === categoria ? { ...x, fonte, travada } : x))
          : [...c.categorias, { categoria, fonte, travada }];
        return { ...c, categorias };
      }),
    resolverFonte: (categoria, override) => resolver(config, { data: "", descricao: "", categoria, valor: 0, fonteOverride: override }),
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useHarmony() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useHarmony deve ser usado dentro de <StoreProvider>");
  return s;
}
