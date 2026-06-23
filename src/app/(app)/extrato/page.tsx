"use client";

import { useState } from "react";
import { useHarmony } from "@/lib/store";
import { GlassCard, brl } from "@/components/ui";
import { TopBar, MonthPill, Segmented } from "@/components/TopBar";
import { EmptyState } from "@/components/EmptyState";
import { Chip, TableHead, TRow, type Col } from "@/components/Table";
import type { FonteId } from "@/rules";

const COLS = "grid-cols-[minmax(0,1fr)_150px_150px_72px_96px]";
const HEAD: Col[] = [
  { label: "Lançamento", sort: true },
  { label: "Categoria" },
  { label: "Fonte" },
  { label: "Data" },
  { label: "Valor", align: "right" },
];
const ORDER: FonteId[] = ["beneficio", "vale", "salario", "outros"];

export default function Extrato() {
  const { lancamentos, config, resolverFonte, ciclo, openModal } = useHarmony();
  const [view, setView] = useState("Por fonte");
  const fonteNome = (id: string) => config.fontes.find((f) => f.id === id)?.nome ?? "";
  const pagosDe = (id: FonteId) => lancamentos.filter((l) => l.pago && resolverFonte(l.categoria, l.fonteOverride) === id);

  function headerChip(id: FonteId) {
    const f = ciclo.fontes[id];
    if (f.estouro > 0) return <Chip tone="neg">Estourou {brl(f.estouro)}</Chip>;
    if (id === "vale" && f.saldoFinal > 0) return <Chip tone="pos">Acumula {brl(f.saldoFinal)}</Chip>;
    if (id === "salario" && f.saldoFinal > 0) return <Chip tone="pos">Sobra {brl(f.saldoFinal)}</Chip>;
    return null;
  }

  const flat = [...lancamentos].filter((l) => l.pago).sort((a, b) => a.data.localeCompare(b.data));

  if (flat.length === 0) {
    return (
      <div>
        <TopBar title="Extrato" subtitle="Todos os lançamentos de junho 2026">
          <MonthPill />
        </TopBar>
        <EmptyState
          title="Nada no extrato deste mês"
          description="Gastos confirmados como pagos aparecem aqui, agrupados por fonte."
          primaryLabel="+ Novo lançamento"
          onPrimary={openModal}
        />
      </div>
    );
  }

  function cells(desc: string, cat: string, fonte: string, data: string, valor: number) {
    return (
      <>
        <span className="truncate font-medium">{desc}</span>
        <span className="truncate text-sub">{cat}</span>
        <span className="truncate text-sub">{fonte}</span>
        <span className="font-mono text-xs text-sub">{data}</span>
        <span className="text-right font-mono font-bold">{brl(valor)}</span>
      </>
    );
  }

  const rows: React.ReactNode[] = [];
  let z = 0;
  if (view === "Por fonte") {
    for (const id of ORDER) {
      const f = ciclo.fontes[id];
      const itens = pagosDe(id);
      const transbordo = id === "salario" && ciclo.estouroTotal > 0;
      if (!itens.length && !transbordo) continue;
      const right = id === "salario" ? brl(f.saidasReais) : `${brl(f.saidasPretendidas)} / ${brl(f.disponivel)}`;
      rows.push(
        <div key={`h-${id}`} className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-[18px] py-2.5">
          <span className="flex items-center gap-2">
            <span className="text-sm font-bold">{fonteNome(id)}</span>
            {headerChip(id)}
          </span>
          <span className="font-mono text-xs text-sub">{right}</span>
        </div>,
      );
      itens.forEach((l, k) => rows.push(<TRow key={`${id}-${k}`} grid={COLS} index={z++}>{cells(l.descricao, l.categoria, fonteNome(id), l.data, l.valor)}</TRow>));
      if (transbordo) rows.push(<TRow key="tb" grid={COLS} index={z++}>{cells("Cobertura de estouro (Benefício)", "Transbordo", "Salário", "30/06", ciclo.estouroTotal)}</TRow>);
    }
  } else {
    flat.forEach((l, k) => {
      const fid = resolverFonte(l.categoria, l.fonteOverride);
      rows.push(<TRow key={k} grid={COLS} index={z++}>{cells(l.descricao, l.categoria, fonteNome(fid), l.data, l.valor)}</TRow>);
    });
  }

  return (
    <div>
      <TopBar title="Extrato" subtitle="Todos os lançamentos de junho 2026">
        <Segmented options={["Por fonte", "Por data"]} value={view} onChange={setView} />
        <MonthPill />
      </TopBar>

      {/* KPI gasto do mês */}
      <GlassCard className="mb-4 inline-block px-4 py-3">
        <p className="text-xs text-sub">Gasto do mês</p>
        <p className="font-mono text-2xl font-bold">{brl(ciclo.totalSaidas)}</p>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <TableHead grid={COLS} cols={HEAD} />
        {rows}
      </GlassCard>
    </div>
  );
}
