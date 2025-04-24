require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  iconsPath: process.env.ICONS_CSV_PATH,
  defaultFill: process.env.DEFAULT_FILL,
  defaultVariant: process.env.DEFAULT_VARIANT,
  corsOrigin: process.env.CORS_ORIGIN
};