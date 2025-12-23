# 系统架构文档

## 项目概述

Word/WPS AI助手是一个基于Office.js的插件，通过AI能力帮助用户编辑和管理Word/WPS文档。系统采用前后端分离架构：
- **前端**：React + TypeScript构建的Office插件
- **后端**：Python + FastAPI构建的API服务
- 支持Microsoft Word和WPS Office

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
│              前端开发服务器 (Webpack Dev Server)             │
│              https://localhost:3000                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS API调用
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              后端服务 (FastAPI)                              │
│              http://localhost:8000                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API接口层                                           │  │
│  │  - POST /api/process (处理AI请求)                    │  │
│  │  - GET /health (健康检查)                            │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  业务逻辑层                                          │  │
│  │  - 提示词构建                                        │  │
│  │  - AI响应解析                                        │  │
│  │  - 错误处理                                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS API调用
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

### 前端构建工具
- **Webpack 5.88** - 模块打包
- **Webpack Dev Server 4.15** - 开发服务器
- **TypeScript Compiler** - 类型检查和编译

### 前端样式
- **CSS Modules** - 样式管理
- **现代CSS** - Flexbox、Grid等

### 后端框架
- **Python 3.8+** - 编程语言
- **FastAPI 0.104+** - 现代化Web框架
- **httpx 0.25+** - 异步HTTP客户端
- **Pydantic 2.5+** - 数据验证

### 开发工具
- **ESLint** - 前端代码检查
- **office-addin-dev-certs** - HTTPS证书管理
- **office-addin-manifest** - 清单验证
- **uvicorn** - ASGI服务器
- **python-dotenv** - 环境变量管理

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
├── backend/                     # 后端服务目录
│   ├── main.py                 # FastAPI应用主文件
│   ├── requirements.txt        # Python依赖
│   ├── .env.example            # 环境变量示例
│   ├── .gitignore              # Git忽略文件
│   └── README.md               # 后端文档
│
├── dist/                        # 构建输出目录
├── assets/                      # 静态资源（图标等）
│
└── docs/                        # 文档目录
    ├── README.md
    ├── QUICKSTART.md
    ├── ARCHITECTURE.md (本文档)
    ├── BACKEND_SETUP.md        # 后端设置指南
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
- 后端API调用管理
- 请求构建和发送
- 响应处理
- 模拟响应（降级方案）
- 配置管理（API密钥、URL、模型）

**主要方法：**
- `processRequest()` - 处理用户请求
- `callBackendAPI()` - 调用后端API
- `getBackendUrl()` - 获取后端URL
- `getMockResponse()` - 获取模拟响应（降级方案）
- `setApiKey()` / `setApiUrl()` / `setModelName()` - 配置管理

**数据流：**
```
用户输入 → processRequest() → callBackendAPI() → 后端服务 → 返回EditOperation[]
```

**架构变化：**
- 前端不再直接调用AI API
- 所有AI请求通过后端服务代理
- 后端负责提示词构建、AI API调用、响应解析

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

### 5. 后端服务层

#### main.py (FastAPI应用)
**职责：**
- 接收前端API请求
- 调用AI API（如OpenAI）
- 解析AI响应
- 错误处理和日志记录
- 返回编辑操作给前端

**主要接口：**
- `POST /api/process` - 处理用户请求，调用AI API
- `GET /health` - 健康检查
- `GET /` - 服务信息

**核心功能：**
- 提示词构建（`build_prompt()`）
- AI API调用（`call_ai_api()`）
- 响应解析（`parse_ai_response()`）
- 模拟响应（`get_mock_response()`）

**配置管理：**
- 支持环境变量配置（`.env`）
- 前端传递的API密钥和URL
- 默认配置（DEFAULT_API_URL, DEFAULT_MODEL_NAME）

**错误处理：**
- HTTP异常处理
- AI API调用失败降级
- 详细的日志记录

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
5. AIService.callBackendAPI() 调用后端服务
   ↓
6. 后端接收请求 (POST /api/process)
   ↓
7. 后端构建提示词 (build_prompt())
   ↓
8. 后端调用AI API (call_ai_api())
   ↓
9. 后端解析AI响应 (parse_ai_response())
   ↓
10. 后端返回 EditOperation[] 给前端
    ↓
11. AIService接收响应并返回
    ↓
12. WordEditor.applyEdits() 执行编辑操作
    ↓
13. 更新UI显示结果
```

### 后端处理流程

```
前端请求
    ↓
FastAPI接收 (POST /api/process)
    ↓
验证请求参数 (Pydantic模型)
    ↓
检查API密钥
    ├─ 无密钥 → 返回模拟响应
    └─ 有密钥 → 继续处理
    ↓
构建提示词 (build_prompt)
    ↓
调用AI API (call_ai_api)
    ├─ 成功 → 解析响应
    └─ 失败 → 返回模拟响应（降级）
    ↓
解析AI响应 (parse_ai_response)
    ↓
返回编辑操作 (AIResponse)
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

### 前端模块依赖

```
taskpane.tsx (入口)
    ├── ErrorBoundary (错误处理)
    │   └── ChatWindow (主界面)
    │       ├── SettingsPanel (设置)
    │       ├── PlatformDetector (平台检测)
    │       ├── AIService (AI服务)
    │       │   └── 调用后端API (HTTP)
    │       └── WordEditor (文档编辑)
    │
    └── PlatformDetector (平台检测)
```

### 后端模块依赖

```
main.py (FastAPI应用)
    ├── API路由层
    │   ├── POST /api/process
    │   └── GET /health
    ├── 业务逻辑层
    │   ├── build_prompt() (提示词构建)
    │   ├── call_ai_api() (AI API调用)
    │   ├── parse_ai_response() (响应解析)
    │   └── get_mock_response() (模拟响应)
    └── 外部依赖
        ├── httpx (HTTP客户端)
        └── AI API (外部服务)
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
- 前后端分离架构
- 前端调用后端API，后端代理AI API调用
- 可配置的AI API端点（通过前端设置）
- 支持OpenAI兼容格式
- 模拟响应降级方案（前后端都有）
- 详细的日志记录（前后端都记录）

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

#### 前端部署

1. **构建前端**
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

#### 后端部署

1. **安装依赖**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **配置环境变量**
   - 创建`.env`文件
   - 配置默认API URL和模型名称（可选）

3. **启动服务**
   ```bash
   # 开发环境
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   
   # 生产环境
   uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

4. **配置前端后端URL**
   - 在生产环境中，更新前端配置指向后端服务URL
   - 可以通过环境变量或localStorage配置

#### 完整部署

前后端需要分别部署：
- **前端**：部署到HTTPS服务器（如Nginx、Apache）
- **后端**：部署到应用服务器（如使用uvicorn、gunicorn，或容器化部署）

确保：
- 前端可以访问后端API（CORS配置正确）
- 后端可以访问外部AI API
- 生产环境使用HTTPS

## 安全考虑

### 1. HTTPS要求
- Office插件必须使用HTTPS
- 开发环境使用自签名证书
- 生产环境需要有效证书

### 2. API密钥安全
- 前端存储在localStorage（客户端）
- 通过HTTP请求传递给后端（不暴露给浏览器网络面板）
- 后端不持久化存储API密钥（每次请求传递）
- 不提交到版本控制
- 通过设置面板配置
- 后端可以进一步优化为服务端存储和管理

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

#### 前端组件关系

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
         │                   │       └─── HTTP ──→ 后端服务 (FastAPI)
         │                   │
         │                   └─── WordEditor
         │                           │
         │                           └─── Office.js API
         │
         └─── PlatformDetector
```

#### 后端组件关系

```
┌─────────────────┐
│   main.py       │ (FastAPI应用)
└────────┬────────┘
         │
         ├─── API路由层
         │       ├─── POST /api/process
         │       └─── GET /health
         │
         ├─── 业务逻辑层
         │       ├─── build_prompt()
         │       ├─── call_ai_api()
         │       ├─── parse_ai_response()
         │       └─── get_mock_response()
         │
         └─── 外部服务
                 └─── AI API (OpenAI等)
```

#### 完整系统关系

```
前端 (React/TypeScript)
    │
    │ HTTP请求
    ▼
后端 (FastAPI/Python)
    │
    │ HTTPS请求
    ▼
AI服务 (OpenAI/外部API)
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
AIService.callBackendAPI() ──→ HTTP ──→ 后端服务 (FastAPI)
    │                                   │
    │                                   ├─ build_prompt()
    │                                   ├─ call_ai_api() ──→ HTTPS ──→ AI服务API
    │                                   └─ parse_ai_response()
    ↓
后端返回 EditOperation[]
    ↓
WordEditor.applyEdits() ──→ Office.js ──→ Word文档
    ↓
UI更新
```

### 后端内部数据流

```
前端请求 (JSON)
    ↓
FastAPI接收
    ↓
Pydantic模型验证
    ↓
提取参数 (user_request, document_content, api_key等)
    ↓
构建提示词
    ↓
调用AI API (httpx)
    ↓
AI响应 (JSON)
    ↓
解析响应 (提取edits数组)
    ↓
返回给前端 (AIResponse)
```

## 架构优势

### 前后端分离的优势

1. **安全性**
   - API密钥可以在后端更安全地管理
   - 前端不直接暴露敏感信息
   - 可以在后端添加认证和授权

2. **灵活性**
   - 可以在后端添加缓存机制
   - 可以实现请求限流
   - 可以添加日志和监控

3. **可扩展性**
   - 后端可以支持多个前端
   - 可以添加新的API接口
   - 可以集成多个AI服务

4. **维护性**
   - 前后端可以独立开发
   - 错误处理统一在后端管理
   - 易于调试和测试

### 架构设计原则

- **关注点分离**：前端负责UI，后端负责业务逻辑
- **单一职责**：每个模块职责明确
- **松耦合**：前后端通过RESTful API通信
- **错误隔离**：错误处理在各层独立实现

## 总结

本系统采用前后端分离的分层架构设计：

**前端：**
- **表现层**：React组件（UI）
- **业务层**：服务类（前端业务逻辑）
- **数据层**：Office.js API、localStorage
- **工具层**：平台检测、错误处理

**后端：**
- **API层**：FastAPI路由和接口
- **业务层**：AI处理逻辑
- **数据层**：外部AI API、配置管理

这种架构设计具有：
- ✅ 清晰的职责分离
- ✅ 良好的可维护性
- ✅ 易于扩展
- ✅ 错误处理完善
- ✅ 平台兼容性好
- ✅ 安全性提升
- ✅ 前后端独立部署

