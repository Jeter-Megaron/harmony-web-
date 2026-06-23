"use client";

// Input / Select com a mesma altura do botão (41px) e o visual glass do design.
const base =
  "h-[41px] w-full rounded-[10px] border border-white/10 bg-surface-2/70 px-3.5 text-sm text-ink outline-none transition placeholder:text-ter focus:border-accent/60 focus:ring-2 focus:ring-accent/30";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${base} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${base} cursor-pointer appearance-none bg-[length:0] ${props.className ?? ""}`}>
      {props.children}
    </select>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      <span className="text-[11px] font-medium text-sub">{label}</span>
      {children}
    </label>
  );
}

export function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`flex h-6 w-[42px] shrink-0 items-center rounded-full p-0.5 transition ${
        on ? "bg-accent shadow-[0_0_10px_var(--color-accent)]" : "bg-surface-2"
      }`}
    >
      <span className={`block size-[18px] rounded-full bg-white transition-transform ${on ? "translate-x-[18px]" : ""}`} />
    </button>
  );
}
