import { EditOperation } from './WordEditor';

export interface AIResponse {
  message: string;
  edits: EditOperation[];
}

export class AIService {
  private static apiKey: string | null = null;
  private static apiUrl: string = 'https://api.openai.com/v1/chat/completions';
  private static modelName: string = 'gpt-3.5-turbo';

  /**
   * 设置API密钥
   */
  static setApiKey(key: string): void {
    this.apiKey = key;
  }

  /**
   * 设置API URL（用于使用其他AI服务）
   */
  static setApiUrl(url: string): void {
    this.apiUrl = url;
  }

  /**
   * 设置模型名称
   */
  static setModelName(model: string): void {
    this.modelName = model;
  }

  /**
   * 获取当前模型名称
   */
  static getModelName(): string {
    return this.modelName;
  }

  /**
   * 处理用户请求并返回编辑操作
   */
  static async processRequest(userRequest: string, documentContent: string): Promise<AIResponse> {
    // 检查API密钥
    if (!this.apiKey || this.apiKey.trim() === '') {
      console.warn('⚠️ API密钥未配置，使用模拟响应');
      console.log('提示：请在设置中配置API密钥以使用真实的AI服务');
      // 如果没有配置API密钥，使用模拟响应
      return this.getMockResponse(userRequest);
    }

    const apiInfo = {
      apiUrl: this.apiUrl,
      model: this.modelName,
      hasApiKey: !!this.apiKey
    };
    console.log(`🚀 开始调用后端API... ${JSON.stringify(apiInfo, null, 2)}`);

    try {
      // 调用后端API
      const response = await this.callBackendAPI(userRequest, documentContent);
      console.log('✅ 后端API调用成功');
      return response;
    } catch (error) {
      console.warn('⚠️ 后端API调用失败（将降级到模拟响应）');
      if (error instanceof Error) {
        console.warn(`错误详情: ${error.message}`);
        if (error.stack) {
          console.warn(`错误堆栈: ${error.stack}`);
        }
      } else {
        console.warn(`错误对象: ${String(error)}`);
      }
      // 降级到模拟响应
      console.warn('⚠️ 降级到模拟响应');
      return this.getMockResponse(userRequest);
    }
  }

  /**
   * 构建提示词
   */
  private static buildPrompt(userRequest: string, documentContent: string): string {
    return `你是一个Word文档编辑助手。用户想要对文档进行编辑，请根据用户需求生成编辑操作。

当前文档内容：
${documentContent.substring(0, 2000)}${documentContent.length > 2000 ? '...' : ''}

用户需求：${userRequest}

请以JSON格式返回编辑操作，格式如下：
{
  "message": "操作说明",
  "edits": [
    {
      "type": "insert|replace|format|delete|addParagraph",
      "content": "文本内容（如果需要）",
      "position": "start|end|数字",
      "searchText": "要搜索的文本（如果需要）",
      "replaceText": "替换的文本（如果需要）",
      "format": {
        "bold": true/false,
        "italic": true/false,
        "underline": true/false,
        "fontSize": 数字,
        "fontColor": "颜色代码"
      }
    }
  ]
}

只返回JSON，不要其他内容。`;
  }

  /**
   * 后端API URL
   */
  private static getBackendUrl(): string {
    // 可以从localStorage读取配置，如果没有则使用默认值
    const savedBackendUrl = localStorage.getItem('backend_url');
    if (savedBackendUrl) {
      return savedBackendUrl;
    }
    
    // 现在前端和后端都在同一个Python服务中，使用相对路径即可
    // 这样避免了混合内容问题和代理复杂性
    const currentProtocol = window.location.protocol;
    const currentHost = window.location.host;
    
    console.log(`🌐 [Backend URL] 当前页面: ${currentProtocol}//${currentHost}`);
    console.log(`🌐 [Backend URL] 使用相对路径访问API（前后端同源）`);
    
    // 使用空字符串表示相对路径，API调用会使用当前页面的协议和主机
    return ''; // 空字符串 = 相对路径 = 同源请求
  }

  /**
   * 调用后端API（使用SSE流式响应）
   */
  private static async callBackendAPI(userRequest: string, documentContent: string): Promise<AIResponse> {
    const backendUrl = this.getBackendUrl();
    // 如果backendUrl是空字符串，使用相对路径；否则拼接完整URL
    const apiEndpoint = backendUrl ? `${backendUrl}/api/process` : '/api/process';
    
    console.log(`📡 发送请求到后端API (SSE): ${apiEndpoint}`);
    console.log(`🌐 当前页面协议: ${window.location.protocol}`);
    console.log(`🌐 当前页面主机: ${window.location.host}`);
    
    const requestBody = {
      user_request: userRequest,
      document_content: documentContent,
      api_key: this.apiKey,
      api_url: this.apiUrl,
      model_name: this.modelName,
    };

    const requestStartTime = Date.now();
    console.log(`⏱️ 请求开始时间: ${new Date(requestStartTime).toISOString()}`);

    // 创建 AbortController 用于超时控制（5分钟超时）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`⏰ 前端超时定时器触发（5分钟）`);
      controller.abort();
    }, 300000); // 300秒（5分钟）

    try {
      console.log(`📤 [Fetch] 准备发送请求到: ${apiEndpoint}`);
      console.log(`📤 [Fetch] 请求方法: POST`);
      console.log(`📤 [Fetch] 请求体大小: ${JSON.stringify(requestBody).length} 字节`);
      console.log(`📤 [Fetch] AbortController信号状态: ${controller.signal.aborted ? '已中止' : '活跃'}`);
      
      // 监听AbortController信号
      controller.signal.addEventListener('abort', () => {
        const abortTime = Date.now();
        const abortDuration = (abortTime - requestStartTime) / 1000;
        console.error(`❌ [Fetch] AbortController信号触发，耗时: ${abortDuration.toFixed(2)} 秒`);
        console.error(`❌ [Fetch] 中止原因: ${controller.signal.reason || '超时'}`);
      });
      
      console.log(`📤 [Fetch] 开始fetch调用...`);
      const fetchStartTime = Date.now();
      
      // 添加定期心跳日志，每10秒记录一次等待状态
      const heartbeatInterval = setInterval(() => {
        const elapsed = (Date.now() - fetchStartTime) / 1000;
        console.log(`💓 [Fetch] 等待响应中... 已等待 ${elapsed.toFixed(1)} 秒`);
        console.log(`💓 [Fetch] AbortController状态: ${controller.signal.aborted ? '已中止' : '活跃'}`);
      }, 10000); // 每10秒
      
      let response: Response;
      try {
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
        
        // fetch成功，清除心跳
        clearInterval(heartbeatInterval);
        console.log(`✅ [Fetch] fetch调用成功完成`);
      } catch (fetchError) {
        // fetch失败，清除心跳
        clearInterval(heartbeatInterval);
        console.error(`❌ [Fetch] fetch调用失败`);
        throw fetchError;
      }

      const fetchEndTime = Date.now();
      const fetchDuration = (fetchEndTime - fetchStartTime) / 1000;
      const responseTime = Date.now();
      const responseDuration = (responseTime - requestStartTime) / 1000;
      
      console.log(`✅ [Fetch] fetch调用完成，fetch耗时: ${fetchDuration.toFixed(2)} 秒，总耗时: ${responseDuration.toFixed(2)} 秒`);
      console.log(`📥 [Fetch] 收到响应，耗时: ${responseDuration.toFixed(2)} 秒`);
      console.log(`📥 [Fetch] 响应状态: ${response.status} ${response.statusText}`);
      console.log(`📥 [Fetch] 响应OK: ${response.ok}`);
      console.log(`📥 [Fetch] 响应类型: ${response.type}`);
      console.log(`📥 [Fetch] 响应重定向: ${response.redirected}`);
      console.log(`📥 [Fetch] 响应URL: ${response.url}`);

      // 记录所有响应头
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
        console.log(`📥 [Fetch] 响应头: ${key} = ${value}`);
      });

      if (!response.ok) {
        console.error(`❌ [Fetch] 响应状态码错误: ${response.status}`);
        const errorText = await response.text();
        console.error(`❌ [Fetch] 错误响应内容: ${errorText.substring(0, 500)}`);
        throw new Error(`后端API请求失败 (${response.status}): ${errorText.substring(0, 200)}`);
      }

      // 检查是否是SSE流式响应
      const contentType = response.headers.get('content-type');
      console.log(`🔍 [Fetch] Content-Type: ${contentType || '(未设置)'}`);
      
      if (contentType && contentType.includes('text/event-stream')) {
        console.log(`✅ [Fetch] 检测到SSE流式响应`);
        console.log(`✅ [Fetch] 响应体是否为ReadableStream: ${response.body !== null}`);
        return await this.handleSSEResponse(response, controller, timeoutId, requestStartTime);
      } else {
        // 回退到普通JSON响应
        console.log(`⚠️ [Fetch] 非SSE响应，使用普通JSON解析`);
        console.log(`⚠️ [Fetch] Content-Type: ${contentType}`);
        const data = await response.json();
        console.log(`✅ [Fetch] JSON解析成功: ${JSON.stringify(data, null, 2)}`);
        clearTimeout(timeoutId);
        return {
          message: data.message || '操作完成',
          edits: data.edits || [],
        };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      const requestEndTime = Date.now();
      const requestDuration = (requestEndTime - requestStartTime) / 1000;
      console.error(`❌ [Fetch] 请求失败，耗时: ${requestDuration.toFixed(2)} 秒`);
      console.error(`❌ [Fetch] 错误发生时间: ${new Date(requestEndTime).toISOString()}`);
      
      if (error instanceof Error) {
        console.error(`❌ [Fetch] 错误名称: ${error.name}`);
        console.error(`❌ [Fetch] 错误消息: ${error.message}`);
        console.error(`❌ [Fetch] 错误堆栈: ${error.stack || '(无堆栈)'}`);
        
        if (error.name === 'AbortError') {
          console.error(`❌ [Fetch] 检测到AbortError - 请求被中止`);
          console.error(`❌ [Fetch] AbortController状态: ${controller.signal.aborted ? '已中止' : '未中止'}`);
          console.error(`❌ [Fetch] 中止原因: ${controller.signal.reason || '超时（5分钟）'}`);
          
          // 检查是否是浏览器默认超时（约60秒）
          if (requestDuration >= 55 && requestDuration <= 65) {
            console.error(`❌ [Fetch] 检测到浏览器默认超时（约60秒）`);
            console.error(`❌ [Fetch] 这可能是浏览器或Office.js环境的网络超时限制`);
            console.error(`❌ [Fetch] 建议：检查webpack proxy是否正确配置了SSE支持`);
            throw new Error(`请求超时：浏览器默认网络超时（约60秒）。后端处理耗时 ${requestDuration.toFixed(2)} 秒，超过了浏览器限制。请检查webpack proxy的SSE配置。`);
          }
          
          throw new Error('请求超时：后端处理时间过长（超过5分钟）');
        }
        
        // 检查是否是网络错误
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('load failed') || errorMsg.includes('network') || errorMsg.includes('failed to fetch')) {
          console.error(`❌ [Fetch] 检测到网络错误`);
          console.error(`❌ [Fetch] 可能原因:`);
          console.error(`❌ [Fetch]   1. 后端服务未启动`);
          console.error(`❌ [Fetch]   2. Webpack proxy未正确转发请求`);
          console.error(`❌ [Fetch]   3. 浏览器网络超时（约60秒）`);
          console.error(`❌ [Fetch]   4. CORS配置问题`);
          console.error(`❌ [Fetch]   5. 混合内容阻止`);
        }
      } else {
        console.error(`❌ [Fetch] 未知错误类型: ${typeof error}`);
        console.error(`❌ [Fetch] 错误值: ${String(error)}`);
      }
      // 详细记录不同类型的错误
      const currentProtocol = window.location.protocol;
      // 安全地获取后端协议（处理相对路径的情况）
      let backendProtocol = 'unknown';
      try {
        // 如果是相对路径，使用当前页面的协议和主机构建完整URL
        const fullApiUrl = apiEndpoint.startsWith('http') 
          ? apiEndpoint 
          : `${window.location.protocol}//${window.location.host}${apiEndpoint}`;
        backendProtocol = new URL(fullApiUrl).protocol;
      } catch {
        // 如果无法解析URL，尝试从apiEndpoint中提取协议
        if (apiEndpoint.startsWith('http://')) {
          backendProtocol = 'http:';
        } else if (apiEndpoint.startsWith('https://')) {
          backendProtocol = 'https:';
        } else {
          backendProtocol = currentProtocol; // 相对路径使用当前协议
        }
      }
      
      // 使用 console.warn 而不是 console.error，避免被 Office.js 记录为严重错误
      // 这是可恢复的错误，会降级到模拟响应
      // 合并所有信息到一个字符串，确保 Office.js 运行时日志能完整显示
      console.warn(`⚠️ 后端API调用失败（将降级到模拟响应）`);
      console.warn(`当前页面协议: ${currentProtocol}`);
      console.warn(`后端API协议: ${backendProtocol}`);
      console.warn(`后端API地址: ${apiEndpoint}`);
      
      // 检查是否是混合内容问题
      if (currentProtocol === 'https:' && backendProtocol === 'http:') {
        console.warn('⚠️ 检测到混合内容问题！');
        console.warn('问题: HTTPS页面无法访问HTTP后端');
        console.warn('解决方案: 1. 配置后端使用HTTPS（推荐） 2. 或使用webpack proxy代理（开发环境） 3. 或在浏览器中允许混合内容（不推荐，仅用于开发）');
      }
      
      // 格式化错误信息，确保完整输出
      let errorMessage = '未知错误';
      let errorType = 'Unknown';
      let errorStack = '';
      
      if (error instanceof TypeError) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('fetch') || errorMsg.includes('network') || errorMsg.includes('failed')) {
          errorMessage = error.message || '网络连接失败';
          errorType = 'NetworkError';
          errorStack = error.stack || '';
          
          console.warn(`⚠️ 网络连接错误: ${errorMessage}`);
          console.warn(`可能的原因: 1. 后端服务未启动（检查: curl http://localhost:3000/health） 2. 网络连接问题 3. CORS配置问题 4. 混合内容阻止 (HTTPS → HTTP) 5. 防火墙阻止`);
          console.warn(`错误类型: ${errorType}`);
          
          throw new Error(`无法连接到后端服务器: ${errorMessage}。请检查后端服务是否运行在 ${apiEndpoint}`);
        }
      }
      
      if (error instanceof Error) {
        errorMessage = error.message || '未知错误';
        errorType = error.constructor.name || 'Error';
        errorStack = error.stack || '';
        
        console.warn(`⚠️ 后端API调用错误: ${errorMessage}`);
        console.warn(`错误类型: ${errorType}`);
        if (errorStack) {
          console.warn(`错误堆栈: ${errorStack}`);
        }
        throw error;
      } else {
        errorMessage = String(error);
        errorType = typeof error;
        console.warn(`⚠️ 未知错误类型: ${errorMessage}`);
        console.warn(`错误类型: ${errorType}`);
        throw new Error(`后端API调用失败: ${errorMessage}`);
      }
    }
  }

  /**
   * 处理SSE流式响应
   */
  private static async handleSSEResponse(
    response: Response,
    controller: AbortController,
    timeoutId: NodeJS.Timeout,
    requestStartTime: number
  ): Promise<AIResponse> {
    console.log(`🔄 [SSE] 开始处理SSE流式响应`);
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      console.error(`❌ [SSE] 无法获取ReadableStream reader，response.body: ${response.body}`);
      throw new Error('无法读取响应流');
    }

    console.log(`✅ [SSE] ReadableStream reader已创建`);

    let buffer = '';
    let result: AIResponse | null = null;
    let lastProgressTime = Date.now();
    let chunkCount = 0;
    let eventCount = 0;

    try {
      console.log(`🔄 [SSE] 开始读取数据流...`);
      
      while (true) {
        const readStartTime = Date.now();
        console.log(`📖 [SSE] 准备读取数据块 #${chunkCount + 1}...`);
        
        const { done, value } = await reader.read();
        chunkCount++;
        
        const readDuration = Date.now() - readStartTime;
        console.log(`📖 [SSE] 数据块 #${chunkCount} 读取完成，耗时: ${readDuration}ms, done: ${done}`);
        
        if (done) {
          console.log(`✅ [SSE] 数据流读取完成，共读取 ${chunkCount} 个数据块`);
          break;
        }

        if (!value) {
          console.warn(`⚠️ [SSE] 数据块 #${chunkCount} 值为空`);
          continue;
        }

        console.log(`📦 [SSE] 数据块 #${chunkCount} 大小: ${value.length} 字节`);

        // 解码数据块
        const decoded = decoder.decode(value, { stream: true });
        console.log(`🔤 [SSE] 解码后文本长度: ${decoded.length} 字符`);
        console.log(`🔤 [SSE] 解码后文本预览: ${decoded.substring(0, 200)}`);
        
        buffer += decoded;
        console.log(`📝 [SSE] Buffer总长度: ${buffer.length} 字符`);
        
        // 处理SSE格式的数据（以\n\n分隔）
        const lines = buffer.split('\n\n');
        const completeLines = lines.slice(0, -1);
        buffer = lines[lines.length - 1] || ''; // 保留最后一个不完整的数据块
        
        console.log(`📋 [SSE] 完整事件行数: ${completeLines.length}, 剩余buffer: ${buffer.length} 字符`);

        for (let i = 0; i < completeLines.length; i++) {
          const line = completeLines[i];
          eventCount++;
          
          console.log(`📨 [SSE] 处理事件 #${eventCount}: ${line.substring(0, 100)}...`);
          
          if (!line.trim()) {
            console.log(`⏭️ [SSE] 事件 #${eventCount} 为空，跳过`);
            continue;
          }
          
          if (!line.startsWith('data: ')) {
            console.warn(`⚠️ [SSE] 事件 #${eventCount} 格式不正确（不以'data: '开头）: ${line.substring(0, 100)}`);
            continue;
          }

          try {
            const dataStr = line.substring(6); // 移除 "data: " 前缀
            console.log(`🔍 [SSE] 事件 #${eventCount} 数据: ${dataStr.substring(0, 200)}...`);
            
            const eventData = JSON.parse(dataStr);
            console.log(`✅ [SSE] 事件 #${eventCount} 解析成功，类型: ${eventData.type}`);

            // 记录收到SSE事件的详细信息
            const eventReceiveTime = Date.now();
            const eventReceiveDuration = (eventReceiveTime - requestStartTime) / 1000;
            console.log(`📨 [SSE] ✅ 收到SSE事件 #${eventCount}，类型: ${eventData.type}，耗时: ${eventReceiveDuration.toFixed(2)} 秒`);
            console.log(`📨 [SSE] 事件完整内容: ${JSON.stringify(eventData, null, 2)}`);

            if (eventData.type === 'start') {
              console.log(`🚀 [SSE] ════════════════════════════════════════`);
              console.log(`🚀 [SSE] 📨 收到开始事件`);
              console.log(`🚀 [SSE] 消息: ${eventData.message}`);
              console.log(`🚀 [SSE] 时间: ${new Date(eventReceiveTime).toISOString()}`);
              console.log(`🚀 [SSE] 从请求开始耗时: ${eventReceiveDuration.toFixed(2)} 秒`);
              console.log(`🚀 [SSE] ════════════════════════════════════════`);
            } else if (eventData.type === 'progress') {
              const currentTime = Date.now();
              console.log(`📊 [SSE] ════════════════════════════════════════`);
              console.log(`📊 [SSE] 📨 收到进度事件`);
              console.log(`📊 [SSE] 数据块数量: ${eventData.chunk_count}`);
              console.log(`📊 [SSE] 内容长度: ${eventData.content_length} 字符`);
              console.log(`📊 [SSE] 已耗时: ${eventData.elapsed_time} 秒`);
              console.log(`📊 [SSE] 时间: ${new Date(eventReceiveTime).toISOString()}`);
              console.log(`📊 [SSE] 从请求开始耗时: ${eventReceiveDuration.toFixed(2)} 秒`);
              console.log(`📊 [SSE] ════════════════════════════════════════`);
              
              // 每5秒记录一次进度
              if (currentTime - lastProgressTime >= 5000) {
                console.log(`📊 [SSE] 📈 进度更新摘要: 已接收 ${eventData.chunk_count} 个数据块，内容长度 ${eventData.content_length} 字符，耗时 ${eventData.elapsed_time.toFixed(2)} 秒`);
                lastProgressTime = currentTime;
              }
            } else if (eventData.type === 'result') {
              result = eventData.data as AIResponse;
              console.log(`✅ [SSE] ════════════════════════════════════════`);
              console.log(`✅ [SSE] 📨 收到结果事件`);
              console.log(`✅ [SSE] 时间: ${new Date(eventReceiveTime).toISOString()}`);
              console.log(`✅ [SSE] 从请求开始耗时: ${eventReceiveDuration.toFixed(2)} 秒`);
              console.log(`✅ [SSE] 结果消息: "${result.message}"`);
              console.log(`✅ [SSE] 编辑操作数量: ${result.edits.length}`);
              if (result.edits.length > 0) {
                console.log(`✅ [SSE] 编辑操作详情:`);
                result.edits.forEach((edit, index) => {
                  console.log(`✅ [SSE]   操作 ${index + 1}: type=${edit.type}, content=${edit.content?.substring(0, 50) || 'N/A'}...`);
                });
              }
              console.log(`✅ [SSE] 完整结果JSON: ${JSON.stringify(result, null, 2)}`);
              console.log(`✅ [SSE] ════════════════════════════════════════`);
            } else if (eventData.type === 'error') {
              console.error(`❌ [SSE] ════════════════════════════════════════`);
              console.error(`❌ [SSE] 📨 收到错误事件`);
              console.error(`❌ [SSE] 时间: ${new Date(eventReceiveTime).toISOString()}`);
              console.error(`❌ [SSE] 从请求开始耗时: ${eventReceiveDuration.toFixed(2)} 秒`);
              console.error(`❌ [SSE] 状态码: ${eventData.status_code}`);
              console.error(`❌ [SSE] 错误详情: ${eventData.detail}`);
              console.error(`❌ [SSE] ════════════════════════════════════════`);
              clearTimeout(timeoutId);
              throw new Error(`后端错误: ${eventData.detail}`);
            } else {
              console.warn(`⚠️ [SSE] ════════════════════════════════════════`);
              console.warn(`⚠️ [SSE] 📨 收到未知类型事件`);
              console.warn(`⚠️ [SSE] 事件类型: ${eventData.type}`);
              console.warn(`⚠️ [SSE] 事件内容: ${JSON.stringify(eventData, null, 2)}`);
              console.warn(`⚠️ [SSE] ════════════════════════════════════════`);
            }
          } catch (parseError) {
            console.error(`❌ [SSE] 解析事件 #${eventCount} 失败`);
            console.error(`❌ [SSE] 错误: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
            console.error(`❌ [SSE] 原始数据: ${line.substring(0, 500)}`);
            if (parseError instanceof Error && parseError.stack) {
              console.error(`❌ [SSE] 错误堆栈: ${parseError.stack}`);
            }
          }
        }
      }

      console.log(`🔄 [SSE] 数据流读取完成，处理剩余buffer...`);
      console.log(`📝 [SSE] 剩余buffer长度: ${buffer.length} 字符`);
      console.log(`📝 [SSE] 剩余buffer内容: ${buffer.substring(0, 200)}`);

      // 处理剩余的buffer
      if (buffer.trim()) {
        const dataStr = buffer.startsWith('data: ') ? buffer.substring(6) : buffer;
        console.log(`🔍 [SSE] 处理剩余buffer数据: ${dataStr.substring(0, 200)}...`);
        try {
          const eventData = JSON.parse(dataStr);
          console.log(`✅ [SSE] 剩余buffer解析成功，类型: ${eventData.type}`);
          if (eventData.type === 'result') {
            result = eventData.data as AIResponse;
            console.log(`✅ [SSE] 从剩余buffer获取结果成功`);
          }
        } catch (e) {
          console.warn(`⚠️ [SSE] 剩余buffer解析失败: ${e instanceof Error ? e.message : String(e)}`);
        }
      }

      if (!result) {
        console.error(`❌ [SSE] 未收到有效的响应结果`);
        console.error(`❌ [SSE] 处理统计: 数据块=${chunkCount}, 事件=${eventCount}, buffer长度=${buffer.length}`);
        throw new Error('未收到有效的响应结果');
      }

      clearTimeout(timeoutId);
      const requestEndTime = Date.now();
      const requestDuration = (requestEndTime - requestStartTime) / 1000;
      console.log(`✅ [SSE] 请求完成，总耗时: ${requestDuration.toFixed(2)} 秒`);
      console.log(`✅ [SSE] 处理统计: 数据块=${chunkCount}, 事件=${eventCount}`);

      return result;
    } catch (error) {
      console.error(`❌ [SSE] 处理SSE响应时出错`);
      console.error(`❌ [SSE] 错误类型: ${error instanceof Error ? error.constructor.name : typeof error}`);
      console.error(`❌ [SSE] 错误消息: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof Error && error.stack) {
        console.error(`❌ [SSE] 错误堆栈: ${error.stack}`);
      }
      console.error(`❌ [SSE] 处理统计: 数据块=${chunkCount}, 事件=${eventCount}, buffer长度=${buffer.length}`);
      
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`处理SSE响应时出错: ${String(error)}`);
    } finally {
      console.log(`🔒 [SSE] 释放reader锁...`);
      reader.releaseLock();
      console.log(`✅ [SSE] Reader锁已释放`);
    }
  }

  /**
   * 解析AI响应
   */
  private static parseAIResponse(response: string): AIResponse {
    try {
      // 尝试提取JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          message: parsed.message || '操作完成',
          edits: parsed.edits || [],
        };
      }
      throw new Error('无法解析AI响应');
    } catch (error) {
      console.error('解析AI响应失败:', error);
      throw new Error('AI响应格式错误');
    }
  }

  /**
   * 获取模拟响应（用于测试或未配置API时）
   */
  private static getMockResponse(userRequest: string): AIResponse {
    const lowerRequest = userRequest.toLowerCase();
    const edits: EditOperation[] = [];

    // 简单的规则匹配
    if (lowerRequest.includes('加粗') || lowerRequest.includes('粗体')) {
      edits.push({
        type: 'format',
        searchText: '第一段',
        format: { bold: true },
      });
    }

    if (lowerRequest.includes('添加') && lowerRequest.includes('末尾')) {
      edits.push({
        type: 'addParagraph',
        content: '这是根据您的要求添加的内容。',
      });
    }

    if (lowerRequest.includes('替换')) {
      edits.push({
        type: 'replace',
        searchText: '旧文本',
        replaceText: '新文本',
      });
    }

    return {
      message: edits.length > 0 
        ? '已根据您的要求完成编辑操作。' 
        : '抱歉，我无法理解您的需求。请尝试更具体的描述，例如："将第一段加粗"或"在文档末尾添加一段文字"。',
      edits,
    };
  }
}

