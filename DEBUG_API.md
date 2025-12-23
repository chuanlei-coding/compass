# API调用调试指南

如果插件没有调用真实的大模型API，而是使用模拟响应，请按照以下步骤排查：

## 检查步骤

### 1. 检查API密钥是否配置

**方法1：通过设置面板检查**
1. 点击插件右上角的"设置"按钮
2. 查看"API密钥"字段是否有值
3. 如果没有，请输入您的API密钥并保存

**方法2：通过浏览器控制台检查**
1. 在Word/WPS中按 **F12** 打开开发者工具
2. 切换到 **Console** 标签页
3. 输入以下命令检查：
   ```javascript
   localStorage.getItem('ai_api_key')
   ```
4. 如果返回 `null` 或空字符串，说明API密钥未配置

### 2. 检查API URL是否正确

1. 打开设置面板
2. 检查"API URL"字段
3. 确保URL格式正确，例如：
   - OpenAI: `https://api.openai.com/v1/chat/completions`
   - 自定义服务: `http://your-server:port/v1/chat/completions`

### 3. 检查模型名称

1. 打开设置面板
2. 检查"模型名称"字段
3. 确保模型名称与您的API服务匹配

### 4. 查看控制台日志

打开浏览器控制台（F12），查看以下日志：

**如果看到：**
- `⚠️ API密钥未配置，使用模拟响应` → API密钥未设置
- `🚀 开始调用AI API...` → 正在尝试调用API
- `📡 发送API请求到: ...` → 正在发送请求
- `✅ AI API调用成功` → API调用成功
- `❌ AI服务调用失败: ...` → API调用失败，查看错误详情

### 5. 检查网络请求

1. 打开开发者工具（F12）
2. 切换到 **Network** 标签页
3. 发送一条消息
4. 查看是否有对API URL的请求
5. 如果有请求，查看：
   - 请求状态码（200表示成功）
   - 请求头（检查Authorization是否正确）
   - 响应内容

## 常见问题

### 问题1：API密钥未配置

**症状：**
- 控制台显示：`⚠️ API密钥未配置，使用模拟响应`
- 返回模拟响应消息

**解决方案：**
1. 打开设置面板
2. 输入API密钥
3. 点击保存
4. 重新发送消息

### 问题2：API调用失败

**症状：**
- 控制台显示：`❌ AI服务调用失败`
- 有错误信息

**可能原因：**
1. **API密钥无效**
   - 检查API密钥是否正确
   - 检查API密钥是否过期

2. **API URL错误**
   - 检查URL格式是否正确
   - 检查URL是否可访问

3. **网络问题**
   - 检查网络连接
   - 检查防火墙设置
   - 检查是否需要代理

4. **CORS问题**
   - 如果使用自定义API服务，需要配置CORS
   - 允许来自Word/WPS的请求

5. **API服务不支持**
   - 检查API服务是否支持OpenAI兼容的格式
   - 检查请求格式是否正确

### 问题3：API响应格式错误

**症状：**
- API调用成功，但解析失败
- 控制台显示：`解析AI响应失败`

**解决方案：**
1. 查看控制台中的"API响应数据"
2. 检查响应格式是否符合预期
3. 某些API服务可能返回不同的格式

### 问题4：模型名称不匹配

**症状：**
- API调用失败
- 错误信息提示模型不存在

**解决方案：**
1. 检查模型名称是否正确
2. 确认您的API服务支持该模型
3. 查看API服务的文档获取正确的模型名称

## 调试技巧

### 1. 启用详细日志

代码中已经添加了详细的日志，在控制台中可以看到：
- API密钥状态
- API URL和模型名称
- 请求参数
- 响应状态
- 错误详情

### 2. 测试API连接

在浏览器控制台中手动测试：

```javascript
// 测试API密钥是否加载
console.log('API Key:', localStorage.getItem('ai_api_key'));
console.log('API URL:', localStorage.getItem('ai_api_url'));
console.log('Model:', localStorage.getItem('ai_model_name'));

// 测试API调用（需要替换为您的实际值）
fetch('YOUR_API_URL', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'YOUR_MODEL',
    messages: [{ role: 'user', content: 'test' }]
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### 3. 检查localStorage

```javascript
// 查看所有配置
console.log({
  apiKey: localStorage.getItem('ai_api_key'),
  apiUrl: localStorage.getItem('ai_api_url'),
  modelName: localStorage.getItem('ai_model_name')
});
```

## 验证配置

完成配置后，发送一条消息，在控制台中应该看到：

```
📄 获取文档内容...
文档内容长度: XXX
🤖 调用AI服务处理请求: 您的消息
🚀 开始调用AI API... { apiUrl: '...', model: '...', hasApiKey: true }
📡 发送API请求到: ...
API响应状态: 200 OK
✅ AI API调用成功
✏️ 执行编辑操作: X 个操作
```

如果看到这些日志，说明API调用成功！

## 获取帮助

如果以上方法都无法解决问题：

1. 打开浏览器控制台（F12）
2. 复制所有错误信息
3. 检查Network标签页中的请求详情
4. 提交Issue到项目仓库，包含：
   - 错误信息
   - 控制台日志
   - API服务类型
   - 配置信息（隐藏敏感信息）

