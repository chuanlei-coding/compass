# 故障排除指南

## 常见问题及解决方案

### 1. npm权限错误

**错误信息：**
```
npm error code EPERM
npm error syscall open
```

**解决方案：**
- 如果使用Homebrew安装的Node.js，可能需要修复权限：
  ```bash
  sudo chown -R $(whoami) /opt/homebrew/Cellar/node@18
  ```
- 或者使用nvm安装Node.js：
  ```bash
  # 安装nvm
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  # 安装Node.js
  nvm install 18
  nvm use 18
  ```

### 2. 开发服务器无法启动

**检查步骤：**
1. 确认端口3000未被占用：
   ```bash
   lsof -i :3000
   # 如果被占用，可以修改webpack.config.js中的port
   ```

2. 检查依赖是否安装：
   ```bash
   ls node_modules
   # 如果不存在，运行 npm install
   ```

3. 尝试直接使用webpack：
   ```bash
   npx webpack serve --mode development
   ```

### 3. HTTPS证书问题

**错误信息：**
- "证书不受信任"
- "NET::ERR_CERT_AUTHORITY_INVALID"

**解决方案：**
1. 生成开发证书：
   ```bash
   npm run setup-certs
   ```

2. 如果仍然有问题，在浏览器中访问 `https://localhost:3000` 并接受证书警告

3. 在macOS上，可能需要将证书添加到钥匙串：
   ```bash
   # 证书位置
   ~/.office-addin-dev-certs/localhost.crt
   # 双击证书文件，添加到"系统"钥匙串，并设置为"始终信任"
   ```

### 4. 插件无法在Word中加载

**检查清单：**
- [ ] 开发服务器正在运行（`npm run dev`）
- [ ] 服务器地址是 `https://localhost:3000`
- [ ] manifest.xml中的URL指向正确的地址
- [ ] Word版本支持Office Add-ins（Office 2016+或Office 365）

**解决方案：**
1. 检查manifest.xml中的URL：
   ```xml
   <SourceLocation DefaultValue="https://localhost:3000/taskpane.html"/>
   ```

2. 在Word中清除缓存：
   - 关闭Word
   - 删除缓存目录（Windows: `%LOCALAPPDATA%\Microsoft\Office\16.0\Wef\`）
   - 重新打开Word并加载插件

3. 使用侧载方式加载：
   - 将manifest.xml放在受信任的目录
   - 在Word中：文件 > 选项 > 信任中心 > 信任中心设置 > 受信任的加载项目录

### 5. TypeScript编译错误

**常见错误：**
- "找不到模块"
- "类型错误"

**解决方案：**
1. 检查tsconfig.json配置
2. 确认所有依赖已安装：
   ```bash
   npm install
   ```
3. 检查类型定义文件是否存在：`src/types/office.d.ts`

### 6. AI功能不工作

**检查步骤：**
1. 确认API密钥已配置（通过设置面板或代码）
2. 检查网络连接
3. 查看浏览器控制台的错误信息
4. 如果没有配置API密钥，插件会使用模拟响应

**解决方案：**
- 在插件侧边栏点击"设置"按钮
- 输入有效的API密钥
- 保存并重试

### 7. Word文档编辑不生效

**可能原因：**
- Office.js API调用错误
- 文档权限问题
- 异步操作未正确等待

**解决方案：**
1. 打开浏览器开发者工具（F12）
2. 查看控制台错误信息
3. 检查WordEditor.ts中的API调用
4. 确认文档未被保护或只读

### 8. 热重载不工作

**解决方案：**
1. 确认webpack-dev-server正在运行
2. 检查webpack.config.js中的hot配置
3. 手动刷新Word中的插件窗口

## 获取帮助

如果以上方案都无法解决问题：

1. 检查项目日志和错误信息
2. 查看[Office Add-ins文档](https://docs.microsoft.com/office/dev/add-ins/)
3. 提交Issue到项目仓库

## 开发环境要求

- Node.js 16+ 
- npm 7+
- Microsoft Word (Office 2016+ 或 Office 365)
- 现代浏览器（用于调试）

