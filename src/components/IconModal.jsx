import React from "react";
import Icon from "./Icon";
import VariantDropdown from "./VariantDropdown";
import CopySection from "./CopySection";

export default function IconModal({
  selectedIcon,
  onClose,
  modalVariant,
  setModalVariant,
  modalVariants,
  modalColor,
  setModalColor,
  hexInput,
  setHexInput,
  onCopyIconName,
  onDownloadSvg,
  onCopyPng,
  onCopyPowerBi,
  svgDownloading,
  pngDownloading,
  pngCopied,
  pngCopying,
  hexCopied,
  hexCopying,
  svgUrlValue,
  powerBiHtmlValue,
  onCopy,
  onCopyHexColor,
  onCopySvg,
  onDownloadPng,
  svgContentCopying,
  svgContentCopied,
  modalPreviewLoading,
  powerBiCopying,
  powerBiCopied,
  nameCopied,
}) {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-surface w-full max-w-lg rounded-3xl relative shadow-modal animate-in zoom-in-95 duration-300 border border-border/60 "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="flex items-center justify-between px-8 pt-7 pb-4">
          <div className="inline-block relative group/title">
            <h2 className="text-xl font-bold text-text">{selectedIcon.name}</h2>
           <button
             onClick={() => onCopyIconName(selectedIcon.name)}
             className={`absolute left-full top-1/2 -translate-y-1/2 ml-2 p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
               nameCopied
                 ? "bg-[#facc15] text-[#1e293b]"
                 : "bg-bg hover:bg-border/50 text-text opacity-70 hover:opacity-100"
             }`}
             title="Copiar nombre"
           >
             <Icon
               name={nameCopied ? "check" : "copy"}
               size="sm"
             />
           </button>

            {/* Nuevo: Copiar SVG */}
            <button
              onClick={onCopySvg}
              disabled={svgContentCopying}
              className={`absolute left-[calc(100%+2.8rem)] top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                svgContentCopied
                  ? "bg-[#facc15] text-[#1e293b]"
                  : "bg-bg hover:bg-border/50 text-text opacity-70 hover:opacity-100"
              }`}
              title="Copiar SVG"
            >
              {svgContentCopying ? (
                <div className="spinner !w-3.5 !h-3.5" />
              ) : (
                <Icon
                  name={svgContentCopied ? "check" : "file-code"}
                  size="sm"
                />
              )}
            </button>

            {/* Nuevo: Descargar PNG */}
            <button
              onClick={onDownloadPng}
              disabled={pngDownloading}
              className={`absolute left-[calc(100%+5.1rem)] top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                pngDownloading
                  ? "bg-[#facc15] text-[#1e293b]"
                  : "bg-bg hover:bg-border/50 text-text opacity-70 hover:opacity-100"
              }`}
              title="Descargar PNG"
            >
              <Icon
                name={pngDownloading ? "check" : "download"}
                size="sm"
              />
            </button>
          </div>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-bg transition-colors cursor-pointer"
            onClick={onClose}
          >
            <Icon
              name="xmark"
              size="md"
              color="text-text"
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
              className={`!w-24 !h-24 transition-opacity duration-200 ${
                modalPreviewLoading ? "opacity-0" : "opacity-100"
              }`}
              style={
                modalVariant === "color" ? undefined : { color: modalColor }
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
            {modalVariants.length > 0 && (
              <div className="flex-1">
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1.5 ml-1">
                  Variante
                </label>
                <VariantDropdown
                  variants={modalVariants}
                  currentVariant={modalVariant}
                  onChange={setModalVariant}
                  className="w-full"
                />
              </div>
            )}

            {/* Selector de color - Oculto para variante 'color' */}
            {modalVariant !== "color" && (
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1.5 ml-1">
                  Color
                </label>
                <div className="flex items-center h-11 bg-bg border border-border/50 rounded-xl px-2.5 gap-2 group/picker focus-within:border-accent/30 transition-all">
                  {/* Color Preview & Picker Trigger */}
                  <div
                    className="relative w-6 h-6 rounded-full border border-border/30 overflow-hidden shrink-0 shadow-sm"
                    style={{ backgroundColor: modalColor }}
                  >
                    <input
                      type="color"
                      value={modalColor}
                      onChange={(e) => {
                        setModalColor(e.target.value);
                        setHexInput(e.target.value);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer scale-150"
                    />
                  </div>

                  {/* HEX Input */}
                  <div className="flex items-center flex-1 min-w-0">
                    <span className="text-text-muted font-mono text-sm mr-0.5 pointer-events-none select-none">
                      #
                    </span>
                    <input
                      type="text"
                      value={hexInput.replace("#", "")}
                      onChange={(e) => {
                        const val = e.target.value.replace("#", "");
                        setHexInput(`#${val}`);
                        if (/^[0-9A-Fa-f]{6}$/.test(val))
                          setModalColor(`#${val}`);
                      }}
                      placeholder="1e293b"
                      className="flex-1 bg-transparent text-sm font-mono text-text outline-none min-w-0"
                      maxLength={6}
                    />
                  </div>

                  {/* Copiar HEX */}
                  <button
                    type="button"
                    onClick={onCopyHexColor}
                    disabled={hexCopying}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                      hexCopied
                        ? "bg-[#facc15] text-[#1e293b]"
                        : "text-text-muted hover:text-text hover:bg-text/5"
                    }`}
                    title="Copiar HEX"
                  >
                    {hexCopying ? (
                      <div className="spinner !w-3.5 !h-3.5" />
                    ) : (
                      <Icon name={hexCopied ? "check" : "copy"} size="sm" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción: Descargar SVG, Copiar PNG y Copiar DAX */}
          <div className="flex gap-3">
            <button
              onClick={onDownloadSvg}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all cursor-pointer text-sm font-bold ${
                svgDownloading
                  ? "bg-[#facc15] border-[#facc15] text-[#1e293b]"
                  : "bg-bg border-border/50 text-text hover:border-text/30 hover:bg-text/5"
              }`}
            >
              <Icon
                name={svgDownloading ? "check" : "arrow-down-to-bracket"}
                size="sm"
                color={svgDownloading ? "text-[#1e293b]" : "text-text"}
              />
              {svgDownloading ? "¡Descargado!" : "Descargar SVG"}
            </button>

            <button
              onClick={onCopyPng}
              disabled={pngCopying}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all cursor-pointer text-sm font-bold ${
                pngCopied
                  ? "bg-[#facc15] border-[#facc15] text-[#1e293b]"
                  : "bg-bg border-border/50 text-text hover:border-text/30 hover:bg-text/5"
              }`}
            >
              {pngCopying ? (
                <div className="flex items-center gap-2">
                  <div className="spinner" />
                  <span>Copiando...</span>
                </div>
              ) : pngCopied ? (
                "¡Copiado!"
              ) : (
                "Copiar PNG"
              )}
              {!pngCopying && (
                <Icon
                  name={pngCopied ? "check" : "copy"}
                  size="sm"
                  color={pngCopied ? "text-[#1e293b]" : "text-text"}
                  className="shrink-0"
                />
              )}
            </button>

            <button
              type="button"
              onClick={onCopyPowerBi}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all cursor-pointer text-sm font-bold ${
                powerBiCopied || powerBiCopying
                  ? "bg-[#facc15] border-[#facc15] text-[#1e293b]"
                  : "bg-bg border-border/50 text-text hover:border-text/30 hover:bg-text/5"
              }`}
            >
              {powerBiCopying ? (
                <div className="spinner" />
              ) : (
                <Icon
                  name={powerBiCopied ? "check" : "copy"}
                  size="sm"
                  color={powerBiCopied ? "text-[#1e293b]" : "text-text"}
                />
              )}
              {powerBiCopying
                ? "DAX..."
                : powerBiCopied
                  ? "¡Copiado!"
                  : "Copiar DAX"}
            </button>
          </div>

          {/* URLs dinámicas */}
          <CopySection label="SVG URL" value={svgUrlValue} onCopy={onCopy} />
          {/* <CopySection
            label="Power BI (HTML Content)"
            value={powerBiHtmlValue}
            onCopy={onCopy}
          /> */}
        </div>
      </div>
    </div>
  );
}
