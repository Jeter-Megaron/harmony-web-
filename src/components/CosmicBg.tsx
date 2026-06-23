// Fundo cósmico (planeta em crescente + starfield) usado nas telas de autenticação.
export function CosmicBg() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -right-[260px] -top-[220px] size-[860px] rounded-full blur-[10px]"
        style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.9), rgba(255,123,208,0.55) 28%, rgba(126,91,234,0.55) 52%, rgba(110,77,255,0.35) 66%, transparent 76%)" }}
      />
      <div className="absolute left-[8%] top-[34%] size-[240px] rounded-full bg-accent/15 blur-[80px]" />
      {[
        [12, 22], [28, 64], [44, 14], [60, 40], [76, 70], [88, 26], [18, 84], [52, 88], [70, 12], [34, 48], [92, 58], [6, 52],
      ].map(([l, t], i) => (
        <span key={i} className="absolute size-[2px] rounded-full bg-white" style={{ left: `${l}%`, top: `${t}%`, opacity: 0.25 + (i % 4) * 0.13 }} />
      ))}
    </div>
  );
}
