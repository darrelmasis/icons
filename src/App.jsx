import React, { useState, useEffect } from "react";
import Icon, { preloadIcon } from "./components/Icon";
import VariantDropdown from "./components/VariantDropdown";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Pagination from "./components/Pagination";
import CopySection from "./components/CopySection";

function App() {
  const [icons, setIcons] = useState([]);
  const [filteredIcons, setFilteredIcons] = useState([]);
  const [visibleIcons, setVisibleIcons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentVariant, setCurrentVariant] = useState("regular");
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [modalVariant, setModalVariant] = useState("regular");
  const [modalColor, setModalColor] = useState("#1e293b");
  const [hexInput, setHexInput] = useState("#1e293b");
  const [svgDownloading, setSvgDownloading] = useState(false);
  const [pngCopied, setPngCopied] = useState(false);
  const [modalPreviewLoading, setModalPreviewLoading] = useState(false);
  const [powerBiCopying, setPowerBiCopying] = useState(false);
  const [powerBiCopied, setPowerBiCopied] = useState(false);
  const ICONS_PER_PAGE = 48;

  const variantGroups = [
    {
      title: "Classics",
      items: [
        { id: "thin", label: "Thin" },
        { id: "light", label: "Light" },
        { id: "regular", label: "Regular" },
        { id: "solid", label: "Solid" },
      ],
    },
    {
      title: "Brands",
      items: [
        { id: "world", label: "Brands" },
        { id: "flat", label: "Flat" },
        { id: "color", label: "Color" },
      ],
    },
  ];

  // Lista plana para compatibilidad con lógica existente
  const variants = [
    { id: "all", label: "Todos" },
    ...variantGroups.flatMap((g) => g.items),
  ];

  const classicsVariants = ["thin", "light", "regular", "solid"];
  const brandsVariants = ["world", "flat", "color"];

  // Devuelve las variantes disponibles para el icono del modal (sin la opción "Todos")
  const getModalVariants = (icon) => {
    if (!icon) return [];
    const iconVariants = icon.variants || [];

    // Lista plana de todas las variantes reales
    const realVariants = variants.filter((v) => v.id !== "all");

    // Filtrar solo las que el icono realmente posee
    return realVariants.filter((v) => iconVariants.includes(v.id));
  };

  const getIconDisplayVariant = (icon, selectedV) => {
    if (selectedV !== "all") return selectedV;
    const v = icon.variants || [];
    // Prioridad Classics
    if (v.includes("regular")) return "regular";
    if (v.includes("solid")) return "solid";
    // Prioridad Brands
    if (v.includes("world")) return "world";
    if (v.includes("color")) return "color";
    if (v.includes("flat")) return "flat";
    return v[0] || "regular";
  };

  const getDefaultModalVariant = (icon, currentV) => {
    const allowed = getModalVariants(icon).map((v) => v.id);
    if (allowed.length === 0) return "world";
    return allowed.includes(currentV) ? currentV : allowed[0];
  };

  useEffect(() => {
    fetchIcons();
  }, []);

  useEffect(() => {
    filterIcons();
  }, [icons, searchTerm, currentVariant]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredIcons.length / ICONS_PER_PAGE));
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);

    const start = (page - 1) * ICONS_PER_PAGE;
    const end = start + ICONS_PER_PAGE;
    setVisibleIcons(filteredIcons.slice(start, end));
  }, [filteredIcons, page]);

  useEffect(() => {
    if (visibleIcons.length === 0) return;

    const getDisplayVariantForIcon = (icon) =>
      icon.forcedVariant || getIconDisplayVariant(icon, currentVariant);

    const start = (page - 1) * ICONS_PER_PAGE;
    const iconsToWarm = [
      ...visibleIcons,
      ...filteredIcons.slice(start + ICONS_PER_PAGE, start + ICONS_PER_PAGE * 2),
    ];

    const unique = new Map();
    for (const icon of iconsToWarm) {
      const name = icon?.name;
      if (!name) continue;
      const variant = getDisplayVariantForIcon(icon);
      unique.set(`${name}:${variant}`, { name, variant });
    }

    const job = () => {
      for (const { name, variant } of unique.values()) {
        preloadIcon(name, variant);
      }
    };

    const ric = window.requestIdleCallback;
    if (typeof ric === "function") {
      const id = ric(job, { timeout: 800 });
      return () => window.cancelIdleCallback?.(id);
    }

    const id = window.setTimeout(job, 0);
    return () => window.clearTimeout(id);
  }, [visibleIcons, filteredIcons, currentVariant]);

  const fetchIcons = async () => {
    try {
      const response = await fetch("/api/icons");
      const data = await response.json();
      setIcons(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching icons:", err);
      setLoading(false);
    }
  };

  const filterIcons = () => {
    const term = searchTerm.toLowerCase();

    // 1. Filtrado básico (busca en nombre y etiquetas)
    let matchedIcons = icons.filter((icon) => {
      const nameMatch = icon.name.toLowerCase().includes(term);
      const tagMatch =
        icon.tags && icon.tags.some((tag) => tag.toLowerCase().includes(term));
      return nameMatch || tagMatch;
    });

    // 2. Orden por relevancia (Exacto > Empieza por > Contiene en nombre > Contiene en etiquetas)
    if (term.length > 0) {
      matchedIcons.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();

        // Exacto
        const aExact = aName === term ? 0 : 1;
        const bExact = bName === term ? 0 : 1;
        if (aExact !== bExact) return aExact - bExact;

        // Comienza por
        const aStarts = aName.startsWith(term) ? 0 : 1;
        const bStarts = bName.startsWith(term) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;

        // Coincidencia en nombre vs Coincidencia en etiquetas
        const aNameMatch = aName.includes(term) ? 0 : 1;
        const bNameMatch = bName.includes(term) ? 0 : 1;
        if (aNameMatch !== bNameMatch) return aNameMatch - bNameMatch;

        return aName.localeCompare(bName);
      });
    }

    // 3. Si estamos en 'all' y hay un término, expandimos a variantes individuales
    if (currentVariant === "all" && term.length > 0) {
      const expanded = [];
      matchedIcons.forEach((icon) => {
        icon.variants.forEach((v) => {
          expanded.push({
            ...icon,
            forcedVariant: v,
            uniqueKey: `${icon.name}-${v}`,
          });
        });
      });
      setFilteredIcons(expanded);
    } else {
      // Filtrado normal por variante seleccionada
      const filtered = matchedIcons.filter(
        (icon) =>
          currentVariant === "all" || icon.variants.includes(currentVariant),
      );
      setFilteredIcons(
        filtered.map((icon) => ({ ...icon, uniqueKey: icon.name })),
      );
    }

    setPage(1);
  };

  const openModal = (icon, forcedVariant = null) => {
    setSelectedIcon(icon);
    const variantToSet =
      forcedVariant || getDefaultModalVariant(icon, currentVariant);
    setModalVariant(variantToSet);
    setModalColor("#1e293b");
    setHexInput("#1e293b");
    setModalPreviewLoading(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedIcon(null);
    document.body.style.overflow = "auto";
  };

  useEffect(() => {
    if (!selectedIcon) return;
    let cancelled = false;

    setModalPreviewLoading(true);
    preloadIcon(selectedIcon.name, modalVariant).finally(() => {
      if (!cancelled) setModalPreviewLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedIcon, modalVariant]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const copyPngToClipboard = async (url) => {
    setPngCopied(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    } catch (err) {
      console.error("Error al copiar imagen:", err);
      copyToClipboard(url);
    } finally {
      setTimeout(() => setPngCopied(false), 2000);
    }
  };

  const handleDownloadSvg = (url, name) => {
    setSvgDownloading(true);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setSvgDownloading(false), 2000);
  };

  const totalPages = Math.max(
    1,
    Math.ceil(filteredIcons.length / ICONS_PER_PAGE),
  );

  const copyPowerBiMeasure = async () => {
    if (!selectedIcon) return;
    setPowerBiCopying(true);
    try {
      const rawMeasureName = String(selectedIcon.name || "Icon");
      const sanitizedMeasureName = rawMeasureName
        .replace(/[^A-Za-z0-9_]/g, "_")
        .replace(/^(\d)/, "i_$1");

      const svgUrl =
        modalVariant === "color"
          ? `${baseUrl}/api/svg/var/${modalVariant}/${selectedIcon.name}`
          : `${baseUrl}/api/svg/var/${modalVariant}/${selectedIcon.name}/${encodeURIComponent(modalColor.replace("#", ""))}`;

      const res = await fetch(svgUrl);
      const svg = (await res.text()).replace(/\r?\n/g, "").trim();

      const css =
        `<style>#htmlContent { width: 100vw; height: 100vh; aspect-ratio: 1 / 1; } ` +
        `.htmlViewerEntry { width: 100%; height: 100%; aspect-ratio: 1 / 1; overflow: hidden; margin:0; padding:0; } ` +
        `svg { width: 100%; height: 100%; aspect-ratio: 1 / 1; margin: 0; padding: 0; display: block;${modalVariant !== "color" ? ` fill:${modalColor}` : ""} }</style>`;

      const daxString = (css + svg).replace(/"/g, '""');
      const measure = `${sanitizedMeasureName} =\n"${daxString}"`;

      copyToClipboard(measure);
      setPowerBiCopied(true);
      setTimeout(() => setPowerBiCopied(false), 2000);
    } catch (err) {
      console.error("Error generando medida Power BI:", err);
    } finally {
      setPowerBiCopying(false);
    }
  };

  const baseUrl = window.location.origin;

  return (
    <div className="min-h-screen bg-bg pb-20">
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentVariant={currentVariant}
        setCurrentVariant={setCurrentVariant}
        variantGroups={variantGroups}
      />

      <main className="max-w-[1200px] mx-auto">
        {loading ? (
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
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-5">
            {visibleIcons.length > 0 ? (
              <>
                {visibleIcons.map((icon) => (
                  <div
                    key={icon.uniqueKey}
                    className="bg-surface rounded-xl border border-border/50 aspect-square p-4 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:bg-[#facc15] hover:border-[#facc15] group"
                    onClick={() => openModal(icon, icon.forcedVariant)}
                  >
                    <div className="flex-1 flex items-center justify-center w-full">
                      <Icon
                        name={icon.name}
                        variant={
                          icon.forcedVariant ||
                          getIconDisplayVariant(icon, currentVariant)
                        }
                        size="3xl"
                        color="text-[#1e293b]"
                      />
                    </div>
                    <div className="text-[11px] font-medium text-text-muted group-hover:text-text transition-colors text-center w-full truncate px-1 flex flex-col items-center">
                      <span className="font-bold">{icon.name}</span>
                      {icon.forcedVariant && (
                        <span className="text-[9px] opacity-60 uppercase tracking-wider">
                          {
                            variants.find((v) => v.id === icon.forcedVariant)
                              ?.label
                          }
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="col-span-full py-24 text-center bg-surface rounded-2xl border border-border/50">
                <p className="text-text-muted font-medium">
                  No se encontraron iconos que coincidan con tu búsqueda.
                </p>
              </div>
            )}
          </div>
        )}

        {!loading && filteredIcons.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={ICONS_PER_PAGE}
            totalItems={filteredIcons.length}
            onChange={(next) => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setPage(next);
            }}
          />
        )}
      </main>

      <Footer />

      {/* Modal */}
      {selectedIcon && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-text/20 backdrop-blur-md p-4 animate-in fade-in duration-300"
          onClick={closeModal}
        >
          <div
            className="bg-surface w-full max-w-lg rounded-3xl relative shadow-modal animate-in zoom-in-95 duration-300 border border-white/50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between px-8 pt-7 pb-4">
              <div className="inline-block relative group/title">
                <h2 className="text-xl font-bold text-text">
                  {selectedIcon.name}
                </h2>
                <button
                  onClick={() => copyToClipboard(selectedIcon.name)}
                  className="absolute left-full top-1/2 -translate-y-1/2 ml-2 p-1.5 bg-bg hover:bg-border/50 rounded-lg cursor-pointer flex items-center justify-center"
                  title="Copiar nombre"
                >
                  <Icon
                    name="copy"
                    size="sm"
                    color="text-[#1e293b]"
                    className="opacity-70"
                  />
                </button>
              </div>
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-bg transition-colors cursor-pointer"
                onClick={closeModal}
              >
                <Icon
                  name="xmark"
                  size="md"
                  color="text-[#1e293b]"
                  className="opacity-50 hover:opacity-100 transition-opacity"
                />
              </button>
            </div>

            {/* Preview del icono */}
            <div className="px-8 pb-5">
              <div
                className="w-full h-44 flex items-center justify-center rounded-2xl border-2 border-dashed border-border/40 transition-colors relative overflow-hidden"
                style={{ backgroundColor: `${modalColor}10` }}
              >
                {modalPreviewLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-2xl skeleton-shimmer opacity-60"></div>
                  </div>
                )}
                <Icon
                  name={selectedIcon.name}
                  variant={modalVariant}
                  size="xl"
                  className={`!w-24 !h-24 transition-opacity duration-200 ${modalPreviewLoading ? "opacity-0" : "opacity-100"}`}
                  style={
                    modalVariant === "color"
                      ? undefined
                      : { color: modalColor }
                  }
                  forceColor={modalVariant !== "color"}
                />
              </div>
            </div>

            {/* Controles */}
            <div className="px-8 pb-6 space-y-5">
              {/* Selector de Variante + Color en la misma fila */}
              <div className="flex gap-3">
                {/* Selector de variante (solo si hay opciones) */}
                {getModalVariants(selectedIcon).length > 0 && (
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1.5 ml-1">
                      Variante
                    </label>
                    <VariantDropdown
                      variants={getModalVariants(selectedIcon)}
                      currentVariant={modalVariant}
                      onChange={setModalVariant}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Selector de color - Oculto para variante 'color' */}
                {modalVariant !== "color" && (
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1.5 ml-1">
                      Color
                    </label>
                    <div className="flex items-center gap-2 bg-bg border border-border/50 rounded-xl px-3 py-1.5">
                      <input
                        type="text"
                        value={hexInput}
                        onChange={(e) => {
                          setHexInput(e.target.value);
                          if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value))
                            setModalColor(e.target.value);
                        }}
                        placeholder="#1e293b"
                        className="flex-1 bg-transparent text-sm font-mono text-text outline-none min-w-0"
                        maxLength={7}
                      />
                      <input
                        type="color"
                        value={modalColor}
                        onChange={(e) => {
                          setModalColor(e.target.value);
                          setHexInput(e.target.value);
                        }}
                        className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent p-0 shrink-0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción: Descargar SVG, Copiar PNG y Copiar DAX */}
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    handleDownloadSvg(
                      modalVariant === "color"
                        ? `${baseUrl}/api/svg/var/${modalVariant}/${selectedIcon.name}`
                        : `${baseUrl}/api/svg/var/${modalVariant}/${selectedIcon.name}/${encodeURIComponent(modalColor.replace("#", ""))}`,
                      selectedIcon.name,
                    )
                  }
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all cursor-pointer text-sm font-bold ${
                    svgDownloading
                      ? "bg-[#facc15] border-[#facc15] text-[#1e293b]"
                      : "bg-bg border-border/50 text-text hover:border-text/30 hover:bg-text/5"
                  }`}
                >
                  <Icon
                    name={svgDownloading ? "check" : "arrow-down-to-bracket"}
                    size="sm"
                    color="text-[#1e293b]"
                  />
                  {svgDownloading ? "¡Descargado!" : "Descargar SVG"}
                </button>
                <button
                  onClick={() =>
                    copyPngToClipboard(
                      modalVariant === "color"
                        ? `${baseUrl}/api/png/var/${modalVariant}/${selectedIcon.name}?size=64`
                        : `${baseUrl}/api/png/var/${modalVariant}/${selectedIcon.name}/${encodeURIComponent(modalColor.replace("#", ""))}?size=64`,
                    )
                  }
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all cursor-pointer text-sm font-bold ${
                    pngCopied
                      ? "bg-[#facc15] border-[#facc15] text-[#1e293b]"
                      : "bg-bg border-border/50 text-text hover:border-text/30 hover:bg-text/5"
                  }`}
                >
                  <Icon
                    name={pngCopied ? "check" : "copy"}
                    size="sm"
                    color="text-[#1e293b]"
                  />
                  {pngCopied ? "¡Copiado!" : "Copiar PNG"}
                </button>
                <button
                  type="button"
                  onClick={copyPowerBiMeasure}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all cursor-pointer text-sm font-bold ${
                    powerBiCopied || powerBiCopying
                      ? "bg-[#facc15] border-[#facc15] text-[#1e293b]"
                      : "bg-bg border-border/50 text-text hover:border-text/30 hover:bg-text/5"
                  }`}
                >
                  {powerBiCopying ? (
                    <div className="spinner" />
                  ) : (
                    <Icon name={powerBiCopied ? "check" : "copy"} size="sm" color="text-[#1e293b]" />
                  )}
                  {powerBiCopying ? "DAX..." : powerBiCopied ? "¡Copiado!" : "Copiar DAX"}
                </button>
              </div>

              {/* URLs dinámicas */}
              <CopySection
                label="SVG URL"
                value={
                  modalVariant === "color"
                    ? `${baseUrl}/api/svg/var/${modalVariant}/${selectedIcon.name}`
                    : `${baseUrl}/api/svg/var/${modalVariant}/${selectedIcon.name}/${encodeURIComponent(modalColor.replace("#", ""))}`
                }
                onCopy={copyToClipboard}
              />
              <CopySection
                label="Power BI (HTML Content)"
                value={
                  modalVariant === "color"
                    ? `<img src="${baseUrl}/api/svg/var/${modalVariant}/${selectedIcon.name}" alt="${selectedIcon.name}" width="24" height="24" style="width:24px;height:24px;" />`
                    : `<img src="${baseUrl}/api/svg/var/${modalVariant}/${selectedIcon.name}/${encodeURIComponent(modalColor.replace("#", ""))}" alt="${selectedIcon.name}" width="24" height="24" style="width:24px;height:24px;" />`
                }
                onCopy={copyToClipboard}
              />

            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[2000] bg-text text-surface px-6 py-3 text-sm font-bold transition-all duration-500 pointer-events-none rounded-full shadow-2xl ${
          toastVisible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-90"
        }`}
      >
        ✓ ¡Copiado al portapapeles!
      </div>
    </div>
  );
}



export default App;
