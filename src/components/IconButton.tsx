"use client";

// Icon Button — quadrado, mesma altura do botão (41px por padrão); variantes glass/primary/danger.
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
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{ width: size, height: size }}
      className={`grid shrink-0 place-items-center rounded-[10px] transition ${VARIANTS[variant]}`}
    >
      {children}
    </button>
  );
}
