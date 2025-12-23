# React 入门指南（面向有编程基础的开发者）

## 前言

本指南面向有编程基础（如 Java、C++、Python 等）但未接触过 React 的开发者。我们将从基础概念出发，结合项目实际代码，详细讲解 React 的核心概念和使用方法。

## 目录

1. [什么是 React？](#什么是-react)
2. [React 核心概念](#react-核心概念)
3. [组件（Component）](#组件component)
4. [JSX 语法](#jsx-语法)
5. [Props（属性）](#props属性)
6. [State（状态）](#state状态)
7. [Hooks 详解](#hooks-详解)
8. [事件处理](#事件处理)
9. [条件渲染和列表渲染](#条件渲染和列表渲染)
10. [项目中的实际应用](#项目中的实际应用)

---

## 什么是 React？

React 是 Facebook（Meta）开发的一个用于构建用户界面的 JavaScript 库。

### 简单理解

**传统方式（原生 JavaScript）：**
```javascript
// 需要手动操作 DOM
const button = document.getElementById('myButton');
button.addEventListener('click', () => {
  const counter = document.getElementById('counter');
  counter.textContent = parseInt(counter.textContent) + 1;
});
```

**React 方式：**
```javascript
// 声明式：描述 UI 应该是什么样的
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

**核心特点：**
- **声明式**：描述 UI 应该是什么样的，而不是如何操作 DOM
- **组件化**：将 UI 拆分成独立的、可复用的组件
- **单向数据流**：数据从父组件流向子组件
- **虚拟 DOM**：React 使用虚拟 DOM 来高效更新界面

### 为什么使用 React？

1. **代码更清晰**：声明式语法，更容易理解和维护
2. **组件复用**：组件可以在多个地方复用
3. **性能优化**：虚拟 DOM 机制自动优化渲染
4. **生态丰富**：大量第三方库和工具
5. **社区活跃**：拥有庞大的开发者社区

---

## React 核心概念

### 1. 组件（Component）

组件是 React 应用的基本构建块。一个组件就是一个独立的 UI 片段，可以像积木一样组合起来构建完整的应用。

**类比：**
- 就像乐高积木：每个组件是一个积木块
- 积木块可以组合成更大的结构
- 相同的积木块可以在不同地方使用

### 2. Props（属性）

Props 是组件接收的数据，从父组件传递给子组件。

**类比：**
- 就像函数的参数
- 父组件调用子组件时"传参"
- 子组件接收并使用这些数据

### 3. State（状态）

State 是组件内部的数据，可以改变，改变时会触发组件重新渲染。

**类比：**
- 就像组件的"记忆"
- 当状态改变时，组件会"刷新"显示新内容
- 类似于对象的状态变量

### 4. 渲染（Render）

渲染是将组件转换为实际的 HTML 显示在页面上。

**类比：**
- 就像模板填充数据后生成最终文档
- 当数据改变时，React 会重新渲染

---

## 组件（Component）

### 函数组件（推荐方式）

函数组件是使用函数定义的组件：

```typescript
// 简单组件
function Greeting() {
  return <h1>你好，世界！</h1>;
}

// 导出组件
export default Greeting;
```

### 组件的基本结构

```typescript
import React from 'react';

// 组件名称通常以大写字母开头
function MyComponent() {
  // 1. 可以定义变量
  const name = "张三";
  
  // 2. 可以定义函数
  const handleClick = () => {
    console.log("点击了");
  };
  
  // 3. 返回 JSX（UI 描述）
  return (
    <div>
      <h1>欢迎，{name}</h1>
      <button onClick={handleClick}>点击我</button>
    </div>
  );
}

export default MyComponent;
```

### 组件命名规范

- **组件名必须以大写字母开头**（React 通过这个来区分组件和普通 HTML 标签）
- 使用 PascalCase（驼峰命名）
- 文件名通常与组件名相同

```typescript
// ✅ 正确
function UserProfile() { }
function ChatWindow() { }
function SettingsPanel() { }

// ❌ 错误
function userProfile() { }  // 小写开头
function chat_window() { }  // 下划线命名
```

---

## JSX 语法

JSX 是 JavaScript 的扩展语法，看起来像 HTML，但实际上是 JavaScript。

### 基本语法

```typescript
// JSX 示例
const element = <h1>你好，世界！</h1>;
```

### JSX 与 HTML 的区别

#### 1. 必须闭合标签

```typescript
// ✅ 正确
<img src="image.jpg" alt="图片" />
<br />
<input type="text" />

// ❌ 错误（HTML 中可以，但 JSX 中不行）
<img src="image.jpg">
<br>
```

#### 2. 使用 className 而不是 class

```typescript
// ✅ 正确
<div className="container">内容</div>

// ❌ 错误
<div class="container">内容</div>  // class 是 JavaScript 关键字
```

#### 3. 使用大括号插入 JavaScript 表达式

```typescript
const name = "张三";
const age = 25;

// ✅ 正确：使用大括号
<h1>你好，{name}</h1>
<p>年龄：{age}</p>
<p>明年：{age + 1}岁</p>

// ❌ 错误：直接写会被当作字符串
<h1>你好，name</h1>  // 显示 "你好，name" 而不是 "你好，张三"
```

#### 4. 属性使用驼峰命名

```typescript
// ✅ 正确
<div style={{ backgroundColor: 'red' }}>
  <input readOnly={true} />
</div>

// ❌ 错误
<div style={{ background-color: 'red' }}>  // 应该是 backgroundColor
  <input readonly={true} />  // 应该是 readOnly
</div>
```

### JSX 表达式

```typescript
// 可以包含表达式
const element = (
  <div>
    <p>{2 + 2}</p>              {/* 显示 4 */}
    <p>{name.toUpperCase()}</p>  {/* 显示 "张三" 的大写 */}
    <p>{isActive ? '激活' : '未激活'}</p>  {/* 三元运算符 */}
  </div>
);
```

### JSX 中的注释

```typescript
<div>
  {/* 这是 JSX 注释 */}
  <p>内容</p>
  {/* 
    多行注释
    可以这样写
  */}
</div>
```

### 多行 JSX

```typescript
// ✅ 正确：使用括号包裹
const element = (
  <div>
    <h1>标题</h1>
    <p>段落</p>
  </div>
);

// ❌ 错误：没有括号
const element = 
  <div>
    <h1>标题</h1>
  </div>;  // 语法错误
```

---

## Props（属性）

Props 是组件接收的数据，从父组件传递给子组件。Props 是只读的，不能在子组件中修改。

### 基本用法

```typescript
// 子组件：接收 props
interface GreetingProps {
  name: string;
  age: number;
}

function Greeting({ name, age }: GreetingProps) {
  return (
    <div>
      <h1>你好，{name}！</h1>
      <p>你今年{age}岁</p>
    </div>
  );
}

// 父组件：传递 props
function App() {
  return (
    <div>
      <Greeting name="张三" age={25} />
      <Greeting name="李四" age={30} />
    </div>
  );
}
```

### Props 的传递方式

#### 方式1：解构参数（推荐）

```typescript
interface UserProps {
  name: string;
  email: string;
}

function User({ name, email }: UserProps) {
  return (
    <div>
      <p>姓名：{name}</p>
      <p>邮箱：{email}</p>
    </div>
  );
}
```

#### 方式2：使用 props 对象

```typescript
interface UserProps {
  name: string;
  email: string;
}

function User(props: UserProps) {
  return (
    <div>
      <p>姓名：{props.name}</p>
      <p>邮箱：{props.email}</p>
    </div>
  );
}
```

### 默认 Props

```typescript
interface ButtonProps {
  label: string;
  color?: string;  // 可选属性
}

function Button({ label, color = "blue" }: ButtonProps) {
  return (
    <button style={{ backgroundColor: color }}>
      {label}
    </button>
  );
}

// 使用
<Button label="点击" />              {/* color 使用默认值 "blue" */}
<Button label="点击" color="red" />  {/* color 使用 "red" */}
```

### Props 的类型定义

在 TypeScript 中，应该定义 Props 的类型：

```typescript
// 定义 Props 接口
interface MessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// 使用 Props
function Message({ id, role, content, timestamp }: MessageProps) {
  return (
    <div className={`message ${role}`}>
      <p>{content}</p>
      <span>{timestamp.toLocaleTimeString()}</span>
    </div>
  );
}
```

### Props 是只读的

```typescript
// ❌ 错误：不能在组件内修改 props
function User({ name }: { name: string }) {
  name = "新名字";  // 错误！props 是只读的
  return <div>{name}</div>;
}

// ✅ 正确：如果需要修改，使用 state
function User({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);  // 使用 state
  return <div>{name}</div>;
}
```

---

## State（状态）

State 是组件内部的数据，可以改变。当 state 改变时，React 会重新渲染组件。

### useState Hook

`useState` 是 React 提供的一个 Hook，用于在函数组件中添加状态。

```typescript
import { useState } from 'react';

function Counter() {
  // useState 返回 [当前值, 更新函数]
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(count - 1)}>减少</button>
    </div>
  );
}
```

### useState 的语法

```typescript
const [state, setState] = useState(initialValue);
```

- `state`：当前的状态值
- `setState`：更新状态的函数
- `initialValue`：初始值

### 更新 State

```typescript
function Counter() {
  const [count, setCount] = useState(0);
  
  // 方式1：直接传递新值
  const increment = () => {
    setCount(count + 1);
  };
  
  // 方式2：使用函数（推荐，特别是依赖旧值时）
  const increment = () => {
    setCount(prevCount => prevCount + 1);
  };
  
  return <button onClick={increment}>计数: {count}</button>;
}
```

**为什么要使用函数形式？**

```typescript
// ❌ 可能有问题的代码
function Counter() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);
    setCount(count + 1);  // 这不会让 count 增加 2！
    // 因为两次调用都使用相同的 count 值
  };
  
  return <button onClick={handleClick}>计数: {count}</button>;
}

// ✅ 正确的代码
function Counter() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);  // 这会正确地让 count 增加 2
  };
  
  return <button onClick={handleClick}>计数: {count}</button>;
}
```

### 多个 State

```typescript
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);
  
  return (
    <form>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="姓名"
      />
      <input 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="邮箱"
      />
      <input 
        type="number"
        value={age} 
        onChange={(e) => setAge(parseInt(e.target.value))} 
        placeholder="年龄"
      />
    </form>
  );
}
```

### 对象 State

```typescript
interface User {
  name: string;
  email: string;
  age: number;
}

function UserForm() {
  const [user, setUser] = useState<User>({
    name: '',
    email: '',
    age: 0
  });
  
  // 更新对象时需要创建新对象（不能直接修改）
  const updateName = (name: string) => {
    setUser({ ...user, name });  // 使用展开运算符
  };
  
  // ❌ 错误：直接修改
  const updateNameWrong = (name: string) => {
    user.name = name;  // 错误！不能直接修改 state
    setUser(user);
  };
  
  return (
    <input 
      value={user.name}
      onChange={(e) => setUser({ ...user, name: e.target.value })}
    />
  );
}
```

### 数组 State

```typescript
function TodoList() {
  const [todos, setTodos] = useState<string[]>([]);
  
  // 添加项目
  const addTodo = (todo: string) => {
    setTodos([...todos, todo]);  // 创建新数组
  };
  
  // 删除项目
  const removeTodo = (index: number) => {
    setTodos(todos.filter((_, i) => i !== index));  // 创建新数组
  };
  
  return (
    <div>
      {todos.map((todo, index) => (
        <div key={index}>
          {todo}
          <button onClick={() => removeTodo(index)}>删除</button>
        </div>
      ))}
    </div>
  );
}
```

**关键点：**
- State 更新必须使用新的值/对象/数组
- 不能直接修改 state（React 不会检测到变化）
- 使用展开运算符 `...` 创建新对象/数组

---

## Hooks 详解

Hooks 是 React 16.8 引入的特性，允许在函数组件中使用状态和其他 React 特性。

### 什么是 Hook？

Hook 是一个特殊的函数，以 `use` 开头，可以在函数组件中使用 React 的特性。

**规则：**
1. 只能在函数组件或自定义 Hook 中调用
2. 只能在组件顶层调用（不能在循环、条件语句中调用）

### 常用的 Hooks

#### 1. useState

管理组件状态：

```typescript
const [state, setState] = useState(initialValue);
```

#### 2. useEffect

处理副作用（数据获取、订阅、DOM 操作等）：

```typescript
useEffect(() => {
  // 副作用代码
  return () => {
    // 清理函数（可选）
  };
}, [dependencies]);
```

**useEffect 的执行时机：**

```typescript
function Component() {
  const [count, setCount] = useState(0);
  
  // 1. 每次渲染后都执行
  useEffect(() => {
    console.log('每次渲染后执行');
  });
  
  // 2. 只在组件挂载时执行一次
  useEffect(() => {
    console.log('只在挂载时执行');
  }, []);  // 空依赖数组
  
  // 3. 当 count 改变时执行
  useEffect(() => {
    console.log('count 改变了:', count);
  }, [count]);  // 依赖 count
  
  return <button onClick={() => setCount(count + 1)}>计数: {count}</button>;
}
```

**useEffect 的清理函数：**

```typescript
function Timer() {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    // 设置定时器
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    
    // 清理函数：组件卸载或依赖改变时执行
    return () => {
      clearInterval(interval);  // 清除定时器
    };
  }, []);  // 空依赖，只在挂载时设置定时器
  
  return <div>已运行 {seconds} 秒</div>;
}
```

#### 3. useRef

创建一个可变的引用，不会触发重新渲染：

```typescript
const ref = useRef<HTMLDivElement>(null);

// 访问 DOM 元素
useEffect(() => {
  if (ref.current) {
    ref.current.focus();  // 聚焦到元素
  }
}, []);

return <div ref={ref}>内容</div>;
```

**useRef 的使用场景：**

```typescript
function Component() {
  const inputRef = useRef<HTMLInputElement>(null);
  const countRef = useRef(0);  // 也可以存储任意值
  
  const focusInput = () => {
    inputRef.current?.focus();  // 聚焦输入框
  };
  
  const incrementCount = () => {
    countRef.current += 1;  // 改变不会触发重新渲染
    console.log(countRef.current);
  };
  
  return (
    <div>
      <input ref={inputRef} />
      <button onClick={focusInput}>聚焦输入框</button>
      <button onClick={incrementCount}>增加计数</button>
    </div>
  );
}
```

### 自定义 Hook

可以创建自己的 Hook 来复用逻辑：

```typescript
// 自定义 Hook：使用 use 开头
function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
}

// 使用自定义 Hook
function Counter() {
  const { count, increment, decrement, reset } = useCounter(0);
  
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={increment}>增加</button>
      <button onClick={decrement}>减少</button>
      <button onClick={reset}>重置</button>
    </div>
  );
}
```

---

## 事件处理

### 基本事件处理

```typescript
function Button() {
  const handleClick = () => {
    console.log('按钮被点击了');
  };
  
  return <button onClick={handleClick}>点击我</button>;
}
```

### 事件对象

```typescript
function Input() {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('输入值:', event.target.value);
  };
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();  // 阻止默认行为
    console.log('表单提交');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
      <button type="submit">提交</button>
    </form>
  );
}
```

### 常见事件类型

```typescript
// 点击事件
onClick={(e: React.MouseEvent<HTMLButtonElement>) => { }}

// 输入变化
onChange={(e: React.ChangeEvent<HTMLInputElement>) => { }}

// 表单提交
onSubmit={(e: React.FormEvent<HTMLFormElement>) => { }}

// 键盘事件
onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => { }}
onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { }}
onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => { }}

// 鼠标事件
onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { }}
onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { }}
```

### 传递参数

```typescript
function TodoList() {
  const [todos] = useState(['任务1', '任务2', '任务3']);
  
  // 方式1：使用箭头函数
  const handleClick = (index: number) => {
    console.log('点击了任务', index);
  };
  
  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={index} onClick={() => handleClick(index)}>
          {todo}
        </li>
      ))}
    </ul>
  );
}
```

### 阻止默认行为

```typescript
function Form() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();  // 阻止表单默认提交
    console.log('自定义提交逻辑');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" />
      <button type="submit">提交</button>
    </form>
  );
}
```

---

## 条件渲染和列表渲染

### 条件渲染

#### 方式1：if 语句

```typescript
function Greeting({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) {
    return <h1>欢迎回来！</h1>;
  }
  return <h1>请先登录</h1>;
}
```

#### 方式2：三元运算符

```typescript
function Greeting({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div>
      {isLoggedIn ? (
        <h1>欢迎回来！</h1>
      ) : (
        <h1>请先登录</h1>
      )}
    </div>
  );
}
```

#### 方式3：逻辑与（&&）

```typescript
function Message({ count }: { count: number }) {
  return (
    <div>
      {count > 0 && <p>你有 {count} 条新消息</p>}
    </div>
  );
}
```

**注意：**
```typescript
// ✅ 正确
{count > 0 && <p>消息</p>}

// ⚠️ 可能有问题（如果 count 是 0，会显示 0）
{count && <p>消息</p>}

// ✅ 更好的方式
{count > 0 ? <p>消息</p> : null}
```

### 列表渲染

#### 使用 map

```typescript
function TodoList() {
  const todos = ['学习 React', '写代码', '休息'];
  
  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={index}>{todo}</li>
      ))}
    </ul>
  );
}
```

#### key 的重要性

```typescript
interface Todo {
  id: string;
  text: string;
}

function TodoList() {
  const [todos] = useState<Todo[]>([
    { id: '1', text: '学习 React' },
    { id: '2', text: '写代码' },
    { id: '3', text: '休息' }
  ]);
  
  return (
    <ul>
      {/* ✅ 正确：使用唯一 id */}
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
      
      {/* ⚠️ 不推荐：使用 index（如果列表会改变顺序） */}
      {todos.map((todo, index) => (
        <li key={index}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

**为什么需要 key？**
- React 使用 key 来识别哪些元素改变了
- 没有 key，React 可能无法正确更新列表
- key 应该是稳定、唯一、可预测的

---

## 项目中的实际应用

让我们看看项目中是如何使用 React 的：

### ChatWindow 组件分析

```typescript
export const ChatWindow: React.FC = () => {
  // 1. 使用多个 useState 管理状态
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // 2. 使用 useRef 获取 DOM 引用
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 3. 使用 useEffect 处理副作用
  useEffect(() => {
    // 当 messages 改变时，滚动到底部
    scrollToBottom();
  }, [messages]);  // 依赖 messages
  
  useEffect(() => {
    // 组件挂载时加载配置
    const savedKey = localStorage.getItem('ai_api_key');
    if (savedKey) {
      AIService.setApiKey(savedKey);
    }
  }, []);  // 空依赖，只执行一次
  
  // 4. 事件处理函数
  const handleSend = async () => {
    // 异步操作
    const aiResponse = await AIService.processRequest(inputValue, content);
    setMessages([...messages, aiResponse]);
  };
  
  // 5. 返回 JSX
  return (
    <div className="chat-container">
      {/* JSX 内容 */}
    </div>
  );
};
```

### SettingsPanel 组件分析

```typescript
// 1. 定义 Props 接口
interface SettingsPanelProps {
  onClose: () => void;
  onApiKeySet: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  onClose, 
  onApiKeySet 
}) => {
  // 2. 管理表单状态
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('https://api.openai.com/v1/chat/completions');
  const [modelName, setModelName] = useState('gpt-3.5-turbo');
  const [saved, setSaved] = useState(false);
  
  // 3. 表单提交处理
  const handleSave = () => {
    AIService.setApiKey(apiKey.trim());
    localStorage.setItem('ai_api_key', apiKey.trim());
    setSaved(true);
    onApiKeySet();
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };
  
  // 4. 组件挂载时加载已保存的配置
  useEffect(() => {
    const savedKey = localStorage.getItem('ai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);
  
  // 5. 返回 JSX（包含条件渲染）
  return (
    <div style={{ /* 样式 */ }}>
      {saved && <p>已保存 ✓</p>}
      <button onClick={handleSave}>
        {saved ? '已保存 ✓' : '保存'}
      </button>
    </div>
  );
};
```

### 组件组合

```typescript
// ChatWindow 使用 SettingsPanel
function ChatWindow() {
  const [showSettings, setShowSettings] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowSettings(true)}>设置</button>
      
      {/* 条件渲染：根据 showSettings 显示/隐藏 */}
      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          onApiKeySet={() => {
            // API 密钥已设置
          }}
        />
      )}
    </div>
  );
}
```

---

## 常见模式和最佳实践

### 1. 状态提升（Lifting State Up）

将共享状态提升到最近的公共父组件：

```typescript
// ❌ 不好：状态在子组件中
function Child() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}

// ✅ 好：状态在父组件中
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <Child count={count} />
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

### 2. 受控组件（Controlled Components）

表单元素的值由 React 状态控制：

```typescript
function Input() {
  const [value, setValue] = useState('');
  
  return (
    <input 
      value={value}  // 值由 state 控制
      onChange={(e) => setValue(e.target.value)}  // 更新 state
    />
  );
}
```

### 3. 组件组合

使用 children 或 props 进行组件组合：

```typescript
// 使用 children
function Container({ children }: { children: React.ReactNode }) {
  return <div className="container">{children}</div>;
}

// 使用
<Container>
  <h1>标题</h1>
  <p>内容</p>
</Container>
```

### 4. 性能优化

#### 使用 useMemo

```typescript
const expensiveValue = useMemo(() => {
  // 昂贵的计算
  return computeExpensiveValue(a, b);
}, [a, b]);  // 只有当 a 或 b 改变时才重新计算
```

#### 使用 useCallback

```typescript
const handleClick = useCallback(() => {
  // 处理点击
}, [dependencies]);  // 只有当依赖改变时才重新创建函数
```

---

## 常见错误和解决方案

### 错误1：直接修改 State

```typescript
// ❌ 错误
const [user, setUser] = useState({ name: 'John' });
user.name = 'Jane';  // 不能直接修改
setUser(user);

// ✅ 正确
setUser({ ...user, name: 'Jane' });  // 创建新对象
```

### 错误2：在条件语句中使用 Hook

```typescript
// ❌ 错误
if (condition) {
  const [state, setState] = useState(0);  // Hook 不能在条件语句中
}

// ✅ 正确
const [state, setState] = useState(0);
if (condition) {
  // 使用 state
}
```

### 错误3：忘记依赖数组

```typescript
// ❌ 错误：每次渲染都执行
useEffect(() => {
  console.log('执行');
});  // 缺少依赖数组

// ✅ 正确：只在挂载时执行
useEffect(() => {
  console.log('执行');
}, []);  // 空依赖数组
```

### 错误4：无限循环

```typescript
// ❌ 错误：会导致无限循环
useEffect(() => {
  setCount(count + 1);  // 改变 count
}, [count]);  // count 改变触发 useEffect

// ✅ 正确：使用函数形式
useEffect(() => {
  setCount(prev => prev + 1);
}, []);  // 或者移除这个 useEffect
```

---

## 学习路径建议

### 第一阶段：基础（1-2周）

1. **组件和 JSX**
   - 理解组件概念
   - 掌握 JSX 语法
   - 创建简单组件

2. **Props 和 State**
   - 理解 Props 传递
   - 掌握 useState Hook
   - 区分 Props 和 State

### 第二阶段：Hooks（1-2周）

1. **useState**
   - 管理简单状态
   - 管理对象和数组状态

2. **useEffect**
   - 理解副作用概念
   - 掌握依赖数组
   - 清理函数的使用

3. **useRef**
   - DOM 引用
   - 存储可变值

### 第三阶段：实践（2-3周）

1. **事件处理**
   - 各种事件类型
   - 事件对象的使用

2. **条件渲染和列表渲染**
   - 多种条件渲染方式
   - 列表渲染和 key

3. **项目实践**
   - 阅读项目代码
   - 修改现有组件
   - 创建新组件

---

## 总结

React 的核心概念：

1. **组件**：可复用的 UI 片段
2. **Props**：从父组件传递的数据（只读）
3. **State**：组件内部的数据（可变）
4. **Hooks**：在函数组件中使用 React 特性
5. **JSX**：描述 UI 的语法
6. **渲染**：将组件转换为 HTML

**关键原则：**
- ✅ 组件应该小而专注
- ✅ Props 向下传递，事件向上传递
- ✅ State 更新必须使用新值
- ✅ Hooks 必须在顶层调用
- ✅ 使用 key 渲染列表

**下一步：**
- 深入学习高级 Hooks（useContext, useReducer 等）
- 学习状态管理（Redux, Zustand 等）
- 学习路由（React Router）
- 学习性能优化

祝您学习顺利！

