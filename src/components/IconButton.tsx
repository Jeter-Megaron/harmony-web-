"use client";

// Icon Button — quadrado, mesma altura do botão (41px por padrão); variantes glass/primary/danger/success.
// Tooltip estilizado no hover (aparece acima do botão).
type Variant = "ghost" | "primary" | "danger" | "success";

const VARIANTS: Record<Variant, string> = {
  ghost: "border border-white/10 bg-surface/55 text-ink hover:bg-white/5",
  primary:
    "bg-gradient-to-r from-[#5b3fd6] to-[#7e5bea] text-white shadow-[0_0_16px_rgba(139,108,255,0.5)] hover:brightness-110",
  danger: "border border-neg/40 bg-neg/10 text-neg hover:bg-neg/20",
  success: "border border-pos/40 bg-pos/15 text-pos hover:bg-pos/25",
};

export function IconButton({
  children,
  onClick,
  variant = "ghost",
  size = 41,
  label,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: Variant;
  size?: number;
  label: string;
}) {
  return (
    <span className="group/ib relative inline-flex">
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        style={{ width: size, height: size }}
        className={`grid shrink-0 place-items-center rounded-[10px] transition ${VARIANTS[variant]}`}
      >
        {children}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full right-0 z-50 mb-1.5 whitespace-nowrap rounded-md border border-white/10 bg-surface-2 px-2 py-1 text-[11px] font-medium text-ink opacity-0 shadow-[0_6px_16px_rgba(0,0,0,0.45)] transition-opacity duration-150 group-hover/ib:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
