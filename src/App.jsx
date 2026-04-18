import React, { useState, useEffect } from "react";
import { preloadIcon } from "./components/Icon";
import IconGrid from "./components/IconGrid";
import IconModal from "./components/IconModal";
import Toast from "./components/Toast";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Pagination from "./components/Pagination";

function App() {
  const [theme, setTheme] = useState(() => {
    const stored = window.localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    return "dark"; // Default is now dark
  }); 
  const [icons, setIcons] = useState([]);
  const [filteredIcons, setFilteredIcons] = useState([]);
  const [visibleIcons, setVisibleIcons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentVariant, setCurrentVariant] = useState(() => {
    const stored = window.localStorage.getItem("svg-icon-category");
    return stored || "all";
  });
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [modalVariant, setModalVariant] = useState("regular");
  const [modalColor, setModalColor] = useState("#1e293b");
  const [hexInput, setHexInput] = useState("#1e293b");
  const [svgDownloading, setSvgDownloading] = useState(false);
  const [pngCopied, setPngCopied] = useState(false);
  const [pngCopying, setPngCopying] = useState(false);
  const [hexCopied, setHexCopied] = useState(false);
  const [hexCopying, setHexCopying] = useState(false);
  const [modalPreviewLoading, setModalPreviewLoading] = useState(false);
  const [powerBiCopying, setPowerBiCopying] = useState(false);
  const [powerBiCopied, setPowerBiCopied] = useState(false);
  const [nameCopied, setNameCopied] = useState(false);
  const [svgContentCopying, setSvgContentCopying] = useState(false);
  const [svgContentCopied, setSvgContentCopied] = useState(false);
  const [pngDownloading, setPngDownloading] = useState(false);
  const ICONS_PER_PAGE = 48;


  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("svg-icon-category", currentVariant);
  }, [currentVariant]);

  useEffect(() => {
    // Si no hay modal abierto, mantenemos el color por defecto coherente con el tema.
    if (selectedIcon) return;
    const defaultColor = theme === "dark" ? "#e2e8f0" : "#1e293b";
    setModalColor(defaultColor);
    setHexInput(defaultColor);
  }, [theme, selectedIcon]);

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
  const brandsVariants = ["flat", "color"];

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
    // Prioridad Brands (En TODOS, preferimos flat sobre color)
    if (v.includes("flat")) return "flat";
    if (v.includes("color")) return "color";
    return v[0] || "regular";
  };

  const getDefaultModalVariant = (icon, currentV) => {
    const allowed = getModalVariants(icon).map((v) => v.id);
    if (allowed.length === 0) return "color";
    return allowed.includes(currentV) ? currentV : allowed[0];
  };

  useEffect(() => {
    fetchIcons();
  }, []);

  useEffect(() => {
    filterIcons();
  }, [icons, searchTerm, currentVariant]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredIcons.length / ICONS_PER_PAGE),
    );
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
      ...filteredIcons.slice(
        start + ICONS_PER_PAGE,
        start + ICONS_PER_PAGE * 2,
      ),
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
          // No mostrar la variante color de brands en TODOS
          if (v === "color") return;
          
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
      const filtered = matchedIcons.filter((icon) => {
        if (currentVariant === "all") {
          // En "todos", solo mostrar iconos que tengan algo más que solo la variante 'color'
          // o si solo tienen 'color', los ocultamos según el requerimiento.
          return icon.variants.some(v => v !== "color");
        }
        return icon.variants.includes(currentVariant);
      });
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
    const defaultColor = theme === "dark" ? "#e2e8f0" : "#1e293b";
    setModalColor(defaultColor);
    setHexInput(defaultColor);
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

  const copyIconName = async (name) => {
    const ok = await copyToClipboard(name);
    if (ok) {
      setNameCopied(true);
      setTimeout(() => setNameCopied(false), 2000);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
      return true;
    } catch (err) {
      console.error("Error al copiar al portapapeles:", err);
      return false;
    }
  };

  const copyPngToClipboard = async (url) => {
    setPngCopying(true);
    setPngCopied(false);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
      setPngCopied(true);
      setTimeout(() => setPngCopied(false), 2000);
      return true;
    } catch (err) {
      console.error("Error al copiar imagen:", err);
      // Fallback: si falla el PNG, intentamos copiar la URL como último recurso.
      return await copyToClipboard(url);
    } finally {
      setPngCopying(false);
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

  const handleDownloadPng = (url, name) => {
    setPngDownloading(true);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setPngDownloading(false), 2000);
  };

  const totalPages = Math.max(
    1,
    Math.ceil(filteredIcons.length / ICONS_PER_PAGE),
  );

  const copyPowerBiMeasure = async () => {
    if (!selectedIcon) return;
    setPowerBiCopying(true);
    setPowerBiCopied(false);
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

      const ok = await copyToClipboard(measure);
      if (ok) {
        setPowerBiCopied(true);
        setTimeout(() => setPowerBiCopied(false), 2000);
      }
    } catch (err) {
      console.error("Error generando medida Power BI:", err);
    } finally {
      setPowerBiCopying(false);
    }
  };

  const baseUrl = window.location.origin;
  const svgUrlValue =
    selectedIcon &&
    (modalVariant === "color"
      ? `${baseUrl}/api/svg/var/${modalVariant}/${selectedIcon.name}`
      : `${baseUrl}/api/svg/var/${modalVariant}/${selectedIcon.name}/${encodeURIComponent(modalColor.replace("#", ""))}`);

  const downloadSvgCurrent = () => {
    if (!selectedIcon) return;
    const url =
      modalVariant === "color"
        ? `${baseUrl}/api/svg/var/${modalVariant}/${selectedIcon.name}`
        : `${baseUrl}/api/svg/var/${modalVariant}/${selectedIcon.name}/${encodeURIComponent(modalColor.replace("#", ""))}`;
    handleDownloadSvg(url, selectedIcon.name);
  };

  const downloadPngCurrent = () => {
    if (!selectedIcon) return;
    const url =
      modalVariant === "color"
        ? `${baseUrl}/api/png/var/${modalVariant}/${selectedIcon.name}?size=1024`
        : `${baseUrl}/api/png/var/${modalVariant}/${selectedIcon.name}/${encodeURIComponent(modalColor.replace("#", ""))}?size=1024`;
    handleDownloadPng(url, selectedIcon.name);
  };

  const copyPngCurrent = () => {
    if (!selectedIcon) return;
    const url =
      modalVariant === "color"
        ? `${baseUrl}/api/png/var/${modalVariant}/${selectedIcon.name}?size=256`
        : `${baseUrl}/api/png/var/${modalVariant}/${selectedIcon.name}/${encodeURIComponent(modalColor.replace("#", ""))}?size=256`;
    copyPngToClipboard(url);
  };

  const copyHexColor = async () => {
    setHexCopying(true);
    setHexCopied(false);
    try {
      const ok = await copyToClipboard(modalColor);
      if (ok) {
        setHexCopied(true);
        setTimeout(() => setHexCopied(false), 2000);
      }
    } finally {
      setHexCopying(false);
    }
  };

  const copySvgContent = async () => {
    if (!svgUrlValue) return;
    setSvgContentCopying(true);
    setSvgContentCopied(false);
    try {
      const res = await fetch(svgUrlValue);
      const svg = await res.text();
      const ok = await copyToClipboard(svg);
      if (ok) {
        setSvgContentCopied(true);
        setTimeout(() => setSvgContentCopied(false), 2000);
      }
    } catch (err) {
      console.error("Error al copiar SVG:", err);
    } finally {
      setSvgContentCopying(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentVariant={currentVariant}
        setCurrentVariant={setCurrentVariant}
        variantGroups={variantGroups}
        theme={theme}
        setTheme={setTheme}
      />

      <main className="max-w-[1200px] mx-auto">
        <IconGrid
          loading={loading}
          visibleIcons={visibleIcons}
          variants={variants}
          currentVariant={currentVariant}
          onOpenModal={openModal}
          getIconDisplayVariant={getIconDisplayVariant}
        />

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
        <IconModal
          selectedIcon={selectedIcon}
          onClose={closeModal}
          modalVariant={modalVariant}
          setModalVariant={setModalVariant}
          modalVariants={getModalVariants(selectedIcon)}
          modalColor={modalColor}
          setModalColor={setModalColor}
          hexInput={hexInput}
          setHexInput={setHexInput}
          modalPreviewLoading={modalPreviewLoading}
          onCopyIconName={copyIconName}
          nameCopied={nameCopied}
          onDownloadSvg={downloadSvgCurrent}
          onDownloadPng={downloadPngCurrent}
          onCopyPng={copyPngCurrent}
          onCopyPowerBi={copyPowerBiMeasure}
          svgDownloading={svgDownloading}
          pngDownloading={pngDownloading}
          pngCopied={pngCopied}
          pngCopying={pngCopying}
          hexCopied={hexCopied}
          hexCopying={hexCopying}
          onCopyHexColor={copyHexColor}
          powerBiCopying={powerBiCopying}
          powerBiCopied={powerBiCopied}
          svgUrlValue={svgUrlValue}
          onCopySvg={copySvgContent}
          svgContentCopying={svgContentCopying}
          svgContentCopied={svgContentCopied}
          powerBiHtmlValue={
            selectedIcon &&
            (modalVariant === "color"
              ? `<img src="${baseUrl}/api/svg/var/${modalVariant}/${selectedIcon.name}" alt="${selectedIcon.name}" width="24" height="24" style="width:24px;height:24px;" />`
              : `<img src="${baseUrl}/api/svg/var/${modalVariant}/${selectedIcon.name}/${encodeURIComponent(modalColor.replace("#", ""))}" alt="${selectedIcon.name}" width="24" height="24" style="width:24px;height:24px;" />`)
          }
          onCopy={copyToClipboard}
        />
      )}

      {/* Toast Notification */}
      <Toast toastVisible={toastVisible}>✓ ¡Copiado al portapapeles!</Toast>
    </div>
  );
}

export default App;
