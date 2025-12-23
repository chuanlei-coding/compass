# CORS（跨域资源共享）详解

## 什么是 CORS？

CORS（Cross-Origin Resource Sharing，跨域资源共享）是一种**浏览器安全机制**，用于控制网页脚本访问不同源（域）的资源。

### 关键理解：这是浏览器的限制！

**重要：CORS 是浏览器实施的限制，不是前端代码的限制，也不是后端代码的限制。**

## 同源策略（Same-Origin Policy）

要理解 CORS，首先需要理解同源策略。

### 什么是"源"（Origin）？

源（Origin）由三部分组成：
- **协议**（Protocol）：http 或 https
- **域名**（Domain）：例如 example.com
- **端口**（Port）：例如 80、443、3000、8000

### 同源判断

两个 URL 的协议、域名、端口**完全相同**才是同源：

| URL 1 | URL 2 | 是否同源 | 原因 |
|-------|-------|---------|------|
| `http://example.com/page1` | `http://example.com/page2` | ✅ 同源 | 协议、域名、端口都相同 |
| `http://example.com` | `https://example.com` | ❌ 不同源 | 协议不同（http vs https） |
| `http://example.com` | `http://www.example.com` | ❌ 不同源 | 域名不同 |
| `http://example.com:80` | `http://example.com:3000` | ❌ 不同源 | 端口不同 |
| `https://localhost:3000` | `http://localhost:8000` | ❌ 不同源 | 协议和端口都不同 |

### 同源策略的限制

**浏览器的同源策略限制：**

1. **JavaScript 无法读取不同源的响应**
   - 虽然请求可以发送（某些情况下）
   - 但浏览器会阻止 JavaScript 读取响应内容

2. **Cookie/LocalStorage 无法跨域访问**
   - 不同域的 Cookie 不能互相访问

3. **DOM 无法跨域访问**
   - 来自不同源的 iframe 内容无法访问

## CORS 的工作原理

### 简单请求（Simple Request）

对于简单请求，浏览器会直接发送请求，然后检查响应头：

```
1. 浏览器发送请求（带 Origin 头）
   ↓
2. 服务器处理请求
   ↓
3. 服务器返回响应（带 CORS 头）
   ↓
4. 浏览器检查响应头
   ├─ 如果允许 → JavaScript 可以读取响应
   └─ 如果不允许 → 浏览器阻止 JavaScript 读取响应
```

**简单请求的条件：**
- 方法是：GET、POST、HEAD
- 请求头只包含：Accept、Accept-Language、Content-Language、Content-Type
- Content-Type 只允许：text/plain、multipart/form-data、application/x-www-form-urlencoded

### 预检请求（Preflight Request）

对于非简单请求，浏览器会先发送一个 OPTIONS 请求（预检请求）：

```
1. 浏览器发送 OPTIONS 预检请求（带 Origin 头）
   ↓
2. 服务器返回预检响应（CORS 头）
   ↓
3. 浏览器检查预检响应
   ├─ 如果允许 → 继续发送实际请求
   └─ 如果不允许 → 阻止实际请求（不会发送）
   ↓
4. 如果允许，浏览器发送实际请求
   ↓
5. 服务器返回响应（带 CORS 头）
   ↓
6. 浏览器检查响应头，决定是否允许 JavaScript 读取
```

## CORS 是对谁的限制？

### 答案：这是浏览器的限制

**CORS 是浏览器实施的限制，目的是保护用户安全。**

### 各方的角色

#### 1. 浏览器（执行限制）

**浏览器的职责：**
- 检查请求是否是跨域请求
- 如果是跨域，检查服务器是否允许（通过响应头）
- 如果允许，让 JavaScript 读取响应
- 如果不允许，**阻止 JavaScript 读取响应**（但请求可能已经发送）

**关键点：**
- 浏览器会发送请求到服务器（请求已经发出）
- 但浏览器会阻止 JavaScript 访问响应内容
- 这是浏览器的安全机制

#### 2. 前端代码（被限制的对象）

**前端代码的角色：**
- 发送请求（可以正常发送）
- 尝试读取响应（可能被浏览器阻止）

**前端代码无法绕过 CORS：**
```javascript
// 前端代码可以发送请求
fetch('http://localhost:8000/api/process', {
  method: 'POST',
  // ...
}).then(response => {
  // 如果服务器没有正确配置CORS，这里会报错
  // "Access to fetch at '...' from origin '...' has been blocked by CORS policy"
  return response.json();
});
```

**前端代码无法绕过这个限制，因为这是浏览器层面的安全机制。**

#### 3. 后端服务器（需要配合）

**后端的职责：**
- 返回正确的 CORS 响应头
- 告诉浏览器："我允许这个来源访问我的资源"

**后端配置示例：**
```python
# FastAPI 后端
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 允许的前端来源
    allow_credentials=True,
    allow_methods=["*"],  # 允许的HTTP方法
    allow_headers=["*"],  # 允许的请求头
)
```

## CORS 响应头

服务器通过以下响应头告诉浏览器是否允许跨域访问：

### 核心响应头

#### 1. `Access-Control-Allow-Origin`

**最重要的响应头**，指定允许访问的源：

```http
Access-Control-Allow-Origin: http://localhost:3000
```

或者允许所有源（不推荐用于生产环境）：

```http
Access-Control-Allow-Origin: *
```

#### 2. `Access-Control-Allow-Methods`

指定允许的 HTTP 方法：

```http
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

#### 3. `Access-Control-Allow-Headers`

指定允许的请求头：

```http
Access-Control-Allow-Headers: Content-Type, Authorization
```

#### 4. `Access-Control-Allow-Credentials`

指定是否允许携带凭证（Cookie、Authorization 头等）：

```http
Access-Control-Allow-Credentials: true
```

**注意：** 如果设置为 `true`，`Access-Control-Allow-Origin` 不能是 `*`，必须指定具体域名。

#### 5. `Access-Control-Max-Age`

指定预检请求的缓存时间（秒）：

```http
Access-Control-Max-Age: 3600
```

### 完整的 CORS 响应示例

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
Content-Type: application/json

{
  "status": "success"
}
```

## 实际示例

### 示例 1：没有 CORS 配置（会失败）

**前端代码：**
```javascript
// 在 localhost:3000 运行的前端
fetch('http://localhost:8000/api/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ... })
});
```

**后端（没有 CORS 配置）：**
```python
# 后端返回响应，但没有 CORS 头
return {"status": "success"}
```

**结果：**
```
浏览器控制台错误：
Access to fetch at 'http://localhost:8000/api/process' from origin 
'http://localhost:3000' has been blocked by CORS policy: No 
'Access-Control-Allow-Origin' header is present on the requested resource.
```

**发生了什么：**
1. 浏览器发送请求到后端 ✅
2. 后端处理请求并返回响应 ✅
3. 浏览器检查响应头，发现没有 `Access-Control-Allow-Origin` ❌
4. 浏览器阻止 JavaScript 读取响应 ❌
5. JavaScript 收到 CORS 错误 ❌

**重要：** 请求已经发送到服务器，服务器也可能已经处理了请求，但浏览器阻止了前端代码读取响应。

### 示例 2：正确配置 CORS（会成功）

**后端配置：**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**前端代码（相同）：**
```javascript
fetch('http://localhost:8000/api/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ... })
});
```

**结果：**
1. 浏览器发送请求到后端 ✅
2. 后端处理请求并返回响应（带 CORS 头）✅
3. 浏览器检查响应头，发现允许访问 ✅
4. 浏览器允许 JavaScript 读取响应 ✅
5. JavaScript 成功获取数据 ✅

## 常见误解

### 误解 1：CORS 是后端的限制

**错误理解：** "CORS 限制了后端，所以后端需要配置才能允许跨域请求。"

**正确理解：** 
- CORS 是**浏览器的限制**
- 后端需要**配合**浏览器，返回正确的 CORS 响应头
- 告诉浏览器："我允许这个来源访问我的资源"

### 误解 2：跨域请求无法发送

**错误理解：** "如果没有 CORS 配置，跨域请求根本发送不出去。"

**正确理解：**
- 跨域请求**可以发送**到服务器
- 服务器**可以处理**请求并返回响应
- 但浏览器会**阻止 JavaScript 读取响应**
- 如果服务器没有返回正确的 CORS 头

### 误解 3：前端可以绕过 CORS

**错误理解：** "可以通过前端代码绕过 CORS 限制。"

**正确理解：**
- 前端代码**无法绕过** CORS 限制
- 这是浏览器层面的安全机制
- 只能通过后端配置 CORS 响应头来解决

### 误解 4：CORS 是为了防止后端被攻击

**错误理解：** "CORS 是为了保护后端服务器不被攻击。"

**正确理解：**
- CORS 是为了**保护用户**（浏览器用户）
- 防止恶意网站窃取用户的敏感数据
- 防止恶意网站以用户身份执行操作

## 为什么需要 CORS？

### 安全原因

**没有 CORS 的话，恶意网站可以：**

1. **窃取用户数据**
   ```javascript
   // 恶意网站 evil.com
   fetch('https://bank.com/api/account', {
     headers: {
       'Cookie': document.cookie  // 用户的银行Cookie
     }
   }).then(data => {
     // 窃取用户的银行账户信息
     sendToAttacker(data);
   });
   ```

2. **以用户身份执行操作**
   ```javascript
   // 恶意网站 evil.com
   fetch('https://bank.com/api/transfer', {
     method: 'POST',
     body: JSON.stringify({
       to: 'attacker-account',
       amount: 10000
     })
   });
   // 以用户身份转账给攻击者
   ```

### CORS 的保护机制

**CORS 确保：**
- 只有服务器明确允许的来源才能访问资源
- 服务器可以控制哪些来源可以访问
- 防止恶意网站跨域访问用户数据

## 如何解决 CORS 问题？

### 方法 1：后端配置 CORS（推荐）

**这是正确和标准的解决方案。**

```python
# FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

```javascript
// Express.js (Node.js)
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000'
}));
```

### 方法 2：代理服务器（开发环境）

**在前端服务器上配置代理：**

```javascript
// webpack.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
};
```

**工作原理：**
```
前端 → fetch('/api/process') → webpack-dev-server (代理) → 后端
```

这样前端和后端看起来是同源的（都通过 localhost:3000），但实际上 webpack-dev-server 代理到后端。

**注意：** 这只适用于开发环境，生产环境仍然需要后端配置 CORS。

### 方法 3：禁用浏览器安全（不推荐）

**仅用于开发测试，绝对不要在生产环境使用！**

```bash
# Chrome (macOS)
open -a "Google Chrome" --args --disable-web-security --user-data-dir=/tmp/chrome_dev

# Chrome (Windows)
chrome.exe --disable-web-security --user-data-dir="C:/tmp/chrome_dev"
```

**危险：** 这会禁用浏览器的所有安全机制，包括 CORS、同源策略等。

## 本项目中的 CORS 配置

### 后端配置

```python
# backend/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 开发环境允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 为什么允许所有来源？

**当前配置：**
```python
allow_origins=["*"]  # 允许所有来源
```

**原因：**
- 这是开发环境的配置
- 方便开发和测试
- 不需要每次修改前端地址都更新配置

**生产环境应该：**
```python
allow_origins=[
    "https://yourdomain.com",
    "https://www.yourdomain.com"
]  # 只允许特定域名
```

## 调试 CORS 问题

### 1. 查看浏览器控制台

**常见错误信息：**

```
Access to fetch at 'http://localhost:8000/api/process' from origin 
'http://localhost:3000' has been blocked by CORS policy: No 
'Access-Control-Allow-Origin' header is present on the requested resource.
```

**含义：** 服务器没有返回 `Access-Control-Allow-Origin` 响应头。

```
Access to fetch at 'http://localhost:8000/api/process' from origin 
'http://localhost:3000' has been blocked by CORS policy: The value of 
the 'Access-Control-Allow-Origin' header in the response must not be 
the wildcard '*' when the request's credentials mode is 'include'.
```

**含义：** 使用了 `credentials: 'include'`，但 `Access-Control-Allow-Origin` 是 `*`。

### 2. 查看 Network 标签页

1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签页
3. 查看请求：
   - 如果是预检请求，会看到 OPTIONS 请求
   - 查看响应头，检查 CORS 相关头部

### 3. 检查响应头

**应该看到的响应头：**
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## 总结

### 关键要点

1. **CORS 是浏览器的限制**
   - 不是前端代码的限制
   - 不是后端代码的限制
   - 是浏览器实施的安全机制

2. **限制的对象**
   - 限制的是浏览器中的 JavaScript
   - 防止恶意网站跨域访问用户数据
   - 保护用户安全

3. **解决方案**
   - 后端需要配置 CORS 响应头
   - 告诉浏览器："我允许这个来源访问"
   - 前端代码无法绕过这个限制

4. **请求流程**
   - 跨域请求可以发送到服务器
   - 服务器可以处理请求
   - 但浏览器会阻止 JavaScript 读取响应（如果没有 CORS 头）

### 记忆要点

- **谁限制？** 浏览器
- **限制谁？** JavaScript 代码（读取响应）
- **如何解决？** 后端配置 CORS 响应头
- **为什么？** 保护用户安全

### 类比理解

**CORS 就像门禁系统：**

- **浏览器** = 门禁系统（检查谁可以进入）
- **前端代码** = 访客（想进入大楼）
- **后端服务器** = 大楼管理员（需要授权访客进入）
- **CORS 响应头** = 访客通行证（告诉门禁系统这个人可以进入）

没有通行证（CORS 头），门禁系统（浏览器）不会让访客（前端代码）进入，即使访客已经到了门口（请求已发送）。

