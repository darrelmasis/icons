import React, { useState } from "react";

export default function CopySection({ label, value, onCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          className="flex-1 bg-transparent px-3 py-2 text-xs outline-none font-mono text-text/70"
        />
        <button
          className={`px-6 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            copied
              ? "bg-[#facc15] text-[#1e293b]"
              : "bg-text text-surface hover:shadow-lg"
          }`}
          onClick={handleCopy}
        >
          {copied ? "✓ Copiado" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
