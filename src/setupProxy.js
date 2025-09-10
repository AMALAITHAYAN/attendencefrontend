// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
  app.use(
    '/student',
    createProxyMiddleware({
      target: 'https://4a94b6e818b2.ngrok-free.app/',
      changeOrigin: true,
    })
  );
};
