#!/usr/bin/env node

/**
 * 快速检查构建配置
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 检查项目配置...\n');

// 检查关键文件
const filesToCheck = [
  'package.json',
  'webpack.config.js',
  'tsconfig.json',
  'manifest.xml',
  'src/taskpane/taskpane.tsx',
  'src/taskpane/taskpane.html',
];

let allOk = true;
filesToCheck.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allOk = false;
});

// 检查node_modules
const nodeModulesExists = fs.existsSync(path.join(__dirname, 'node_modules'));
console.log(`\n${nodeModulesExists ? '✅' : '❌'} node_modules/`);

if (!nodeModulesExists) {
  console.log('\n⚠️  请先运行: npm install');
  allOk = false;
}

// 检查webpack
const webpackPath = path.join(__dirname, 'node_modules', '.bin', 'webpack');
const webpackExists = fs.existsSync(webpackPath);
console.log(`${webpackExists ? '✅' : '❌'} webpack`);

if (allOk && webpackExists) {
  console.log('\n✅ 配置检查通过！可以启动开发服务器。');
  console.log('\n启动命令:');
  console.log('  npm run dev');
  console.log('  或');
  console.log('  npm run dev:simple');
} else {
  console.log('\n❌ 配置检查未通过，请修复上述问题。');
}

