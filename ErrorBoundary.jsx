import React from 'react';
import { AlertCircle, RefreshCw, Wifi, MapPin } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorType: 'unknown'
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 分析错误类型
    let errorType = 'unknown';
    if (error.message) {
      if (error.message.includes('百度') || error.message.includes('baidu') || error.message.includes('地图')) {
        errorType = 'map';
      } else if (error.message.includes('网络') || error.message.includes('fetch') || error.message.includes('timeout')) {
        errorType = 'network';
      } else if (error.message.includes('useEffect') || error.message.includes('hook')) {
        errorType = 'react';
      }
    }
    
    this.setState({
      error,
      errorInfo,
      errorType
    });
    
    // 特殊处理React Query相关错误
    if (error.message && error.message.includes('useEffect')) {
      console.error('React hooks error detected, this might be a React version compatibility issue');
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorType: 'unknown' });
  };

  getErrorMessage = () => {
    const { errorType, error } = this.state;
    
    switch (errorType) {
      case 'map':
        return {
          title: '地图服务异常',
          message: '地图功能暂时不可用，但其他功能仍可正常使用。请检查网络连接或稍后重试。',
          icon: <MapPin className="h-16 w-16 text-orange-500 mx-auto mb-4" />
        };
      case 'network':
        return {
          title: '网络连接异常',
          message: '无法连接到服务器，请检查网络连接后重试。',
          icon: <Wifi className="h-16 w-16 text-red-500 mx-auto mb-4" />
        };
      case 'react':
        return {
          title: 'React组件错误',
          message: '应用组件出现异常，这可能是版本兼容性问题。',
          icon: <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        };
      default:
        return {
          title: '应用出现错误',
          message: '应用遇到了一个意外错误，请尝试刷新页面或联系技术支持。',
          icon: <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        };
    }
  };

  render() {
    if (this.state.hasError) {
      const { title, message, icon } = this.getErrorMessage();
      
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            {icon}
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{title}</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {message}
            </p>
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <RefreshCw className="h-4 w-4" />
                <span>重试</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-200 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                刷新页面
              </button>
            </div>
            
            {/* 开发环境下显示错误详情 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 font-medium">
                  错误详情 (开发模式)
                </summary>
                <div className="mt-3 p-3 bg-gray-50 rounded border">
                  <pre className="text-xs text-red-600 overflow-auto whitespace-pre-wrap">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
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
