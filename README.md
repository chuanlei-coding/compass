# Word/WPS AI助手插件

一个功能强大的Office插件，支持Microsoft Word和WPS Office，通过侧边栏对话窗口，使用AI能力帮助您编辑和管理文档。

## 功能特性

- 💬 **智能对话界面** - 在Word侧边栏打开对话窗口，自然语言交互
- 🤖 **AI驱动编辑** - 根据您的需求自动编辑文档
- ✏️ **多种编辑操作** - 支持插入、替换、格式化、删除等操作
- 🎨 **美观的UI** - 现代化的聊天界面设计

## 技术栈

### 前端
- **Office.js** - Microsoft Office插件开发框架
- **React + TypeScript** - 现代化的前端开发
- **Webpack** - 模块打包工具

### 后端
- **Python + FastAPI** - 后端API服务
- **httpx** - HTTP客户端（用于调用AI API）

### AI服务
- 支持OpenAI等AI服务（可配置）

📖 **学习指南**:
- [TypeScript 入门指南](TYPESCRIPT_GUIDE.md) - 面向有编程基础的 TypeScript/JavaScript/HTML/CSS 学习指南
- [React 入门指南](REACT_GUIDE.md) - React 核心概念和使用方法详解
- [Office.js 完整指南](OFFICE_JS_GUIDE.md) - Office.js API 详细使用方法

## 安装和运行

### 前置要求

- Node.js 16+ 和 npm
- Microsoft Word (Office 365 或 Office 2016+) **或** WPS Office (支持Office.js的版本)
- 开发证书（用于本地HTTPS）

### 安装步骤

1. **安装依赖**
   ```bash
   npm install
   ```

2. **生成开发证书**
   ```bash
   npx office-addin-dev-certs install --machine
   ```

3. **启动开发服务器**
   
   方式1：使用启动脚本（推荐）
   ```bash
   npm run dev
   ```
   
   方式2：直接启动（如果方式1失败）
   ```bash
   npm run dev:simple
   ```
   
   如果遇到证书问题，先运行：
   ```bash
   npm run setup-certs
   ```

4. **加载插件**

   **Microsoft Word:**
   - 打开Word
   - 转到"插入" > "我的加载项" > "上传我的加载项"
   - 选择项目根目录下的 `manifest.xml` 文件

   **WPS Office:**
   - 打开WPS Writer
   - 转到"开发工具" > "加载项" > "添加加载项"
   - 选择项目根目录下的 `manifest.xml` 文件
   - 注意：WPS需要支持Office.js API的版本（通常为WPS Office 2019+）
   - 📖 详细步骤请参考 [WPS加载指南](WPS_LOADING_GUIDE.md)

## 快速开始

### 1. 安装前端依赖

```bash
npm install
```

### 2. 安装后端依赖

```bash
cd backend
pip install -r requirements.txt
```

### 3. 启动后端服务

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. 启动前端服务

在另一个终端：

```bash
npm run dev
```

### 5. 配置AI服务

在插件侧边栏中点击右上角的 **设置** 按钮，输入您的AI API密钥和API URL。

📖 **详细设置指南**: 查看 [BACKEND_SETUP.md](BACKEND_SETUP.md) 了解后端服务的详细配置。

**注意**：
- 如果不配置API密钥，插件会使用模拟响应进行测试（功能有限）
- 后端服务默认运行在 `http://localhost:8000`
- 前端会自动连接到后端服务

## 使用示例

在对话窗口中输入您的需求，例如：

- "将第一段加粗"
- "在文档末尾添加一段文字"
- "将所有'旧文本'替换为'新文本'"
- "将标题设置为红色"

## 项目结构

```
compass/
├── manifest.xml              # Word插件清单文件
├── package.json              # 项目配置
├── webpack.config.js         # Webpack配置
├── tsconfig.json             # TypeScript配置
├── src/
│   ├── taskpane/
│   │   ├── taskpane.html     # 主HTML文件
│   │   ├── taskpane.tsx      # 入口文件
│   │   ├── taskpane.css      # 样式文件
│   │   ├── components/
│   │   │   ├── ChatWindow.tsx    # 对话窗口组件
│   │   │   ├── SettingsPanel.tsx  # 设置面板组件
│   │   │   └── ErrorBoundary.tsx  # 错误边界组件
│   │   ├── services/
│   │   │   ├── WordEditor.ts      # Word文档编辑服务
│   │   │   └── AIService.ts       # AI服务集成
│   │   └── utils/
│   │       └── PlatformDetector.ts # 平台检测工具
│   ├── commands/
│   │   ├── commands.html     # 命令处理HTML
│   │   └── commands.ts       # 命令处理逻辑
│   └── types/
│       └── office.d.ts       # Office.js类型定义
└── dist/                     # 构建输出目录
```

📖 **详细架构文档**: 请查看 [ARCHITECTURE.md](ARCHITECTURE.md) 了解完整的系统架构设计。

## 开发

### 构建生产版本
```bash
npm run build
```

### 验证清单文件
```bash
npm run validate
```

## 注意事项

1. **HTTPS要求** - Office插件必须通过HTTPS提供服务，开发环境使用自签名证书
2. **API密钥安全** - 不要将API密钥提交到版本控制系统
3. **权限** - 插件需要 `ReadWriteDocument` 权限来编辑文档
4. **浏览器兼容性** - Office插件在Word内置浏览器中运行，确保代码兼容

## 许可证

MIT

## 贡献

欢迎提交Issue和Pull Request！

