"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useHarmony, type RendaEntry } from "@/lib/store";
import { GlassCard, brl } from "@/components/ui";
import { Field, Input, Select, Toggle } from "@/components/Field";
import { IconButton } from "@/components/IconButton";
import { MaterialIcon } from "@/components/MaterialIcon";
import { Modal, Popconfirm } from "@/components/Modal";
import { Pagination } from "@/components/Pagination";
import { EmptyState } from "@/components/EmptyState";
import type { FonteId } from "@/rules";

const COLS = "grid-cols-[minmax(0,1fr)_130px_120px_90px_90px_96px]";

function parseValor(s: string) {
  return parseFloat(s.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
}

function Chip({ on }: { on: boolean }) {
  return (
    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium" style={on ? { backgroundColor: "#142e21", color: "#35e08a" } : { backgroundColor: "#1e2029", color: "#a8abbd" }}>
      {on ? "Sim" : "Não"}
    </span>
  );
}

export default function RendaPage() {
  const { config, rendaEntries, meses, mesAtual, setRenda, removeRenda, toggleRepete, toggleAcumula } = useHarmony();

  const [fFonte, setFFonte] = useState<string>("all");
  const [fMes, setFMes] = useState<string>("all");
  const [modal, setModal] = useState<{ open: boolean; editing: RendaEntry | null }>({ open: false, editing: null });
  const [confirm, setConfirm] = useState<RendaEntry | null>(null);

  const rows = useMemo(
    () => rendaEntries.filter((r) => (fFonte === "all" || r.fonteId === fFonte) && (fMes === "all" || r.mes === fMes)),
    [rendaEntries, fFonte, fMes],
  );

  // form do modal
  const [fonte, setFonte] = useState<FonteId>("salario");
  const [mes, setMes] = useState<string>(mesAtual);
  const [valor, setValor] = useState<string>("");
  const [repete, setRepete] = useState(true);
  const [acumula, setAcumula] = useState(true);

  function openNew() {
    setModal({ open: true, editing: null });
    setFonte("salario"); setMes(mesAtual); setValor(""); setRepete(true); setAcumula(true);
  }
  function openEdit(r: RendaEntry) {
    setModal({ open: true, editing: r });
    setFonte(r.fonteId); setMes(r.mes); setValor(String(r.valor)); setRepete(r.repete); setAcumula(r.acumula);
  }
  function salvar() {
    setRenda(mes, fonte, parseValor(valor));
    const f = config.fontes.find((x) => x.id === fonte);
    if (f && f.repeteMensal !== repete) toggleRepete(fonte);
    if (f && f.acumula !== acumula) toggleAcumula(fonte);
    setModal({ open: false, editing: null });
  }

  return (
    <div>
      <nav className="mb-2 flex items-center gap-2 text-xs text-ter">
        <Link href="/" className="hover:text-sub">Início</Link>
        <span className="text-ter/60">›</span>
        <span className="font-medium text-[#b9a8ff]">Renda</span>
      </nav>
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold md:text-[20px]">Fontes de renda</h1>
        <p className="text-[13px] text-sub">Cadastre a renda recebida em cada mês, por fonte</p>
      </div>

      {/* filtros */}
      <GlassCard className="mb-5 p-[18px]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">Filtros</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Período">
            <Select value={fMes} onChange={(e) => setFMes(e.target.value)}>
              <option value="all">Todos os meses</option>
              {meses.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </Field>
          <Field label="Fonte">
            <Select value={fFonte} onChange={(e) => setFFonte(e.target.value)}>
              <option value="all">Todas as fontes</option>
              {config.fontes.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </Select>
          </Field>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3.5">
          <p className="text-xs text-ter">Filtre os lançamentos de renda do período.</p>
          <button onClick={() => { setFFonte("all"); setFMes("all"); }} className="rounded-[10px] px-4 py-2.5 text-[13px] font-bold text-sub hover:text-ink">Limpar</button>
        </div>
      </GlassCard>

      {/* listagem */}
      <GlassCard className="overflow-hidden">
        <div className="flex items-center justify-between px-[18px] py-4">
          <h2 className="text-sm font-bold">Lançamentos de renda</h2>
          <button onClick={openNew} className="flex items-center gap-1.5 rounded-[10px] bg-gradient-to-r from-[#5b3fd6] to-[#7e5bea] px-3.5 py-2.5 text-[13px] font-bold text-white shadow-[0_0_16px_rgba(139,108,255,0.5)]">
            Criar novo <MaterialIcon name="add" size={16} />
          </button>
        </div>
        <div className={`grid ${COLS} gap-3 border-y border-white/10 bg-surface-2/40 px-[18px] py-2.5 text-[11px] font-medium text-sub`}>
          <span>Fonte</span><span>Mês</span><span className="text-right">Valor</span><span>Repete</span><span>Acumula</span><span className="text-right">Ações</span>
        </div>
        {rows.map((r, i) => (
          <div key={`${r.mes}-${r.fonteId}`} className={`grid ${COLS} items-center gap-3 border-b border-white/5 px-[18px] py-2.5 text-sm ${i % 2 ? "bg-white/[0.02]" : ""}`}>
            <span className="truncate font-medium">{r.fonteNome}</span>
            <span className="text-sub">{r.mes}</span>
            <span className="text-right font-mono font-bold">{brl(r.valor)}</span>
            <span><Chip on={r.repete} /></span>
            <span><Chip on={r.acumula} /></span>
            <span className="flex justify-end gap-2">
              <IconButton size={30} label="Editar" onClick={() => openEdit(r)}><MaterialIcon name="edit" size={16} className="text-[#b9a8ff]" /></IconButton>
              <IconButton size={30} variant="ghost" label="Excluir" onClick={() => setConfirm(r)}><MaterialIcon name="delete" size={16} className="text-neg" /></IconButton>
            </span>
          </div>
        ))}
        {!rows.length &&
          (rendaEntries.length === 0 ? (
            <EmptyState
              title="Nenhuma renda cadastrada"
              description="Cadastre a renda recebida de cada fonte no mês para acompanhar saldos e cobertura."
              primaryLabel="+ Cadastrar renda"
              onPrimary={openNew}
            />
          ) : (
            <p className="px-[18px] py-6 text-sm text-sub">Nenhuma renda encontrada para o filtro.</p>
          ))}
        {rows.length > 0 && <Pagination total={rows.length} />}
      </GlassCard>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? "Editar renda" : "Cadastrar renda"}
        subtitle="Registre o valor recebido de uma fonte no mês"
        footer={
          <>
            <button onClick={() => setModal({ open: false, editing: null })} className="rounded-lg border border-white/10 bg-surface/55 px-4 py-2.5 text-sm font-bold text-ink">Cancelar</button>
            <button onClick={salvar} className="rounded-lg bg-gradient-to-r from-[#5b3fd6] to-[#7e5bea] px-4 py-2.5 text-sm font-bold text-white shadow-[0_0_16px_rgba(139,108,255,0.5)]">Salvar renda</button>
          </>
        }
      >
        <Field label="Fonte">
          <Select value={fonte} onChange={(e) => setFonte(e.target.value as FonteId)}>
            {config.fontes.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mês de referência">
            <Select value={mes} onChange={(e) => setMes(e.target.value)}>
              {[...new Set([mesAtual, ...meses])].map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </Field>
          <Field label="Valor recebido">
            <Input value={valor} onChange={(e) => setValor(e.target.value)} placeholder="R$ 0,00" inputMode="decimal" className="font-mono" />
          </Field>
        </div>
        <div className="flex items-center justify-between">
          <div className="leading-tight">
            <p className="text-sm font-medium">Repete todo mês</p>
            <p className="text-[11px] text-ter">Usa este valor automaticamente nos próximos meses.</p>
          </div>
          <Toggle on={repete} onClick={() => setRepete((v) => !v)} label="Repete todo mês" />
        </div>
        <div className="flex items-center justify-between">
          <div className="leading-tight">
            <p className="text-sm font-medium">Acumula saldo</p>
            <p className="text-[11px] text-ter">O que não for usado passa para o mês seguinte.</p>
          </div>
          <Toggle on={acumula} onClick={() => setAcumula((v) => !v)} label="Acumula saldo" />
        </div>
      </Modal>

      <Popconfirm
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm && removeRenda(confirm.mes, confirm.fonteId)}
        title="Excluir esta renda?"
        message="A renda desse mês/fonte será removida."
      />
    </div>
  );
}
