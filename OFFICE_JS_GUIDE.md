# Office.js 完整指南

## 什么是 Office.js？

Office.js 是微软提供的 JavaScript API 库，用于开发 Office 插件（Add-ins）。它允许您通过 Web 技术（HTML、CSS、JavaScript）来扩展 Microsoft Office 应用的功能。

### 简单理解

想象一下：
- **Office 应用**（Word、Excel、PowerPoint等）是一栋大楼
- **Office.js** 是进入这栋大楼的"钥匙"和"工具"
- **您的插件**是您想要在大楼里做的事情

通过 Office.js，您可以在 Word 中读取文档内容、修改文本、格式化等，就像您在 Word 界面中手动操作一样，但是通过代码自动完成。

## 为什么使用 Office.js？

### 传统方式 vs Office.js

**传统方式（VBA宏）：**
- 只能在 Windows 上运行
- 代码复杂，难以维护
- 不支持跨平台

**Office.js（现代插件）：**
- ✅ 跨平台（Windows、Mac、Web）
- ✅ 使用现代 Web 技术（HTML、CSS、JavaScript）
- ✅ 易于开发和维护
- ✅ 可以在 Office 365 和本地 Office 中运行
- ✅ 支持云端部署

## 核心概念

### 1. Office.js Runtime（运行时）

Office.js Runtime 是 Office 应用内置的 JavaScript 引擎，负责：
- 加载和执行您的插件代码
- 提供 Office API 访问
- 管理插件生命周期

**类比**：就像浏览器中的 JavaScript 引擎（V8），但是专门为 Office 应用设计的。

### 2. Host（宿主应用）

Host 是指运行插件的 Office 应用，例如：
- **Word** - 文字处理
- **Excel** - 电子表格
- **PowerPoint** - 演示文稿
- **Outlook** - 邮件客户端

### 3. Manifest（清单文件）

Manifest 是一个 XML 文件，告诉 Office：
- 插件叫什么名字
- 插件在哪里（URL）
- 插件需要什么权限
- 插件在哪个 Office 应用中运行

**类比**：就像应用的"身份证"，Office 通过它来识别和加载插件。

### 4. TaskPane（任务窗格）

TaskPane 是插件显示的主要界面，通常显示在 Office 应用的右侧。

**类比**：就像浏览器中的侧边栏，但是嵌入在 Office 应用中。

## Office.js 基本结构

### 1. 初始化

在使用 Office.js API 之前，必须先等待 Office 环境准备就绪：

```javascript
Office.onReady((info) => {
  // Office 环境已准备好
  // info.host 告诉您当前是哪个 Office 应用
  // info.platform 告诉您运行平台（桌面、Web等）
  
  if (info.host === Office.HostType.Word) {
    // 在 Word 中运行
    console.log('当前在 Word 中');
  }
});
```

**为什么需要等待？**
- Office 应用需要时间加载
- API 需要初始化
- 确保所有功能可用后再执行代码

### 2. Request-Response 模式

Office.js 使用特殊的请求-响应模式：

```javascript
Word.run(async (context) => {
  // 1. 请求阶段：告诉 Office 您要做什么
  const body = context.document.body;
  body.load('text');  // 请求加载文本内容
  
  // 2. 同步阶段：执行请求
  await context.sync();
  
  // 3. 响应阶段：使用结果
  console.log(body.text);  // 现在可以访问文本了
});
```

**为什么需要 context.sync()？**
- Office.js 使用批量处理优化性能
- 所有请求先收集，然后一次性执行
- `context.sync()` 告诉 Office："现在执行我收集的所有请求"

**类比**：就像点餐：
1. 先看菜单，决定要什么（请求阶段）
2. 告诉服务员（sync）
3. 等待上菜（响应阶段）

## Word API 详解

### 1. 文档对象模型（DOM）

Word 文档的结构就像 HTML DOM：

```
Document（文档）
  └── Body（正文）
      ├── Paragraph（段落）
      │   └── Text（文本）
      └── Table（表格）
          └── Row（行）
              └── Cell（单元格）
```

### 2. 读取文档内容

```javascript
Word.run(async (context) => {
  // 获取文档正文
  const body = context.document.body;
  
  // 请求加载文本属性
  body.load('text');
  
  // 同步执行
  await context.sync();
  
  // 现在可以访问文本了
  console.log('文档内容:', body.text);
});
```

**关键点：**
- 必须先 `load()` 要使用的属性
- 必须 `await context.sync()` 后才能访问
- 只能访问已加载的属性

### 3. 修改文档内容

#### 插入文本

```javascript
Word.run(async (context) => {
  const body = context.document.body;
  
  // 在文档末尾插入文本
  body.insertText('这是新添加的文本', Word.InsertLocation.end);
  
  await context.sync();
});
```

#### 替换文本

```javascript
Word.run(async (context) => {
  const body = context.document.body;
  
  // 搜索文本
  const searchResults = body.search('旧文本', { matchCase: false });
  searchResults.load('items');
  await context.sync();
  
  // 替换所有匹配的文本
  searchResults.items.forEach((result) => {
    result.insertText('新文本', Word.InsertLocation.replace);
  });
  
  await context.sync();
});
```

#### 格式化文本

```javascript
Word.run(async (context) => {
  const body = context.document.body;
  
  // 搜索要格式化的文本
  const searchResults = body.search('要加粗的文本');
  searchResults.load('items');
  await context.sync();
  
  // 格式化
  searchResults.items.forEach((result) => {
    result.font.bold = true;      // 加粗
    result.font.italic = true;    // 斜体
    result.font.size = 16;         // 字号
    result.font.color = 'red';    // 颜色
  });
  
  await context.sync();
});
```

### 4. 插入位置（InsertLocation）

```javascript
Word.InsertLocation.start    // 在开头插入
Word.InsertLocation.end      // 在末尾插入
Word.InsertLocation.before   // 在之前插入
Word.InsertLocation.after    // 在之后插入
Word.InsertLocation.replace  // 替换
```

## 常见操作示例

### 示例1：获取文档内容

```javascript
async function getDocumentText() {
  return new Promise((resolve, reject) => {
    Word.run(async (context) => {
      try {
        const body = context.document.body;
        body.load('text');
        await context.sync();
        resolve(body.text);
      } catch (error) {
        reject(error);
      }
    });
  });
}

// 使用
const text = await getDocumentText();
console.log(text);
```

### 示例2：在文档末尾添加段落

```javascript
async function addParagraph(text) {
  return new Promise((resolve, reject) => {
    Word.run(async (context) => {
      try {
        const body = context.document.body;
        const paragraph = body.insertParagraph(text, Word.InsertLocation.end);
        await context.sync();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

// 使用
await addParagraph('这是新段落');
```

### 示例3：查找并替换所有匹配文本

```javascript
async function replaceAll(searchText, replaceText) {
  return new Promise((resolve, reject) => {
    Word.run(async (context) => {
      try {
        const body = context.document.body;
        const searchResults = body.search(searchText, { matchCase: false });
        searchResults.load('items');
        await context.sync();
        
        searchResults.items.forEach((result) => {
          result.insertText(replaceText, Word.InsertLocation.replace);
        });
        
        await context.sync();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

// 使用
await replaceAll('旧文本', '新文本');
```

### 示例4：格式化特定文本

```javascript
async function formatText(searchText, format) {
  return new Promise((resolve, reject) => {
    Word.run(async (context) => {
      try {
        const body = context.document.body;
        const searchResults = body.search(searchText);
        searchResults.load('items');
        await context.sync();
        
        searchResults.items.forEach((result) => {
          const font = result.font;
          if (format.bold !== undefined) font.bold = format.bold;
          if (format.italic !== undefined) font.italic = format.italic;
          if (format.size) font.size = format.size;
          if (format.color) font.color = format.color;
        });
        
        await context.sync();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

// 使用
await formatText('标题', {
  bold: true,
  size: 18,
  color: 'blue'
});
```

## 重要概念详解

### 1. Context（上下文）

`context` 是 `Word.run()` 回调函数的参数，代表当前的操作上下文。

**作用：**
- 管理所有请求
- 提供文档访问
- 执行同步操作

**特点：**
- 每个 `Word.run()` 调用都有独立的 context
- context 不能跨 `Word.run()` 使用
- context 中的对象在 sync 前不能直接访问属性值

### 2. Load（加载）- 核心概念详解

`load()` 是 Office.js 中最核心的概念之一。它告诉 Office："我准备要使用这个对象的某些属性，请为我准备好"。

#### 什么是"属性"（Property）？

在理解 `load()` 之前，我们需要先理解什么是"属性"。

**属性是对象的数据成员**，用于存储对象的状态信息。就像现实中的物体有各种特征一样。

**类比理解：**

想象一个"人"对象：

```javascript
// 一个"人"对象有很多属性
const person = {
  name: "张三",        // name 是属性，值是 "张三"
  age: 25,            // age 是属性，值是 25
  height: 175,        // height 是属性，值是 175
  weight: 70          // weight 是属性，值是 70
};

// 访问属性
console.log(person.name);    // "张三"
console.log(person.age);     // 25
```

**在 Office.js 中：**

Word 文档对象也有各种属性：

```javascript
const body = context.document.body;

// body 对象有很多属性，例如：
body.text         // 属性：文档的文本内容
body.paragraphs   // 属性：文档的段落集合
body.tables       // 属性：文档的表格集合
body.font         // 属性：默认字体设置
```

**属性的特点：**

1. **属性可以存储数据**
   - `body.text` → 存储文档的文本内容（字符串）
   - `body.paragraphs` → 存储段落集合（数组）

2. **属性可以包含对象**
   - `body.font` → 是一个字体对象，它自己也有属性（如 `font.size`, `font.color`）

3. **属性需要加载才能访问**
   - 在 Office.js 中，属性不是自动可用的
   - 必须先用 `load()` 告诉 Office："我需要这个属性"
   - 然后调用 `sync()` 才能真正获取数据

**与其他语言的对比：**

```java
// Java：属性通常直接可用
class Person {
    private String name;  // 属性
    public String getName() {
        return name;      // 直接访问
    }
}
```

```typescript
// TypeScript/JavaScript：一般属性也是直接可用
const person = {
    name: "张三"  // 属性
};
console.log(person.name);  // 直接访问 ✅
```

```typescript
// Office.js：属性需要先加载
const body = context.document.body;
body.load('text');      // 必须先"预约"属性
await context.sync();   // 然后"获取"数据
console.log(body.text); // 现在才能访问 ✅
```

**为什么 Office.js 的属性需要 load？**

这是因为 Office.js 使用**代理模式**：
- 您的代码在浏览器中运行
- Office 应用在另一个进程中运行
- 数据需要通过网络传递
- 为了性能，不能自动加载所有属性
- 所以需要您明确告诉 Office："我需要哪些属性"

**属性 vs 方法：**

```javascript
const body = context.document.body;

// 属性：存储数据（需要 load）
body.text           // 属性：文本内容
body.paragraphs     // 属性：段落集合

// 方法：执行操作（不需要 load）
body.insertText(...)     // 方法：插入文本
body.insertParagraph(...) // 方法：插入段落
```

**总结：**
- **属性** = 对象的特征/数据（如文本、段落、格式等）
- **方法** = 对象的行为/操作（如插入、删除、格式化等）
- 在 Office.js 中，**访问属性需要先 load**，但**调用方法不需要 load**

#### 什么是 Load？

`load()` 是一个方法，用于"预约"加载对象的属性。它不是立即获取数据，而是告诉 Office："我稍后会需要这些属性，请准备好"。

**重要理解：**
- `load()` **不是立即获取数据**
- `load()` 是"预约"属性，告诉 Office 需要准备什么
- 只有在调用 `context.sync()` 后，数据才会真正从 Office 传递到您的代码中

#### 为什么需要 load？

##### 1. 性能优化 - 按需加载

```javascript
// ❌ 不好的做法：加载所有属性（假设 Office 这样做）
const body = context.document.body;
// 如果自动加载所有属性，Office 需要：
// - 读取文本内容（可能很大）
// - 读取所有段落信息
// - 读取所有格式信息
// - 读取所有样式信息
// ... 这会非常慢！

// ✅ 好的做法：只加载需要的
const body = context.document.body;
body.load('text');  // 只加载文本，其他都不加载
await context.sync();
console.log(body.text);  // 只传输了文本数据
```

**类比：**
想象您在一家餐厅点餐：
- **没有 load**：服务员把整个菜单上的所有菜都端上来（太慢！）
- **有 load**：您告诉服务员只要"宫保鸡丁"（快！）

##### 2. 批量操作优化

```javascript
Word.run(async (context) => {
  // 收集多个 load 请求
  const body = context.document.body;
  body.load('text');
  
  const paragraphs = body.paragraphs;
  paragraphs.load('items/text');  // 加载所有段落的文本
  
  // 一次性执行所有加载请求
  await context.sync();  // 批量传输，更高效
  
  // 现在所有数据都可用
  console.log(body.text);
  console.log(paragraphs.items.length);
});
```

##### 3. 减少内存占用

只加载需要的属性，可以显著减少内存使用，特别是处理大文档时。

#### Load 的语法

##### 基本用法

```javascript
// 加载单个属性
object.load('propertyName');

// 加载多个属性
object.load(['property1', 'property2', 'property3']);
// 或者用逗号分隔的字符串
object.load('property1,property2,property3');
```

##### 示例：加载单个属性

```javascript
Word.run(async (context) => {
  const body = context.document.body;
  body.load('text');        // 只加载 text 属性
  await context.sync();
  console.log(body.text);   // ✅ 可以访问
  // console.log(body.paragraphs);  // ❌ undefined！没有加载
});
```

##### 示例：加载多个属性

```javascript
Word.run(async (context) => {
  const body = context.document.body;
  body.load('text,paragraphs');  // 加载 text 和 paragraphs
  await context.sync();
  console.log(body.text);        // ✅ 可以访问
  console.log(body.paragraphs);  // ✅ 可以访问
});
```

##### 示例：加载集合的属性

```javascript
Word.run(async (context) => {
  const body = context.document.body;
  const paragraphs = body.paragraphs;
  
  // 加载集合本身（获得 items 数组）
  paragraphs.load('items');
  await context.sync();
  
  // 现在 paragraphs.items 可用，但每个 item 的属性还未加载
  // 如果需要访问每个段落的属性，需要再次加载
  paragraphs.items.forEach(p => {
    p.load('text');
  });
  await context.sync();
  
  // 现在可以访问每个段落的文本
  paragraphs.items.forEach(p => {
    console.log(p.text);
  });
});
```

##### 示例：嵌套属性加载

```javascript
Word.run(async (context) => {
  const body = context.document.body;
  const paragraphs = body.paragraphs;
  
  // 使用斜杠加载嵌套属性：加载所有段落的文本
  paragraphs.load('items/text');
  await context.sync();
  
  // 现在可以直接访问所有段落的文本
  paragraphs.items.forEach(p => {
    console.log(p.text);  // ✅ 可以直接访问
  });
});
```

#### 搜索结果的 Load

搜索操作返回的是一个集合，需要特别处理：

```javascript
Word.run(async (context) => {
  const body = context.document.body;
  
  // 搜索文本
  const searchResults = body.search('要查找的文本');
  
  // 搜索返回的是一个 SearchResultCollection 对象
  // 需要加载 'items' 属性才能获得实际的搜索结果数组
  searchResults.load('items');  // 这一步是关键！
  await context.sync();
  
  // 现在 searchResults.items 是一个数组，包含所有匹配的 Range 对象
  searchResults.items.forEach((result) => {
    // result 是一个 Range 对象
    // 如果需要访问 result 的属性，也需要加载
    result.load('text');
  });
  await context.sync();
  
  // 现在可以访问每个结果的文本
  searchResults.items.forEach((result) => {
    console.log(result.text);
  });
});
```

#### 常见 Load 模式

##### 模式1：简单属性加载

```javascript
// 读取文档文本
const body = context.document.body;
body.load('text');
await context.sync();
console.log(body.text);
```

##### 模式2：集合加载

```javascript
// 获取所有段落
const paragraphs = context.document.body.paragraphs;
paragraphs.load('items');
await context.sync();

// 遍历段落（如果需要访问属性，需要再次加载）
paragraphs.items.forEach(p => {
  p.load('text');
});
await context.sync();

paragraphs.items.forEach(p => {
  console.log(p.text);
});
```

##### 模式3：嵌套属性加载

```javascript
// 一次性加载集合中所有项的属性
const paragraphs = context.document.body.paragraphs;
paragraphs.load('items/text');  // 加载所有段落的文本
await context.sync();

paragraphs.items.forEach(p => {
  console.log(p.text);  // 可以直接使用
});
```

##### 模式4：搜索结果加载

```javascript
// 搜索并加载结果
const searchResults = context.document.body.search('关键词');
searchResults.load('items');
await context.sync();

// 遍历结果
searchResults.items.forEach(result => {
  // 如果需要操作结果，通常不需要再次加载
  // 因为操作（如插入文本）不需要读取属性
  result.insertText('新文本', Word.InsertLocation.replace);
});
await context.sync();
```

#### Load 的执行流程

```javascript
Word.run(async (context) => {
  // 步骤1：创建对象引用
  const body = context.document.body;
  // 此时 body 只是一个"引用"，不是真实数据
  
  // 步骤2：使用 load 预约属性
  body.load('text');
  // 此时只是"登记"了需求，数据还没有获取
  
  // 步骤3：同步执行
  await context.sync();
  // 这一步才是真正去 Office 获取数据
  // Office 看到 load 请求，准备数据，然后传输过来
  
  // 步骤4：使用数据
  console.log(body.text);
  // 现在 body.text 是真实的数据了
});
```

#### 常见错误

##### 错误1：忘记 load

```javascript
// ❌ 错误
Word.run(async (context) => {
  const body = context.document.body;
  await context.sync();
  console.log(body.text);  // undefined！因为没有 load
});

// ✅ 正确
Word.run(async (context) => {
  const body = context.document.body;
  body.load('text');       // 先 load
  await context.sync();
  console.log(body.text);  // ✅ 正常
});
```

##### 错误2：在 sync 之前访问

```javascript
// ❌ 错误
Word.run(async (context) => {
  const body = context.document.body;
  body.load('text');
  console.log(body.text);  // undefined！还没有 sync
  await context.sync();
});

// ✅ 正确
Word.run(async (context) => {
  const body = context.document.body;
  body.load('text');
  await context.sync();    // 先 sync
  console.log(body.text);  // ✅ 正常
});
```

##### 错误3：加载集合忘记加载 items

```javascript
// ❌ 错误
Word.run(async (context) => {
  const paragraphs = context.document.body.paragraphs;
  paragraphs.load('text');  // 错误：paragraphs 是集合，没有 text 属性
  await context.sync();
  // paragraphs.items 是 undefined
});

// ✅ 正确
Word.run(async (context) => {
  const paragraphs = context.document.body.paragraphs;
  paragraphs.load('items');  // 加载 items 属性
  await context.sync();
  // paragraphs.items 现在是一个数组
});
```

##### 错误4：加载搜索结果忘记 items

```javascript
// ❌ 错误
Word.run(async (context) => {
  const searchResults = context.document.body.search('文本');
  // 忘记 load('items')
  await context.sync();
  // searchResults.items 是 undefined
  searchResults.items.forEach(...);  // 错误！
});

// ✅ 正确
Word.run(async (context) => {
  const searchResults = context.document.body.search('文本');
  searchResults.load('items');  // 必须加载 items
  await context.sync();
  searchResults.items.forEach(...);  // ✅ 正常
});
```

#### Load 与其他语言/API 的对比

##### 传统 API（如 JDBC）

```java
// 传统方式：立即执行查询，立即返回所有数据
ResultSet rs = statement.executeQuery("SELECT * FROM users");
while (rs.next()) {
    String name = rs.getString("name");  // 立即获取
}
```

##### Office.js 方式

```javascript
// Office.js：先"预约"，再批量获取
const users = context.database.users;
users.load('items/name,items/email');  // 预约需要的属性
await context.sync();                   // 批量获取
users.items.forEach(user => {
    console.log(user.name);             // 使用数据
});
```

**优势：**
- 批量操作，减少往返次数
- 按需加载，只获取需要的属性
- 性能更好，特别是在处理大量数据时

#### Load 的最佳实践

##### 1. 批量加载，减少 sync 次数

```javascript
// ❌ 性能差：多次 sync
Word.run(async (context) => {
  const body = context.document.body;
  body.load('text');
  await context.sync();
  
  const paragraphs = body.paragraphs;
  paragraphs.load('items');
  await context.sync();
});

// ✅ 性能好：一次 sync
Word.run(async (context) => {
  const body = context.document.body;
  body.load('text');
  
  const paragraphs = body.paragraphs;
  paragraphs.load('items');
  
  await context.sync();  // 只 sync 一次
});
```

##### 2. 只加载需要的属性

```javascript
// ❌ 加载不需要的属性
body.load('text,paragraphs,tables,sections,contentControls');
// 如果只需要 text，上面的加载会很慢

// ✅ 只加载需要的
body.load('text');
```

##### 3. 使用嵌套属性语法加载集合项

```javascript
// ❌ 需要两次 sync
paragraphs.load('items');
await context.sync();
paragraphs.items.forEach(p => p.load('text'));
await context.sync();

// ✅ 一次 sync
paragraphs.load('items/text');
await context.sync();
```

#### 总结

`load()` 是 Office.js 的核心机制：

1. **作用**：预约加载属性，告诉 Office 需要准备什么数据
2. **执行时机**：必须在 `context.sync()` 之前调用
3. **数据可用时机**：在 `context.sync()` 之后
4. **性能影响**：正确使用可以大幅提升性能
5. **常见用法**：
   - 简单属性：`object.load('property')`
   - 多个属性：`object.load('prop1,prop2')`
   - 集合：`collection.load('items')`
   - 嵌套属性：`collection.load('items/property')`

记住：**先 load，再 sync，后使用！**

### 3. Sync（同步）

`context.sync()` 是执行所有请求的"开关"：

```javascript
Word.run(async (context) => {
  // 收集多个请求
  const body = context.document.body;
  body.load('text');
  
  const paragraphs = body.paragraphs;
  paragraphs.load('items');
  
  // 一次性执行所有请求
  await context.sync();
  
  // 现在所有数据都可用
  console.log(body.text);
  console.log(paragraphs.items.length);
});
```

**最佳实践：**
- 尽量批量收集请求，然后一次性 sync
- 避免多次 sync（性能差）
- 在需要数据之前再 sync

### 4. 对象类型

Office.js 中的对象分为两类：

#### 客户端对象（Client Objects）
- 在您的代码中创建
- 需要通过 context 访问
- 需要 load 和 sync

```javascript
const body = context.document.body;  // 客户端对象
body.load('text');
await context.sync();
```

#### 代理对象（Proxy Objects）
- 代表 Office 中的实际对象
- 在 sync 后可以访问属性值

```javascript
// body 是客户端对象
// body.text 在 sync 后是代理对象（字符串值）
```

## 错误处理

### 常见错误类型

#### 1. 未加载属性错误

```javascript
// ❌ 错误
const body = context.document.body;
console.log(body.text);  // 错误：属性未加载

// ✅ 正确
const body = context.document.body;
body.load('text');
await context.sync();
console.log(body.text);
```

#### 2. 跨 Context 使用错误

```javascript
// ❌ 错误
let savedBody;
Word.run(async (context) => {
  savedBody = context.document.body;
});
// 在另一个 context 中使用
Word.run(async (context) => {
  savedBody.load('text');  // 错误：不能跨 context 使用
});

// ✅ 正确
Word.run(async (context) => {
  const body = context.document.body;
  body.load('text');
  await context.sync();
  // 在这个 context 中使用
});
```

#### 3. 权限错误

```javascript
// 如果插件没有写入权限
Word.run(async (context) => {
  const body = context.document.body;
  body.insertText('文本', Word.InsertLocation.end);
  await context.sync();  // 可能抛出权限错误
});
```

### 错误处理最佳实践

```javascript
Word.run(async (context) => {
  try {
    const body = context.document.body;
    body.load('text');
    await context.sync();
    console.log(body.text);
  } catch (error) {
    console.error('操作失败:', error);
    // 处理错误
  }
});
```

## 性能优化

### 1. 批量操作

```javascript
// ❌ 性能差：多次 sync
Word.run(async (context) => {
  for (let i = 0; i < 10; i++) {
    context.document.body.insertText(`文本${i}`, Word.InsertLocation.end);
    await context.sync();  // 每次循环都 sync
  }
});

// ✅ 性能好：批量 sync
Word.run(async (context) => {
  for (let i = 0; i < 10; i++) {
    context.document.body.insertText(`文本${i}`, Word.InsertLocation.end);
  }
  await context.sync();  // 只 sync 一次
});
```

### 2. 只加载需要的属性

```javascript
// ❌ 加载不需要的属性
body.load('text,font,paragraphs');  // 如果只需要 text

// ✅ 只加载需要的
body.load('text');
```

### 3. 使用集合操作

```javascript
// ❌ 逐个处理
const paragraphs = body.paragraphs;
paragraphs.load('items');
await context.sync();
paragraphs.items.forEach(p => {
  p.load('text');
});
await context.sync();

// ✅ 批量加载
const paragraphs = body.paragraphs;
paragraphs.load('items/text');  // 一次性加载所有段落的文本
await context.sync();
```

## 权限和安全性

### 权限级别

在 manifest.xml 中定义：

```xml
<Permissions>ReadWriteDocument</Permissions>
```

**权限类型：**
- `ReadDocument` - 只读
- `ReadWriteDocument` - 读写
- `ReadWriteMailbox` - 邮件读写（Outlook）

### 安全考虑

1. **HTTPS 要求**
   - 所有插件必须通过 HTTPS 提供服务
   - 开发环境可以使用自签名证书

2. **内容安全策略**
   - Office 会验证插件来源
   - 限制外部资源加载

3. **API 限制**
   - 某些操作需要用户权限
   - 敏感操作需要用户确认

## 调试技巧

### 1. 使用控制台

```javascript
Word.run(async (context) => {
  const body = context.document.body;
  body.load('text');
  await context.sync();
  
  console.log('文档内容:', body.text);
  console.log('文档对象:', body);
});
```

### 2. 检查对象状态

```javascript
Word.run(async (context) => {
  const body = context.document.body;
  console.log('加载前:', body.isNullObject);  // true
  
  body.load('text');
  await context.sync();
  
  console.log('加载后:', body.isNullObject);  // false
  console.log('文本:', body.text);
});
```

### 3. 错误追踪

```javascript
Word.run(async (context) => {
  try {
    // 您的代码
  } catch (error) {
    console.error('错误类型:', error.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('错误代码:', error.code);
  }
});
```

## 常见问题解答

### Q1: 为什么我的代码不工作？

**可能原因：**
1. 没有等待 `Office.onReady()`
2. 没有调用 `context.sync()`
3. 没有加载属性就访问
4. 权限不足

**检查清单：**
- ✅ 是否在 `Office.onReady()` 回调中？
- ✅ 是否调用了 `await context.sync()`？
- ✅ 是否加载了要访问的属性？
- ✅ manifest.xml 中的权限是否正确？

### Q2: 为什么 sync 很慢？

**可能原因：**
- 加载了太多属性
- 执行了太多操作
- 文档很大

**优化方法：**
- 只加载需要的属性
- 批量操作，减少 sync 次数
- 使用集合操作

### Q3: 可以在浏览器中测试吗？

**答案：**
- 部分功能可以在浏览器中测试 UI
- 但 Office.js API 只能在 Office 环境中运行
- 建议在 Word/WPS 中测试完整功能

### Q4: 如何知道 API 是否可用？

```javascript
if (typeof Word !== 'undefined') {
  // Word API 可用
  Word.run(async (context) => {
    // 使用 Word API
  });
} else {
  console.warn('Word API 不可用');
}
```

### Q5: 如何处理异步操作？

```javascript
// 使用 Promise
function getDocumentText() {
  return new Promise((resolve, reject) => {
    Word.run(async (context) => {
      try {
        const body = context.document.body;
        body.load('text');
        await context.sync();
        resolve(body.text);
      } catch (error) {
        reject(error);
      }
    });
  });
}

// 使用 async/await
async function processDocument() {
  const text = await getDocumentText();
  console.log(text);
}
```

## 最佳实践

### 1. 代码组织

```javascript
// ✅ 好的实践：封装成函数
async function getDocumentContent() {
  return new Promise((resolve, reject) => {
    Word.run(async (context) => {
      try {
        const body = context.document.body;
        body.load('text');
        await context.sync();
        resolve(body.text);
      } catch (error) {
        reject(error);
      }
    });
  });
}

// ❌ 不好的实践：直接在组件中写
Word.run(async (context) => {
  // 大量代码混在一起
});
```

### 2. 错误处理

```javascript
// ✅ 好的实践：完整的错误处理
async function safeOperation() {
  try {
    return await Word.run(async (context) => {
      // 操作
    });
  } catch (error) {
    console.error('操作失败:', error);
    // 用户友好的错误提示
    throw new Error('无法完成操作，请重试');
  }
}
```

### 3. 性能优化

```javascript
// ✅ 批量操作
Word.run(async (context) => {
  // 收集所有操作
  const body = context.document.body;
  body.insertText('文本1', Word.InsertLocation.end);
  body.insertText('文本2', Word.InsertLocation.end);
  body.insertText('文本3', Word.InsertLocation.end);
  
  // 一次性执行
  await context.sync();
});
```

### 4. 类型安全

```typescript
// 使用 TypeScript 获得类型提示
Word.run(async (context: Word.RequestContext) => {
  const body: Word.Body = context.document.body;
  body.load('text');
  await context.sync();
  const text: string = body.text;
});
```

## 学习资源

### 官方文档
- [Office Add-ins 文档](https://docs.microsoft.com/office/dev/add-ins/)
- [Word API 参考](https://docs.microsoft.com/javascript/api/word)
- [Office.js API 参考](https://docs.microsoft.com/javascript/api/office)

### 示例代码
- [Office Add-ins 示例](https://github.com/OfficeDev/Office-Add-in-samples)
- [Word Add-in 示例](https://github.com/OfficeDev/Word-Add-in-JavaScript-Speak)

### 工具
- [Office Add-in 清单验证工具](https://www.npmjs.com/package/office-addin-manifest)
- [Office Add-in 开发证书工具](https://www.npmjs.com/package/office-addin-dev-certs)

## 总结

Office.js 是开发 Office 插件的强大工具：

1. **简单易用** - 使用熟悉的 JavaScript/TypeScript
2. **功能强大** - 可以访问 Office 文档的所有功能
3. **跨平台** - 支持 Windows、Mac、Web
4. **现代技术** - 使用 Web 标准技术

**关键要点：**
- ✅ 总是等待 `Office.onReady()`
- ✅ 使用 `load()` 加载属性
- ✅ 使用 `context.sync()` 执行操作
- ✅ 批量操作以提高性能
- ✅ 处理错误情况

希望这份指南能帮助您更好地理解和使用 Office.js！

