const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const config = require('./config');

let iconCache = {};

function loadIcons() {
  return new Promise((resolve, reject) => {
    const icons = {};
    const csvPath = path.resolve(__dirname, '../data/icons.csv'); // ruta absoluta

    if (!fs.existsSync(csvPath)) {
      return reject(new Error(`Archivo CSV no encontrado en ${csvPath}`));
    }

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        const iconName = row.name;
        const variant = row.variant || config.defaultVariant;

        if (!icons[iconName]) icons[iconName] = {};
        icons[iconName][variant] = row.svg;
      })
      .on('end', () => {
        iconCache = icons;
        console.log(`✅ ${Object.keys(icons).length} iconos cargados desde CSV`);
        resolve(icons);
      })
      .on('error', reject);
  });
}

function getIcon(iconName, variant = config.defaultVariant) {
  return iconCache[iconName]?.[variant];
}

module.exports = { loadIcons, getIcon };
