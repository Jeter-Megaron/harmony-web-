"use client";

// Estado vazio (espelha a tela "Sem dados" do Figma): ilustração flat + título + texto + CTAs.
export function EmptyState({
  title,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  title: string;
  description: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5 px-6 py-16 text-center">
      <WalletArt />
      <div className="max-w-sm space-y-1.5">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-[13px] leading-relaxed text-sub">{description}</p>
      </div>
      {(primaryLabel || secondaryLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {primaryLabel && (
            <button
              onClick={onPrimary}
              className="rounded-[10px] bg-gradient-to-r from-[#5b3fd6] to-[#7e5bea] px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_0_22px_rgba(139,108,255,0.5)] transition hover:brightness-110"
            >
              {primaryLabel}
            </button>
          )}
          {secondaryLabel && (
            <button
              onClick={onSecondary}
              className="rounded-[10px] border border-white/10 bg-surface/55 px-4 py-2.5 text-[13px] font-bold text-ink transition hover:bg-white/5"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function WalletArt() {
  return (
    <div className="relative grid h-[150px] w-[210px] place-items-center">
      <div className="absolute size-[170px] rounded-full bg-accent/20 blur-[55px]" />
      <svg width="200" height="150" viewBox="0 0 200 150" fill="none" className="relative">
        <rect x="44" y="22" width="120" height="74" rx="12" transform="rotate(-8 104 59)" fill="#1ff0da" opacity="0.9" />
        <rect x="30" y="50" width="150" height="80" rx="18" fill="#7e5bea" />
        <rect x="30" y="50" width="150" height="30" rx="14" fill="#5b3fd6" />
        <rect x="150" y="92" width="30" height="20" rx="7" fill="#ffb81f" />
        <circle cx="148" cy="34" r="26" fill="#ffb81f" />
        <circle cx="148" cy="34" r="16" fill="#ffd36b" />
        <text x="148" y="39" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7a4b00" fontFamily="monospace">R$</text>
        <path d="M14 44l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#ffffff" opacity="0.85" />
        <path d="M186 118l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#ffffff" opacity="0.85" />
      </svg>
    </div>
  );
}
