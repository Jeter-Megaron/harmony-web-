// Logo do Harmony — marca (imagem do Figma 245:15361) + wordmark âmbar (#ffb81f, Space Grotesk Bold).
export function Logo({ className = "", wordmark = true }: { className?: string; wordmark?: boolean }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/harmony-mark.png"
        alt="Harmony"
        width={40}
        height={28}
        className="block h-7 w-10 shrink-0 select-none rounded-md"
        draggable={false}
      />
      {wordmark && <span className="font-display text-base font-bold text-cat-amber">Harmony</span>}
    </div>
  );
}
