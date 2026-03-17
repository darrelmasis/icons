import React from "react";

export default function Footer() {
  return (
    <footer className="max-w-[1200px] mx-auto px-6 pt-10 pb-24">
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/70 backdrop-blur px-4 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <span className="text-xs font-black tracking-wide text-text/50 uppercase">
            Construido por
          </span>
          <span className="text-xs font-black text-text">ADATOS</span>
          <span className="text-text/20">—</span>
          <span className="text-xs font-bold text-text/60">
            SVG Icon Library
          </span>
        </div>
      </div>
    </footer>
  );
}
