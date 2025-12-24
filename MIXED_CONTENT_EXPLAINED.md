# 混合内容问题（Mixed Content）详解

## 为什么使用 Webpack Proxy 而不是直接调用 8000 端口？

### 问题背景

当前架构：
- **前端服务**: `https://localhost:3000` (HTTPS)
- **后端服务**: `http://localhost:8000` (HTTP)

### 混合内容（Mixed Content）问题

**浏览器的安全策略：**

当 HTTPS 页面尝试加载 HTTP 资源时，浏览器会**阻止**这些请求，这被称为"混合内容"（Mixed Content）问题。

```
HTTPS 页面 (https://localhost:3000)
    ↓ 尝试访问
HTTP 后端 (http://localhost:8000)
    ↓ 浏览器阻止
❌ Mixed Content Error
```

### 为什么前端必须是 HTTPS？

**Office Add-ins 的要求：**

1. **Microsoft Office 要求**：Office Add-ins 必须通过 HTTPS 提供服务
2. **安全策略**：Office.js API 需要安全上下文（Secure Context）
3. **生产环境**：生产环境必须使用 HTTPS

### 解决方案对比

#### 方案 1：Webpack Proxy（当前方案）

**工作原理：**
```
浏览器 (HTTPS)
    ↓ fetch('/api/process')
Webpack Dev Server (HTTPS, localhost:3000)
    ↓ 代理转发
后端服务 (HTTP, localhost:8000)
```

**优点：**
- ✅ 解决混合内容问题
- ✅ 前端和后端看起来同源（都是 localhost:3000）
- ✅ 开发环境简单配置
- ✅ 不需要修改后端

**缺点：**
- ❌ 增加了一层代理，可能有性能开销
- ❌ 需要 webpack dev server 运行
- ❌ 代理可能超时（已配置 120 秒超时）

#### 方案 2：直接调用 HTTP 后端（需要修改）

**如果前端是 HTTP：**
```
浏览器 (HTTP)
    ↓ fetch('http://localhost:8000/api/process')
后端服务 (HTTP, localhost:8000)
    ✅ 可以正常工作
```

**如果前端是 HTTPS：**
```
浏览器 (HTTPS)
    ↓ fetch('http://localhost:8000/api/process')
    ❌ 浏览器阻止（Mixed Content）
```

#### 方案 3：后端也使用 HTTPS

**需要配置：**
- 后端服务器配置 SSL 证书
- 使用 HTTPS 协议

**优点：**
- ✅ 完全解决混合内容问题
- ✅ 可以直接调用
- ✅ 生产环境标准做法

**缺点：**
- ❌ 开发环境配置复杂
- ❌ 需要管理证书

### 当前代码逻辑

查看 `src/taskpane/services/AIService.ts` 的 `getBackendUrl()` 方法：

```typescript
private static getBackendUrl(): string {
  // 如果前端在 HTTPS 上运行（开发环境）
  if (currentProtocol === 'https:' && currentHost.includes('localhost:3000')) {
    // 使用相对路径，通过 webpack proxy 访问后端
    return ''; // 空字符串 = 使用相对路径 = webpack proxy
  }
  
  // 如果前端是 HTTP 或不在开发环境
  return 'http://localhost:8000'; // 直接调用
}
```

### 如何改为直接调用？

如果你想直接调用 8000 端口，有以下选项：

#### 选项 1：修改代码强制直接调用

修改 `getBackendUrl()` 方法，始终返回 `http://localhost:8000`：

```typescript
private static getBackendUrl(): string {
  // 强制直接调用后端（忽略混合内容问题）
  return 'http://localhost:8000';
}
```

**注意：** 如果前端是 HTTPS，浏览器会阻止请求。

#### 选项 2：前端改为 HTTP（不推荐）

修改 `webpack.config.js`，将前端改为 HTTP：

```javascript
server: 'http', // 改为 HTTP
```

**问题：**
- ❌ Office Add-ins 要求 HTTPS
- ❌ 可能无法正常工作

#### 选项 3：后端改为 HTTPS（推荐用于生产）

配置后端使用 HTTPS，然后直接调用：

```typescript
private static getBackendUrl(): string {
  return 'https://localhost:8000'; // 后端也使用 HTTPS
}
```

### 推荐方案

**开发环境：**
- 使用 Webpack Proxy（当前方案）
- 简单、快速、不需要额外配置

**生产环境：**
- 后端使用 HTTPS
- 前端直接调用后端 HTTPS 地址
- 不需要代理

### 总结

使用 Webpack Proxy 的原因：
1. ✅ 解决混合内容问题（HTTPS → HTTP）
2. ✅ 符合 Office Add-ins 的 HTTPS 要求
3. ✅ 开发环境简单配置
4. ✅ 不需要修改后端

如果遇到 504 超时问题，可以：
- 增加 proxy 超时时间（已设置为 120 秒）
- 检查后端服务响应时间
- 考虑在生产环境使用 HTTPS 后端

