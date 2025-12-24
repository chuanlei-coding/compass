const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');

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

