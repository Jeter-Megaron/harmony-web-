"use client";

// Primitivos de tabela no padrão da página Renda (cabeçalho + zebra + chips), reusados em todas as tabelas.

type Tone = "pos" | "neg" | "amber" | "neutral";
const TONES: Record<Tone, { bg: string; fg: string }> = {
  pos: { bg: "#142e21", fg: "#35e08a" },
  neg: { bg: "#331a21", fg: "#ff5d6e" },
  amber: { bg: "#2a2412", fg: "#ffb81f" },
  neutral: { bg: "#1e2029", fg: "#a8abbd" },
};

export function Chip({ children, tone = "neutral" }: { children: React.ReactNode; tone?: Tone }) {
  const c = TONES[tone];
  return (
    <span className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: c.bg, color: c.fg }}>
      {children}
    </span>
  );
}

export type Col = { label: string; align?: "right"; sort?: boolean };

export function TableHead({ grid, cols }: { grid: string; cols: Col[] }) {
  return (
    <div className={`grid ${grid} gap-3 border-b border-white/10 bg-surface-2/40 px-[18px] py-2.5 text-[11px] font-medium text-sub`}>
      {cols.map((c, i) => (
        <span key={i} className={`flex items-center gap-1 ${c.align === "right" ? "justify-end" : ""}`}>
          {c.label}
          {c.sort && <span className="text-[10px] text-[#6e7180]">⇅</span>}
        </span>
      ))}
    </div>
  );
}

export function TRow({ grid, index = 0, children, muted = false }: { grid: string; index?: number; children: React.ReactNode; muted?: boolean }) {
  return (
    <div
      className={`grid ${grid} items-center gap-3 border-b border-white/5 px-[18px] py-2.5 text-sm ${index % 2 ? "bg-white/[0.02]" : ""} ${
        muted ? "opacity-55" : ""
      }`}
    >
      {children}
    </div>
  );
}
