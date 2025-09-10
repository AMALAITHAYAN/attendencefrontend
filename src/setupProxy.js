// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
  app.use(
    '/student',
    createProxyMiddleware({
      target: 'http://172.20.102.202:8081/',
      changeOrigin: true,
    })
  );
};
