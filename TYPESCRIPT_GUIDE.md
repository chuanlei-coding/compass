# TypeScript 入门指南（面向有编程基础的开发者）

## 前言

本指南面向有编程基础（如 Java、C++、Python 等）但未接触过 JavaScript/TypeScript 的开发者。我们将从编程基础概念出发，重点讲解 JavaScript/TypeScript 的特有概念和语法。

## 目录

1. [JavaScript 基础](#javascript-基础)
2. [TypeScript 基础](#typescript-基础)
3. [HTML 基础](#html-基础)
4. [CSS 基础](#css-基础)
5. [React 基础](#react-基础)
6. [项目中的实际应用](#项目中的实际应用)

---

## JavaScript 基础

### 1. 变量声明

JavaScript 有三种变量声明方式：

```javascript
// var - 传统方式（不推荐）
var oldWay = "不推荐使用";

// let - 可变变量（推荐）
let name = "张三";
name = "李四";  // 可以重新赋值

// const - 常量（推荐）
const PI = 3.14159;
// PI = 3.14;  // 错误：常量不能重新赋值
```

**与其他语言对比：**
- Java: `String name = "张三";` → JavaScript: `let name = "张三";`
- Python: `name = "张三"` → JavaScript: `let name = "张三";`

### 2. 数据类型

JavaScript 是动态类型语言，但 TypeScript 是静态类型。

```javascript
// JavaScript（动态类型）
let value = 42;        // 数字
value = "现在是字符串";  // 可以改变类型

// TypeScript（静态类型）
let value: number = 42;
// value = "字符串";  // 错误：类型不匹配
```

**基本类型：**

```typescript
// 数字
let age: number = 25;
let price: number = 99.99;

// 字符串
let name: string = "张三";
let message: string = `你好，${name}`;  // 模板字符串

// 布尔值
let isActive: boolean = true;
let isDone: boolean = false;

// 数组
let numbers: number[] = [1, 2, 3, 4, 5];
let names: string[] = ["张三", "李四"];

// 对象
let person: { name: string; age: number } = {
  name: "张三",
  age: 25
};

// null 和 undefined
let value1: null = null;
let value2: undefined = undefined;
```

### 3. 函数

#### 函数声明

```typescript
// 方式1：函数声明
function add(a: number, b: number): number {
  return a + b;
}

// 方式2：箭头函数（推荐）
const add = (a: number, b: number): number => {
  return a + b;
};

// 方式3：箭头函数（单行）
const add = (a: number, b: number): number => a + b;

// 调用
const result = add(3, 5);  // result = 8
```

**与其他语言对比：**
- Java: `public int add(int a, int b) { return a + b; }`
- Python: `def add(a: int, b: int) -> int: return a + b`
- TypeScript: `const add = (a: number, b: number): number => a + b`

#### 异步函数（重要！）

JavaScript 大量使用异步操作：

```typescript
// Promise（承诺）
function fetchData(): Promise<string> {
  return new Promise((resolve, reject) => {
    // 模拟异步操作
    setTimeout(() => {
      resolve("数据获取成功");
    }, 1000);
  });
}

// async/await（推荐）
async function getData() {
  try {
    const data = await fetchData();
    console.log(data);
  } catch (error) {
    console.error("错误:", error);
  }
}
```

**类比理解：**
- Promise 就像"承诺书"：我现在给你一个承诺，稍后给你结果
- `await` 就像"等待"：等待承诺完成后再继续
- `async` 标记函数为异步函数

### 4. 对象和类

#### 对象字面量

```typescript
// 创建对象
const person = {
  name: "张三",
  age: 25,
  greet: function() {
    return `你好，我是${this.name}`;
  }
};

// 访问属性
console.log(person.name);        // "张三"
console.log(person["age"]);      // 25
console.log(person.greet());     // "你好，我是张三"
```

#### 类（Class）

```typescript
class Person {
  // 属性
  name: string;
  age: number;

  // 构造函数
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  // 方法
  greet(): string {
    return `你好，我是${this.name}，今年${this.age}岁`;
  }
}

// 使用
const person = new Person("张三", 25);
console.log(person.greet());
```

**与其他语言对比：**
- Java: 类语法非常相似
- Python: `self` → TypeScript: `this`

### 5. 数组操作

```typescript
const numbers = [1, 2, 3, 4, 5];

// map - 转换每个元素
const doubled = numbers.map(n => n * 2);  // [2, 4, 6, 8, 10]

// filter - 过滤元素
const evens = numbers.filter(n => n % 2 === 0);  // [2, 4]

// forEach - 遍历
numbers.forEach(n => console.log(n));

// find - 查找元素
const found = numbers.find(n => n > 3);  // 4

// reduce - 归约
const sum = numbers.reduce((acc, n) => acc + n, 0);  // 15
```

### 6. 解构赋值

```typescript
// 数组解构
const [first, second, third] = [1, 2, 3];
console.log(first);   // 1
console.log(second);  // 2

// 对象解构
const person = { name: "张三", age: 25 };
const { name, age } = person;
console.log(name);  // "张三"
console.log(age);   // 25

// 函数参数解构
function greet({ name, age }: { name: string; age: number }) {
  return `你好，${name}`;
}
```

### 7. 展开运算符

```typescript
// 数组展开
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];  // [1, 2, 3, 4, 5, 6]

// 对象展开
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, ...obj1 };  // { c: 3, a: 1, b: 2 }
```

---

## TypeScript 基础

### 1. 类型系统

TypeScript 的核心是类型系统，提供编译时类型检查。

#### 基本类型注解

```typescript
// 变量类型
let count: number = 0;
let name: string = "张三";
let isActive: boolean = true;

// 函数类型
function multiply(a: number, b: number): number {
  return a * b;
}

// 数组类型
let numbers: number[] = [1, 2, 3];
// 或
let numbers: Array<number> = [1, 2, 3];
```

#### 联合类型

```typescript
// 可以是多种类型之一
let value: string | number;
value = "字符串";  // 可以
value = 42;       // 可以
// value = true;  // 错误
```

#### 可选类型

```typescript
// 属性可选
interface Person {
  name: string;
  age?: number;  // age 是可选的
}

const person1: Person = { name: "张三" };           // 可以
const person2: Person = { name: "李四", age: 25 };  // 可以
```

### 2. 接口（Interface）

接口定义对象的形状：

```typescript
// 定义接口
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;  // 可选属性
}

// 使用接口
const user: User = {
  id: 1,
  name: "张三",
  email: "zhangsan@example.com"
};

// 函数接口
interface Calculator {
  (a: number, b: number): number;
}

const add: Calculator = (a, b) => a + b;
```

**与其他语言对比：**
- Java: 接口概念相同
- C++: 类似抽象类
- Python: 类似 Protocol（类型提示）

### 3. 类型别名（Type）

```typescript
// 类型别名
type ID = number;
type Name = string;

// 联合类型别名
type Status = "active" | "inactive" | "pending";

// 复杂类型别名
type User = {
  id: ID;
  name: Name;
  status: Status;
};
```

### 4. 泛型（Generics）

```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

const num = identity<number>(42);
const str = identity<string>("hello");

// 泛型接口
interface Box<T> {
  value: T;
}

const numberBox: Box<number> = { value: 42 };
const stringBox: Box<string> = { value: "hello" };
```

**类比理解：**
- 就像 Java 的泛型：`List<String>` → TypeScript: `Array<string>`
- 类型参数 `T` 可以是任何类型

### 5. 枚举（Enum）

```typescript
// 数字枚举
enum Direction {
  Up,      // 0
  Down,    // 1
  Left,    // 2
  Right    // 3
}

// 字符串枚举
enum Status {
  Active = "active",
  Inactive = "inactive",
  Pending = "pending"
}

// 使用
const dir = Direction.Up;
const status = Status.Active;
```

### 6. 类型断言

```typescript
// 方式1：as 语法
const value: unknown = "hello";
const str = value as string;

// 方式2：尖括号语法（不推荐，在 JSX 中会冲突）
const str2 = <string>value;

// 非空断言
const element = document.getElementById("myId")!;  // ! 表示确定不为 null
```

---

## HTML 基础

### 1. HTML 结构

HTML（HyperText Markup Language）是网页的结构语言。

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>页面标题</title>
</head>
<body>
    <h1>这是标题</h1>
    <p>这是段落</p>
    <button>点击按钮</button>
</body>
</html>
```

**基本概念：**
- **标签（Tag）**：`<div>`, `<p>`, `<button>` 等
- **元素（Element）**：标签 + 内容
- **属性（Attribute）**：`id="myId"`, `class="myClass"`

### 2. 常用 HTML 标签

```html
<!-- 标题 -->
<h1>一级标题</h1>
<h2>二级标题</h2>

<!-- 段落 -->
<p>这是一个段落</p>

<!-- 链接 -->
<a href="https://example.com">链接文本</a>

<!-- 图片 -->
<img src="image.jpg" alt="图片描述">

<!-- 列表 -->
<ul>
  <li>项目1</li>
  <li>项目2</li>
</ul>

<!-- 输入框 -->
<input type="text" placeholder="输入文本">
<input type="button" value="按钮">

<!-- 容器 -->
<div>块级容器</div>
<span>行内容器</span>
```

### 3. 在 JavaScript 中操作 HTML

```typescript
// 获取元素
const element = document.getElementById("myId");
const elements = document.getElementsByClassName("myClass");

// 修改内容
if (element) {
  element.textContent = "新文本";
  element.innerHTML = "<strong>加粗文本</strong>";
}

// 修改样式
if (element) {
  element.style.color = "red";
  element.style.fontSize = "20px";
}

// 添加事件监听
const button = document.getElementById("myButton");
if (button) {
  button.addEventListener("click", () => {
    console.log("按钮被点击了");
  });
}
```

---

## CSS 基础

### 1. CSS 是什么？

CSS（Cascading Style Sheets）用于美化 HTML 页面。

```css
/* 选择器 { 属性: 值; } */
h1 {
  color: red;
  font-size: 24px;
}

.button {
  background-color: blue;
  color: white;
  padding: 10px 20px;
}
```

### 2. 选择器

```css
/* 标签选择器 */
p { color: black; }

/* 类选择器 */
.my-class { color: blue; }

/* ID选择器 */
#my-id { color: red; }

/* 组合选择器 */
.container .item { margin: 10px; }
```

### 3. 常用 CSS 属性

```css
/* 颜色和背景 */
color: #333333;              /* 文字颜色 */
background-color: #ffffff;    /* 背景颜色 */

/* 字体 */
font-size: 16px;             /* 字号 */
font-weight: bold;           /* 粗体 */
font-family: Arial, sans-serif; /* 字体 */

/* 布局 */
width: 100px;                /* 宽度 */
height: 50px;                 /* 高度 */
margin: 10px;                 /* 外边距 */
padding: 10px;                /* 内边距 */
display: flex;                /* 弹性布局 */
justify-content: center;      /* 水平居中 */
align-items: center;         /* 垂直居中 */

/* 边框 */
border: 1px solid #ccc;      /* 边框 */
border-radius: 4px;          /* 圆角 */
```

### 4. Flexbox 布局（重要）

Flexbox 是现代 CSS 布局的主要方式：

```css
.container {
  display: flex;              /* 启用 flex 布局 */
  flex-direction: row;        /* 方向：横向 */
  justify-content: center;    /* 主轴对齐：居中 */
  align-items: center;        /* 交叉轴对齐：居中 */
  gap: 10px;                  /* 子元素间距 */
}

.item {
  flex: 1;                    /* 自动分配空间 */
}
```

**类比理解：**
- `flex-direction: row` → 横向排列（像一行）
- `flex-direction: column` → 纵向排列（像一列）
- `justify-content` → 控制主轴（主要方向）的对齐
- `align-items` → 控制交叉轴（垂直方向）的对齐

### 5. 在 TypeScript 中使用 CSS

#### 方式1：外部 CSS 文件

```typescript
// 在 TypeScript 中导入
import './styles.css';
```

#### 方式2：内联样式（React 中常用）

```typescript
const style = {
  color: 'red',
  fontSize: '20px',  // 注意：驼峰命名
  backgroundColor: 'blue'
};

<div style={style}>内容</div>
```

---

## React 基础

### 1. 什么是 React？

React 是一个用于构建用户界面的 JavaScript 库。

**核心概念：**
- **组件（Component）**：可复用的 UI 片段
- **JSX**：类似 HTML 的语法，但实际上是 JavaScript
- **状态（State）**：组件的数据
- **属性（Props）**：传递给组件的数据

### 2. 组件

#### 函数组件（推荐）

```typescript
// 简单组件
function Greeting() {
  return <h1>你好，世界！</h1>;
}

// 带属性的组件
interface GreetingProps {
  name: string;
  age: number;
}

function Greeting({ name, age }: GreetingProps) {
  return <h1>你好，{name}，你今年{age}岁</h1>;
}

// 使用
<Greeting name="张三" age={25} />
```

**JSX 语法说明：**
- `{name}` → 插入 JavaScript 表达式
- `age={25}` → 传递数字属性（注意大括号）
- `className` → HTML 的 `class`（因为 class 是 JavaScript 关键字）

#### 类组件（了解即可）

```typescript
class Greeting extends React.Component {
  render() {
    return <h1>你好，世界！</h1>;
  }
}
```

### 3. 状态（State）

状态是组件的数据，改变状态会触发组件重新渲染。

```typescript
import { useState } from 'react';

function Counter() {
  // useState 返回 [当前值, 更新函数]
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
    </div>
  );
}
```

**理解：**
- `useState(0)` → 初始值是 0
- `count` → 当前值
- `setCount` → 更新值的函数
- 调用 `setCount` 会触发组件重新渲染

### 4. 副作用（Effect）

`useEffect` 用于处理副作用（如数据获取、订阅等）。

```typescript
import { useEffect, useState } from 'react';

function DataFetcher() {
  const [data, setData] = useState<string | null>(null);

  // 组件挂载时执行
  useEffect(() => {
    // 模拟数据获取
    setTimeout(() => {
      setData("数据加载完成");
    }, 1000);
  }, []);  // 空数组表示只执行一次

  return <div>{data || "加载中..."}</div>;
}
```

**useEffect 的依赖数组：**
- `[]` → 只在组件挂载时执行一次
- `[count]` → 当 count 改变时执行
- 无依赖 → 每次渲染都执行

### 5. 事件处理

```typescript
function Button() {
  const handleClick = () => {
    console.log("按钮被点击");
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("输入值:", event.target.value);
  };

  return (
    <div>
      <button onClick={handleClick}>点击</button>
      <input onChange={handleChange} />
    </div>
  );
}
```

### 6. 条件渲染

```typescript
function Conditional({ isLoggedIn }: { isLoggedIn: boolean }) {
  // 方式1：if 语句
  if (isLoggedIn) {
    return <div>已登录</div>;
  }
  return <div>未登录</div>;

  // 方式2：三元运算符
  return (
    <div>
      {isLoggedIn ? <span>已登录</span> : <span>未登录</span>}
    </div>
  );

  // 方式3：逻辑与
  return (
    <div>
      {isLoggedIn && <span>已登录</span>}
    </div>
  );
}
```

### 7. 列表渲染

```typescript
function List({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
```

**重要：** `key` 属性帮助 React 识别列表项，应该使用唯一值。

---

## 项目中的实际应用

### 1. 项目中的组件结构

让我们看看项目中的实际代码：

```typescript
// src/taskpane/components/ChatWindow.tsx
export const ChatWindow: React.FC = () => {
  // 状态声明
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 副作用：组件挂载时加载配置
  useEffect(() => {
    const savedKey = localStorage.getItem('ai_api_key');
    if (savedKey) {
      AIService.setApiKey(savedKey);
    }
  }, []);

  // 事件处理函数
  const handleSend = async () => {
    // 异步操作
    const aiResponse = await AIService.processRequest(inputValue, content);
    setMessages([...messages, aiResponse]);
  };

  // JSX 返回
  return (
    <div className="chat-container">
      <div className="chat-header">Word/WPS AI助手</div>
      {/* ... */}
    </div>
  );
};
```

### 2. 类型定义

```typescript
// 定义消息接口
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// 使用接口
const message: Message = {
  id: '1',
  role: 'user',
  content: '你好',
  timestamp: new Date()
};
```

### 3. 服务类

```typescript
// 单例模式的服务类
export class AIService {
  private static apiKey: string | null = null;

  static setApiKey(key: string): void {
    this.apiKey = key;
  }

  static async processRequest(request: string): Promise<AIResponse> {
    // 处理请求
  }
}
```

### 4. 异步操作处理

```typescript
// 在组件中处理异步操作
const handleSend = async () => {
  setIsLoading(true);  // 开始加载
  try {
    const response = await AIService.processRequest(inputValue);
    setMessages([...messages, response]);
  } catch (error) {
    console.error('错误:', error);
    setError('操作失败');
  } finally {
    setIsLoading(false);  // 结束加载
  }
};
```

---

## 常见模式

### 1. 可选链操作符（?.）

```typescript
// 安全访问对象属性
const name = person?.name;  // 如果 person 为 null/undefined，返回 undefined
const length = array?.length;  // 如果 array 为 null/undefined，返回 undefined

// 等价于
const name = person ? person.name : undefined;
```

### 2. 空值合并操作符（??）

```typescript
// 如果左侧为 null/undefined，使用右侧值
const name = user.name ?? "匿名";  // 如果 name 为 null/undefined，使用 "匿名"

// 等价于
const name = user.name ? user.name : "匿名";
```

### 3. 模板字符串

```typescript
const name = "张三";
const age = 25;

// 传统方式
const message = "你好，我是" + name + "，今年" + age + "岁";

// 模板字符串（推荐）
const message = `你好，我是${name}，今年${age}岁`;
```

### 4. 箭头函数 vs 普通函数

```typescript
// 普通函数
function add(a: number, b: number): number {
  return a + b;
}

// 箭头函数
const add = (a: number, b: number): number => {
  return a + b;
};

// 箭头函数（单行）
const add = (a: number, b: number): number => a + b;

// this 的区别
const obj = {
  name: "对象",
  // 普通函数：this 指向 obj
  greet: function() {
    return `我是${this.name}`;
  },
  // 箭头函数：this 继承外层作用域
  greetArrow: () => {
    // this 不是 obj
    return "箭头函数";
  }
};
```

---

## 学习路径建议

### 第一阶段：基础语法（1-2周）

1. **JavaScript 基础**
   - 变量、数据类型
   - 函数、对象、数组
   - 异步操作（Promise、async/await）

2. **TypeScript 基础**
   - 类型系统
   - 接口和类型别名
   - 泛型

### 第二阶段：Web 基础（1周）

1. **HTML**
   - 基本标签
   - 表单元素
   - DOM 操作

2. **CSS**
   - 选择器
   - 布局（Flexbox）
   - 响应式设计基础

### 第三阶段：React（2-3周）

1. **React 基础**
   - 组件、Props、State
   - 事件处理
   - 条件渲染、列表渲染

2. **React Hooks**
   - useState
   - useEffect
   - useRef

### 第四阶段：项目实践

1. **阅读项目代码**
   - 理解组件结构
   - 理解数据流
   - 理解异步操作

2. **修改和扩展**
   - 添加新功能
   - 修改现有功能
   - 优化代码

---

## 快速参考

### TypeScript 类型速查

```typescript
// 基本类型
let num: number = 42;
let str: string = "hello";
let bool: boolean = true;
let arr: number[] = [1, 2, 3];
let obj: { a: number; b: string } = { a: 1, b: "hello" };

// 函数类型
let fn: (a: number) => number = (a) => a * 2;

// 可选和只读
interface User {
  readonly id: number;    // 只读
  name: string;
  age?: number;          // 可选
}

// 联合类型
let value: string | number;

// 泛型
function identity<T>(arg: T): T { return arg; }
```

### React Hooks 速查

```typescript
// useState - 状态
const [state, setState] = useState(initialValue);

// useEffect - 副作用
useEffect(() => {
  // 副作用代码
}, [dependencies]);

// useRef - 引用
const ref = useRef<HTMLDivElement>(null);
```

### 常用数组方法

```typescript
// map - 转换
arr.map(x => x * 2)

// filter - 过滤
arr.filter(x => x > 0)

// find - 查找
arr.find(x => x > 5)

// forEach - 遍历
arr.forEach(x => console.log(x))

// reduce - 归约
arr.reduce((acc, x) => acc + x, 0)
```

---

## 常见错误和解决方案

### 错误1：类型不匹配

```typescript
// ❌ 错误
let count: number = "42";

// ✅ 正确
let count: number = 42;
```

### 错误2：访问可能为 null 的属性

```typescript
// ❌ 错误
const element = document.getElementById("myId");
element.textContent = "文本";  // element 可能为 null

// ✅ 正确
const element = document.getElementById("myId");
if (element) {
  element.textContent = "文本";
}

// ✅ 或使用可选链
element?.textContent = "文本";
```

### 错误3：忘记 await

```typescript
// ❌ 错误
const data = fetchData();  // 返回 Promise，不是实际数据
console.log(data);  // Promise 对象

// ✅ 正确
const data = await fetchData();  // 等待 Promise 完成
console.log(data);  // 实际数据
```

### 错误4：在 useEffect 中缺少依赖

```typescript
// ❌ 错误：缺少 count 依赖
useEffect(() => {
  console.log(count);
}, []);  // 空数组，不会在 count 改变时执行

// ✅ 正确
useEffect(() => {
  console.log(count);
}, [count]);  // 包含 count 依赖
```

---

## 学习资源

### 官方文档
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [React 官方文档](https://react.dev/)
- [MDN Web 文档](https://developer.mozilla.org/)

### 在线练习
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [CodeSandbox](https://codesandbox.io/) - 在线代码编辑器

### 推荐阅读顺序
1. TypeScript 官方文档的"Handbook"
2. React 官方文档的"Learn React"
3. 阅读项目代码，理解实际应用

---

## 总结

作为有编程基础的开发者，您需要重点关注：

1. **JavaScript 特有概念**
   - 异步编程（Promise、async/await）
   - 闭包和作用域
   - this 绑定

2. **TypeScript 类型系统**
   - 类型注解
   - 接口和类型别名
   - 泛型

3. **React 概念**
   - 组件化思维
   - 状态管理
   - 生命周期（Hooks）

4. **Web 基础**
   - HTML 结构
   - CSS 布局（特别是 Flexbox）
   - DOM 操作

**关键建议：**
- 多写代码，多实践
- 阅读项目代码，理解实际应用
- 遇到问题查文档，看示例
- 逐步深入，不要急于求成

祝您学习顺利！

