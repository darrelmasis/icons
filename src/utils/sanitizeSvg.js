// Utilidad simple para sanitizar SVGs: eliminar <script> y atributos on* peligrosos
function sanitizeSvg(svg) {
  if (!svg || typeof svg !== "string") return svg;
  return svg
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\s+on[a-z]+=\"[^\"]*\"/gi, "")
    .replace(/\s+on[a-z]+='[^']*'/gi, "");
}

module.exports = { sanitizeSvg };
