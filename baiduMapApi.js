// 百度地图API服务
const BAIDU_MAP_API_URL = 'https://api.map.baidu.com/place/v2/search';
const BAIDU_MAP_AK = 'vc0WPRO7moeRnE0t9RDus0vlGFlmgifi';

// 菜系关键词转换映射
const CUISINE_MAPPING = {
  'hot pot': '火锅',
  'Chinese': '中餐',
  'Japanese': '日本料理',
  'Korean': '韩国料理',
  'Italian': '意大利餐厅',
  'BBQ': '烧烤',
  'Seafood': '海鲜'
};

// 转换菜系关键词
const convertCuisine = (cuisine) => {
  if (!cuisine) return '美食';

  // 如果是英文，转换为中文
  if (CUISINE_MAPPING[cuisine]) {
    return CUISINE_MAPPING[cuisine];
  }

  // 如果是中文，直接使用
  return cuisine;
};

// 转换距离偏好
const convertDistancePreference = (distancePreference) => {
  if (!distancePreference) return 5000; // 默认5公里

  // 假设输入是数字，单位为公里
  const distanceInMeters = distancePreference * 1000;

  // 百度地图API限制最大50000米
  return Math.min(distanceInMeters, 50000);
};

// 构建请求URL
const buildRequestUrl = (params) => {
  const { latitude, longitude, cuisine, distancePreference, pageNum = 0 } = params;

  const query = encodeURIComponent(convertCuisine(cuisine));
  const radius = convertDistancePreference(distancePreference);
  const location = `${latitude},${longitude}`;

  const urlParams = new URLSearchParams({
    query,
    location,
    radius,
    output: 'json',
    page_size: 20,
    page_num: pageNum,
    scope: 2,
    tag: '美食',
    ak: BAIDU_MAP_AK
  });

  return `${BAIDU_MAP_API_URL}?${urlParams.toString()}`;
};

// 检查百度地图API是否可用
const checkBaiduMapAvailability = () => {
  return new Promise((resolve) => {
    // 检查全局标记
    if (window.baiduMapAPIFailed) {
      resolve(false);
      return;
    }
    
    // 检查百度地图API是否已加载
    if (typeof window.BMap !== 'undefined') {
      resolve(true);
      return;
    }

    // 等待一段时间后再检查
    setTimeout(() => {
      if (window.baiduMapAPIFailed) {
        resolve(false);
      } else {
        resolve(typeof window.BMap !== 'undefined');
      }
    }, 2000);
  });
};

// 网络连接测试
const testNetworkConnectivity = async () => {
  try {
    // 尝试访问百度地图API的基础URL
    const testUrl = 'https://api.map.baidu.com/';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(testUrl, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors' // 避免CORS问题
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    console.warn('网络连接测试失败:', error.message);
    return false;
  }
};

// 搜索餐厅
export const searchRestaurants = async (parsedConditions) => {
  try {
    // 验证必要参数
    if (!parsedConditions.latitude || !parsedConditions.longitude) {
      throw new Error('缺少必要的坐标参数');
    }

    // 检查百度地图API可用性
    const isBaiduMapAvailable = await checkBaiduMapAvailability();
    if (!isBaiduMapAvailable) {
      // 进行网络连接测试
      const networkOk = await testNetworkConnectivity();
      if (!networkOk) {
        throw new Error('网络连接异常，无法访问地图服务。请检查网络连接或稍后重试。');
      } else {
        throw new Error('百度地图API未正确加载。这可能是由于网络问题或浏览器安全策略导致的。请尝试刷新页面或检查是否开启了广告拦截器。');
      }
    }

    // 构建请求参数
    const requestParams = {
      latitude: parsedConditions.latitude,
      longitude: parsedConditions.longitude,
      cuisine: parsedConditions.cuisine,
      distancePreference: parsedConditions.distance_preference,
      pageNum: parsedConditions.page_num || 0
    };

    // 构建请求URL
    const requestUrl = buildRequestUrl(requestParams);

    console.log('百度地图API请求URL:', requestUrl);
    console.log('当前使用的 AK:', BAIDU_MAP_AK);

    // 使用JSONP方式调用百度地图API
    return new Promise((resolve, reject) => {
      // 1. 生成更稳定的全局唯一回调函数名
      const callbackName = `bd_cb_${Math.random().toString(36).slice(2, 11)}`;
      
      // 2. 增加更长的超时保护 (45秒)，并确保清理干净
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('百度地图API响应超时。后台已接收请求但前端未收到回调，请检查网络代理或AK白名单设置。'));
      }, 45000);

      const cleanup = () => {
        clearTimeout(timeoutId);
        if (window[callbackName]) {
          // 不要立即删除，防止脚本延迟到达报错，改为空函数
          window[callbackName] = () => {}; 
        }
        const script = document.getElementById(callbackName);
        if (script && script.parentNode) script.parentNode.removeChild(script);
      };

      // 3. 定义全局回调
      window[callbackName] = (data) => {
        console.log('百度地图原始返回数据:', data); // 调试利器
        cleanup();
        if (data && data.status === 0) {
          resolve(data);
        } else {
          const msg = data?.message || `状态码: ${data?.status}`;
          reject(new Error(`百度API报错: ${msg}`));
        }
      };

      const script = document.createElement('script');
      script.id = callbackName;
      // 强制使用 https 并确保 callback 参数准确
      script.src = `${requestUrl}&callback=${callbackName}`;
      
      script.onerror = () => {
        cleanup();
        reject(new Error('百度地图脚本加载失败，可能是由于网络拦截或域名限制。'));
      };

      document.head.appendChild(script);
    });
  } catch (error) {
    console.error('百度地图API调用失败:', error);
    
    // 提供更友好的错误信息
    if (error.message.includes('网络') || error.message.includes('超时')) {
      throw new Error('网络连接异常，请检查网络后重试');
    } else if (error.message.includes('AK') || error.message.includes('权限') || error.message.includes('密钥')) {
      throw new Error('地图服务配置异常，请联系技术支持');
    } else if (error.message.includes('脚本加载失败')) {
      throw new Error('地图服务暂时不可用，请稍后重试或检查网络连接');
    } else {
      throw error;
    }
  }
};

// 预加载百度地图API（可选）
export const preloadBaiduMapAPI = () => {
  return new Promise((resolve, reject) => {
    // 如果已经标记为失败，直接返回失败
    if (window.baiduMapAPIFailed) {
      reject(new Error('百度地图API已标记为不可用'));
      return;
    }
    
    // 如果已经加载，直接返回
    if (typeof window.BMap !== 'undefined') {
      resolve(true);
      return;
    }

    // 检查是否已有加载中的脚本
    const existingScript = document.querySelector('script[src*="api.map.baidu.com"]');
    if (existingScript) {
      // 等待现有脚本加载完成
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => {
        window.baiduMapAPIFailed = true;
        reject(new Error('百度地图API加载失败'));
      };
      return;
    }

    // 创建新的脚本标签
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://api.map.baidu.com/api?v=2.0&ak=${BAIDU_MAP_AK}`;
    
    script.onload = () => {
      console.log('百度地图API预加载成功');
      window.baiduMapAPILoaded = true;
      resolve(true);
    };
    
    script.onerror = () => {
      console.error('百度地图API预加载失败');
      window.baiduMapAPIFailed = true;
      reject(new Error('百度地图API预加载失败'));
    };

    document.head.appendChild(script);
  });
};
