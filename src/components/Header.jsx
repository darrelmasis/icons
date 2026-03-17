import React from "react";
import Icon from "./Icon";
import VariantDropdown from "./VariantDropdown";

export default function Header({
  searchTerm,
  setSearchTerm,
  currentVariant,
  setCurrentVariant,
  variantGroups,
}) {
  return (
    <header className="sticky top-0 z-[100] py-4 md:pt-6 md:pb-12 px-4 md:px-6 mb-8 pointer-events-none">
      {/* Background container with mask effect to avoid clipping dropdowns */}
      <div className="absolute inset-0 z-[-1] backdrop-blur-md bg-surface/30 [mask-image:linear-gradient(black_60%,transparent_100%)] pointer-events-none"></div>
      
      <div className="max-w-[1200px] mx-auto relative flex flex-col md:flex-row items-center justify-center min-h-[48px] gap-4 md:gap-0 pointer-events-auto">
        {/* Espacio para logo */}
        <div className="md:absolute md:left-0 shrink-0 ml-2 md:ml-0 w-full">
          <a
            href="/"
            className="flex items-center justify-center w-12 md:w-16 transition-opacity"
          >
            <Icon
              name="dm"
              variant="flat"
              className="w-full h-full hover:opacity-80 transition-opacity"
            />
          </a>
        </div>

        {/* Buscador Central Grande con Dropdown */}
        <div className="w-full max-w-2xl relative flex items-center group">
          <div className="absolute left-4 md:left-5 pointer-events-none z-10 flex items-center h-full">
            <Icon
              name="magnifying-glass"
              size="md"
              color="text-[#1e293b]"
              className="mt-0 opacity-50 group-focus-within:opacity-100 transition-opacity"
            />
          </div>
          <input
            type="text"
            placeholder="Buscar iconos..."
            className="w-full bg-white/50 backdrop-blur-md border-2 border-[#1e293b]/30 rounded-full pl-12 md:pl-14 pr-[140px] md:pr-48 py-3 md:py-3.5 text-sm md:text-base text-[#1e293b] font-medium outline-none transition-all focus:border-[#1e293b] focus:ring-4 focus:ring-[#facc15] hover:shadow-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="absolute right-2 md:right-2.5 z-2 flex items-center gap-1 md:gap-1.5 h-full">
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="p-1 md:p-1.5 rounded-full hover:bg-black/5 text-text-muted transition-colors cursor-pointer flex items-center justify-center animate-in fade-in zoom-in duration-200"
                title="Limpiar búsqueda"
              >
                <Icon
                  name="xmark"
                  size="sm"
                  color="text-[#1e293b]"
                  className="opacity-60"
                />
              </button>
            )}

            <div className="scale-[0.85] md:scale-100 origin-right">
              <VariantDropdown
                variants={[{ id: "all", label: "Todos" }, ...variantGroups]}
                currentVariant={currentVariant}
                onChange={setCurrentVariant}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
