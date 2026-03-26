// src/iconLoader.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let iconCache = {}; // { iconName: { variant: svgString } }
let tagCache = {};  // { iconName: [tags] }
let mtimeCache = {}; // { filePath: lastModifiedTime }
let iconsLoaded = false;

async function loadIcons() {
  const rootDir = path.resolve(__dirname, "..", config.iconsDir);
  console.log("iconLoader: Escaneando iconos en:", rootDir);

  if (!fs.existsSync(rootDir)) {
    console.warn(`iconLoader: Directorio no encontrado: ${rootDir}`);
    return {};
  }

  // Cargar etiquetas si existen
  const tagsPath = path.join(rootDir, "tags.json");
  if (fs.existsSync(tagsPath)) {
    try {
      tagCache = JSON.parse(fs.readFileSync(tagsPath, "utf-8"));
      console.log(`✅ iconLoader: Cargadas etiquetas para ${Object.keys(tagCache).length} iconos.`);
    } catch (err) {
      console.warn("iconLoader: Error cargando tags.json:", err);
    }
  }

  const icons = {};

  for (const targetPath of config.targetPaths) {
    const dirPath = path.join(rootDir, targetPath);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".svg"));
    
    // Identificar la variante basándose en la ruta completa
    let variant = path.basename(targetPath); // fallback default
    if (targetPath.includes("flat")) variant = "flat";
    else if (targetPath.includes("color")) variant = "color";
    else if (targetPath.includes('thin')) variant = 'thin';
    else if (targetPath.includes('light')) variant = 'light';
    else if (targetPath.includes('regular')) variant = 'regular';
    else if (targetPath.includes('solid')) variant = 'solid';

    for (const file of files) {
      const iconName = file.replace(".svg", "").toLowerCase();
      const filePath = path.join(dirPath, file);
      
      try {
        let svgContent = fs.readFileSync(filePath, "utf-8");
        // Limpiamos un poco el SVG si es necesario
        svgContent = svgContent.replace(/""/g, '"');
        
        if (!icons[iconName]) icons[iconName] = {};
        icons[iconName][variant] = svgContent;
      } catch (err) {
        console.warn(`Error leyendo icono ${file}:`, err);
      }
    }
  }

  iconCache = icons;
  iconsLoaded = true;
  console.log(`✅ iconLoader: ${Object.keys(icons).length} iconos cargados.`);
  return iconCache;
}

export async function getIcon(iconName, variant = config.defaultVariant) {
  if (!iconsLoaded) await loadIcons();
  return iconCache[iconName]?.[variant] || null;
}

export async function getFirstIconName() {
  if (!iconsLoaded) await loadIcons();
  const keys = Object.keys(iconCache);
  return keys.length ? keys[0] : null;
}

export async function getAllIcons() {
  if (!iconsLoaded) await loadIcons();
  return Object.keys(iconCache)
    .sort()
    .map(name => ({
      name,
      variants: Object.keys(iconCache[name]),
      tags: tagCache[name] || []
    }));
}

export { loadIcons };
