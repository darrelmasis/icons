const express = require('express');
const cors = require('cors');
const { loadIcons, getIcon } = require('./iconLoader');
const config = require('./config');

const app = express();

// Colores preestablecidos
const colorMap = {
  "bodybg": "#F0F2F5",
  "dark": "#1F2937",
  "muted": "#6B7280",
  "border": "#C7CED2",
  "primary": "#ADFA1D",
  "primary-alt": "#577D0F",
  "text": "#4C545F"
};

// Configuración CORS
app.use(cors({
  origin: config.corsOrigin
}));

// Middleware para parsear rutas y extraer los parámetros
app.use((req, res, next) => {
  req.params.fill = req.params.fill || config.defaultFill; // Asignar valor de color predeterminado si no se pasa
  next();
});

// Ruta principal para obtener iconos con variante y color en la URL
app.get('/:iconName/:variant/:fillHash', async (req, res) => {
  try {
    const { iconName, variant, fillHash } = req.params;

    // Extraer el color real (antes del guión)
    const [fill] = fillHash.split('-');

    // Asignar color del mapa o usar directamente el fill recibido
    let color = colorMap[fill] || fill;

    // Normalizar fill si es hexadecimal (ej. "ff0000" => "#ff0000")
    if (color && /^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) {
      color = `#${color}`;
    }

    // Obtener icono desde el cache
    const iconSvg = getIcon(iconName, variant);

    if (!iconSvg) {
      return res.status(404).send(`Icono "${iconName}" con variante "${variant}" no encontrado`);
    }

    let svgToSend = iconSvg;

    // Reemplazar todos los fills si se pasa el color
    if (color) {
      svgToSend = iconSvg.replace(/(<path[^>]*fill=["'])([^"']*)(["'])/gi, `$1${color}$3`);
    }

    // Configurar headers y enviar respuesta
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svgToSend);

  } catch (error) {
    console.error('Error al procesar icono:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Ruta principal para obtener iconos con variante y color en la URL
app.get('/:iconName/:fillHash', async (req, res) => {
  try {
    const { iconName, fillHash } = req.params;
    const variant = "regular"
    // Extraer el color real (antes del guión)
    const [fill] = fillHash.split('-');

    // Asignar color del mapa o usar directamente el fill recibido
    let color = colorMap[fill] || fill;

    // Normalizar fill si es hexadecimal (ej. "ff0000" => "#ff0000")
    if (color && /^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) {
      color = `#${color}`;
    }

    // Obtener icono desde el cache
    const iconSvg = getIcon(iconName, variant);

    if (!iconSvg) {
      return res.status(404).send(`Icono "${iconName}" con variante "${variant}" no encontrado`);
    }

    let svgToSend = iconSvg;

    // Reemplazar todos los fills si se pasa el color
    if (color) {
      svgToSend = iconSvg.replace(/(<path[^>]*fill=["'])([^"']*)(["'])/gi, `$1${color}$3`);
    }

    // Configurar headers y enviar respuesta
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svgToSend);

  } catch (error) {
    console.error('Error al procesar icono:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Ruta alternativa para mantener compatibilidad con la versión anterior
app.get('/:iconName/:variant', async (req, res) => {
  try {
    const { iconName, variant } = req.params;
    const fill = config.defaultFill; // Usar color predeterminado en la ruta alternativa

    const iconSvg = getIcon(iconName, variant);

    if (!iconSvg) {
      return res.status(404).send(`Icono "${iconName}" con variante "${variant}" no encontrado`);
    }

    let svgToSend = iconSvg;

    // Reemplazar todos los fills si se pasa el color
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

// Iniciar servidor
async function startServer() {
  try {
    await loadIcons();

    app.listen(config.port, () => {
      console.log(`🚀 Servidor de iconos funcionando en http://localhost:${config.port}`);
    });

  } catch (error) {
    console.error('❌ No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
