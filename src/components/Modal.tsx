"use client";

import { IconButton } from "./IconButton";
import { MaterialIcon } from "./MaterialIcon";

// Shell de modal (header + body + footer) fiel aos modais do Figma.
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 500,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <div
        style={{ maxWidth: width }}
        className="relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-2xl border border-white/10 bg-surface/95 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div className="leading-tight">
            <h2 className="text-base font-bold">{title}</h2>
            {subtitle && <p className="text-xs text-ter">{subtitle}</p>}
          </div>
          <IconButton variant="ghost" size={32} label="Fechar" onClick={onClose}>
            <MaterialIcon name="close" size={16} className="text-sub" />
          </IconButton>
        </div>
        <div className="space-y-4 px-5 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2.5 border-t border-white/[0.08] px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

// Popconfirm de exclusão (mensagem + Cancelar/Excluir).
export function Popconfirm({
  open,
  onClose,
  onConfirm,
  title = "Excluir este item?",
  message = "Esta ação não pode ser desfeita.",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[340px] rounded-xl border border-white/10 bg-surface/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div className="flex items-start gap-3">
          <span className="grid size-[26px] shrink-0 place-items-center rounded-full border border-neg/50 bg-neg/15 text-sm font-bold text-neg">!</span>
          <div className="leading-tight">
            <p className="text-sm font-bold">{title}</p>
            <p className="mt-0.5 text-xs text-ter">{message}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-white/10 bg-surface/55 px-3.5 py-2 text-xs font-bold text-ink">
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-lg border border-neg/45 bg-neg/15 px-3.5 py-2 text-xs font-bold text-neg hover:bg-neg/25"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
