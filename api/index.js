const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const config = require('../src/config');
const { servePng, serveSvg } = require('../src/serveIcon'); // tu función de servir iconos

const app = express();
app.use(cors({ origin: config.corsOrigin }));

const defaultSize = config.defaultSize;
const defaultVariant = config.defaultVariant;

// ---------------- PNG ----------------

// variante + icono + relleno + tamaño
app.get(['/png/var/:variant/:iconName/:fill/size/:size','/png/var/:variant/:iconName/:fill'], async (req, res) => {
  await servePng(req, res, req.params.iconName, req.params.variant, req.params.fill, req.params.size || defaultSize);
});

// variante + icono + tamaño
app.get(['/png/var/:variant/:iconName/size/:size','/png/var/:variant/:iconName'], async (req, res) => {
  await servePng(req, res, req.params.iconName, req.params.variant, null, req.params.size || defaultSize);
});

// icono + relleno + tamaño
app.get(['/png/:iconName/:fill/size/:size','/png/:iconName/:fill'], async (req, res) => {
  await servePng(req, res, req.params.iconName, defaultVariant, req.params.fill, req.params.size || defaultSize);
});

// icono + tamaño
app.get(['/png/:iconName/size/:size','/png/:iconName'], async (req, res) => {
  await servePng(req, res, req.params.iconName, defaultVariant, null, req.params.size || defaultSize);
});

// ---------------- SVG ----------------

// variante + icono + relleno
app.get('/svg/var/:variant/:iconName/:fill', async (req, res) => {
  await serveSvg(req, res, req.params.iconName, req.params.variant, req.params.fill);
});

// variante + icono
app.get('/svg/var/:variant/:iconName', async (req, res) => {
  await serveSvg(req, res, req.params.iconName, req.params.variant, null);
});

// icono + relleno
app.get('/svg/:iconName/:fill', async (req, res) => {
  await serveSvg(req, res, req.params.iconName, defaultVariant, req.params.fill);
});

// icono
app.get('/svg/:iconName', async (req, res) => {
  await serveSvg(req, res, req.params.iconName, defaultVariant, null);
});

module.exports = app;
module.exports.handler = serverless(app);
