// src/server.js adaptado como /api/index.js

const express = require('express');
const serverless = require('serverless-http');  // IMPORTANTE para Vercel
const cors = require('cors');
const { loadIcons, getIcon } = require('../src/iconLoader');
const config = require('../src/config');

const app = express();

// Colores preestablecidos
const colorMap = {
  "body-bg": "#F0F2F5",
  "dark": "#1F2937",
  "muted": "#6B7280",
  "border": "#C7CED2",
  "primary": "#ADFA1D",
  "primary-alt": "#577D0F",
  "text": "#4C545F"
};

// CORS
app.use(cors({
  origin: config.corsOrigin
}));

// Middleware (aunque realmente este no hacía nada útil aquí)
app.use((req, res, next) => {
  req.params.fill = req.params.fill || config.defaultFill;
  next();
});

// Rutas
app.get('/:iconName/:variant/:fill', async (req, res) => {
  try {
    const { iconName, variant, fill } = req.params;
    let color = colorMap[fill] || fill;

    if (color && /^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) {
      color = `#${color}`;
    }

    const iconSvg = getIcon(iconName, variant);

    if (!iconSvg) {
      return res.status(404).send(`Icono "${iconName}" con variante "${variant}" no encontrado`);
    }

    let svgToSend = iconSvg;

    if (color) {
      svgToSend = iconSvg.replace(/(<path[^>]*fill=["'])([^"']*)(["'])/gi, `$1${color}$3`);
    }

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svgToSend);

  } catch (error) {
    console.error('Error al procesar icono:', error);
    res.status(500).send('Error interno del servidor');
  }
});

app.get('/:iconName/:variant', async (req, res) => {
  try {
    const { iconName, variant } = req.params;
    const fill = config.defaultFill;

    const iconSvg = getIcon(iconName, variant);

    if (!iconSvg) {
      return res.status(404).send(`Icono "${iconName}" con variante "${variant}" no encontrado`);
    }

    let svgToSend = iconSvg;

    if (fill) {
      svgToSend = iconSvg.replace(/(<path[^>]*fill=["'])([^"']*)(["'])/gi, `$1${fill}$3`);
    }

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svgToSend);

  } catch (error) {
    console.error('Error al procesar icono:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// 👇 Esto cambia: no listen(), sino exportamos handler
// Cargamos iconos antes de exponer el handler
async function prepareServer() {
  await loadIcons();
}

prepareServer();

module.exports = serverless(app);
