# 快速开始指南

## 第一步：安装依赖

```bash
npm install
```

## 第二步：生成开发证书

Office插件需要HTTPS，运行以下命令生成开发证书：

```bash
npx office-addin-dev-certs install --machine
```

如果遇到权限问题，可能需要使用管理员权限运行。

## 第三步：启动开发服务器

```bash
npm run dev
```

服务器将在 `https://localhost:3000` 启动。

## 第四步：加载插件

### Microsoft Word

**方法1：通过Word界面加载**

1. 打开Microsoft Word
2. 转到 **插入** 选项卡
3. 点击 **我的加载项** (或 **Add-ins**)
4. 选择 **上传我的加载项** (或 **Upload My Add-in**)
5. 浏览并选择项目根目录下的 `manifest.xml` 文件
6. 点击 **上传**

**方法2：通过侧载加载（推荐用于开发）**

1. 打开Word
2. 转到 **文件** > **选项** > **信任中心** > **信任中心设置** > **受信任的加载项目录**
3. 添加包含 `manifest.xml` 的文件夹路径
4. 重启Word
5. 转到 **插入** > **我的加载项** > **共享文件夹**，找到并加载插件

### WPS Office

1. 打开WPS Writer
2. 转到 **开发工具** 选项卡（如果没有，需要在选项中启用）
3. 点击 **加载项** > **添加加载项**
4. 浏览并选择项目根目录下的 `manifest.xml` 文件
5. 点击 **确定**

**注意**：WPS需要支持Office.js API的版本（WPS Office 2019+）

## 第五步：配置AI服务（可选）

### 方式1：通过UI配置

1. 在插件侧边栏中点击右上角的 **设置** 按钮
2. 输入您的AI API密钥
3. 点击 **保存**

### 方式2：通过代码配置

编辑 `src/taskpane/services/AIService.ts`，在初始化时设置：

```typescript
AIService.setApiKey('your-api-key-here');
```

## 使用插件

1. 在Word中打开或创建一个文档
2. 点击 **插入** > **我的加载项**，找到并打开 **Word AI助手**
3. 在侧边栏的对话窗口中输入您的需求，例如：
   - "将第一段加粗"
   - "在文档末尾添加一段文字"
   - "将所有'旧文本'替换为'新文本'"
4. 按Enter或点击发送按钮
5. AI将根据您的需求自动编辑文档

## 常见问题

### 插件无法加载

- 确保开发服务器正在运行（`npm run dev`）
- 检查浏览器控制台是否有错误
- 确保manifest.xml中的URL指向正确的地址（默认是 `https://localhost:3000`）

### 证书错误

如果遇到证书警告：
- 在浏览器中访问 `https://localhost:3000` 并接受证书
- 或者重新生成证书：`npx office-addin-dev-certs remove` 然后 `npx office-addin-dev-certs install --machine`

### AI功能不工作

- 如果没有配置API密钥，插件会使用模拟响应（功能有限）
- 检查网络连接
- 查看浏览器控制台的错误信息

## 下一步

- 阅读 [README.md](README.md) 了解更多详细信息
- 查看源代码了解如何扩展功能
- 根据需要修改AI提示词以优化响应质量

