import type { CicloResult, Config, FonteId } from "@/rules";
import { Icon, type IconName } from "./icons";

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });

export const CAT_COLORS = ["#a24dff", "#1ff0da", "#ffb81f", "#ff3dbe", "#2e9bff", "#8b6cff", "#35e08a"];

export function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-surface/55 backdrop-blur-xl ${className}`}>{children}</div>
  );
}

export const FONTE_ICON: Record<FonteId, IconName> = {
  salario: "wallet",
  beneficio: "card",
  vale: "cart",
  outros: "bag",
};

type Badge = { label: string; bg: string; fg: string };
const POS: Omit<Badge, "label"> = { bg: "#142e21", fg: "#35e08a" };
const NEG: Omit<Badge, "label"> = { bg: "#331a21", fg: "#ff5d6e" };
const NEU: Omit<Badge, "label"> = { bg: "#1e2029", fg: "#a8abbd" };

function badgeFor(id: FonteId, f: CicloResult["fontes"][FonteId]): Badge {
  if (f.estouro > 0) return { label: "Estourou", ...NEG };
  if (f.saldoFinal < 0) return { label: "No vermelho", ...NEG };
  if (id === "vale" && f.saldoFinal > 0) return { label: "Acumula", ...POS };
  if (f.saldoFinal > 0) return { label: "Sobra", ...POS };
  return { label: "Vazio", ...NEU };
}

function sublineFor(id: FonteId, f: CicloResult["fontes"][FonteId], acumula: boolean): string {
  switch (id) {
    case "salario":
      return f.recebidoFallback > 0 ? `Absorveu ${brl(f.recebidoFallback)} de estouro` : "Poupança do mês";
    case "beneficio":
      return f.estouro > 0 ? `Não cobriu ${brl(f.estouro)} das contas fixas` : "Cobre as contas fixas";
    case "vale":
      return acumula ? "Saldo passa p/ o próximo mês" : "Alimentação do mês";
    default:
      return "Renda avulsa";
  }
}

export function SourceCards({ ciclo, config }: { ciclo: CicloResult; config: Config }) {
  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {config.fontes.map((cf) => {
        const f = ciclo.fontes[cf.id];
        const b = badgeFor(cf.id, f);
        return (
          <GlassCard key={cf.id} className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <Icon name={FONTE_ICON[cf.id]} size={20} className="text-[#c7bbff]" />
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: b.bg, color: b.fg }}
              >
                {b.label}
              </span>
            </div>
            <p className="text-xs font-medium text-sub">{f.nome}</p>
            <p className="font-mono text-2xl font-bold text-ink">{brl(f.saldoFinal)}</p>
            <p className="text-xs text-ter">{sublineFor(cf.id, f, cf.acumula)}</p>
          </GlassCard>
        );
      })}
    </section>
  );
}

const COVERAGE_ORDER: FonteId[] = ["beneficio", "vale", "salario", "outros"];

export function CoverageBars({ ciclo, config }: { ciclo: CicloResult; config: Config }) {
  const fontes = COVERAGE_ORDER.map((id) => config.fontes.find((f) => f.id === id)).filter(Boolean) as Config["fontes"];
  const grad = (id: FonteId, estouro: number) =>
    estouro > 0
      ? "from-[#ff3b5c] to-[#ff8a1e]"
      : id === "vale"
        ? "from-[#1fff9f] to-[#22f0e0]"
        : id === "salario"
          ? "from-[#a24dff] to-[#ff3dbe]"
          : "from-[#a24dff] to-[#c46cff]";
  return (
    <div className="space-y-4">
      {fontes.map((cf) => {
        const f = ciclo.fontes[cf.id];
        const ratio = f.disponivel > 0 ? Math.min(1, f.saidasPretendidas / f.disponivel) : f.saidasPretendidas > 0 ? 1 : 0;
        return (
          <div key={cf.id}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{f.nome}</span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs text-sub">
                  {brl(f.saidasPretendidas)} / {brl(f.disponivel)}
                </span>
                {f.estouro > 0 && (
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: "#331a21", color: "#ff5d6e" }}>
                    Estourou {brl(f.estouro)}
                  </span>
                )}
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${grad(cf.id, f.estouro)}`}
                style={{ width: `${Math.max(ratio * 100, 2)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CategoryDonut({
  porCategoria,
  centerLabel = "no mês",
  vertical = false,
}: {
  porCategoria: Record<string, number>;
  centerLabel?: string;
  vertical?: boolean;
}) {
  const cats = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]);
  const total = cats.reduce((s, [, v]) => s + v, 0) || 1;

  // anel SVG (rosquinha neon, fiel ao 236:39)
  const R = 66;
  const SW = 16;
  const C = 2 * Math.PI * R;
  const GAP = 3; // folga entre fatias, em unidades de circunferência
  let offset = 0;
  const arcs = cats.map(([name, v], i) => {
    const len = (v / total) * C;
    const dash = Math.max(len - GAP, 0.0001);
    const seg = (
      <circle
        key={name}
        cx="80"
        cy="80"
        r={R}
        fill="none"
        stroke={CAT_COLORS[i % CAT_COLORS.length]}
        strokeWidth={SW}
        strokeDasharray={`${dash} ${C - dash}`}
        strokeDashoffset={-offset}
        style={{ filter: `drop-shadow(0 0 4px ${CAT_COLORS[i % CAT_COLORS.length]}66)` }}
      />
    );
    offset += len;
    return seg;
  });

  return (
    <div className={`flex items-center gap-7 ${vertical ? "flex-col" : "flex-col sm:flex-row"}`}>
      <div className="relative size-[160px] shrink-0 drop-shadow-[0_0_21px_rgba(162,77,255,0.18)]">
        <svg viewBox="0 0 160 160" className="size-full -rotate-90">
          {cats.length ? (
            arcs
          ) : (
            <circle cx="80" cy="80" r={R} fill="none" stroke="var(--color-surface-2)" strokeWidth={SW} />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-lg font-bold text-ink">{brl(total)}</span>
          <span className="text-[10px] text-sub">{centerLabel}</span>
        </div>
      </div>

      <ul className="flex w-full flex-1 flex-col gap-0.5">
        {cats.map(([name, v], i) => (
          <li
            key={name}
            className={`flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 ${i % 2 === 0 ? "bg-white/[0.06]" : ""}`}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />
              <span className="truncate text-xs font-medium text-ink">{name}</span>
            </span>
            <span className="flex shrink-0 items-center gap-2 font-mono">
              <span className="text-xs font-bold text-ink">{brl(v)}</span>
              <span className="w-8 text-right text-[11px] text-sub">{Math.round((v / total) * 100)}%</span>
            </span>
          </li>
        ))}
        {!cats.length && <li className="px-2.5 py-2 text-xs text-sub">Nenhum gasto ainda.</li>}
      </ul>
    </div>
  );
}
