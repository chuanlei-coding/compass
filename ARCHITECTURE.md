# 系统架构文档

## 项目概述

Word/WPS AI助手是一个基于Office.js的插件，通过AI能力帮助用户编辑和管理Word/WPS文档。系统采用React + TypeScript构建，支持Microsoft Word和WPS Office。

## 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Word/WPS Office 环境                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Office.js Runtime                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │          插件侧边栏 (TaskPane)                  │  │  │
│  │  │  ┌──────────────────────────────────────────┐  │  │  │
│  │  │  │      React应用 (ChatWindow)               │  │  │  │
│  │  │  │  ┌──────────────┐  ┌──────────────────┐ │  │  │  │
│  │  │  │  │  UI组件层    │  │   服务层         │ │  │  │  │
│  │  │  │  │  - ChatWindow│  │  - AIService     │ │  │  │  │
│  │  │  │  │  - Settings  │  │  - WordEditor    │ │  │  │  │
│  │  │  │  │  - ErrorBound│  │  - PlatformDetect│ │  │  │  │
│  │  │  │  └──────────────┘  └──────────────────┘ │  │  │  │
│  │  │  └──────────────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              开发服务器 (Webpack Dev Server)                 │
│              https://localhost:3000                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API调用
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI服务 (外部API)                          │
│         OpenAI / 自定义AI服务                                │
└─────────────────────────────────────────────────────────────┘
```

## 技术栈

### 前端框架
- **React 18.2** - UI框架
- **TypeScript 5.1** - 类型安全
- **Office.js 1.1.85** - Office插件API

### 构建工具
- **Webpack 5.88** - 模块打包
- **Webpack Dev Server 4.15** - 开发服务器
- **TypeScript Compiler** - 类型检查和编译

### 样式
- **CSS Modules** - 样式管理
- **现代CSS** - Flexbox、Grid等

### 开发工具
- **ESLint** - 代码检查
- **office-addin-dev-certs** - HTTPS证书管理
- **office-addin-manifest** - 清单验证

## 项目结构

```
compass/
├── manifest.xml                 # Office插件清单（定义插件元数据和配置）
├── package.json                 # 项目依赖和脚本
├── tsconfig.json                # TypeScript配置
├── webpack.config.js             # Webpack构建配置
├── start-dev.js                  # 开发服务器启动脚本
│
├── src/                          # 源代码目录
│   ├── taskpane/                # 侧边栏主应用
│   │   ├── taskpane.html         # HTML入口文件
│   │   ├── taskpane.tsx         # React应用入口
│   │   ├── taskpane.css         # 全局样式
│   │   │
│   │   ├── components/          # React组件
│   │   │   ├── ChatWindow.tsx   # 对话窗口主组件
│   │   │   ├── SettingsPanel.tsx # 设置面板组件
│   │   │   └── ErrorBoundary.tsx # 错误边界组件
│   │   │
│   │   ├── services/            # 业务服务层
│   │   │   ├── AIService.ts     # AI服务集成
│   │   │   └── WordEditor.ts    # Word文档编辑服务
│   │   │
│   │   └── utils/               # 工具函数
│   │       └── PlatformDetector.ts # 平台检测工具
│   │
│   ├── commands/                # 命令处理（功能区按钮）
│   │   ├── commands.html
│   │   └── commands.ts
│   │
│   └── types/                   # TypeScript类型定义
│       └── office.d.ts          # Office.js类型扩展
│
├── dist/                        # 构建输出目录
├── assets/                      # 静态资源（图标等）
│
└── docs/                        # 文档目录
    ├── README.md
    ├── QUICKSTART.md
    ├── ARCHITECTURE.md (本文档)
    └── ...
```

## 核心模块

### 1. 入口层 (taskpane.tsx)

**职责：**
- 初始化Office.js环境
- 平台检测和验证
- React应用挂载
- 全局错误处理

**关键代码：**
```typescript
Office.onReady((info) => {
  // 平台检测
  // React应用渲染
  // 错误边界包装
});
```

### 2. UI组件层

#### ChatWindow.tsx
**职责：**
- 对话界面渲染
- 消息管理（发送/接收）
- 用户输入处理
- 加载状态管理
- 调用服务层API

**状态管理：**
- `messages` - 消息列表
- `inputValue` - 输入框内容
- `isLoading` - 加载状态
- `error` - 错误信息
- `showSettings` - 设置面板显示状态

#### SettingsPanel.tsx
**职责：**
- AI服务配置界面
- API密钥管理
- API URL配置
- 模型名称配置
- 配置持久化（localStorage）

#### ErrorBoundary.tsx
**职责：**
- 捕获React组件错误
- 显示友好错误界面
- 提供错误恢复机制

### 3. 服务层

#### AIService.ts
**职责：**
- AI API调用管理
- 请求构建和发送
- 响应解析
- 模拟响应（降级方案）
- 配置管理（API密钥、URL、模型）

**主要方法：**
- `processRequest()` - 处理用户请求
- `callAI()` - 调用AI API
- `parseAIResponse()` - 解析AI响应
- `getMockResponse()` - 获取模拟响应
- `setApiKey()` / `setApiUrl()` / `setModelName()` - 配置管理

**数据流：**
```
用户输入 → processRequest() → buildPrompt() → callAI() → parseAIResponse() → 返回EditOperation[]
```

#### WordEditor.ts
**职责：**
- Word文档内容读取
- 文档编辑操作执行
- Office.js API封装
- 编辑操作类型管理

**主要方法：**
- `getDocumentContent()` - 获取文档内容
- `applyEdits()` - 应用编辑操作
- `appendText()` - 添加文本
- `replaceText()` - 替换文本
- `formatText()` - 格式化文本

**支持的编辑操作：**
- `insert` - 插入文本
- `replace` - 替换文本
- `format` - 格式化文本（加粗、斜体、颜色等）
- `delete` - 删除文本
- `addParagraph` - 添加段落

### 4. 工具层

#### PlatformDetector.ts
**职责：**
- 检测运行平台（Word/WPS）
- 平台信息获取
- API可用性检查

**检测方法：**
- User Agent检测
- Window对象检测
- Document referrer检测
- Office.js host类型检测

## 数据流

### 用户请求处理流程

```
1. 用户在ChatWindow中输入消息
   ↓
2. handleSend() 被调用
   ↓
3. WordEditor.getDocumentContent() 获取文档内容
   ↓
4. AIService.processRequest() 处理请求
   ↓
5. AIService.buildPrompt() 构建提示词
   ↓
6. AIService.callAI() 调用AI API
   ↓
7. AIService.parseAIResponse() 解析响应
   ↓
8. 返回 EditOperation[] 编辑操作数组
   ↓
9. WordEditor.applyEdits() 执行编辑操作
   ↓
10. 更新UI显示结果
```

### 配置管理流程

```
1. 用户在SettingsPanel中配置
   ↓
2. 保存到localStorage
   ↓
3. AIService.setApiKey/Url/Model() 更新配置
   ↓
4. ChatWindow初始化时从localStorage加载
   ↓
5. 应用到后续的API调用
```

## 模块依赖关系

```
taskpane.tsx (入口)
    ├── ErrorBoundary (错误处理)
    │   └── ChatWindow (主界面)
    │       ├── SettingsPanel (设置)
    │       ├── PlatformDetector (平台检测)
    │       ├── AIService (AI服务)
    │       └── WordEditor (文档编辑)
    │
    └── PlatformDetector (平台检测)
```

## 关键技术决策

### 1. 错误处理策略

**多层错误处理：**
- React错误边界（组件级）
- 全局错误监听（window.onerror）
- Promise拒绝捕获（unhandledrejection）
- 服务层try-catch（操作级）

### 2. 平台兼容性

**策略：**
- 使用Office.js标准API（兼容Word和WPS）
- 平台检测自动适配
- 降级处理（API不可用时）

### 3. AI服务集成

**设计：**
- 可配置的API端点
- 支持OpenAI兼容格式
- 模拟响应降级方案
- 详细的日志记录

### 4. 状态管理

**方案：**
- React Hooks (useState, useEffect)
- localStorage持久化
- 服务层单例模式

## 构建和部署

### 开发环境

```
npm run dev
  ↓
start-dev.js (检查证书)
  ↓
webpack-dev-server (启动开发服务器)
  ↓
https://localhost:3000
```

### 生产构建

```
npm run build
  ↓
webpack --mode production
  ↓
dist/ (输出目录)
  ├── taskpane.html
  ├── taskpane.js
  └── commands.js
```

### 部署流程

1. **构建**
   ```bash
   npm run build
   ```

2. **验证清单**
   ```bash
   npm run validate
   ```

3. **部署到服务器**
   - 将dist目录部署到HTTPS服务器
   - 更新manifest.xml中的URL

4. **加载到Word/WPS**
   - 通过侧载或上传方式加载

## 安全考虑

### 1. HTTPS要求
- Office插件必须使用HTTPS
- 开发环境使用自签名证书
- 生产环境需要有效证书

### 2. API密钥安全
- 存储在localStorage（客户端）
- 不提交到版本控制
- 通过设置面板配置

### 3. 内容安全策略
- 限制外部资源加载
- 验证API响应格式
- 防止XSS攻击

## 扩展性设计

### 1. 添加新的编辑操作

在`WordEditor.ts`中添加新的操作类型：
```typescript
case 'newOperation':
  // 实现新操作
  break;
```

### 2. 支持新的AI服务

修改`AIService.ts`中的请求格式：
```typescript
// 适配不同的API格式
private static async callAI(prompt: string): Promise<string> {
  // 自定义请求格式
}
```

### 3. 添加新的UI组件

在`components/`目录下创建新组件：
```typescript
export const NewComponent: React.FC = () => {
  // 组件实现
};
```

## 性能优化

### 1. 代码分割
- Webpack自动代码分割
- 按需加载组件

### 2. 资源优化
- CSS内联（减少请求）
- 代码压缩（生产环境）

### 3. 运行时优化
- React组件优化
- 避免不必要的重渲染
- 异步操作优化

## 测试策略

### 1. 单元测试（建议）
- 服务层测试
- 工具函数测试

### 2. 集成测试（建议）
- 组件集成测试
- API调用测试

### 3. 手动测试
- Word环境测试
- WPS环境测试
- 不同版本测试

## 未来改进方向

1. **功能增强**
   - 支持更多编辑操作
   - 支持批量操作
   - 操作历史记录

2. **性能优化**
   - 代码分割优化
   - 缓存策略
   - 懒加载

3. **用户体验**
   - 操作预览
   - 撤销/重做
   - 快捷键支持

4. **错误处理**
   - 更详细的错误提示
   - 错误恢复机制
   - 错误上报

## 架构图

### 组件关系图

```
┌─────────────────┐
│  taskpane.tsx   │ (入口)
└────────┬────────┘
         │
         ├─── ErrorBoundary
         │         │
         │         └─── ChatWindow
         │                   │
         │                   ├─── SettingsPanel
         │                   │
         │                   ├─── PlatformDetector
         │                   │
         │                   ├─── AIService
         │                   │       │
         │                   │       └─── AI API (外部)
         │                   │
         │                   └─── WordEditor
         │                           │
         │                           └─── Office.js API
         │
         └─── PlatformDetector
```

### 数据流图

```
用户输入
    ↓
ChatWindow.handleSend()
    ↓
WordEditor.getDocumentContent() ──→ Office.js ──→ Word文档
    ↓
AIService.processRequest()
    ↓
AIService.callAI() ──→ HTTPS ──→ AI服务API
    ↓
AIService.parseAIResponse()
    ↓
EditOperation[]
    ↓
WordEditor.applyEdits() ──→ Office.js ──→ Word文档
    ↓
UI更新
```

## 总结

本系统采用分层架构设计：
- **表现层**：React组件（UI）
- **业务层**：服务类（业务逻辑）
- **数据层**：Office.js API、localStorage、外部AI API
- **工具层**：平台检测、错误处理

这种架构设计具有：
- ✅ 清晰的职责分离
- ✅ 良好的可维护性
- ✅ 易于扩展
- ✅ 错误处理完善
- ✅ 平台兼容性好

