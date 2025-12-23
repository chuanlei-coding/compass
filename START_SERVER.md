# 启动开发服务器

## 已修复的问题

✅ **HTTPS配置** - webpack配置已更新，支持HTTPS（Office插件要求）
✅ **证书自动检测** - 自动检测并使用开发证书
✅ **启动脚本** - 创建了智能启动脚本 `start-dev.js`
✅ **错误处理** - 改进了错误处理和用户提示

## 启动方式

### 方式1：使用npm脚本（推荐）

```bash
npm run dev
```

这会自动：
- 检查并生成开发证书（如果需要）
- 启动webpack-dev-server
- 在 `https://localhost:3000` 提供服务

### 方式2：直接启动webpack

如果方式1遇到npm权限问题：

```bash
npx webpack serve --mode development
```

或者使用node直接运行：

```bash
node node_modules/.bin/webpack serve --mode development
```

### 方式3：手动生成证书后启动

```bash
# 1. 生成证书
npm run setup-certs
# 或
npx office-addin-dev-certs install --machine

# 2. 启动服务器
npm run dev:simple
```

## 验证服务器运行

启动成功后，您应该看到：

```text
webpack compiled successfully
```

然后在浏览器中访问 `https://localhost:3000/taskpane.html` 应该能看到插件界面。

## 如果遇到问题

1. **npm权限错误** - 参考 `TROUBLESHOOTING.md`
2. **端口被占用** - 修改 `webpack.config.js` 中的 `port: 3000` 为其他端口
3. **证书错误** - 运行 `npm run setup-certs` 重新生成证书

## 下一步：加载插件

服务器启动后，需要将插件加载到Word中。根据您的Word版本和配置，有以下几种方法：

### 方法1：侧载方式（推荐用于开发）

这是最可靠的方法，适用于所有Word版本：

1. **配置受信任目录**
   - 打开Microsoft Word
   - 转到 **文件** > **选项**
   - 选择 **信任中心** > **信任中心设置**
   - 选择 **受信任的加载项目录**
   - 点击 **添加新位置**
   - 浏览并选择项目根目录（包含manifest.xml的文件夹）
   - 点击 **确定**，然后关闭所有对话框

2. **重启Word**
   - 完全关闭Word
   - 重新打开Word

3. **加载插件**
   - 转到 **插入** > **我的加载项**
   - 点击 **共享文件夹** 选项卡
   - 找到 **Word/WPS AI助手** 插件
   - 点击 **添加** 按钮

### 方法2：通过"上传我的加载项"（如果可用）

某些Word版本可能显示此选项：

1. 打开Microsoft Word
2. 转到 **插入** > **我的加载项**
3. 查看是否有 **上传我的加载项** 或 **Upload My Add-in** 选项
   - 如果有，点击它
   - 选择项目根目录下的 `manifest.xml` 文件
   - 点击 **上传**
4. 如果**没有**这个选项，请使用方法1（侧载方式）

### 为什么看不到"上传我的加载项"？

可能的原因：
- **Word版本不同**：不同版本的Word界面可能不同
- **企业版限制**：企业版Word可能有策略限制
- **权限问题**：某些设置可能禁用了此功能
- **界面位置**：可能在"我的加载项"对话框的其他位置

**解决方案**：使用**方法1（侧载方式）**，这是最可靠的方法，适用于所有情况。

### 详细说明

更多详细的加载步骤和故障排除，请参考：
- [QUICKSTART.md](QUICKSTART.md) - 快速开始指南
- [WORD_LOADING_GUIDE.md](WORD_LOADING_GUIDE.md) - Word加载详细指南（包含为什么看不到"上传我的加载项"的说明）
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - 故障排除指南

