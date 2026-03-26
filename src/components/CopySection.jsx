import React, { useState } from "react";

export default function CopySection({ label, value, onCopy }) {
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);

  const handleCopy = async () => {
    if (copying) return;
    setCopied(false);
    setCopying(true);
    try {
      const ok = await onCopy(value);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">
        {label}
      </label>
      <div className="flex bg-bg rounded-xl border border-border/50 p-1">
        <input
          type="text"
          value={value}
          readOnly
          spellCheck={false}
          className="flex-1 bg-transparent px-3 py-2 text-xs outline-none font-mono text-text/70 min-w-0 w-full overflow-hidden text-ellipsis whitespace-nowrap"
          title={value}
        />
        <button
          className={`px-6 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            copied
              ? "bg-[#facc15] text-[#1e293b]"
              : "bg-text text-bg hover:shadow-lg"
          }`}
          disabled={copying}
          aria-busy={copying}
          onClick={handleCopy}
        >
          {copying ? (
            <div className="flex items-center gap-2">
              <div className="spinner" />
              <span>Copiando...</span>
            </div>
          ) : copied ? (
            "✓ Copiado"
          ) : (
            "Copiar"
          )}
        </button>
      </div>
    </div>
  );
}
