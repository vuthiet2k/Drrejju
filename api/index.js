/**
 * api/index.js — Vercel serverless entry point.
 * Dùng lại nguyên request handler của dev-server.js (routing, LiquidJS render,
 * asset compiler...) — không viết lại logic riêng cho Vercel.
 */
module.exports = require('../dev-server.js');
