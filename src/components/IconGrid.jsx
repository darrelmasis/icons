import React from "react";
import Icon from "./Icon";
import IconCard from "./IconCard";

export default function IconGrid({
  loading,
  visibleIcons,
  variants,
  currentVariant,
  onOpenModal,
  getIconDisplayVariant,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-5 py-4">
        {[...Array(48)].map((_, i) => (
          <div
            key={`init-skeleton-${i}`}
            className="bg-surface rounded-xl border border-border/30 aspect-square p-4 flex flex-col items-center justify-center gap-4"
          >
            <div className="w-12 h-12 rounded-lg skeleton-shimmer opacity-40"></div>
            <div className="w-20 h-2 rounded skeleton-shimmer opacity-30"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-5">
      {visibleIcons.length > 0 ? (
        visibleIcons.map((icon) => {
          const displayVariant =
            icon.forcedVariant || getIconDisplayVariant(icon, currentVariant);

          const forcedVariantLabel = icon.forcedVariant
            ? variants.find((v) => v.id === icon.forcedVariant)?.label
            : null;

          return (
            <IconCard
              key={icon.uniqueKey}
              icon={icon}
              displayVariant={displayVariant}
              forcedVariantLabel={forcedVariantLabel}
              onOpen={onOpenModal}
            />
          );
        })
      ) : (
        <div className="col-span-full py-24 text-center bg-surface rounded-2xl border border-border/50">
          <p className="text-text-muted font-medium">
            No se encontraron iconos que coincidan con tu búsqueda.
          </p>
        </div>
      )}
    </div>
  );
}

