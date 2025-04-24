const express = require('express');
const cors = require('cors');
const { loadIcons, getIcon } = require('./iconLoader');
const config = require('./config');

const app = express();

// CORS
app.use(cors({
  origin: config.corsOrigin
}));

// Middleware para llenar el fill por defecto si no viene
app.use((req, res, next) => {
  req.query.fill = req.query.fill || config.defaultFill;
  next();
});

// Función para procesar fill y reemplazarlo en el SVG
function applyFillToSvg(svg, fill) {
  if (!fill) return svg;

  // Agregar "#" si es color hexadecimal válido
  if (/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(fill)) {
    fill = `#${fill}`;
  }

  return svg.replace(/(\bfill=["'])([^"']*)(["'])/gi, `$1${fill}$3`);
}

// Ruta principal con variante
app.get('/:iconName/:variant', async (req, res) => {
  try {
    const { iconName, variant } = req.params;
    let { fill } = req.query;

    fill = (fill || '').toString().replace(/["']/g, '');

    const iconSvg = getIcon(iconName, variant);
    if (!iconSvg) {
      return res.status(404).send(`Icono "${iconName}" con variante "${variant}" no encontrado`);
    }

    const svgToSend = applyFillToSvg(iconSvg, fill);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svgToSend);

  } catch (error) {
    console.error('Error al procesar icono:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Ruta alternativa sin variante explícita
app.get('/:iconName', async (req, res) => {
  try {
    const iconName = req.params.iconName;
    const variant = config.defaultVariant;
    let { fill } = req.query;

    fill = (fill || '').toString().replace(/["']/g, '');

    const iconSvg = getIcon(iconName, variant);
    if (!iconSvg) {
      return res.status(404).send(`Icono "${iconName}" con variante "${variant}" no encontrado`);
    }

    const svgToSend = applyFillToSvg(iconSvg, fill);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svgToSend);

  } catch (error) {
    console.error('Error al procesar icono:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Arrancar servidor
async function startServer() {
  try {
    await loadIcons();
    app.listen(config.port, () => {
      console.log(`🚀 Servidor de iconos en http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('❌ No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
