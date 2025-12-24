const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');
const http = require('http');

// 尝试加载开发证书
let httpsOptions = null;
try {
  const certPath = path.join(process.env.HOME || process.env.USERPROFILE, '.office-addin-dev-certs', 'localhost.crt');
  const keyPath = path.join(process.env.HOME || process.env.USERPROFILE, '.office-addin-dev-certs', 'localhost.key');
  
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    // 检查文件是否可读
    try {
      fs.accessSync(certPath, fs.constants.R_OK);
      fs.accessSync(keyPath, fs.constants.R_OK);
      
      httpsOptions = {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
      };
      console.log('✅ 成功加载开发证书');
    } catch (accessError) {
      console.warn('⚠️  证书文件存在但无法读取，将使用自签名证书:', accessError.message);
      console.warn('   提示: 请检查证书文件权限或重新生成证书');
    }
  } else {
    console.warn('⚠️  未找到开发证书，将使用webpack-dev-server的自签名证书');
    console.warn('   提示: 运行 "npm run setup-certs" 生成开发证书');
  }
} catch (error) {
  console.warn('⚠️  无法加载开发证书，将使用自签名证书:', error.message);
}

module.exports = {
  entry: {
    taskpane: './src/taskpane/taskpane.tsx',
    commands: './src/commands/commands.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/taskpane/taskpane.html',
      filename: 'taskpane.html',
      chunks: ['taskpane'],
    }),
    new HtmlWebpackPlugin({
      template: './src/commands/commands.html',
      filename: 'commands.html',
      chunks: ['commands'],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 3000,
    hot: true,
    // 使用新的 server 选项（webpack-dev-server 4.x）
    server: httpsOptions ? {
      type: 'https',
      options: httpsOptions,
    } : 'https', // 如果证书不可用，使用自签名证书
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    // 代理后端API请求，解决混合内容问题（HTTPS前端访问HTTP后端）
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // 使用 IPv4 localhost 避免 IPv6 连接问题
        changeOrigin: true,
        secure: false, // 允许代理到HTTP后端
        logLevel: 'debug',
        // http-proxy-middleware 的超时配置（单位：毫秒）
        // 注意：http-proxy-middleware 默认超时是 30 秒
        // 需要创建自定义 agent 并设置 socket 超时
        agent: new http.Agent({
          keepAlive: true,
          keepAliveMsecs: 1000,
          // Agent 本身不直接支持 timeout，需要在 socket 上设置
        }),
        // http-proxy 的超时选项
        timeout: 300000, // 300秒（5分钟）- 请求超时
        proxyTimeout: 300000, // 300秒（5分钟）- 代理超时
        // 这些选项会传递给 http-proxy，但可能还需要在 onProxyReq 中显式设置 socket 超时
        onError: (err, req, res) => {
          const timestamp = new Date().toISOString();
          console.error(`[${timestamp}] [Proxy Error] ${err.message || err}`);
          if (res && !res.headersSent) {
            res.writeHead(500, {
              'Content-Type': 'text/plain',
            });
            res.end(`Proxy error: ${err.message || 'Unknown error'}`);
          }
        },
        onProxyReq: (proxyReq, req, res) => {
          const timestamp = new Date().toISOString();
          console.log(`[${timestamp}] [Proxy] ${req.method} ${req.url} -> http://127.0.0.1:8000${req.url}`);
          // 关键：显式设置 socket 超时，这是确保超时配置生效的关键
          // http-proxy 的 timeout 选项可能不会自动应用到 socket
          try {
            // 设置请求超时
            if (typeof proxyReq.setTimeout === 'function') {
              proxyReq.setTimeout(300000, () => {
                console.warn(`[${new Date().toISOString()}] [Proxy] Request timeout after 300s`);
              });
            }
            // 设置 socket 超时（这是最重要的）
            if (proxyReq.socket && typeof proxyReq.socket.setTimeout === 'function') {
              proxyReq.socket.setTimeout(300000, () => {
                console.warn(`[${new Date().toISOString()}] [Proxy] Socket timeout after 300s`);
                if (!proxyReq.destroyed) {
                  proxyReq.destroy();
                }
              });
            }
            // 如果 socket 还没有创建，监听 'socket' 事件
            proxyReq.on('socket', (socket) => {
              if (socket && typeof socket.setTimeout === 'function') {
                socket.setTimeout(300000, () => {
                  console.warn(`[${new Date().toISOString()}] [Proxy] Socket timeout after 300s (from socket event)`);
                  if (!proxyReq.destroyed) {
                    proxyReq.destroy();
                  }
                });
              }
            });
          } catch (error) {
            console.error(`[${timestamp}] [Proxy] Error setting timeout:`, error);
          }
        },
        onProxyRes: (proxyRes, req, res) => {
          const timestamp = new Date().toISOString();
          console.log(`[${timestamp}] [Proxy] Response ${proxyRes.statusCode} for ${req.url}`);
        },
      },
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
};

