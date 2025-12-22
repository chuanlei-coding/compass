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

```
webpack compiled successfully
```

然后在浏览器中访问 `https://localhost:3000/taskpane.html` 应该能看到插件界面。

## 如果遇到问题

1. **npm权限错误** - 参考 `TROUBLESHOOTING.md`
2. **端口被占用** - 修改 `webpack.config.js` 中的 `port: 3000` 为其他端口
3. **证书错误** - 运行 `npm run setup-certs` 重新生成证书

## 下一步

服务器启动后：
1. 打开Microsoft Word
2. 转到 **插入** > **我的加载项** > **上传我的加载项**
3. 选择项目根目录下的 `manifest.xml` 文件
4. 开始使用插件！

