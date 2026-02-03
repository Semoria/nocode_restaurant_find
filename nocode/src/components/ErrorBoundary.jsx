import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary 捕获到错误:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // 可以将错误日志上报给服务
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    try {
      // 这里可以添加错误上报逻辑
      console.log('错误上报:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    } catch (e) {
      console.error('错误上报失败:', e);
    }
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                应用遇到了问题
              </h1>
              <p className="text-gray-600 mb-6">
                很抱歉，应用运行时出现了错误。这可能是由于网络连接问题或外部服务暂时不可用导致的。
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={this.handleRetry}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                重新尝试
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                刷新页面
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  查看错误详情
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 overflow-auto">
                  <div className="mb-2">
                    <strong>错误信息:</strong> {this.state.error.message}
                  </div>
                  <div className="mb-2">
                    <strong>错误堆栈:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>组件堆栈:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
