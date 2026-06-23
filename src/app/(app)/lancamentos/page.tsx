"use client";

import { useEffect, useState } from "react";
import { useHarmony } from "@/lib/store";
import { GlassCard, brl } from "@/components/ui";
import { TopBar, MonthPill, PrimaryButton } from "@/components/TopBar";
import { Icon } from "@/components/icons";
import { EmptyState } from "@/components/EmptyState";
import { Chip, TableHead, TRow, type Col } from "@/components/Table";
import { IconButton } from "@/components/IconButton";
import { MaterialIcon } from "@/components/MaterialIcon";
import { Popconfirm } from "@/components/Modal";
import { Pagination } from "@/components/Pagination";
import type { FonteId } from "@/rules";

const COLS = "grid-cols-[34px_72px_minmax(0,1fr)_120px_140px_92px_56px_70px]";
const HEAD: Col[] = [
  { label: "#" },
  { label: "Data" },
  { label: "Descrição", sort: true },
  { label: "Categoria", sort: true },
  { label: "Fonte (auto)" },
  { label: "Valor", align: "right", sort: true },
  { label: "Pago" },
  { label: "Ações", align: "right" },
];
const PAGE = 8;

export default function Lancamentos() {
  const { lancamentos, config, resolverFonte, removeLancamento, togglePago, ciclo, openModal } = useHarmony();
  const fonteNome = (id: string) => config.fontes.find((f) => f.id === id)?.nome ?? "";

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<number | null>(null);
  const q = query.trim().toLowerCase();

  useEffect(() => setPage(1), [q]);

  const visiveis = lancamentos
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => !q || l.descricao.toLowerCase().includes(q) || l.categoria.toLowerCase().includes(q));
  const pageRows = visiveis.slice((page - 1) * PAGE, page * PAGE);

  const recapOrder: FonteId[] = ["beneficio", "vale", "salario", "outros"];
  const recap = recapOrder
    .map((id) => ({ id, nome: fonteNome(id), f: ciclo.fontes[id] }))
    .filter((r) => r.f && (r.f.saidasPretendidas > 0 || r.f.saidasReais > 0));
  const pendentes = lancamentos.filter((l) => !l.pago);
  const pendenteTotal = pendentes.reduce((s, l) => s + l.valor, 0);

  if (lancamentos.length === 0) {
    return (
      <div>
        <TopBar title="Lançamentos" subtitle="Junho 2026 · cadastre cada gasto como numa planilha">
          <MonthPill />
          <PrimaryButton onClick={openModal}>+&nbsp;&nbsp;Novo lançamento</PrimaryButton>
        </TopBar>
        <EmptyState
          title="Nenhum lançamento ainda"
          description="Cadastre seu primeiro gasto do mês para acompanhar saldos e cobertura por fonte."
          primaryLabel="+ Novo lançamento"
          onPrimary={openModal}
        />
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Lançamentos" subtitle="Junho 2026 · cadastre cada gasto como numa planilha">
        <MonthPill />
        <div className="flex items-center gap-2 rounded-[10px] border border-white/10 bg-surface/55 px-3 backdrop-blur-md focus-within:border-accent/60">
          <Icon name="search" size={16} className="text-ter" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar lançamento"
            aria-label="Buscar lançamento"
            className="h-[41px] w-44 bg-transparent text-xs text-ink outline-none placeholder:text-ter"
          />
        </div>
        <PrimaryButton onClick={openModal}>+&nbsp;&nbsp;Novo lançamento</PrimaryButton>
      </TopBar>

      {/* hint */}
      <div className="mb-4 flex items-center gap-2 rounded-[10px] border border-white/10 bg-surface/45 px-3.5 py-2.5 backdrop-blur-md">
        <span className="size-2 shrink-0 rounded-full bg-accent shadow-[0_0_6px_var(--color-accent)]" />
        <span className="text-xs text-sub">
          A Fonte é preenchida pela categoria. Um gasto só conta nos saldos quando você confirma o pagamento (✓).
        </span>
      </div>

      <GlassCard className="overflow-hidden">
        <TableHead grid={COLS} cols={HEAD} />

        {pageRows.map(({ l, i }) => {
          const fid = resolverFonte(l.categoria, l.fonteOverride);
          const regra = config.categorias.find((c) => c.categoria === l.categoria);
          return (
            <TRow key={i} grid={COLS} index={i} muted={!l.pago}>
              <span className="font-mono text-ter">{i + 1}</span>
              <span className="font-mono text-sub">{l.data}</span>
              <span className="truncate font-medium">{l.descricao}</span>
              <span className="truncate text-sub">{l.categoria}</span>
              <span className="flex items-center gap-1.5 text-sub">
                <span className="truncate">{fonteNome(fid)}</span>
                {regra?.travada && <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[9px] text-ter">trava</span>}
              </span>
              <span className="text-right font-mono font-bold">{brl(l.valor)}</span>
              <span>
                <Chip tone={l.pago ? "pos" : "amber"}>{l.pago ? "Sim" : "Não"}</Chip>
              </span>
              <span className="flex justify-end gap-1.5">
                <IconButton
                  size={30}
                  variant={l.pago ? "success" : "ghost"}
                  label={l.pago ? "Marcar como não pago" : "Confirmar pagamento"}
                  onClick={() => togglePago(i)}
                >
                  <MaterialIcon name="check" size={16} />
                </IconButton>
                <IconButton size={30} label="Excluir" onClick={() => setConfirm(i)}>
                  <MaterialIcon name="delete" size={16} className="text-neg" />
                </IconButton>
              </span>
            </TRow>
          );
        })}

        {/* linha "adicionar" (estilo planilha) — oculta durante a busca */}
        {!q && (
          <button
            onClick={openModal}
            className={`grid ${COLS} w-full items-center gap-3 border-b border-white/5 px-[18px] py-2.5 text-left text-sm text-ter transition hover:bg-white/[0.03]`}
          >
            <span className="font-mono">{lancamentos.length + 1}</span>
            <span className="font-mono">dd/mm</span>
            <span>+ adicionar gasto…</span>
            <span>Categoria</span>
            <span>—</span>
            <span className="text-right font-mono">R$ 0,00</span>
            <span />
            <span />
          </button>
        )}

        {q && !visiveis.length && <p className="px-[18px] py-6 text-sm text-sub">Nenhum lançamento encontrado para “{query}”.</p>}

        {/* total (apenas pagos) */}
        <div className={`grid ${COLS} items-center gap-3 border-t border-white/10 bg-surface-2/30 px-[18px] py-3 text-sm`}>
          <span />
          <span />
          <span className="font-semibold">Total pago do mês</span>
          <span />
          <span />
          <span className="text-right font-mono font-bold text-ink">{brl(ciclo.totalSaidas)}</span>
          <span />
          <span />
        </div>

        <Pagination total={visiveis.length} pageSize={PAGE} page={page} onPageChange={setPage} />
      </GlassCard>

      {/* recap por fonte + pendentes */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-sub">
        <span className="font-medium text-ter">Por fonte:</span>
        {recap.map((r) => {
          const gasto = r.id === "salario" ? r.f.saidasReais : r.f.saidasPretendidas;
          return (
            <span key={r.id} className="rounded-full border border-white/10 bg-surface/55 px-3 py-1 font-mono backdrop-blur-md">
              {r.nome} {brl(gasto)}
              {r.f.estouro > 0 && <span className="text-neg"> · estourou {brl(r.f.estouro)}</span>}
            </span>
          );
        })}
        {pendentes.length > 0 && (
          <span className="rounded-full px-3 py-1 font-mono" style={{ backgroundColor: "#2a2412", color: "#ffb81f" }}>
            {pendentes.length} pendente{pendentes.length > 1 ? "s" : ""} · {brl(pendenteTotal)}
          </span>
        )}
      </div>

      <Popconfirm
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm !== null && removeLancamento(confirm)}
        title="Excluir este lançamento?"
        message="O gasto será removido permanentemente."
      />
    </div>
  );
}
