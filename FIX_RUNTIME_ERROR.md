# 修复运行时错误指南

## 已添加的错误处理

我已经添加了以下错误处理机制来帮助诊断和修复运行时错误：

### 1. React错误边界（Error Boundary）

- 捕获React组件渲染错误
- 显示友好的错误界面
- 提供重新加载选项

### 2. 全局错误处理

- 捕获未处理的JavaScript错误
- 捕获未处理的Promise拒绝
- 记录详细的错误信息

### 3. 组件级错误处理

- 在关键操作中添加try-catch
- 防止单个错误导致整个应用崩溃

## 如何查看详细错误信息

### 方法1：使用开发者工具（推荐）

1. **在Word/WPS中打开插件**
2. **按F12打开开发者工具**
3. **切换到Console标签页**
4. **查看错误信息**

您会看到类似这样的错误信息：
```
❌ React错误边界捕获到错误: Error message
错误信息: Component stack trace
全局错误捕获: Error details
错误文件: taskpane.js
错误行号: 123
错误列号: 45
```

### 方法2：查看错误边界界面

如果React错误边界捕获到错误，会显示一个友好的错误界面，包含：
- 错误信息
- 错误堆栈
- 解决建议
- 重新加载按钮

## 常见运行时错误及解决方案

### 错误1：Office.js未加载

**症状：**
- `Office is not defined`
- `Cannot read property 'onReady' of undefined`

**解决方案：**
1. 确保在Word/WPS中运行，不要在浏览器中直接打开
2. 检查manifest.xml中的Office.js引用
3. 检查网络连接，确保可以加载Office.js

### 错误2：Word API不可用

**症状：**
- `Word is not defined`
- `Cannot read property 'run' of undefined`

**解决方案：**
1. 确保在Word或WPS环境中运行
2. 检查Word API是否已加载
3. 等待Office.onReady完成后再调用Word API

### 错误3：localStorage访问错误

**症状：**
- `Cannot access localStorage`
- `localStorage is not available`

**解决方案：**
1. 检查浏览器/Office环境是否支持localStorage
2. 使用try-catch包装localStorage操作
3. 提供降级方案

### 错误4：网络请求失败

**症状：**
- `Failed to fetch`
- `Network error`

**解决方案：**
1. 检查开发服务器是否运行
2. 检查HTTPS证书是否正确
3. 检查防火墙设置
4. 检查CORS配置

### 错误5：React渲染错误

**症状：**
- `Cannot read property 'X' of undefined`
- `TypeError: ...`

**解决方案：**
1. 检查组件props是否正确传递
2. 检查状态初始化
3. 添加空值检查
4. 查看错误边界捕获的详细信息

## 调试步骤

### 步骤1：打开开发者工具

1. 在Word/WPS中加载插件
2. 按F12打开开发者工具
3. 切换到Console标签页

### 步骤2：查看错误信息

查找以下类型的错误：
- ❌ 红色错误信息
- ⚠️ 黄色警告信息
- 🔴 React错误边界信息

### 步骤3：检查错误堆栈

错误堆栈会显示：
- 错误发生的文件
- 错误发生的行号
- 调用链

### 步骤4：复制错误信息

1. 右键点击错误信息
2. 选择"复制"
3. 保存错误信息用于排查

## 预防措施

### 1. 添加空值检查

```typescript
if (someValue) {
  // 使用someValue
}
```

### 2. 使用可选链

```typescript
const value = obj?.property?.nested;
```

### 3. 使用try-catch

```typescript
try {
  // 可能出错的代码
} catch (error) {
  console.error('错误:', error);
  // 错误处理
}
```

### 4. 验证环境

```typescript
if (typeof Office !== 'undefined') {
  // 使用Office API
}
```

## 获取帮助

如果错误仍然存在：

1. **收集信息**
   - 错误消息
   - 错误堆栈
   - 控制台完整日志
   - 操作步骤

2. **检查环境**
   - Word/WPS版本
   - 浏览器版本（Office使用）
   - Node.js版本
   - 操作系统

3. **提交Issue**
   - 包含所有收集的信息
   - 说明复现步骤
   - 提供截图

## 快速修复

如果遇到运行时错误，可以尝试：

1. **刷新插件**
   - 关闭侧边栏
   - 重新打开插件

2. **清除缓存**
   - 清除浏览器缓存
   - 清除localStorage（在控制台输入：`localStorage.clear()`）

3. **重启Word/WPS**
   - 完全关闭应用
   - 重新打开

4. **检查服务器**
   - 确保开发服务器运行
   - 检查服务器日志

现在代码已经添加了完善的错误处理，应该能够更好地捕获和显示错误信息。请按F12打开开发者工具查看详细的错误信息。

