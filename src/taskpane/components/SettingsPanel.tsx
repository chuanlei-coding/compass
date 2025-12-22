import * as React from 'react';
import { useState } from 'react';
import { AIService } from '../services/AIService';

interface SettingsPanelProps {
  onClose: () => void;
  onApiKeySet: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose, onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('https://api.openai.com/v1/chat/completions');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      AIService.setApiKey(apiKey.trim());
    }
    if (apiUrl.trim()) {
      AIService.setApiUrl(apiUrl.trim());
    }
    
    // 保存到localStorage
    if (apiKey.trim()) {
      localStorage.setItem('ai_api_key', apiKey.trim());
    }
    if (apiUrl.trim()) {
      localStorage.setItem('ai_api_url', apiUrl.trim());
    }
    
    setSaved(true);
    onApiKeySet();
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  React.useEffect(() => {
    // 从localStorage加载已保存的配置
    const savedKey = localStorage.getItem('ai_api_key');
    const savedUrl = localStorage.getItem('ai_api_url');
    if (savedKey) {
      setApiKey(savedKey);
      AIService.setApiKey(savedKey);
    }
    if (savedUrl) {
      setApiUrl(savedUrl);
      AIService.setApiUrl(savedUrl);
    }
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>AI服务配置</h2>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
            API密钥
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="输入您的AI API密钥"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            如果不设置API密钥，将使用模拟响应进行测试
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
            API URL
          </label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="API服务地址"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#0078d4',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {saved ? '已保存 ✓' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

