import express from "express";
import cors from "cors";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import { getIcon, getAllIcons, loadIcons } from "../src/iconLoader.js";
import config from "../src/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());

const colorMap = {
  navy: "#1e293b",
  slate: "#64748b",
  amber: "#f59e0b",
  white: "#ffffff",
  text: "#1e293b",
  muted: "#94a3b8",
};

const cssColors = new Set([
  "black", "white", "red", "blue", "green", "yellow", "gray", "silver", "gold", "orange", "purple", "pink"
  // simplified for brevity, the original had many more
]);

function resolveColor(fill) {
  if (!fill) return null;
  const baseColor = fill.split("-")[0];
  const color = colorMap[baseColor] || baseColor;
  if (cssColors.has(color.toLowerCase())) return color;
  if (/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) return `#${color}`;
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) return color;
  return null;
}

const serveSvg = async (req, res, iconName, variant, fill) => {
  try {
    const iconSvg = await getIcon(iconName, variant);
    if (!iconSvg) return res.status(404).send(`Icono "${iconName}" no encontrado`);
    
    // Default color to navy (#1e293b) if no fill is specified, but only for classic variants
    let color = fill ? resolveColor(fill) : null;
    const multiColorVariants = ['world', 'local', 'color', 'flat'];
    if (!color && !multiColorVariants.includes(variant)) {
      color = "#1e293b";
    }

    let svg = iconSvg;
    if (color) {
      // 1. Inyectamos el color base en el tag <svg>
      svg = svg.replace('<svg ', `<svg fill="${color}" color="${color}" `);
      
      // 2. Removemos bloques <style> internos que bloquean la herencia
      svg = svg.replace(/<style[\s\S]*?<\/style>/gi, '');
      
      // 3. Reemplazamos fills y strokes hardcodeados o currentColor
      svg = svg.replace(/fill="(?!none)[^"]*"/gi, `fill="${color}"`)
               .replace(/stroke="(?!none)[^"]*"/gi, `stroke="${color}"`);
      
      // 4. Forzamos en estilos inline
      svg = svg.replace(/style="[^"]*"/gi, (match) => {
        return match.replace(/fill:[^;"]*/gi, `fill:${color}`).replace(/stroke:[^;"]*/gi, `stroke:${color}`);
      });
    }

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=60"); // Reducido a 1 min para desarrollo
    res.send(svg);
  } catch (err) {
    res.status(500).send("Error al procesar SVG");
  }
};

const servePng = async (req, res, iconName, variant, fill, size = config.defaultSize) => {
  try {
    const iconSvg = await getIcon(iconName, variant);
    if (!iconSvg) return res.status(404).send(`Icono "${iconName}" no encontrado`);

    let color = fill ? resolveColor(fill) : null;
    const multiColorVariants = ['world', 'local', 'color', 'flat'];
    if (!color && !multiColorVariants.includes(variant)) {
      color = "#1e293b";
    }

    let svg = iconSvg;
    if (color) {
      svg = svg.replace('<svg ', `<svg fill="${color}" color="${color}" `);
      svg = svg.replace(/<style[\s\S]*?<\/style>/gi, '');
      svg = svg.replace(/fill="(?!none)[^"]*"/gi, `fill="${color}"`)
               .replace(/stroke="(?!none)[^"]*"/gi, `stroke="${color}"`);
      svg = svg.replace(/style="[^"]*"/gi, (match) => {
        return match.replace(/fill:[^;"]*/gi, `fill:${color}`).replace(/stroke:[^;"]*/gi, `stroke:${color}`);
      });
    }

    let finalSize = parseInt(size, 10);
    if (isNaN(finalSize) || finalSize <= 0 || finalSize > 1024) finalSize = config.defaultSize;

    const png = await sharp(Buffer.from(svg))
      .resize(finalSize, finalSize, { fit: "inside" })
      .png()
      .toBuffer();

    res.setHeader("Content-Type", "image/png");
    res.send(png);
  } catch (err) {
    res.status(500).send("Error al convertir a PNG");
  }
};

// API Routes
app.get("/api/icons", async (req, res) => {
  const icons = await getAllIcons();
  res.json(icons);
});

app.get("/api/icons/refresh", async (req, res) => {
  try {
    await loadIcons();
    res.json({ success: true, message: "Iconos recargados correctamente" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SVG Routes
app.get("/api/svg/var/:variant/:iconName/:fill", (req, res) => {
  serveSvg(req, res, req.params.iconName, req.params.variant, req.params.fill);
});

app.get("/api/svg/var/:variant/:iconName", (req, res) => {
  serveSvg(req, res, req.params.iconName, req.params.variant, null);
});

app.get("/api/svg/:iconName/:fill", (req, res) => {
  serveSvg(req, res, req.params.iconName, config.defaultVariant, req.params.fill);
});

app.get("/api/svg/:iconName", (req, res) => {
  serveSvg(req, res, req.params.iconName, config.defaultVariant, null);
});

// PNG Routes
app.get("/api/png/var/:variant/:iconName/:fill", (req, res) => {
  servePng(req, res, req.params.iconName, req.params.variant, req.params.fill, req.query.size);
});

app.get("/api/png/var/:variant/:iconName", (req, res) => {
  servePng(req, res, req.params.iconName, req.params.variant, null, req.query.size);
});

app.get("/api/png/:iconName/:fill", (req, res) => {
  servePng(req, res, req.params.iconName, config.defaultVariant, req.params.fill, req.query.size);
});

app.get("/api/png/:iconName", (req, res) => {
  servePng(req, res, req.params.iconName, config.defaultVariant, null, req.query.size);
});

// For local development
if (process.env.NODE_ENV !== "production") {
  loadIcons().then(() => {
    app.listen(config.port, () => {
      console.log(`🚀 API lista en http://localhost:${config.port}`);
    });
  });
}

// Export for Vercel Serverless
export default app;
