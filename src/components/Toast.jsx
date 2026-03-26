import React from "react";

export default function Toast({ toastVisible, children }) {
  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[2000] bg-surface text-text border border-border/60 px-6 py-3 text-sm font-bold transition-all duration-500 pointer-events-none rounded-full shadow-2xl ${
        toastVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-90"
      }`}
    >
      {children}
    </div>
  );
}

