const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000', // 后端服务器地址
      changeOrigin: true,
      secure: false,
      logLevel: 'debug', // 添加调试日志
      pathRewrite: {
        '^/api': '/api'
      },
      onProxyReq: (proxyReq, req) => {
        // 保留原始 Authorization 头
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
        }
        // 打印代理请求信息
        console.log('代理请求:', {
          method: req.method,
          path: req.path,
          headers: req.headers
        });
      },
      onProxyRes: (proxyRes, req) => {
        // 打印代理响应信息
        console.log('代理响应:', {
          status: proxyRes.statusCode,
          headers: proxyRes.headers,
          path: req.path
        });
      },
      onError: (err, req, res) => {
        console.error('代理错误:', err);
        res.status(500).json({
          status: 'error',
          message: '服务器连接失败',
          error: err.message
        });
      }
    })
  );
};