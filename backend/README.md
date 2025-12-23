# 后端服务文档

## 概述

这是 Word/WPS AI助手插件的后端服务，使用 Python + FastAPI 构建。后端作为前端和AI API之间的代理服务器。

## 功能

- 接收前端的请求
- 调用AI API（如OpenAI）
- 解析AI响应
- 返回编辑操作给前端
- 处理错误和降级方案

## 安装

### 1. 创建虚拟环境（推荐）

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

## 配置

### 环境变量（可选）

创建 `.env` 文件（参考 `.env.example`）：

```bash
DEFAULT_API_URL=https://api.openai.com/v1/chat/completions
DEFAULT_MODEL_NAME=gpt-3.5-turbo
```

**注意：** 前端可以通过设置面板配置API密钥和URL，这些配置会通过请求传递给后端。

## 运行

### 开发模式

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 生产模式

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 使用Python直接运行

```bash
python main.py
```

服务启动后，访问：
- API文档：http://localhost:8000/docs
- 健康检查：http://localhost:8000/health

## API接口

### POST /api/process

处理用户请求，调用AI API并返回编辑操作。

**请求体：**

```json
{
  "user_request": "将第一段加粗",
  "document_content": "文档内容...",
  "api_key": "sk-...",
  "api_url": "https://api.openai.com/v1/chat/completions",
  "model_name": "gpt-3.5-turbo"
}
```

**响应：**

```json
{
  "message": "操作说明",
  "edits": [
    {
      "type": "format",
      "searchText": "第一段",
      "format": {
        "bold": true
      }
    }
  ]
}
```

### GET /health

健康检查接口。

**响应：**

```json
{
  "status": "healthy"
}
```

## 前端配置

前端需要配置后端URL。在 `src/taskpane/services/AIService.ts` 中：

```typescript
private static getBackendUrl(): string {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  return backendUrl;
}
```

或通过环境变量配置：

```bash
REACT_APP_BACKEND_URL=http://localhost:8000
```

## CORS配置

后端默认允许所有来源的跨域请求（开发环境）。生产环境应该配置具体的允许来源：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # 指定允许的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 错误处理

- 如果AI API调用失败，后端会返回模拟响应作为降级方案
- 所有错误都会记录日志
- HTTP错误会返回相应的状态码和错误信息

## 日志

后端使用Python logging模块记录日志，包括：
- API调用信息
- 错误详情
- 请求处理状态

## 部署

### Docker部署（示例）

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 环境变量配置

生产环境建议使用环境变量或配置文件管理敏感信息。

## 故障排除

### 端口被占用

如果8000端口被占用，可以修改端口：

```bash
uvicorn main:app --port 8080
```

并相应修改前端的后端URL配置。

### CORS错误

确保CORS中间件正确配置，允许前端域名。

### AI API调用失败

检查：
1. API密钥是否正确
2. API URL是否可访问
3. 网络连接是否正常
4. 查看后端日志获取详细错误信息

