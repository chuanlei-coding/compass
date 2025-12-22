import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { WordEditor } from '../services/WordEditor';
import { AIService } from '../services/AIService';
import { SettingsPanel } from './SettingsPanel';
import { PlatformDetector } from '../utils/PlatformDetector';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 初始化时从localStorage加载API密钥
    const savedKey = localStorage.getItem('ai_api_key');
    const savedUrl = localStorage.getItem('ai_api_url');
    if (savedKey) {
      AIService.setApiKey(savedKey);
    }
    if (savedUrl) {
      AIService.setApiUrl(savedUrl);
    }

    // 检测并显示平台信息
    const platform = PlatformDetector.detect();
    if (platform !== 'unknown') {
      console.log(`运行平台: ${PlatformDetector.getPlatformName()}`);
    }
  }, []);

  useEffect(() => {
    // 自动调整文本框高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // 获取当前文档内容
      const documentContent = await WordEditor.getDocumentContent();

      // 调用AI服务处理用户需求
      const aiResponse = await AIService.processRequest(userMessage.content, documentContent);

      // 执行AI返回的编辑操作
      await WordEditor.applyEdits(aiResponse.edits);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.message || '已根据您的要求完成文档编辑。',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '处理请求时发生错误';
      setError(errorMessage);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `抱歉，处理您的请求时出现错误：${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <span>Word/WPS AI助手</span>
        <div style={{ float: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', opacity: 0.8 }}>
            {PlatformDetector.getPlatformName()}
          </span>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            设置
          </button>
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            padding: '40px 20px',
            fontSize: '14px'
          }}>
            <p>👋 欢迎使用Word AI助手！</p>
            <p style={{ marginTop: '8px' }}>告诉我您想要对文档做什么修改，我会帮您完成。</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-bubble">{message.content}</div>
            <div className="message-time">{formatTime(message.timestamp)}</div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant">
            <div className="message-bubble">
              <div className="loading-indicator">
                <span>AI正在处理</span>
                <div className="loading-dots">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="chat-input-container">
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入您的需求，例如：将第一段加粗、在文档末尾添加一段文字..."
          rows={1}
          disabled={isLoading}
        />
        <button
          className="send-button"
          onClick={handleSend}
          disabled={isLoading || !inputValue.trim()}
        >
          发送
        </button>
      </div>

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          onApiKeySet={() => {
            // API密钥已设置
          }}
        />
      )}
    </div>
  );
};

