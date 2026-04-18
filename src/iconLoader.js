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

const CACHE_FILE = path.resolve(__dirname, "..", config.iconsDir, "cache.json");
const CSV_FILE = path.join(__dirname, "Icons-html-content.csv");

function getVariantFromPath(rootDir, filePath) {
  const relative = path.relative(rootDir, filePath);
  if (relative.includes("flat")) return "flat";
  if (relative.includes("color")) return "color";
  if (relative.includes('thin')) return 'thin';
  if (relative.includes('light')) return 'light';
  if (relative.includes('regular')) return 'regular';
  if (relative.includes('solid')) return 'solid';
  return "regular";
}

function loadPersistentCache() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      iconCache = data.icons || {};
      mtimeCache = data.mtimes || {};
      console.log(`📦 iconLoader: Cargados ${Object.keys(iconCache).length} iconos desde el caché persistente.`);
      return true;
    } catch (err) {
      console.warn("iconLoader: Error leyendo cache.json:", err);
    }
  }
  return false;
}

function savePersistentCache() {
  const TMP_FILE = CACHE_FILE + ".tmp";
  try {
    const data = {
      mtimes: mtimeCache,
      icons: iconCache
    };
    // Escritura atómica: escribir en temporal y luego renombrar
    fs.writeFileSync(TMP_FILE, JSON.stringify(data), "utf-8");
    fs.renameSync(TMP_FILE, CACHE_FILE);
    console.log("💾 iconLoader: Caché persistente guardado de forma atómica.");
  } catch (err) {
    if (fs.existsSync(TMP_FILE)) fs.unlinkSync(TMP_FILE);
    console.warn("iconLoader: Error guardando cache.json:", err);
  }
}

function exportIconsToCsv(icons) {
  try {
    const allVariants = ["thin", "light", "regular", "solid", "flat", "color"];
    const header = ["Nombre", ...allVariants].join(",");
    
    const rows = Object.keys(icons).sort().map(name => {
      const iconVariants = icons[name];
      const rowData = [name];
      
      allVariants.forEach(v => {
        let content = iconVariants[v] || "";
        if (content) {
          // Formatear para CSV: escapar comillas y envolver en comillas dobles
          // Además, para Power BI (HTML Viewer), a veces necesitan un prefijo o estilo
          const escapedContent = content.replace(/"/g, '""');
          rowData.push(`"${escapedContent}"`);
        } else {
          rowData.push("");
        }
      });
      
      return rowData.join(",");
    });
    
    fs.writeFileSync(CSV_FILE, header + "\n" + rows.join("\n"), "utf-8");
    console.log(`📊 iconLoader: Librería CSV exportada correctamente (${rows.length} iconos).`);
  } catch (err) {
    console.warn("iconLoader: Error exportando a CSV:", err);
  }
}

async function loadIcons() {
  const startTime = Date.now();
  const rootDir = path.resolve(__dirname, "..", config.iconsDir);
  
  if (!iconsLoaded) {
    loadPersistentCache();
  }

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

  let updatedCount = 0;
  let newCount = 0;
  let cachedCount = 0;
  let hasChanges = false;
  
  const currentFiles = new Set();

  for (const targetPath of config.targetPaths) {
    const dirPath = path.join(rootDir, targetPath);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".svg"));
    const variant = getVariantFromPath(rootDir, dirPath);

    for (const file of files) {
      const iconName = file.replace(".svg", "").toLowerCase();
      const filePath = path.join(dirPath, file);
      currentFiles.add(filePath);
      
      const stats = fs.statSync(filePath);
      const mtime = stats.mtimeMs;

      // Si ya está en caché y no ha cambiado, saltamos
      if (mtimeCache[filePath] === mtime && iconCache[iconName]?.[variant]) {
        cachedCount++;
        continue;
      }

      try {
        let svgContent = fs.readFileSync(filePath, "utf-8");
        svgContent = svgContent.replace(/""/g, '"');
        
        if (!iconCache[iconName]) iconCache[iconName] = {};
        
        if (mtimeCache[filePath]) {
          updatedCount++;
        } else {
          newCount++;
        }

        iconCache[iconName][variant] = svgContent;
        mtimeCache[filePath] = mtime;
        hasChanges = true;
      } catch (err) {
        console.warn(`Error leyendo icono ${file}:`, err);
      }
    }
  }

  // Detectar archivos borrados
  for (const filePath in mtimeCache) {
    if (!currentFiles.has(filePath)) {
      delete mtimeCache[filePath];
      hasChanges = true;
    }
  }
  
  // Limpiar variantes huérfanas en iconCache y regenerar si hay cambios
  if (hasChanges) {
    const newIconCache = {};
    for (const filePath in mtimeCache) {
      const iconName = path.basename(filePath, ".svg").toLowerCase();
      const variant = getVariantFromPath(rootDir, filePath);

      if (!newIconCache[iconName]) newIconCache[iconName] = {};
      newIconCache[iconName][variant] = iconCache[iconName][variant];
    }
    iconCache = newIconCache;
    
    savePersistentCache();
    exportIconsToCsv(iconCache);
  }

  iconsLoaded = true;
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ iconLoader finalizado en ${duration}s:`);
  console.log(`   - ${cachedCount} desde caché`);
  console.log(`   - ${newCount} nuevos`);
  console.log(`   - ${updatedCount} actualizados`);
  console.log(`   - Total: ${Object.keys(iconCache).length} iconos independientes.`);
  
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
