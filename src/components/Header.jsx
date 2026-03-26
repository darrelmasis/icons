import React, { useState, useRef, useEffect } from "react";
import Icon from "./Icon";
import VariantDropdown from "./VariantDropdown";

export default function Header({
  searchTerm,
  setSearchTerm,
  currentVariant,
  setCurrentVariant,
  variantGroups,
  theme,
  setTheme,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    }
    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <header className="sticky top-0 z-[100] py-4 md:pt-6 md:pb-12 px-4 md:px-6 mb-8 pointer-events-none">
      {/* Background container with mask effect to avoid clipping dropdowns */}
      <div className="absolute inset-0 z-[-1] backdrop-blur-md bg-surface/30 [mask-image:linear-gradient(black_60%,transparent_100%)] pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto relative flex items-center justify-center min-h-[48px] gap-4 md:gap-0 pointer-events-auto">
        {/* Espacio para logo - Se oculta en móvil cuando se expande el buscador */}
        <div
          className={`md:absolute md:left-0 shrink-0 transition-opacity duration-300 ${isExpanded ? "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto" : "opacity-100"}`}
        >
          <a
            href="/"
            className="flex items-center justify-center w-12 md:w-16 transition-opacity hover:scale-105 trasnition-transform"
          >
            <Icon
              name="dm"
              variant="flat"
              className="w-full h-full hover:opacity-80 transition-opacity"
            />
          </a>
        </div>

        {/* Toggle tema */}
        <div className="md:absolute md:right-0 shrink-0">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-12 h-12 rounded-full border border-border/60 bg-surface/60 backdrop-blur-md flex items-center justify-center shadow-sm hover:bg-surface-hover transition-colors cursor-pointer"
            aria-label={
              theme === "dark"
                ? "Cambiar a modo claro"
                : "Cambiar a modo oscuro"
            }
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          >
            {theme === "dark" ? (
              <Icon name="sun-bright" size="md" color="text-text" />
            ) : (
              <Icon name="moon" size="md" color="text-text" />
            )}
          </button>
        </div>

        {/* Buscador Central Grande con Dropdown */}
        <div
          ref={searchRef}
          className={`relative flex items-center transition-all duration-300 ease-in-out md:max-w-2xl md:w-full group ${
            isExpanded ? "w-full scale-100" : "w-12 h-12 md:w-full md:h-auto"
          }`}
        >
          {/* Botón de activación para móvil */}
          <button
            onClick={() => setIsExpanded(true)}
            className={`absolute inset-0 z-20 flex items-center justify-center md:hidden transition-opacity duration-200 ${
              isExpanded ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <div className="w-12 h-12 rounded-full border-2 border-border/60 bg-surface/60 backdrop-blur-md flex items-center justify-center shadow-sm">
              <Icon
                name="magnifying-glass"
                size="md"
                color="text-text"
                className="opacity-60"
              />
            </div>
          </button>

          <div
            className={`w-full relative flex items-center transition-all duration-300 ${
              !isExpanded
                ? "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto"
                : "opacity-100"
            }`}
          >
            <div className="absolute left-4 md:left-5 pointer-events-none z-10 flex items-center h-full">
              <Icon
                name="magnifying-glass"
                size="md"
                color="text-text"
                className="mt-0 opacity-50 group-focus-within:opacity-100 transition-opacity"
              />
            </div>
            <input
              type="text"
              placeholder="Buscar iconos..."
              className="w-full bg-surface/60 backdrop-blur-md border-2 border-border/60 rounded-full pl-12 md:pl-14 pr-[140px] md:pr-48 py-3 md:py-3.5 text-sm md:text-base text-text font-medium outline-none transition-all focus:border-border hover:shadow-none focus:ring-1 focus:ring-1 focus:ring-offset-1 focus:ring-offset-surface/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus={isExpanded}
            />

            <div className="absolute right-2 md:right-2.5 z-2 flex items-center gap-1 md:gap-1.5 h-full">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="p-1 md:p-1.5 rounded-full hover:bg-text/5 text-text-muted transition-colors cursor-pointer flex items-center justify-center animate-in fade-in zoom-in duration-200"
                  title="Limpiar búsqueda"
                >
                  <Icon
                    name="xmark"
                    size="sm"
                    color="text-text"
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
      </div>
    </header>
  );
}
