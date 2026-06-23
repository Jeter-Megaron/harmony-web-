"use client";

import { useState } from "react";
/* eslint-disable @next/next/no-img-element */
import { useUser, useClerk } from "@clerk/nextjs";
import { useHarmony } from "@/lib/store";
import { GlassCard } from "@/components/ui";
import { Popconfirm } from "@/components/Modal";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] font-medium text-sub">{label}</span>
      <span className="truncate text-[13px] text-ink">{value}</span>
    </div>
  );
}

export default function PerfilPage() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { mesAtual } = useHarmony();
  const [confirm, setConfirm] = useState(false);

  const nome = user?.fullName || user?.firstName || "Usuário";
  const email = user?.primaryEmailAddress?.emailAddress ?? "—";
  const inicial = (user?.firstName?.[0] || nome[0] || "?").toUpperCase();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold md:text-[20px]">Perfil</h1>
        <p className="text-[13px] text-sub">Sua conta e preferências</p>
      </div>

      <GlassCard className="flex items-center gap-4 p-[18px]">
        {user?.imageUrl ? (
          <img src={user.imageUrl} alt="" className="size-[72px] shrink-0 rounded-full object-cover" />
        ) : (
          <span className="grid size-[72px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#7e5bea] to-[#c46cff] text-[28px] font-bold text-white">
            {inicial}
          </span>
        )}
        <div className="min-w-0 space-y-1.5">
          <p className="truncate text-lg font-bold">{nome}</p>
          <p className="truncate text-[13px] text-sub">{email}</p>
          <span className="inline-block rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-medium text-[#b9a8ff]">Conta pessoal</span>
        </div>
      </GlassCard>

      <GlassCard className="space-y-3.5 p-[18px]">
        <h2 className="text-sm font-bold">Conta</h2>
        <Row label="Nome" value={nome} />
        <Row label="E-mail" value={email} />
        <Row label="Moeda" value="Real (R$)" />
        <Row label="Mês de referência" value={mesAtual} />
        <div className="flex flex-wrap gap-2.5 pt-1">
          <button
            onClick={() => openUserProfile()}
            className="rounded-[10px] border border-white/10 bg-surface/55 px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-white/5"
          >
            Gerenciar conta
          </button>
          <button
            onClick={() => setConfirm(true)}
            className="rounded-[10px] border border-neg/40 bg-neg/10 px-4 py-2.5 text-sm font-bold text-neg transition hover:bg-neg/20"
          >
            Sair da conta
          </button>
        </div>
      </GlassCard>

      <Popconfirm
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => signOut({ redirectUrl: "/sign-in" })}
        title="Sair da conta?"
        message="Você precisará entrar novamente para acessar o Harmony."
      />
    </div>
  );
}
