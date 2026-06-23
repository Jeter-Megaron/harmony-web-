"use client";

import { useHarmony } from "@/lib/store";
import { SourceCards, CoverageBars, CategoryDonut, GlassCard, FONTE_ICON, brl } from "@/components/ui";
import { Icon } from "@/components/icons";
import { TopBar, MonthPill, PrimaryButton } from "@/components/TopBar";
import { EmptyState } from "@/components/EmptyState";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { ciclo, config, lancamentos, resolverFonte, openModal } = useHarmony();
  const router = useRouter();
  const fonteNome = (id: string) => config.fontes.find((f) => f.id === id)?.nome ?? "";
  const recentes = [...lancamentos].filter((l) => l.pago).reverse();

  if (lancamentos.length === 0) {
    return (
      <div>
        <TopBar title="Painel financeiro" subtitle="Visão do mês de junho 2026">
          <MonthPill />
          <PrimaryButton onClick={openModal}>+&nbsp;&nbsp;Novo lançamento</PrimaryButton>
        </TopBar>
        <EmptyState
          title="Tudo zerado por aqui"
          description="Defina a renda do mês e registre seus gastos para ver saldos, cobertura por fonte e relatórios."
          primaryLabel="+ Novo lançamento"
          onPrimary={openModal}
          secondaryLabel="Definir renda do mês"
          onSecondary={() => router.push("/renda")}
        />
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Painel financeiro" subtitle="Visão do mês de junho 2026">
        <MonthPill />
        <PrimaryButton onClick={openModal}>+&nbsp;&nbsp;Novo lançamento</PrimaryButton>
      </TopBar>

      <div className="space-y-5">
      {/* alerta de estouro (235:46) */}
      {ciclo.alertas.length > 0 && (
        <div className="flex items-center gap-2 rounded-[10px] border border-[rgba(255,93,110,0.4)] bg-[rgba(51,26,33,0.6)] px-3.5 py-2.5 shadow-[0_0_18px_rgba(255,93,110,0.18)] backdrop-blur-md">
          <span className="size-2 shrink-0 rounded-full bg-neg shadow-[0_0_8px_var(--color-neg)]" />
          <span className="text-xs font-medium text-neg">{ciclo.alertas[0]}</span>
        </div>
      )}

      {/* cards das fontes */}
      <SourceCards ciclo={ciclo} config={config} />

      {/* grid principal: esquerda (cobertura + categoria) · direita (extrato) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.95fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <GlassCard className="p-[18px]">
            <h2 className="text-sm font-bold">Cobertura por fonte</h2>
            <div className="mt-5">
              <CoverageBars ciclo={ciclo} config={config} />
            </div>
          </GlassCard>

          <GlassCard className="p-[18px]">
            <h2 className="text-sm font-bold">Gasto por categoria</h2>
            <div className="mt-4">
              <CategoryDonut porCategoria={ciclo.porCategoria} />
            </div>
          </GlassCard>
        </div>

        {/* extrato recente */}
        <GlassCard className="flex flex-col p-[18px]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Extrato recente</h2>
            <a href="/extrato" className="text-xs text-accent hover:underline">Ver tudo</a>
          </div>
          <ul className="scroll-slim mt-3 max-h-[460px] divide-y divide-white/5 overflow-y-auto pr-1">
            {recentes.map((l, i) => {
              const fid = resolverFonte(l.categoria, l.fonteOverride);
              return (
                <li key={i} className="flex items-center gap-3 py-3.5">
                  <Icon name={FONTE_ICON[fid]} size={18} className="shrink-0 text-[#c7bbff]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{l.descricao}</p>
                    <p className="text-[11px] text-ter">{fonteNome(fid)} · {l.data}</p>
                  </div>
                  <span className="shrink-0 font-mono text-sm font-bold">{brl(l.valor)}</span>
                </li>
              );
            })}
            {!recentes.length && <li className="py-3 text-sm text-sub">Nenhum lançamento ainda.</li>}
          </ul>
        </GlassCard>
      </div>
      </div>
    </div>
  );
}
