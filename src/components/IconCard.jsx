import React from "react";
import Icon from "./Icon";

export default function IconCard({ icon, displayVariant, forcedVariantLabel, onOpen }) {
  return (
    <div
      className="bg-surface rounded-xl border border-border/50 aspect-square p-4 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:bg-[#facc15] hover:border-[#facc15] group"
      onClick={() => onOpen(icon, icon.forcedVariant)}
    >
      <div className="flex-1 flex items-center justify-center w-full">
        <Icon
          name={icon.name}
          variant={displayVariant}
          size="3xl"
          color="text-text group-hover:text-[#1e293b]"
        />
      </div>
      <div className="text-[11px] font-medium text-text-muted group-hover:text-[#1e293b] transition-colors text-center w-full truncate px-1 flex flex-col items-center">
        <span className="font-bold">{icon.name}</span>
        {icon.forcedVariant && (
          <span className="text-[9px] opacity-60 uppercase tracking-wider">
            {forcedVariantLabel}
          </span>
        )}
      </div>
    </div>
  );
}

