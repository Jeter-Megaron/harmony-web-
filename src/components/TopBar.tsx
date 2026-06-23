"use client";

import { Icon, type IconName } from "./icons";
import { useHarmony } from "@/lib/store";

// Barra superior — cada página monta a sua (título/subtítulo + ações próprias), fiel aos frames do Figma.
export function TopBar({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-0.5">
        <h1 className="font-display text-xl font-bold leading-tight text-ink md:text-[20px]">{title}</h1>
        <p className="text-[13px] text-sub">{subtitle}</p>
      </div>
      {children && <div className="hidden items-center gap-2.5 md:flex">{children}</div>}
    </div>
  );
}

const glass = "border border-white/10 bg-surface/55 backdrop-blur-md";

export function MonthPill() {
  const { mesAtual, setMesAtual, meses } = useHarmony();
  return (
    <div className={`relative flex items-center rounded-[10px] ${glass}`}>
      <select
        value={mesAtual}
        onChange={(e) => setMesAtual(e.target.value)}
        aria-label="Mês de referência"
        className="cursor-pointer appearance-none bg-transparent py-2.5 pl-3 pr-7 text-xs font-medium text-ink outline-none"
      >
        {meses.map((m) => (
          <option key={m} value={m} className="bg-surface-2">{m}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-[10px] text-sub">▾</span>
    </div>
  );
}

export function SearchPill() {
  return (
    <div className={`flex items-center gap-2 rounded-[10px] px-3 py-2.5 ${glass}`}>
      <Icon name="search" size={16} className="text-ter" />
      <span className="text-xs text-ter">Buscar lançamento</span>
    </div>
  );
}

export function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-[10px] bg-gradient-to-r from-[#5b3fd6] to-[#7e5bea] px-4 py-3 text-[13px] font-bold text-white shadow-[0_0_22px_rgba(139,108,255,0.6)] transition hover:brightness-110 active:brightness-95"
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, icon }: { children: React.ReactNode; onClick?: () => void; icon?: IconName }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-[10px] px-4 py-3 text-[13px] font-bold text-ink transition hover:bg-white/5 ${glass}`}
    >
      {icon && <Icon name={icon} size={18} className="text-sub" />}
      {children}
    </button>
  );
}

export function Segmented({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-[10px] bg-surface-2/60 p-1">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`rounded-[7px] px-3 py-1.5 text-xs transition ${
              active ? "border border-white/10 bg-surface/95 font-bold text-ink" : "font-medium text-sub hover:text-ink"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
