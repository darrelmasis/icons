const express = require('express');
const cors = require('cors');
const sharp = require('sharp');
const { loadIcons, getIcon } = require('./iconLoader');
const config = require('./config');

const app = express();

const colorMap = {
  dark: "#1F2937", light: "#F0F2F5", muted: "#6B7280", border: "#C7CED2",
  primary: "#ADFA1D", primaryalt: "#577D0F", text: "#4C545F"
};

const cssColors = new Set([
  "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque",
  "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue",
  "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan",
  "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkgrey",
  "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred",
  "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey",
  "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey",
  "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro",
  "ghostwhite", "gold", "goldenrod", "gray", "green", "greenyellow", "grey",
  "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender",
  "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan",
  "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey", "lightpink",
  "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightslategrey",
  "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon",
  "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen",
  "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred",
  "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite", "navy",
  "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod",
  "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru",
  "pink", "plum", "powderblue", "purple", "rebeccapurple", "red", "rosybrown",
  "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna",
  "silver", "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen",
  "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat",
  "white", "whitesmoke", "yellow", "yellowgreen"
]);

function resolveColor(fill) {
  const color = colorMap[fill] || fill;
  if (cssColors.has(color.toLowerCase())) return color;
  if (/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) return `#${color}`;
  return null;
}

//---------------- CONVERT (PNG) CON TAMAÑO ----------------
// icono + variante + color + tamaño
app.get('/convert/:iconName/:variant/:fill/size/:size', async (req, res) => {
  await servePng(req, res, req.params.iconName, req.params.variant, req.params.fill, req.params.size);
});

// icono + color + tamaño
app.get('/convert/:iconName/:fill/size/:size', async (req, res) => {
  await servePng(req, res, req.params.iconName, 'regular', req.params.fill, req.params.size);
});

// icono + variante + tamaño
app.get('/convert/:iconName/:variant/size/:size', async (req, res) => {
  await servePng(req, res, req.params.iconName, req.params.variant, null, req.params.size);
});

// icono + tamaño
app.get('/convert/:iconName/size/:size', async (req, res) => {
  await servePng(req, res, req.params.iconName, 'regular', null, req.params.size);
});

// ---------------- CONVERT (PNG) ----------------

// icono + variante + color
app.get('/convert/:iconName/:variant/:fill', async (req, res) => {
  await servePng(req, res, req.params.iconName, req.params.variant, req.params.fill);
});

// icono + color
app.get('/convert/:iconName/:fill', async (req, res) => {
  await servePng(req, res, req.params.iconName, 'regular', req.params.fill);
});

// icono + variante
app.get('/convert/:iconName/:variant', async (req, res) => {
  await servePng(req, res, req.params.iconName, req.params.variant, null);
});

// solo icono
app.get('/convert/:iconName', async (req, res) => {
  await servePng(req, res, req.params.iconName, 'regular', null);
});




// ---------------- SVG ----------------

// icono + variante + color
app.get('/:iconName/:variant/:fill', async (req, res) => {
  await serveSvg(req, res, req.params.iconName, req.params.variant, req.params.fill);
});

// icono + color
app.get('/:iconName/:fill', async (req, res) => {
  await serveSvg(req, res, req.params.iconName, 'regular', req.params.fill);
});

// icono + variante
app.get('/:iconName/:variant', async (req, res) => {
  await serveSvg(req, res, req.params.iconName, req.params.variant, null);
});

// solo icono
app.get('/:iconName', async (req, res) => {
  await serveSvg(req, res, req.params.iconName, 'regular', null);
});

// ---------- Handlers ----------
async function serveSvg(req, res, iconName, variant, fill) {
  try {
    const iconSvg = getIcon(iconName, variant);
    if (!iconSvg) return res.status(404).send(`Icono "${iconName}" con variante "${variant}" no encontrado`);
    const color = fill ? resolveColor(fill) : null;

    const svg = color
      ? iconSvg.replace(/(<path[^>]*fill=["'])([^"']*)(["'])/gi, `$1${color}$3`)
      : iconSvg;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al procesar SVG');
  }
}

async function servePng(req, res, iconName, variant, fill, size = 128) {
  try {
    const iconSvg = getIcon(iconName, variant);
    if (!iconSvg) return res.status(404).send(`Icono "${iconName}" con variante "${variant}" no encontrado`);

    const color = fill ? resolveColor(fill) : null;
    const svg = color
      ? iconSvg.replace(/(<path[^>]*fill=["'])([^"']*)(["'])/gi, `$1${color}$3`)
      : iconSvg;

    const png = await sharp(Buffer.from(svg))
      .resize(Number(size), Number(size), { fit: 'inside' })
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


// ---------- Start Server ----------
async function startServer() {
  try {
    await loadIcons();
    app.listen(config.port, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err);
    process.exit(1);
  }
}

startServer();
