const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
  // 注意：devServer 配置已移除
  // 现在前后端已合并，使用 Python 服务 (start-server.py) 同时提供前端静态文件和后端API
  // webpack 仅用于构建前端代码，不再需要开发服务器
};

