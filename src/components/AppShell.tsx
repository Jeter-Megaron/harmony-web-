"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { Icon, type IconName } from "./icons";
import { Logo } from "./Logo";
import { NovoLancamentoModal } from "./NovoLancamentoModal";
import { useHarmony } from "@/lib/store";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Início", icon: "home" },
  { href: "/renda", label: "Renda", icon: "wallet" },
  { href: "/lancamentos", label: "Lançamentos", icon: "list" },
  { href: "/extrato", label: "Extrato", icon: "receipt" },
  { href: "/relatorios", label: "Relatórios", icon: "pie" },
  { href: "/categorias", label: "Categorias", icon: "cog" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { modalOpen, openModal, closeModal } = useHarmony();
  const { user } = useUser();
  const nome = user?.firstName || user?.fullName || "Minha conta";
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="min-h-screen md:pl-60">
      {/* sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-white/10 bg-surface/60 p-4 backdrop-blur-xl md:flex">
        <div className="px-2 pb-2 pt-1.5">
          <Logo />
        </div>
        <nav className="mt-4 space-y-1.5">
          {NAV.map(({ href, label, icon }) => {
            const a = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  a
                    ? "border border-accent/40 bg-accent/15 font-semibold text-ink shadow-[0_0_20px_rgba(139,108,255,0.30)]"
                    : "border border-transparent text-sub hover:bg-white/5 hover:text-ink"
                }`}
              >
                <Icon name={icon} size={18} className={a ? "text-accent" : "text-sub"} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div
          className={`mt-auto flex items-center gap-2.5 rounded-xl p-2.5 transition ${
            isActive("/perfil")
              ? "border border-accent/40 bg-accent/15 shadow-[0_0_20px_rgba(139,108,255,0.30)]"
              : "border border-transparent bg-surface-2/60"
          }`}
        >
          <UserButton />
          <Link href="/perfil" className="min-w-0 leading-tight">
            <p className="truncate text-xs font-semibold">{nome}</p>
            <p className="text-[10px] text-ter">Ver perfil</p>
          </Link>
        </div>
      </aside>

      {/* top bar (mobile) */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-surface/70 px-4 py-3 backdrop-blur-xl md:hidden">
        <Logo />
        <div className="flex items-center gap-3">
          <UserButton />
          <button
            onClick={openModal}
            aria-label="Novo lançamento"
            className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-r from-[#5b3fd6] to-[#7e5bea] text-lg font-bold text-white shadow-[0_0_16px_rgba(139,108,255,0.5)]"
          >
            +
          </button>
        </div>
      </header>

      {/* content column */}
      <div className="mx-auto max-w-[1240px] px-5 py-6 pb-24 sm:px-7 sm:py-7 md:pb-7">{children}</div>

      {/* bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-white/10 bg-surface/80 px-2 py-2 backdrop-blur-xl md:hidden">
        {NAV.map(({ href, label, icon }) => {
          const a = isActive(href);
          return (
            <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${a ? "text-accent" : "text-ter"}`}>
              <Icon name={icon} size={20} />
              {label}
            </Link>
          );
        })}
      </nav>

      {modalOpen && <NovoLancamentoModal onClose={closeModal} />}
    </div>
  );
}
