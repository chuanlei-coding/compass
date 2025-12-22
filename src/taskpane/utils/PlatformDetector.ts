/* global Office */

/**
 * 平台检测工具
 * 用于检测当前运行环境是Microsoft Word还是WPS Office
 */
export class PlatformDetector {
  private static platform: 'word' | 'wps' | 'unknown' | null = null;

  /**
   * 检测当前平台
   */
  static detect(): 'word' | 'wps' | 'unknown' {
    if (this.platform !== null) {
      return this.platform;
    }

    try {
      // 方法1: 通过Office对象检测
      if (typeof Office !== 'undefined' && Office.context) {
        const host = Office.context.host;
        
        // WPS通常会在host字符串中包含相关信息
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('wps') || userAgent.includes('kingsoft')) {
          this.platform = 'wps';
          return this.platform;
        }

        // Microsoft Word - 检查HostType枚举
        // 使用类型断言来处理可能的类型差异
        const hostValue = host as any;
        if (host === Office.HostType.Word || 
            (typeof hostValue === 'string' && hostValue.toLowerCase() === 'word')) {
          this.platform = 'word';
          return this.platform;
        }
      }

      // 方法2: 通过window对象检测
      if (typeof window !== 'undefined') {
        // WPS可能会在window对象上添加特定属性
        if ((window as any).WPS || (window as any).Kingsoft) {
          this.platform = 'wps';
          return this.platform;
        }
      }

      // 方法3: 通过文档对象检测
      if (typeof document !== 'undefined') {
        const referrer = document.referrer.toLowerCase();
        if (referrer.includes('wps') || referrer.includes('kingsoft')) {
          this.platform = 'wps';
          return this.platform;
        }
      }

      // 默认假设是Word（因为Office.js主要是为Word设计的）
      this.platform = 'word';
      return this.platform;
    } catch (error) {
      console.warn('平台检测失败:', error);
      this.platform = 'unknown';
      return this.platform;
    }
  }

  /**
   * 检查是否为Word环境
   */
  static isWord(): boolean {
    return this.detect() === 'word';
  }

  /**
   * 检查是否为WPS环境
   */
  static isWPS(): boolean {
    return this.detect() === 'wps';
  }

  /**
   * 获取平台名称
   */
  static getPlatformName(): string {
    const platform = this.detect();
    switch (platform) {
      case 'word':
        return 'Microsoft Word';
      case 'wps':
        return 'WPS Office';
      default:
        return '未知平台';
    }
  }

  /**
   * 检查Office.js API是否可用
   */
  static isOfficeJSAvailable(): boolean {
    return typeof Office !== 'undefined' && typeof Word !== 'undefined';
  }

  /**
   * 检查WPS API是否可用（如果WPS有自己的API）
   */
  static isWPSAPIAvailable(): boolean {
    return typeof window !== 'undefined' && 
           ((window as any).WPS || (window as any).Kingsoft);
  }
}

