require("dotenv").config();

const DEFAULT_PORT = 3000;
const DEFAULT_ICONS_PATH = "./src/icons.csv";
const DEFAULT_VARIANT = "regular";
const DEFAULT_SIZE = 64;

module.exports = {
  port: process.env.PORT || DEFAULT_PORT,
  iconsPath: process.env.ICONS_CSV_PATH || DEFAULT_ICONS_PATH,
  defaultFill: process.env.DEFAULT_FILL || null,
  defaultVariant: process.env.DEFAULT_VARIANT || DEFAULT_VARIANT,
  corsOrigin: process.env.CORS_ORIGIN || "*",
  defaultSize: Number.isFinite(parseInt(process.env.DEFAULT_ICON_SIZE, 10))
    ? parseInt(process.env.DEFAULT_ICON_SIZE, 10)
    : DEFAULT_SIZE,
  defaultIconName: process.env.DEFAULT_ICON_NAME || "xmark", // Cambia aquí el nombre si quieres otro
};
