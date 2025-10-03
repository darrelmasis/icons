// src/iconLoader.js
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const config = require("./config");

let iconCache = {}; // { iconName: { variant: svgString } }
let iconsLoaded = false;

function _normalizeRow(row) {
  // Aceptamos varias formas de columnas para ser tolerantes
  return {
    name:
      row.name ||
      row.iconName ||
      row.icon ||
      row["icon-name"] ||
      row["icons-html-content-name"],
    variant:
      row.variant || row.style || row.variantName || config.defaultVariant,
    svg:
      row.svg ||
      row.svgContent ||
      row["icons-html-content"] ||
      row.content ||
      row.svg_data,
  };
}

function loadIcons() {
  return new Promise((resolve, reject) => {
    const icons = {};
    // Resolución absoluta basada en la ruta relativa declarada en config.iconsPath
    const csvPath = path.resolve(__dirname, config.iconsPath);

    console.log("iconLoader: intentando leer CSV en:", csvPath);

    if (!fs.existsSync(csvPath)) {
      console.warn(
        `iconLoader: archivo CSV no encontrado en ${csvPath}. Se cargará cache vacío.`
      );
      // no rechazamos para que la función serverless no caiga en deploy; resolvemos con cache vacío
      iconCache = {};
      iconsLoaded = true;
      return resolve(iconCache);
    }

    const stream = fs.createReadStream(csvPath).pipe(csv());

    stream.on("data", (row) => {
      try {
        const r = _normalizeRow(row);
        if (!r.name || !r.svg) {
          // fila incompleta, la ignoramos pero no rompemos todo
          return;
        }
        // Normalizar: trim y lowercase para búsquedas consistentes
        const iconName = String(r.name).trim().toLowerCase();
        const variant = String(r.variant || config.defaultVariant)
          .trim()
          .toLowerCase();

        // Limpiar SVG simple: corregir comillas duplicadas comunes en CSV exportados
        let svgContent = String(r.svg).replace(/""/g, '"');
        svgContent = svgContent.replace(
          /xmlns=\"http:\/\/www.w3.org\/2000\/svg\"/gi,
          'xmlns="http://www.w3.org/2000/svg"'
        );

        if (!icons[iconName]) icons[iconName] = {};
        icons[iconName][variant] = svgContent;
      } catch (err) {
        // no terror: registramos y seguimos
        console.warn("iconLoader: fila CSV inválida, se ignora", err);
      }
    });

    stream.on("end", () => {
      iconCache = icons;
      iconsLoaded = true;
      console.log(
        `✅ iconLoader: ${Object.keys(icons).length} iconos cargados desde CSV`
      );
      resolve(iconCache);
    });

    stream.on("error", (err) => {
      console.error("iconLoader: error leyendo CSV", err);
      reject(err);
    });
  });
}

async function getIcon(iconName, variant = config.defaultVariant) {
  try {
    // Si aún no cargamos iconos, lo hacemos (on-demand para serverless)
    if (!iconsLoaded) {
      await loadIcons();
    }
    return iconCache[iconName]?.[variant] || null;
  } catch (err) {
    console.error("iconLoader.getIcon error:", err);
    return null;
  }
}

async function getFirstIconName() {
  try {
    if (!iconsLoaded) {
      await loadIcons();
    }
    const keys = Object.keys(iconCache || {});
    return keys.length ? keys[0] : null;
  } catch (err) {
    console.error("iconLoader.getFirstIconName error:", err);
    return null;
  }
}

module.exports = { loadIcons, getIcon, getFirstIconName };
