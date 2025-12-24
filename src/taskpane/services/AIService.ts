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

    console.log('🚀 开始调用后端API...', {
      apiUrl: this.apiUrl,
      model: this.modelName,
      hasApiKey: !!this.apiKey
    });

    try {
      // 调用后端API
      const response = await this.callBackendAPI(userRequest, documentContent);
      console.log('✅ 后端API调用成功');
      return response;
    } catch (error) {
      console.error('❌ 后端API调用失败:', error);
      if (error instanceof Error) {
        console.error('错误详情:', error.message);
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
    
    // 开发环境：如果前端在HTTPS上运行，使用相对路径通过webpack proxy访问后端
    // 这样可以避免混合内容问题（HTTPS页面访问HTTP后端）
    const currentProtocol = window.location.protocol;
    const currentHost = window.location.host;
    
    if (currentProtocol === 'https:' && currentHost.includes('localhost:3000')) {
      // 使用相对路径，通过webpack dev server的proxy转发到后端
      console.log('🔀 使用webpack proxy访问后端（解决混合内容问题）');
      return ''; // 空字符串表示使用相对路径，webpack proxy会处理
    }
    
    // 默认使用HTTP后端（如果前端是HTTP或不在开发环境）
    return 'http://localhost:8000';
  }

  /**
   * 调用后端API
   */
  private static async callBackendAPI(userRequest: string, documentContent: string): Promise<AIResponse> {
    const backendUrl = this.getBackendUrl();
    // 如果backendUrl是空字符串，使用相对路径；否则拼接完整URL
    const apiEndpoint = backendUrl ? `${backendUrl}/api/process` : '/api/process';
    
    // 显示完整的请求信息
    const fullUrl = backendUrl 
      ? apiEndpoint 
      : `${window.location.protocol}//${window.location.host}${apiEndpoint} (通过proxy)`;
    
    console.log('📡 发送请求到后端API:', apiEndpoint);
    console.log('📡 完整URL:', fullUrl);
    console.log('🌐 当前页面协议:', window.location.protocol);
    console.log('🌐 当前页面主机:', window.location.host);
    console.log('🌐 后端URL配置:', backendUrl || '(空，使用相对路径/proxy)');
    
    const requestBody = {
      user_request: userRequest,
      document_content: documentContent,
      api_key: this.apiKey,
      api_url: this.apiUrl,  // 后端会使用这个URL调用AI API
      model_name: this.modelName,
    };

    console.log('请求参数:', {
      backendUrl: apiEndpoint,
      model: this.modelName,
      requestLength: userRequest.length,
      documentLength: documentContent.length,
      hasApiKey: !!this.apiKey
    });

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('后端API响应状态:', response.status, response.statusText);
      // 记录响应头（兼容不同浏览器）
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log('响应头:', headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 后端API错误响应:', errorText);
        console.error('错误状态码:', response.status);
        console.error('错误状态文本:', response.statusText);
        throw new Error(`后端API请求失败 (${response.status}): ${response.statusText}. ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();
      console.log('✅ 后端API响应数据:', data);
      
      // 后端已经返回了解析后的AIResponse格式
      return {
        message: data.message || '操作完成',
        edits: data.edits || [],
      };
    } catch (error) {
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
      
      console.error('❌ 后端API调用失败');
      console.error('当前页面协议:', currentProtocol);
      console.error('后端API协议:', backendProtocol);
      console.error('后端API地址:', apiEndpoint);
      
      // 检查是否是混合内容问题
      if (currentProtocol === 'https:' && backendProtocol === 'http:') {
        console.error('⚠️ 检测到混合内容问题！');
        console.error('问题: HTTPS页面无法访问HTTP后端');
        console.error('解决方案:');
        console.error('1. 配置后端使用HTTPS（推荐）');
        console.error('2. 或使用webpack proxy代理（开发环境）');
        console.error('3. 或在浏览器中允许混合内容（不推荐，仅用于开发）');
      }
      
      if (error instanceof TypeError) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('fetch') || errorMsg.includes('network') || errorMsg.includes('failed')) {
          console.error('❌ 网络连接错误');
          console.error('可能的原因:');
          console.error('1. 后端服务未启动');
          console.error('   检查: curl http://localhost:8000/health');
          console.error('2. 网络连接问题');
          console.error('3. CORS配置问题');
          console.error('4. 混合内容阻止 (HTTPS → HTTP)');
          console.error('5. 防火墙阻止');
          console.error('错误详情:', error.message);
          console.error('错误类型:', error.constructor.name);
          throw new Error(`无法连接到后端服务器: ${error.message}。请检查后端服务是否运行在 ${apiEndpoint}`);
        }
      }
      
      if (error instanceof Error) {
        console.error('❌ 后端API调用错误:', error.message);
        console.error('错误类型:', error.constructor.name);
        if (error.stack) {
          console.error('错误堆栈:', error.stack);
        }
        throw error;
      } else {
        console.error('❌ 未知错误:', error);
        console.error('错误类型:', typeof error);
        throw new Error(`后端API调用失败: ${String(error)}`);
      }
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

