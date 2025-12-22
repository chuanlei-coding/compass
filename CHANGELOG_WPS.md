# WPS支持更新日志

## 版本 1.1.0 - WPS Office 支持

### 新增功能

1. **平台检测功能**
   - 新增 `PlatformDetector` 工具类，自动检测运行环境
   - 支持识别 Microsoft Word 和 WPS Office
   - 在UI中显示当前运行平台

2. **WPS兼容性**
   - 插件现在可以在WPS Office中运行
   - 使用相同的Office.js API，无需修改代码
   - 自动适配WPS环境

3. **错误处理增强**
   - 添加了API可用性检查
   - 提供更友好的错误提示
   - 支持平台特定的错误处理

### 修改的文件

1. **新增文件**
   - `src/taskpane/utils/PlatformDetector.ts` - 平台检测工具
   - `WPS_SUPPORT.md` - WPS支持详细文档
   - `CHANGELOG_WPS.md` - 本更新日志

2. **修改的文件**
   - `src/taskpane/taskpane.tsx` - 添加WPS环境支持
   - `src/taskpane/components/ChatWindow.tsx` - 显示平台信息
   - `src/taskpane/services/WordEditor.ts` - 添加API兼容性检查
   - `manifest.xml` - 更新描述信息
   - `README.md` - 添加WPS使用说明
   - `QUICKSTART.md` - 添加WPS加载步骤
   - `package.json` - 更新项目描述

### 技术细节

1. **平台检测方法**
   - User Agent检测
   - Window对象属性检测
   - Document referrer检测
   - Office.js host类型检测

2. **API兼容性**
   - WPS Office支持大部分Office.js API
   - 使用标准的Word API，无需特殊处理
   - 添加了API可用性检查，确保在API不可用时给出友好提示

3. **manifest.xml**
   - WPS使用与Word相同的`Document` Host
   - 不需要特殊的WPS配置
   - 保持与Word的完全兼容

### 使用说明

#### 在WPS中加载插件

1. 打开WPS Writer
2. 转到"开发工具" > "加载项" > "添加加载项"
3. 选择 `manifest.xml` 文件
4. 插件会自动检测运行环境并适配

#### 平台信息显示

插件会在侧边栏标题栏显示当前运行平台：
- Microsoft Word
- WPS Office

### 已知限制

1. **WPS版本要求**
   - 需要WPS Office 2019或更高版本
   - 需要支持Office.js API的WPS版本

2. **API兼容性**
   - 某些高级API可能在WPS中不完全支持
   - 如果遇到问题，请查看浏览器控制台错误信息

3. **功能测试**
   - 建议在Word和WPS中都进行完整测试
   - 某些功能可能在WPS中表现不同

### 后续计划

1. 收集WPS用户反馈
2. 优化WPS特定功能
3. 添加WPS特定的错误处理
4. 完善WPS文档

### 反馈

如果发现WPS兼容性问题，请：
1. 记录WPS版本号
2. 记录错误信息
3. 提交Issue到项目仓库

