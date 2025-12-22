import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ChatWindow } from './components/ChatWindow';
import { PlatformDetector } from './utils/PlatformDetector';
import './taskpane.css';

/* global Office */

// 支持Word和WPS
Office.onReady((info) => {
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
      const root = ReactDOM.createRoot(container);
      root.render(<ChatWindow />);
    } else {
      console.error('找不到容器元素');
    }
  } else {
    console.warn('不支持的Office应用:', info.host);
    const container = document.getElementById('container');
    if (container) {
      container.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h3>不支持的平台</h3>
          <p>此插件需要Microsoft Word或WPS Office环境。</p>
          <p>当前检测到: ${info.host || '未知'}</p>
        </div>
      `;
    }
  }
});

