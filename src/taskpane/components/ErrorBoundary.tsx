import * as React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ React错误边界捕获到错误:', error);
    console.error('错误信息:', errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          backgroundColor: '#fff',
          minHeight: '100vh',
        }}>
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '20px',
            border: '2px solid #d32f2f',
            borderRadius: '8px',
            backgroundColor: '#ffebee',
          }}>
            <h2 style={{ color: '#d32f2f', marginTop: 0 }}>
              ⚠️ 发生错误
            </h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              插件遇到了一个错误，无法继续运行。
            </p>
            
            {this.state.error && (
              <div style={{
                backgroundColor: '#fff',
                padding: '15px',
                borderRadius: '4px',
                marginBottom: '15px',
                border: '1px solid #e0e0e0',
              }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 600 }}>
                  错误信息：
                </p>
                <pre style={{
                  margin: 0,
                  padding: '10px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}>
                  {this.state.error.toString()}
                  {this.state.error.stack && (
                    <>
                      {'\n\n'}
                      {this.state.error.stack}
                    </>
                  )}
                </pre>
              </div>
            )}

            <div style={{
              backgroundColor: '#fff',
              padding: '15px',
              borderRadius: '4px',
              marginBottom: '15px',
              border: '1px solid #e0e0e0',
            }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 600 }}>
                如何解决：
              </p>
              <ol style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
                <li>按 <strong>F12</strong> 打开开发者工具查看详细错误</li>
                <li>检查控制台（Console）标签页的错误信息</li>
                <li>尝试刷新插件（关闭并重新打开侧边栏）</li>
                <li>如果问题持续，请检查网络连接和服务器状态</li>
              </ol>
            </div>

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0078d4',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

