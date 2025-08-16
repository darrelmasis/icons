require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  iconsPath: process.env.ICONS_CSV_PATH || '/data/icons.csv',
  defaultFill: process.env.DEFAULT_FILL || '#000000',
  defaultVariant: process.env.DEFAULT_VARIANT || 'regular',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  defaultSize: parseInt(process.env.DEFAULT_ICON_SIZE, 10) || 128
};
