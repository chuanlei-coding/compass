#!/usr/bin/env node

/**
 * 开发服务器启动脚本
 * 自动检查并生成开发证书，然后启动webpack-dev-server
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const certDir = path.join(os.homedir(), '.office-addin-dev-certs');
const certPath = path.join(certDir, 'localhost.crt');
const keyPath = path.join(certDir, 'localhost.key');

console.log('🚀 启动Word AI助手开发服务器...\n');

// 检查证书是否存在
if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.log('📜 未找到开发证书，正在生成...');
  try {
    execSync('npx office-addin-dev-certs install --machine', {
      stdio: 'inherit',
      cwd: __dirname,
    });
    console.log('✅ 证书生成成功！\n');
  } catch (error) {
    console.warn('⚠️  证书生成失败，将使用webpack-dev-server的自签名证书');
    console.warn('   如果遇到证书问题，请手动运行: npx office-addin-dev-certs install --machine\n');
  }
} else {
  console.log('✅ 开发证书已存在\n');
}

// 启动webpack-dev-server
console.log('🌐 启动开发服务器...');
console.log('   服务器地址: https://localhost:3000');
console.log('   按 Ctrl+C 停止服务器\n');

try {
  execSync('npx webpack serve --mode development', {
    stdio: 'inherit',
    cwd: __dirname,
  });
} catch (error) {
  if (error.status !== null) {
    process.exit(error.status);
  } else {
    console.error('❌ 启动失败:', error.message);
    process.exit(1);
  }
}

