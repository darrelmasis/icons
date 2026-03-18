import React from "react";

export default function Footer() {
  return (
    <footer className="max-w-[1200px] mx-auto px-6 pt-10 pb-24 mt-12">
      <div className="flex items-center justify-center">
        <div className="text-[11px] tracking-[0.2em] font-semibold text-text-muted uppercase transition-colors hover:text-text/70">
          construido por{" "}
          <a
            href="https://www.facebook.com/darrelmasis"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text/80 font-black hover:text-blue-600 transition-colors"
          >
            Darel Masis
          </a>
          <span className="mx-3 text-text/30 font-light">•</span>
          <span>2026</span>
        </div>
      </div>
    </footer>
  );
}
