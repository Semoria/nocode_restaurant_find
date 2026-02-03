// 百度地图 Geocoding API 工具函数
// 使用 JSONP 方式调用百度地图 API

// 全局错误处理器
const setupGlobalErrorHandler = () => {
  if (typeof window !== 'undefined' && !window.geocodingErrorHandlerSetup) {
    window.geocodingErrorHandlerSetup = true;
    
    // 监听全局脚本错误
    window.addEventListener('error', (event) => {
      if (event.filename && event.filename.includes('api.map.baidu.com')) {
        console.error('百度地图API脚本错误:', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error
        });
      }
    });

    // 监听未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.message && event.reason.message.includes('地理编码')) {
        console.error('地理编码Promise拒绝:', event.reason);
      }
    });
  }
};

// 初始化全局错误处理
setupGlobalErrorHandler();

/**
 * 检查网络连接状态
 * @returns {boolean} 网络是否可用
 */
function checkNetworkStatus() {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

/**
 * 检查百度地图API是否可访问
 * @returns {Promise<boolean>} API是否可访问
 */
function checkBaiduApiAvailability() {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(false);
    }, 5000);

    const script = document.createElement('script');
    script.src = 'https://api.map.baidu.com/api?v=3.0&ak=test&callback=__baiduApiTest__';
    
    window.__baiduApiTest__ = () => {
      clearTimeout(timeout);
      cleanup();
      resolve(true);
    };

    script.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
      if (window.__baiduApiTest__) {
        delete window.__baiduApiTest__;
      }
    };

    try {
      document.head.appendChild(script);
    } catch (error) {
      clearTimeout(timeout);
      cleanup();
      resolve(false);
    }
  });
}

/**
 * 将地址转换为经纬度坐标
 * @param {string} address - 要转换的地址字符串
 * @returns {Promise<{latitude: number, longitude: number}>} - 返回经纬度对象
 */
export function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    // 输入验证
    if (!address || typeof address !== 'string' || address.trim() === '') {
      reject(new Error('地址参数无效'));
      return;
    }

    // 网络连接检查
    if (!checkNetworkStatus()) {
      reject(new Error('网络连接不可用，请检查网络设置'));
      return;
    }

    // 创建 JSONP 回调函数名
    const callbackName = `baidu_geocode_callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 创建 script 标签
    const script = document.createElement('script');
    
    // 设置超时时间（10秒）
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('地理编码请求超时，请稍后重试'));
    }, 10000);

    // 清理函数
    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (script && script.parentNode) {
        try {
          document.head.removeChild(script);
        } catch (e) {
          console.warn('清理script标签时出错:', e);
        }
      }
      if (window[callbackName]) {
        try {
          delete window[callbackName];
        } catch (e) {
          window[callbackName] = undefined;
        }
      }
    };
    
    // 设置回调函数
    window[callbackName] = (response) => {
      cleanup();
      
      try {
        // 处理响应
        if (response && response.status === 0 && response.result && response.result.location) {
          const { lat, lng } = response.result.location;
          
          // 验证坐标有效性
          if (typeof lat === 'number' && typeof lng === 'number' && 
              !isNaN(lat) && !isNaN(lng) && 
              lat >= -90 && lat <= 90 && 
              lng >= -180 && lng <= 180) {
            resolve({
              latitude: lat,
              longitude: lng
            });
          } else {
            reject(new Error('返回的坐标数据无效'));
          }
        } else {
          // 根据百度地图API错误码提供更友好的错误信息
          let errorMessage = '地理编码失败';
          if (response && response.status) {
            switch (response.status) {
              case 1:
                errorMessage = '服务器内部错误';
                break;
              case 2:
                errorMessage = '请求参数无效';
                break;
              case 3:
                errorMessage = '权限校验失败';
                break;
              case 4:
                errorMessage = '配额校验失败';
                break;
              case 5:
                errorMessage = 'API密钥无效或过期';
                break;
              case 101:
                errorMessage = '服务禁用';
                break;
              case 102:
                errorMessage = '不通过白名单或安全码不对';
                break;
              default:
                if (response.status >= 200 && response.status < 300) {
                  errorMessage = '无权限';
                } else if (response.status >= 300 && response.status < 400) {
                  errorMessage = '配额错误';
                } else {
                  errorMessage = `地理编码失败，错误码: ${response.status}`;
                }
            }
          }
          reject(new Error(errorMessage));
        }
      } catch (error) {
        reject(new Error(`处理地理编码响应时出错: ${error.message}`));
      }
    };
    
    // 设置 script 标签属性
    const encodedAddress = encodeURIComponent(address.trim());
    const apiKey = 'vc0WPRO7moeRnE0t9RDus0vlGFlmgifi';
    script.src = `https://api.map.baidu.com/geocoding/v3/?address=${encodedAddress}&output=json&ak=${apiKey}&callback=${callbackName}`;
    
    // 错误处理
    script.onerror = (event) => {
      cleanup();
      console.error('百度地图API脚本加载失败:', {
        event,
        src: script.src,
        timestamp: new Date().toISOString()
      });
      reject(new Error('地理编码服务暂时不可用，请稍后重试'));
    };

    // 加载处理
    script.onload = () => {
      // script加载成功，但这不意味着API调用成功
      // 实际的成功/失败会在回调函数中处理
      console.log('百度地图API脚本加载成功');
    };
    
    // 设置script属性以提高安全性和性能
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    
    try {
      // 添加到页面
      document.head.appendChild(script);
      console.log('开始地理编码请求:', { address, callbackName });
    } catch (error) {
      cleanup();
      console.error('无法添加地理编码脚本:', error);
      reject(new Error(`无法加载地理编码服务: ${error.message}`));
    }
  });
}

/**
 * 带重试机制的地理编码函数
 * @param {string} address - 要转换的地址字符串
 * @param {number} maxRetries - 最大重试次数，默认为2
 * @returns {Promise<{latitude: number, longitude: number}>} - 返回经纬度对象
 */
export function geocodeAddressWithRetry(address, maxRetries = 2) {
  return new Promise(async (resolve, reject) => {
    let lastError;
    
    // 首先检查API可用性
    const isApiAvailable = await checkBaiduApiAvailability();
    if (!isApiAvailable) {
      console.warn('百度地图API不可访问，使用降级方案');
      reject(new Error('地理编码服务暂时不可用'));
      return;
    }
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`地理编码尝试 ${attempt + 1}/${maxRetries + 1}:`, address);
        const result = await geocodeAddress(address);
        console.log('地理编码成功:', result);
        resolve(result);
        return;
      } catch (error) {
        lastError = error;
        console.warn(`地理编码尝试 ${attempt + 1} 失败:`, error.message);
        
        // 如果不是最后一次尝试，等待一段时间后重试
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // 指数退避，最大5秒
          console.log(`等待 ${delay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error('地理编码重试全部失败:', lastError);
    reject(lastError || new Error('地理编码重试失败'));
  });
}

/**
 * 获取预设的上海商圈坐标
 * @param {string} district - 商圈名称
 * @returns {Object|null} - 返回坐标对象或null
 */
export function getDistrictCoordinates(district) {
  const districtCoords = {
    '陆家嘴': { latitude: 31.2401, longitude: 121.5002 },
    '静安寺': { latitude: 31.2271, longitude: 121.4472 },
    '南京东路': { latitude: 31.2335, longitude: 121.4789 },
    '徐家汇': { latitude: 31.1959, longitude: 121.4337 },
    '虹桥': { latitude: 31.1935, longitude: 121.3175 },
    '外滩': { latitude: 31.2397, longitude: 121.4900 },
    '新天地': { latitude: 31.2192, longitude: 121.4737 },
    '人民广场': { latitude: 31.2336, longitude: 121.4707 },
    '上海': { latitude: 31.2304, longitude: 121.4737 } // 上海市中心
  };
  
  return districtCoords[district] || null;
}

/**
 * 智能地理编码函数 - 优先使用预设坐标，失败时使用API
 * @param {string} address - 要转换的地址字符串
 * @returns {Promise<{latitude: number, longitude: number}>} - 返回经纬度对象
 */
export function smartGeocode(address) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('开始智能地理编码:', address);
      
      // 首先尝试从预设坐标中获取
      const presetCoords = getDistrictCoordinates(address);
      if (presetCoords) {
        console.log('使用预设坐标:', presetCoords);
        resolve(presetCoords);
        return;
      }
      
      // 如果没有预设坐标，使用API进行地理编码
      console.log('预设坐标未找到，尝试API地理编码');
      const result = await geocodeAddressWithRetry(address);
      resolve(result);
    } catch (error) {
      // 如果API也失败了，返回上海市中心坐标作为降级方案
      console.warn('地理编码完全失败，使用默认坐标:', error.message);
      const fallbackCoords = { latitude: 31.2304, longitude: 121.4737 };
      console.log('使用降级坐标:', fallbackCoords);
      resolve(fallbackCoords);
    }
  });
}

/**
 * 验证坐标有效性
 * @param {Object} coords - 坐标对象
 * @returns {boolean} - 坐标是否有效
 */
export function validateCoordinates(coords) {
  if (!coords || typeof coords !== 'object') {
    return false;
  }
  
  const { latitude, longitude } = coords;
  
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * 获取地理编码服务状态
 * @returns {Promise<Object>} - 服务状态信息
 */
export async function getGeocodingServiceStatus() {
  const status = {
    networkAvailable: checkNetworkStatus(),
    apiAvailable: false,
    timestamp: new Date().toISOString()
  };
  
  try {
    status.apiAvailable = await checkBaiduApiAvailability();
  } catch (error) {
    console.error('检查API可用性时出错:', error);
    status.error = error.message;
  }
  
  return status;
}
