# 后端服务设置指南

## 概述

项目已添加 Python + FastAPI 后端服务，作为前端和AI API之间的代理服务器。

## 架构变化

**之前的架构：**
```
前端 → 直接调用AI API（如OpenAI）
```

**现在的架构：**
```
前端 → 后端服务（FastAPI） → AI API（如OpenAI）
```

## 优势

1. **安全性**：API密钥在后端管理，不在前端暴露
2. **灵活性**：可以在后端添加缓存、限流等功能
3. **统一处理**：错误处理和日志记录统一管理
4. **扩展性**：易于添加新的功能和接口

## 快速开始

### 1. 安装Python依赖

```bash
cd backend
pip install -r requirements.txt
```

或使用虚拟环境（推荐）：

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 2. 启动后端服务

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

服务启动后：
- API文档：http://localhost:8000/docs
- 健康检查：http://localhost:8000/health

### 3. 启动前端服务

在另一个终端：

```bash
npm run dev
```

### 4. 配置前端

前端默认会连接到 `http://localhost:8000`。如果需要修改，可以在 `.env` 文件中设置：

```bash
REACT_APP_BACKEND_URL=http://localhost:8000
```

## 使用方式

### 方式1：使用后端服务（推荐）

1. 启动后端服务（端口8000）
2. 启动前端服务（端口3000）
3. 在设置面板中配置API密钥和API URL
4. 前端会自动调用后端服务

### 方式2：直接调用AI API（向后兼容）

如果需要直接调用AI API，可以：

1. 在设置面板中将"API URL"设置为AI API地址（如 `https://api.openai.com/v1/chat/completions`）
2. 前端会检测到这是AI API URL，会回退到直接调用模式

**注意：** 目前前端已修改为调用后端，如果需要直接调用，需要进一步修改代码。

## 项目结构

```
compass/
├── backend/              # 后端服务
│   ├── main.py          # FastAPI应用
│   ├── requirements.txt # Python依赖
│   ├── .env.example     # 环境变量示例
│   └── README.md        # 后端文档
├── src/                 # 前端代码（保持不变）
│   └── taskpane/
│       └── services/
│           └── AIService.ts  # 已修改为调用后端
└── ...
```

## API接口

### POST /api/process

处理用户请求。

**请求示例：**

```bash
curl -X POST http://localhost:8000/api/process \
  -H "Content-Type: application/json" \
  -d '{
    "user_request": "将第一段加粗",
    "document_content": "这是文档内容...",
    "api_key": "sk-...",
    "api_url": "https://api.openai.com/v1/chat/completions",
    "model_name": "gpt-3.5-turbo"
  }'
```

**响应示例：**

```json
{
  "message": "已根据您的要求完成编辑操作",
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

## 开发建议

### 同时运行前后端

可以在两个终端分别运行：

**终端1（后端）：**
```bash
cd backend
uvicorn main:app --reload
```

**终端2（前端）：**
```bash
npm run dev
```

### 查看API文档

访问 http://localhost:8000/docs 查看交互式API文档。

### 调试

- 后端日志会显示所有API调用和错误信息
- 前端控制台会显示调用后端的状态
- 可以使用Postman或其他工具测试后端API

## 常见问题

### Q: 后端启动失败

A: 检查：
1. Python版本（需要3.8+）
2. 依赖是否安装完整：`pip install -r requirements.txt`
3. 端口8000是否被占用

### Q: 前端无法连接后端

A: 检查：
1. 后端是否正在运行
2. 后端URL配置是否正确
3. CORS配置是否正确（后端已配置允许所有来源）
4. 浏览器控制台的错误信息

### Q: API调用失败

A: 检查：
1. API密钥是否正确
2. API URL是否可访问
3. 后端日志中的详细错误信息

## 下一步

- [ ] 添加API密钥的服务器端存储和管理
- [ ] 添加请求缓存
- [ ] 添加请求限流
- [ ] 添加用户认证
- [ ] 优化错误处理和日志

