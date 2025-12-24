const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');

// 尝试加载开发证书
let httpsOptions = null;
try {
  const certPath = path.join(process.env.HOME || process.env.USERPROFILE, '.office-addin-dev-certs', 'localhost.crt');
  const keyPath = path.join(process.env.HOME || process.env.USERPROFILE, '.office-addin-dev-certs', 'localhost.key');
  
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    httpsOptions = {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    };
  }
} catch (error) {
  console.warn('无法加载开发证书，将使用HTTP（Office插件需要HTTPS）:', error.message);
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
    https: httpsOptions || true, // 使用HTTPS（Office插件要求）
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    // 代理后端API请求，解决混合内容问题（HTTPS前端访问HTTP后端）
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false, // 允许代理到HTTP后端
        logLevel: 'debug',
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

