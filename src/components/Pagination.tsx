"use client";

import { useState } from "react";

// Paginação das tabelas. Controlada (page + onPageChange) ou autônoma (estado interno, só visual).
export function Pagination({
  total,
  pageSize = 10,
  page,
  onPageChange,
}: {
  total: number;
  pageSize?: number;
  page?: number;
  onPageChange?: (p: number) => void;
}) {
  const [internal, setInternal] = useState(1);
  const current = page ?? internal;
  const setPage = (p: number) => (onPageChange ? onPageChange(p) : setInternal(p));

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(total, current * pageSize);

  return (
    <div className="flex items-center justify-between border-t border-white/[0.06] px-[18px] py-3.5">
      <span className="text-xs text-ter">
        {from}–{to} de {total}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setPage(Math.max(1, current - 1))}
          disabled={current <= 1}
          className="px-1.5 text-sm font-bold text-sub disabled:opacity-30"
          aria-label="Página anterior"
        >
          ‹
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).slice(0, 6).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`rounded-[7px] px-2.5 py-1 text-xs transition ${
              p === current ? "border border-accent/40 bg-accent/15 font-bold text-ink" : "font-medium text-sub hover:text-ink"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => setPage(Math.min(pages, current + 1))}
          disabled={current >= pages}
          className="px-1.5 text-sm font-bold text-sub disabled:opacity-30"
          aria-label="Próxima página"
        >
          ›
        </button>
      </div>
    </div>
  );
}
