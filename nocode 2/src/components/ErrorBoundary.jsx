import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary 捕获到错误:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center px-5">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-brand-border">
              <div className="text-6xl mb-4">😵</div>
              <h2 className="text-xl font-bold text-brand-text mb-4">
                页面出现了问题
              </h2>
              <p className="text-brand-text/70 mb-6">
                抱歉，页面遇到了一些技术问题。请刷新页面重试。
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors font-medium"
              >
                刷新页面
              </button>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-brand-text/60">
                    查看错误详情
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                    {this.state.error && this.state.error.toString()}
                    <br />
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
