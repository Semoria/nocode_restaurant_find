import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import { Loader2 } from "lucide-react";

// 验证React hooks是否可用
const validateReactHooks = () => {
  try {
    if (!React.useEffect || !React.useState || !React.useCallback) {
      throw new Error('React hooks not available');
    }
    return true;
  } catch (error) {
    console.error('React hooks validation failed:', error);
    return false;
  }
};

// 创建QueryClient实例，添加错误处理配置
let queryClient;
try {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000, // 5分钟
        cacheTime: 10 * 60 * 1000, // 10分钟
      },
      mutations: {
        retry: 1,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: console.error,
    },
  });
} catch (error) {
  console.error('Failed to create QueryClient:', error);
  queryClient = null;
}

// 加载中组件
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600">应用加载中...</p>
    </div>
  </div>
);

// 错误回退组件
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
      <h2 className="text-xl font-bold text-red-600 mb-4">应用出现错误</h2>
      <p className="text-gray-600 mb-4">
        {error?.message || "发生了未知错误"}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        重试
      </button>
    </div>
  </div>
);

// 不使用React Query的降级组件
const FallbackApp = () => (
  <HashRouter>
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {navItems.map(({ to, page }) => (
          <Route key={to} path={to} element={page} />
        ))}
      </Routes>
    </Suspense>
  </HashRouter>
);

const App = () => {
  // 验证React环境
  if (!validateReactHooks()) {
    return <ErrorFallback error={new Error('React hooks 不可用')} resetErrorBoundary={() => window.location.reload()} />;
  }

  // 如果QueryClient创建失败，使用降级方案
  if (!queryClient) {
    console.warn('QueryClient not available, using fallback app');
    return (
      <TooltipProvider>
        <Toaster />
        <FallbackApp />
      </TooltipProvider>
    );
  }

  try {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <HashRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {navItems.map(({ to, page }) => (
                  <Route key={to} path={to} element={page} />
                ))}
              </Routes>
            </Suspense>
          </HashRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error("App render error:", error);
    return <ErrorFallback error={error} resetErrorBoundary={() => window.location.reload()} />;
  }
};

export default App;
