"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useHarmony } from "@/lib/store";
import { CATEGORIAS } from "@/lib/data";
import type { FonteId } from "@/rules";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-surface-2/70 px-3 py-2 text-sm text-ink outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/40";

function ddmm(iso: string) {
  const [y, m, d] = iso.split("-");
  return d && m ? `${d}/${m}/${y}` : iso;
}

export function NovoLancamentoModal({ onClose }: { onClose: () => void }) {
  const { config, addLancamento, resolverFonte } = useHarmony();
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [override, setOverride] = useState<FonteId | "">("");

  const regra = config.categorias.find((c) => c.categoria === categoria);
  const travada = !!(regra && regra.travada);
  const fonteId = resolverFonte(categoria, travada ? undefined : override || undefined);
  const fonteNome = config.fontes.find((f) => f.id === fonteId)?.nome ?? "";
  const fallbackNome = config.fontes.find((f) => f.id === config.fallback)?.nome ?? "Salário";

  const valorNum = parseFloat(valor.replace(/\./g, "").replace(",", ".")) || 0;
  const canSave = descricao.trim().length > 0 && valorNum > 0;

  function salvar() {
    if (!canSave) return;
    addLancamento({
      data: ddmm(data),
      descricao: descricao.trim(),
      categoria,
      valor: valorNum,
      tipo: "gasto",
      pago: false,
      fonteOverride: travada ? undefined : override || undefined,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      {/* sem scroll: conteúdo compacto que sempre cabe na tela */}
      <div className="relative z-10 flex max-h-[96dvh] w-full max-w-[480px] flex-col rounded-2xl border border-white/10 bg-surface/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">Novo lançamento</h2>
          <button onClick={onClose} aria-label="Fechar" className="grid h-7 w-7 place-items-center rounded-full bg-surface-2 text-sub hover:text-ink">
            <X size={15} />
          </button>
        </div>

        <div className="mt-3.5 space-y-3">
          <label className="block">
            <span className="text-[11px] font-medium text-sub">Descrição</span>
            <input className={`mt-1 ${inputCls}`} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex.: Conta de luz" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] font-medium text-sub">Valor (R$)</span>
              <input className={`mt-1 font-mono ${inputCls}`} value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" inputMode="decimal" />
            </label>
            <label className="block">
              <span className="text-[11px] font-medium text-sub">Data</span>
              <input type="date" className={`mt-1 ${inputCls}`} value={data} onChange={(e) => setData(e.target.value)} />
            </label>
          </div>

          <label className="block">
            <span className="text-[11px] font-medium text-sub">Categoria</span>
            <select className={`mt-1 ${inputCls}`} value={categoria} onChange={(e) => { setCategoria(e.target.value); setOverride(""); }}>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c} className="bg-surface-2">{c}</option>
              ))}
            </select>
          </label>

          <div>
            <span className="text-[11px] font-medium text-sub">Fonte</span>
            {travada ? (
              <div className="mt-1 flex items-center justify-between rounded-lg border border-white/10 bg-surface-2/40 px-3 py-2 text-sm">
                <span>{fonteNome}</span>
                <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[10px] text-sub">Travado</span>
              </div>
            ) : (
              <select className={`mt-1 ${inputCls}`} value={override || fonteId} onChange={(e) => setOverride(e.target.value as FonteId)}>
                {config.fontes.map((f) => (
                  <option key={f.id} value={f.id} className="bg-surface-2">{f.nome}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-[11px] leading-snug text-[#b9a8ff]">
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
            Se o {fonteNome} não cobrir, o excedente sai do {fallbackNome} e você é avisado.
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2.5">
          <button onClick={onClose} className="rounded-lg border border-white/10 bg-surface-2/70 px-4 py-2 text-sm font-medium text-ink">
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={!canSave}
            className="rounded-lg bg-gradient-to-r from-[#5b3fd6] to-[#7e5bea] px-5 py-2 text-sm font-bold text-white shadow-[0_0_22px_rgba(139,108,255,0.5)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            Adicionar gasto
          </button>
        </div>
      </div>
    </div>
  );
}
