"use client";

import { useState } from "react";
import { useHarmony } from "@/lib/store";
import { GlassCard, brl, CategoryDonut } from "@/components/ui";
import { TopBar, MonthPill, Segmented } from "@/components/TopBar";
import { EmptyState } from "@/components/EmptyState";
import { historicoMensal } from "@/lib/data";

function BarChart({ jun }: { jun: { entradas: number; saidas: number } }) {
  const dados = historicoMensal.map((m) => (m.mes === "Jun" ? { ...m, ...jun } : m));
  const max = Math.max(...dados.flatMap((d) => [d.entradas, d.saidas]), 1);
  const h = (v: number) => (v > 0 ? Math.max(6, Math.round((v / max) * 142)) : 6);
  return (
    <div className="flex h-[170px] w-full items-end gap-2">
      {dados.map((d) => (
        <div key={d.mes} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          <div className="flex items-end gap-[3px]">
            <div className="w-[9px] rounded-[3px] bg-gradient-to-t from-[#1fff9f] to-[#62ffbc]" style={{ height: h(d.entradas) }} />
            <div className="w-[9px] rounded-[3px] bg-gradient-to-t from-[#a24dff] to-[#be82ff]" style={{ height: h(d.saidas) }} />
          </div>
          <span className="text-[9px] text-sub">{d.mes}</span>
        </div>
      ))}
    </div>
  );
}

function LegendDot({ className }: { className: string }) {
  return <span className={`size-2.5 rounded-full ${className}`} />;
}

export default function Relatorios() {
  const { ciclo, config, lancamentos, openModal } = useHarmony();
  const [scope, setScope] = useState("Mês");
  const sobrou = ciclo.totalEntradas - ciclo.totalSaidas;
  const nCats = Object.keys(ciclo.porCategoria).length;
  const f = (id: string) => ciclo.fontes[id as keyof typeof ciclo.fontes];

  const kpis = [
    { label: "Entrou no mês", value: brl(ciclo.totalEntradas), cls: "text-pos", sub: "Salário + Benefício + Vale" },
    { label: "Saiu no mês", value: brl(ciclo.totalSaidas), cls: "", sub: `Em ${nCats} categorias` },
    { label: "Sobrou", value: brl(sobrou), cls: sobrou >= 0 ? "text-pos" : "text-neg", sub: "Poupança do Salário" },
    { label: "Estourou", value: brl(ciclo.estouroTotal), cls: ciclo.estouroTotal > 0 ? "text-neg" : "", sub: "Benefício → Salário" },
  ];

  const porFonte: Record<string, number> = {};
  for (const cf of config.fontes) {
    const v = ciclo.fontes[cf.id].saidasReais;
    if (v > 0) porFonte[cf.nome] = v;
  }

  const resumo = [
    `Benefício cobriu ${brl(Math.min(f("beneficio").saidasPretendidas, f("beneficio").disponivel))} das contas fixas${
      f("beneficio").estouro > 0 ? ` e estourou ${brl(f("beneficio").estouro)} (foi p/ Salário)` : ""
    }.`,
    `Vale alimentação acumulou ${brl(f("vale").saldoFinal)} para o próximo mês.`,
    `Salário sobrou ${brl(f("salario").saldoFinal)} (poupança do mês).`,
    f("outros").saidasReais > 0 || f("outros").disponivel > 0 ? "Outros: com renda avulsa no mês." : "Outros: sem renda avulsa neste mês.",
  ];

  if (lancamentos.length === 0) {
    return (
      <div>
        <TopBar title="Relatórios" subtitle="Como o mês de junho 2026 se comportou">
          <MonthPill />
        </TopBar>
        <EmptyState
          title="Sem dados para relatórios"
          description="Registre a renda e os gastos do mês para ver os gráficos e o resumo."
          primaryLabel="+ Novo lançamento"
          onPrimary={openModal}
        />
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Relatórios" subtitle="Como o mês de junho 2026 se comportou">
        <Segmented options={["Mês", "Ano"]} value={scope} onChange={setScope} />
        <MonthPill />
      </TopBar>

      <div className="space-y-5">
        {/* KPIs */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((k) => (
            <GlassCard key={k.label} className="p-[18px]">
              <p className="text-xs text-sub">{k.label}</p>
              <p className={`mt-1.5 font-mono text-2xl font-bold ${k.cls}`}>{k.value}</p>
              <p className="mt-2 text-[11px] text-ter">{k.sub}</p>
            </GlassCard>
          ))}
        </section>

        {/* Entradas × Saídas + Gasto por fonte */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <GlassCard className="p-[18px]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">Entradas × Saídas (2026)</h2>
              <div className="flex items-center gap-4 text-[11px] text-sub">
                <span className="flex items-center gap-1.5"><LegendDot className="bg-gradient-to-r from-[#1fff9f] to-[#62ffbc]" /> Entradas</span>
                <span className="flex items-center gap-1.5"><LegendDot className="bg-gradient-to-r from-[#a24dff] to-[#be82ff]" /> Saídas</span>
              </div>
            </div>
            <div className="mt-5">
              <BarChart jun={{ entradas: ciclo.totalEntradas, saidas: ciclo.totalSaidas }} />
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col items-center p-[18px]">
            <h2 className="self-start text-sm font-bold">Gasto por fonte</h2>
            <div className="mt-3 w-full">
              <CategoryDonut porCategoria={porFonte} centerLabel="saídas" vertical />
            </div>
          </GlassCard>
        </div>

        {/* Gasto por categoria + Resumo */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <GlassCard className="p-[18px]">
            <h2 className="text-sm font-bold">Gasto por categoria</h2>
            <div className="mt-4">
              <CategoryDonut porCategoria={ciclo.porCategoria} />
            </div>
          </GlassCard>

          <GlassCard className="p-[18px]">
            <h2 className="text-sm font-bold">Resumo do mês</h2>
            <ul className="mt-4 space-y-3">
              {resumo.map((t, i) => (
                <li key={i} className="flex gap-2.5 text-xs text-sub">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_6px_var(--color-accent)]" />
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
