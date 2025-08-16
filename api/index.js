const express = require('express');
const cors = require('cors');
const sharp = require('sharp');
const { loadIcons, getIcon } = require('../src/iconLoader');
const config = require('../src/config');

const serverless = require('serverless-http');
const app = express();
app.use(cors());

const colorMap = {
  dark: "#1F2937", light: "#F0F2F5", muted: "#6B7280", border: "#C7CED2",
  primary: "#ADFA1D", primaryalt: "#577D0F", text: "#4C545F"
};

const cssColors = new Set([
  // ... tu lista de colores ...
]);

let defaultVariant = config.defaultVariant;
let defaultSize = config.defaultSize;

function resolveColor(fill) {
  if (!fill) return null;
  const baseColor = fill.split('-')[0];
  const color = colorMap[baseColor] || baseColor;
  if (cssColors.has(color.toLowerCase())) return color;
  if (/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) return `#${color}`;
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) return color;
  return null;
}

// ---------------- RUTAS ----------------
// PNG
app.get(['/png/var/:variant/:iconName/:fill/size/:size','/png/var/:variant/:iconName/:fill'], async (req, res) => {
  await servePng(req, res, req.params.iconName, req.params.variant, req.params.fill, req.params.size || defaultSize);
});
app.get(['/png/var/:variant/:iconName/size/:size','/png/var/:variant/:iconName'], async (req, res) => {
  await servePng(req, res, req.params.iconName, req.params.variant, null, req.params.size || defaultSize);
});
app.get(['/png/:iconName/:fill/size/:size','/png/:iconName/:fill'], async (req, res) => {
  await servePng(req, res, req.params.iconName, defaultVariant, req.params.fill, req.params.size || defaultSize);
});
app.get(['/png/:iconName/size/:size','/png/:iconName'], async (req, res) => {
  await servePng(req, res, req.params.iconName, defaultVariant, null, req.params.size || defaultSize);
});

// SVG
app.get('/svg/var/:variant/:iconName/:fill', async (req, res) => {
  await serveSvg(req, res, req.params.iconName, req.params.variant, req.params.fill);
});
app.get('/svg/var/:variant/:iconName', async (req, res) => {
  await serveSvg(req, res, req.params.iconName, req.params.variant, null);
});
app.get('/svg/:iconName/:fill', async (req, res) => {
  await serveSvg(req, res, req.params.iconName, defaultVariant, req.params.fill);
});
app.get('/svg/:iconName', async (req, res) => {
  await serveSvg(req, res, req.params.iconName, defaultVariant, null);
});

// ---------------- HANDLERS ----------------
async function serveSvg(req, res, iconName, variant, fill) {
  try {
    const iconSvg = getIcon(iconName, variant);
    if (!iconSvg) return res.status(404).send(`Icono "${iconName}" con variante "${variant}" no encontrado`);
    const color = fill ? resolveColor(fill) : null;
    const svg = color
      ? iconSvg
          .replace(/fill="currentColor"/gi, `fill="${color}"`)
          .replace(/(<(path|circle|rect|polygon|ellipse|line)[^>]*fill=["'])([^"']*)(["'])/gi, `$1${color}$4`)
      : iconSvg;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al procesar SVG');
  }
}

async function servePng(req, res, iconName, variant, fill, size = config.defaultSize) {
  try {
    const iconSvg = getIcon(iconName, variant);
    if (!iconSvg) return res.status(404).send(`Icono "${iconName}" con variante "${variant}" no encontrado`);
    const color = fill ? resolveColor(fill) : null;
    const svg = color
      ? iconSvg
          .replace(/fill="currentColor"/gi, `fill="${color}"`)
          .replace(/(<(path|circle|rect|polygon|ellipse|line)[^>]*fill=["'])([^"']*)(["'])/gi, `$1${color}$4`)
      : iconSvg;
    let finalSize = parseInt(size, 10);
    if (isNaN(finalSize) || finalSize <= 0 || finalSize > 1024) finalSize = config.defaultSize;
    const png = await sharp(Buffer.from(svg))
      .resize(finalSize, finalSize, { fit: 'inside' })
      .png()
      .toBuffer();
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(png);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al convertir a PNG');
  }
}

// ---------------- CARGA ICONOS ----------------
(async () => {
  try {
    await loadIcons();
    console.log('Íconos cargados correctamente.');
  } catch (err) {
    console.error('No se pudieron cargar los íconos:', err);
  }
})();

// ---------------- EXPORT SERVERLESS ----------------
module.exports = app;
module.exports.handler = serverless(app);
