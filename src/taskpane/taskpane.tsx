import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ChatWindow } from './components/ChatWindow';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PlatformDetector } from './utils/PlatformDetector';
import './taskpane.css';

/* global Office */

// 支持Word和WPS
// 添加全局错误处理（在捕获阶段，最早处理）
window.addEventListener('error', (event) => {
  // 过滤跨域脚本错误（Script error），这些错误通常来自外部脚本且无法获取详细信息
  if (event.message === 'Script error.' && !event.filename && event.lineno === 0) {
    // 这是跨域脚本错误，通常可以安全忽略
    // 阻止事件传播，避免被 Office.js 运行时记录为严重错误
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    console.warn('⚠️ 检测到跨域脚本错误（通常来自外部脚本，已阻止传播）');
    return false; // 返回 false 表示已处理，不需要默认行为
  }
  
  // 记录真实的错误
  console.error('❌ 全局错误捕获:', {
    message: event.message,
    error: event.error,
    filename: event.filename || '未知',
    lineno: event.lineno || '未知',
    colno: event.colno || '未知',
    stack: event.error?.stack || '无堆栈信息'
  });
}, true); // 使用捕获阶段，可以最早捕获错误

window.addEventListener('unhandledrejection', (event) => {
  // 检查是否是跨域相关的错误
  const reason = event.reason;
  if (reason && typeof reason === 'object' && reason.message === 'Script error.') {
    // 阻止跨域脚本错误的 Promise 拒绝传播
    event.preventDefault();
    console.warn('⚠️ 检测到跨域脚本错误的Promise拒绝（已阻止传播）');
    return;
  }
  
  console.error('❌ 未处理的Promise拒绝:', {
    reason: event.reason,
    promise: event.promise,
    stack: event.reason?.stack || '无堆栈信息'
  });
});

// 确保在 Office.js 加载完成后再初始化
Office.onReady((info) => {
  console.log('✅ Office.onReady 回调执行', info);
  
  // 添加小延迟，确保所有脚本完全加载
  setTimeout(() => {
    try {
      // 检测平台
      const platform = PlatformDetector.detect();
      console.log(`✅ 检测到平台: ${PlatformDetector.getPlatformName()}`);

      // Word环境：检查host类型
      // WPS环境：WPS可能也使用Office.js，但host可能不同
      const hostValue = info.host as any;
      const isSupportedHost = 
        info.host === Office.HostType.Word || 
        (typeof hostValue === 'string' && hostValue.toLowerCase() === 'word') ||
        platform === 'wps' ||
        PlatformDetector.isOfficeJSAvailable();

      if (isSupportedHost) {
        const container = document.getElementById('container');
        if (container) {
          try {
            console.log('🚀 开始渲染React组件...');
            const root = ReactDOM.createRoot(container);
            root.render(
              <ErrorBoundary>
                <ChatWindow />
              </ErrorBoundary>
            );
            console.log('✅ React组件渲染成功');
          } catch (error) {
            console.error('❌ 渲染React组件时出错:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : '';
            container.innerHTML = `
              <div style="padding: 20px; text-align: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <h3 style="color: #d32f2f;">初始化错误</h3>
                <p>插件初始化失败，请查看控制台获取详细信息。</p>
                <p style="color: #666; font-size: 12px;">错误: ${errorMessage}</p>
                ${errorStack ? `<pre style="text-align: left; font-size: 10px; color: #999; margin-top: 10px;">${errorStack}</pre>` : ''}
              </div>
            `;
          }
        } else {
          console.error('❌ 找不到容器元素 #container');
        }
      } else {
        console.warn('⚠️ 不支持的Office应用:', info.host);
        const container = document.getElementById('container');
        if (container) {
          container.innerHTML = `
            <div style="padding: 20px; text-align: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
              <h3 style="color: #d32f2f; margin-top: 0;">不支持的平台</h3>
              <p>此插件需要Microsoft Word或WPS Office环境。</p>
              <p style="color: #666;">当前检测到: ${info.host || '未知'}</p>
              <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 8px; text-align: left;">
                <p style="margin: 0 0 10px 0; font-weight: 600;">如何查看日志：</p>
                <ol style="margin: 0; padding-left: 20px; color: #666;">
                  <li>在Word/WPS中加载插件（不要直接在浏览器中打开）</li>
                  <li>按 <strong>F12</strong> 打开开发者工具</li>
                  <li>切换到 <strong>Console</strong> 标签页查看日志</li>
                </ol>
                <p style="margin-top: 15px; margin-bottom: 0; font-size: 12px; color: #999;">
                  💡 提示：此页面必须在Word/WPS环境中运行，浏览器中无法使用。
                </p>
              </div>
            </div>
          `;
        }
      }
    } catch (error) {
      console.error('❌ Office.onReady 回调中发生错误:', error);
      const container = document.getElementById('container');
      if (container) {
        container.innerHTML = `
          <div style="padding: 20px; text-align: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h3 style="color: #d32f2f;">初始化失败</h3>
            <p>插件初始化时发生错误，请查看控制台获取详细信息。</p>
            <p style="color: #666; font-size: 12px;">错误: ${error instanceof Error ? error.message : String(error)}</p>
          </div>
        `;
      }
    }
  }, 100); // 100ms延迟，确保所有脚本加载完成
});

