const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const config = require('./config');

const iconCache = {};

// Carga los iconos desde el CSV
async function loadIcons() {
  const filePath = path.resolve(config.iconsPath);

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) return resolve();

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const { iconName, variant, svgContent } = row;
        if (!iconCache[iconName]) iconCache[iconName] = {};
        iconCache[iconName][variant || config.defaultVariant] = svgContent;
      })
      .on('end', resolve)
      .on('error', reject);
  });
}

// Devuelve un icono cargando la caché si es necesario
async function getIcon(iconName, variant) {
  if (!Object.keys(iconCache).length) {
    await loadIcons();
  }
  return iconCache[iconName]?.[variant || config.defaultVariant] || null;
}

module.exports = {
  loadIcons,
  getIcon
};
