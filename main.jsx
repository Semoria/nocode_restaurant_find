import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./index.css";

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // 特殊处理跨域脚本错误
  if (event.message === 'Script error.' && event.filename === '') {
    console.warn('检测到跨域脚本错误，可能是百度地图API相关问题');
    // 设置全局标记，表示百度地图API可能不可用
    window.baiduMapAPIFailed = true;
    // 不阻止应用继续运行，只是标记地图功能不可用
    event.preventDefault();
    return;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // 特殊处理百度地图相关的Promise rejection
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('百度') || event.reason.message.includes('baidu'))) {
    console.warn('检测到百度地图相关的Promise rejection');
    window.baiduMapAPIFailed = true;
    // 阻止Promise rejection导致应用崩溃
    event.preventDefault();
  }
});

// 检查关键依赖是否正确加载
const validateDependencies = () => {
  const issues = [];
  
  if (!React || !React.createElement || !React.useEffect) {
    issues.push('React框架未正确加载');
  }
  
  if (!ReactDOM || !ReactDOM.createRoot) {
    issues.push('ReactDOM未正确加载');
  }
  
  return issues;
};

// 渲染错误页面
const renderErrorPage = (message) => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background-color: #fef2f2; padding: 24px;">
        <div style="background: white; padding: 32px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px;">
          <h1 style="color: #dc2626; margin-bottom: 16px; font-size: 24px; font-weight: bold;">应用启动失败</h1>
          <p style="color: #6b7280; margin-bottom: 24px; line-height: 1.5;">${message}</p>
          <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 500;">刷新页面</button>
        </div>
      </div>
    `;
  }
};

// 百度地图API状态检查
const checkBaiduMapStatus = () => {
  return new Promise((resolve) => {
    // 如果已经标记为失败，直接返回
    if (window.baiduMapAPIFailed) {
      resolve(false);
      return;
    }
    
    // 如果已经加载成功，直接返回
    if (window.baiduMapAPILoaded || typeof window.BMap !== 'undefined') {
      resolve(true);
      return;
    }
    
    // 等待一段时间检查加载状态
    let checkCount = 0;
    const maxChecks = 5;
    const checkInterval = setInterval(() => {
      checkCount++;
      
      if (typeof window.BMap !== 'undefined') {
        clearInterval(checkInterval);
        window.baiduMapAPILoaded = true;
        resolve(true);
      } else if (checkCount >= maxChecks || window.baiduMapAPIFailed) {
        clearInterval(checkInterval);
        console.warn('百度地图API检查超时或加载失败');
        resolve(false);
      }
    }, 1000);
  });
};

// 确保DOM完全加载后再渲染应用
const renderApp = async () => {
  try {
    // 验证依赖
    const issues = validateDependencies();
    if (issues.length > 0) {
      renderErrorPage(issues.join('，') + '。请刷新页面重试。');
      return;
    }

    const rootElement = document.getElementById("root");
    
    if (!rootElement) {
      console.error("Root element not found");
      renderErrorPage('页面容器元素未找到。');
      return;
    }

    // 检查百度地图API状态
    const baiduMapAvailable = await checkBaiduMapStatus();
    if (!baiduMapAvailable) {
      console.warn('百度地图API不可用，地图功能将被禁用');
      window.baiduMapAPIFailed = true;
    }

    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    
    console.log('应用渲染成功');
  } catch (error) {
    console.error("Failed to render app:", error);
    renderErrorPage(`应用渲染失败：${error.message}。请刷新页面重试。`);
  }
};

// 确保DOM加载完成
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}

// 添加百度地图API加载状态监控
let baiduMapCheckInterval;
const monitorBaiduMapAPI = () => {
  let checkCount = 0;
  const maxChecks = 10; // 最多检查10次
  
  baiduMapCheckInterval = setInterval(() => {
    checkCount++;
    
    if (typeof window.BMap !== 'undefined') {
      console.log('百度地图API加载成功');
      window.baiduMapAPILoaded = true;
      clearInterval(baiduMapCheckInterval);
    } else if (checkCount >= maxChecks) {
      console.warn('百度地图API加载超时，可能影响地图相关功能');
      window.baiduMapAPIFailed = true;
      clearInterval(baiduMapCheckInterval);
    }
  }, 1000);
};

// 页面加载完成后开始监控百度地图API
window.addEventListener('load', () => {
  monitorBaiduMapAPI();
});
