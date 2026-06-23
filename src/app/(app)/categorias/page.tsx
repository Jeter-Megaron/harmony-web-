"use client";

import { useState } from "react";
import { useHarmony } from "@/lib/store";
import { GlassCard } from "@/components/ui";
import { Field, Input, Select, Toggle } from "@/components/Field";
import { IconButton } from "@/components/IconButton";
import { MaterialIcon } from "@/components/MaterialIcon";
import { Modal, Popconfirm } from "@/components/Modal";
import { Pagination } from "@/components/Pagination";
import { TableHead, TRow, type Col } from "@/components/Table";
import type { CategoriaRegra, FonteId } from "@/rules";

const COLS = "grid-cols-[minmax(0,1fr)_240px_90px_96px]";
const HEAD: Col[] = [
  { label: "Categoria", sort: true },
  { label: "Fonte", sort: true },
  { label: "Travada" },
  { label: "Ações", align: "right" },
];

export default function CategoriasPage() {
  const { config, addCategoria, editCategoria, removeCategoria, setTrava } = useHarmony();
  const fonteNome = (id: string) => config.fontes.find((f) => f.id === id)?.nome ?? "";

  const [modal, setModal] = useState<{ open: boolean; editing: CategoriaRegra | null }>({ open: false, editing: null });
  const [confirm, setConfirm] = useState<CategoriaRegra | null>(null);
  const [nome, setNome] = useState("");
  const [fonte, setFonte] = useState<FonteId>("salario");
  const [travada, setTravada] = useState(true);

  function openNew() {
    setModal({ open: true, editing: null });
    setNome(""); setFonte("salario"); setTravada(true);
  }
  function openEdit(c: CategoriaRegra) {
    setModal({ open: true, editing: c });
    setNome(c.categoria); setFonte(c.fonte); setTravada(c.travada);
  }
  function salvar() {
    const reg: CategoriaRegra = { categoria: nome.trim(), fonte, travada };
    if (!reg.categoria) return;
    if (modal.editing) editCategoria(modal.editing.categoria, reg);
    else addCategoria(reg);
    setModal({ open: false, editing: null });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold md:text-[20px]">Categorias</h1>
          <p className="text-[13px] text-sub">Gerencie as categorias e suas travas de fonte</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 rounded-[10px] bg-gradient-to-r from-[#5b3fd6] to-[#7e5bea] px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_0_18px_rgba(139,108,255,0.55)]">
          <MaterialIcon name="add" size={16} /> Nova categoria
        </button>
      </div>

      <p className="mb-3 text-xs text-sub">
        Categorias travadas saem sempre da fonte indicada; o que estourar vai para o Salário. As demais sugerem o Salário e podem ser
        trocadas no lançamento.
      </p>

      <GlassCard className="overflow-hidden">
        <TableHead grid={COLS} cols={HEAD} />
        {config.categorias.map((c, i) => (
          <TRow key={c.categoria} grid={COLS} index={i}>
            <span className="truncate font-medium">{c.categoria}</span>
            <span className="flex items-center gap-2 text-sub">
              {fonteNome(c.fonte)}
              {!c.travada && <span className="size-2 rounded-full bg-accent/70" title="Editável no lançamento" />}
            </span>
            <span><Toggle on={c.travada} onClick={() => setTrava(c.categoria, c.fonte, !c.travada)} label={`Travar ${c.categoria}`} /></span>
            <span className="flex justify-end gap-2">
              <IconButton size={30} label="Editar" onClick={() => openEdit(c)}><MaterialIcon name="edit" size={16} className="text-[#b9a8ff]" /></IconButton>
              <IconButton size={30} label="Excluir" onClick={() => setConfirm(c)}><MaterialIcon name="delete" size={16} className="text-neg" /></IconButton>
            </span>
          </TRow>
        ))}
        {!config.categorias.length && <p className="px-[18px] py-6 text-sm text-sub">Nenhuma categoria ainda.</p>}
        <Pagination total={config.categorias.length} />
      </GlassCard>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? "Editar categoria" : "Nova categoria"}
        subtitle="Crie uma categoria e amarre a uma fonte"
        footer={
          <>
            <button onClick={() => setModal({ open: false, editing: null })} className="rounded-lg border border-white/10 bg-surface/55 px-4 py-2.5 text-sm font-bold text-ink">Cancelar</button>
            <button onClick={salvar} className="rounded-lg bg-gradient-to-r from-[#5b3fd6] to-[#7e5bea] px-4 py-2.5 text-sm font-bold text-white shadow-[0_0_16px_rgba(139,108,255,0.5)]">Salvar categoria</button>
          </>
        }
      >
        <Field label="Nome da categoria">
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Streaming, Pets, Educação" />
        </Field>
        <Field label="Fonte">
          <Select value={fonte} onChange={(e) => setFonte(e.target.value as FonteId)}>
            {config.fontes.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </Select>
        </Field>
        <div className="flex items-center justify-between">
          <div className="leading-tight">
            <p className="text-sm font-medium">Travar nesta fonte</p>
            <p className="text-[11px] text-ter">Sai sempre dessa fonte; o que estourar vai para o Salário.</p>
          </div>
          <Toggle on={travada} onClick={() => setTravada((v) => !v)} label="Travar nesta fonte" />
        </div>
      </Modal>

      <Popconfirm
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm && removeCategoria(confirm.categoria)}
        title="Excluir esta categoria?"
        message="A categoria e sua trava serão removidas."
      />
    </div>
  );
}
