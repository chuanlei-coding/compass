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
  const [isLoadingSelection, setIsLoadingSelection] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedTextPreview, setSelectedTextPreview] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const ignoreSelectionRef = useRef(false); // 用于临时禁用选择检测

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    try {
      // 初始化时从localStorage加载API密钥和配置
      const savedKey = localStorage.getItem('ai_api_key');
      const savedUrl = localStorage.getItem('ai_api_url');
      const savedModel = localStorage.getItem('ai_model_name');
      if (savedKey) {
        AIService.setApiKey(savedKey);
      }
      if (savedUrl) {
        AIService.setApiUrl(savedUrl);
      }
      if (savedModel) {
        AIService.setModelName(savedModel);
      }

      // 检测并显示平台信息
      const platform = PlatformDetector.detect();
      if (platform !== 'unknown') {
        console.log(`运行平台: ${PlatformDetector.getPlatformName()}`);
      }
    } catch (error) {
      console.error('初始化配置时出错:', error);
    }
  }, []);

  useEffect(() => {
    // 自动调整文本框高度
    try {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    } catch (error) {
      console.error('调整文本框高度时出错:', error);
    }
  }, [inputValue]);

  // 使用 WordEditor 的选择监听器来检测选中文本
  useEffect(() => {
    const cleanup = WordEditor.setupSelectionChangedListener((hasSelection, selectedText) => {
      // 如果设置了忽略标志，则不处理选择变化
      if (ignoreSelectionRef.current) {
        return;
      }

      if (hasSelection && selectedText) {
        setHasSelection(true);
        // 显示预览（最多50个字符）
        const preview = selectedText.length > 50 
          ? selectedText.substring(0, 50) + '...' 
          : selectedText;
        setSelectedTextPreview(preview);
      } else {
        setHasSelection(false);
        setSelectedTextPreview('');
      }
    });

    // 清理函数
    return cleanup;
  }, []);

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
      console.log('📄 获取文档内容...');
      const documentContent = await WordEditor.getDocumentContent();
      console.log(`文档内容长度: ${documentContent.length}`);

      // 调用AI服务处理用户需求
      console.log(`🤖 调用AI服务处理请求: ${userMessage.content}`);
      const aiResponse = await AIService.processRequest(userMessage.content, documentContent);
      console.log(`AI响应: ${JSON.stringify(aiResponse, null, 2)}`);

      // 执行AI返回的编辑操作
      if (aiResponse.edits && aiResponse.edits.length > 0) {
        console.log(`✏️ 执行编辑操作: ${aiResponse.edits.length} 个操作`);
        await WordEditor.applyEdits(aiResponse.edits);
      } else {
        console.log('⚠️ 没有编辑操作需要执行');
      }

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

  const handleAddSelectionToChat = async () => {
    setIsLoadingSelection(true);
    setError(null);
    
    // 立即隐藏浮动按钮
    setHasSelection(false);
    
    // 暂时禁用选择检测，避免弹窗立即重新出现
    ignoreSelectionRef.current = true;
    
    try {
      console.log('📋 获取选中的文本...');
      const selectedText = await WordEditor.getSelectedText();
      
      if (!selectedText || !selectedText.trim()) {
        // 没有选中文本
        setError('请先在文档中选择要添加的文本');
        setTimeout(() => setError(null), 3000);
        // 延迟后重新启用选择检测
        setTimeout(() => {
          ignoreSelectionRef.current = false;
        }, 1000);
        return;
      }
      
      console.log(`✅ 获取到选中文本: ${selectedText.substring(0, 50)}...`);
      
      // 将选中的文本添加到输入框
      if (inputValue.trim()) {
        // 如果输入框已有内容，追加选中文本
        setInputValue((prev) => `${prev}\n\n【选中的文本】\n${selectedText}`);
      } else {
        // 如果输入框为空，直接设置为选中文本
        setInputValue(selectedText);
      }
      
      // 清除文档中的选中状态
      try {
        await WordEditor.clearSelection();
        console.log('✅ 已清除文档中的选中状态');
      } catch (error) {
        console.warn('⚠️ 清除选中状态失败:', error);
        // 即使清除失败也继续执行，不影响主要功能
      }
      
      // 聚焦到输入框
      setTimeout(() => {
        textareaRef.current?.focus();
        // 滚动到底部
        if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
      }, 100);
      
      // 延迟后重新启用选择检测（给用户时间操作）
      setTimeout(() => {
        ignoreSelectionRef.current = false;
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取选中文本时发生错误';
      console.error('❌ 获取选中文本失败:', err);
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
      // 延迟后重新启用选择检测
      setTimeout(() => {
        ignoreSelectionRef.current = false;
      }, 1000);
    } finally {
      setIsLoadingSelection(false);
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

      {/* 浮动按钮：当有选中文本时显示，固定在 TaskPane 右下角 */}
      {hasSelection && (
        <div className="floating-add-button">
          <div className="floating-add-button-content">
            <div className="floating-add-button-header">
              <span className="floating-add-button-title">检测到选中文本</span>
              <button
                className="floating-add-button-close"
                onClick={() => {
                  setHasSelection(false);
                  // 暂时禁用选择检测，避免立即重新显示
                  ignoreSelectionRef.current = true;
                  setTimeout(() => {
                    ignoreSelectionRef.current = false;
                  }, 1000);
                }}
                title="关闭"
              >
                ×
              </button>
            </div>
            <div className="floating-add-button-preview">
              {selectedTextPreview}
            </div>
            <button
              onClick={handleAddSelectionToChat}
              disabled={isLoading || isLoadingSelection}
              className="floating-add-button-btn"
            >
              {isLoadingSelection ? '添加中...' : '📋 添加到聊天'}
            </button>
          </div>
        </div>
      )}

      <div className="chat-input-container" style={{ position: 'relative' }}>
        <div className="chat-input-wrapper">
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
          <div className="send-button-wrapper">
            <button
              className="send-button"
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
            >
              {isLoading ? '发送中...' : '发送'}
            </button>
          </div>
        </div>
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

