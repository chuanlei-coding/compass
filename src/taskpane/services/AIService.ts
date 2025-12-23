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

    console.log('🚀 开始调用AI API...', {
      apiUrl: this.apiUrl,
      model: this.modelName,
      hasApiKey: !!this.apiKey
    });

    try {
      const prompt = this.buildPrompt(userRequest, documentContent);
      const response = await this.callAI(prompt);
      console.log('✅ AI API调用成功');
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('❌ AI服务调用失败:', error);
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
   * 调用AI API
   */
  private static async callAI(prompt: string): Promise<string> {
    console.log('📡 发送API请求到:', this.apiUrl);
    
    const requestBody = {
      model: this.modelName,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的Word文档编辑助手，能够理解用户需求并生成准确的编辑操作。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    };

    console.log('请求参数:', {
      model: this.modelName,
      messagesCount: requestBody.messages.length,
      promptLength: prompt.length
    });

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('API响应状态:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API错误响应:', errorText);
      throw new Error(`API请求失败 (${response.status}): ${response.statusText}. ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    console.log('API响应数据:', data);
    
    const content = data.choices[0]?.message?.content || '';
    if (!content) {
      console.warn('⚠️ API响应中没有内容');
      console.log('完整响应:', JSON.stringify(data, null, 2));
    }
    
    return content;
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

