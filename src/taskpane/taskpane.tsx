import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ChatWindow } from './components/ChatWindow';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PlatformDetector } from './utils/PlatformDetector';
import './taskpane.css';

/* global Office */

// 支持Word和WPS
// 添加全局错误处理
window.addEventListener('error', (event) => {
  console.error('全局错误捕获:', event.error);
  console.error('错误文件:', event.filename);
  console.error('错误行号:', event.lineno);
  console.error('错误列号:', event.colno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason);
});

Office.onReady((info) => {
  console.log('Office.onReady 回调执行', info);
  // 检测平台
  const platform = PlatformDetector.detect();
  console.log(`检测到平台: ${PlatformDetector.getPlatformName()}`);

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
        const root = ReactDOM.createRoot(container);
        root.render(
          <ErrorBoundary>
            <ChatWindow />
          </ErrorBoundary>
        );
      } catch (error) {
        console.error('渲染React组件时出错:', error);
        container.innerHTML = `
          <div style="padding: 20px; text-align: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h3 style="color: #d32f2f;">初始化错误</h3>
            <p>插件初始化失败，请查看控制台获取详细信息。</p>
            <p style="color: #666; font-size: 12px;">错误: ${error instanceof Error ? error.message : String(error)}</p>
          </div>
        `;
      }
    } else {
      console.error('找不到容器元素');
    }
  } else {
    console.warn('不支持的Office应用:', info.host);
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
});

