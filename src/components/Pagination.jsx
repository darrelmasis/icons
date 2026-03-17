import React from "react";

export default function Pagination({ page, totalPages, pageSize, totalItems, onChange }) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(totalItems, page * pageSize);

  const go = (p) => {
    const clamped = Math.max(1, Math.min(totalPages, p));
    if (clamped !== page) onChange(clamped);
  };

  const buildPages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages = [1];

    if (page <= 3) {
      pages.push(2, 3);
    } else if (page >= totalPages - 2) {
      pages.push(totalPages - 2, totalPages - 1);
    } else {
      pages.push(page - 1, page, page + 1);
    }

    pages.push(totalPages);

    const uniq = Array.from(new Set(pages))
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);

    const out = [];
    for (let i = 0; i < uniq.length; i++) {
      const current = uniq[i];
      const prev = uniq[i - 1];
      if (i > 0 && current - prev > 1) out.push("…");
      out.push(current);
    }
    return out;
  };

  const pages = buildPages();

  return (
    <div className="flex flex-col items-center justify-center gap-4 pt-10 pb-2">
      <div className="text-sm font-bold text-text/70 text-center">
        Mostrando {end} de {totalItems}
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          className={`px-4 py-3 rounded-2xl border text-base font-black transition-all ${
            page <= 1
              ? "bg-bg border-border/40 text-text/30 cursor-not-allowed"
              : "bg-bg border-border/50 text-text hover:border-text/30 hover:bg-text/5 cursor-pointer"
          }`}
          aria-label="Página anterior"
        >
          {"<"}
        </button>

        {pages.map((p, idx) =>
          p === "…" ? (
            <span
              key={`dots-${idx}`}
              className="px-2 text-base font-black text-text/40 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => go(p)}
              className={`min-w-12 px-4 py-3 rounded-2xl border text-base font-black transition-all ${
                p === page
                  ? "bg-text border-text text-surface"
                  : "bg-bg border-border/50 text-text hover:border-text/30 hover:bg-text/5 cursor-pointer"
              }`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => go(page + 1)}
          disabled={page >= totalPages}
          className={`px-4 py-3 rounded-2xl border text-base font-black transition-all ${
            page >= totalPages
              ? "bg-bg border-border/40 text-text/30 cursor-not-allowed"
              : "bg-bg border-border/50 text-text hover:border-text/30 hover:bg-text/5 cursor-pointer"
          }`}
          aria-label="Página siguiente"
        >
          {">"}
        </button>
      </div>
    </div>
  );
}
