import { useState, useEffect } from 'react';
import { Check, RotateCcw, Loader2, LocateFixed } from 'lucide-react';
import { toast } from 'sonner';

const HeroSection = ({ onAddressConfirm }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        setCurrentTime(`${hours}:${minutes}`);
      } catch (err) {
        console.error('时间更新失败:', err);
        setCurrentTime('--:--');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // 提取纯异步函数，不依赖任何state
  const geocodeAddress = async (addressToGeocode) => {
    const response = await fetch(
      `https://restapi.amap.com/v3/geocode/geo?key=9deea9030329e7a129ec9c5bb57d052a&address=${encodeURIComponent(addressToGeocode)}&output=JSON`
    );
    
    if (!response.ok) {
      throw new Error('网络请求失败');
    }
    
    const data = await response.json();
    
    if (data.status === "1" && data.geocodes && data.geocodes.length > 0) {
      const geocode = data.geocodes[0];
      const locationStr = geocode.location || '';
      const [lng, lat] = locationStr.split(',').map(Number);
      
      if (isNaN(lng) || isNaN(lat)) {
        throw new Error('坐标解析失败');
      }
      
      return {
        lng,
        lat,
        formatted_address: geocode.formatted_address || addressToGeocode,
        city: geocode.city || ''
      };
    } else {
      throw new Error('未找到该地址，请尝试更详细的地址');
    }
  };

  const handleConfirm = async () => {
    if (!address.trim()) {
      setError('请输入地址');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const locationInfo = await geocodeAddress(address);
      
      setLocationData(locationInfo);
      
      if (typeof onAddressConfirm === 'function') {
        onAddressConfirm(locationInfo);
      }
      
      // 平滑滚动到第二区域
      setTimeout(() => {
        try {
          const secondSection = document.querySelector('[data-second-section]');
          if (secondSection) {
            secondSection.scrollIntoView({ behavior: 'smooth' });
          }
        } catch (scrollErr) {
          console.error('滚动失败:', scrollErr);
        }
      }, 100);
    } catch (err) {
      console.error('定位失败:', err);
      setError(err.message || '定位失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    try {
      setLocationData(null);
      setError('');
      setAddress('');
      if (typeof onAddressConfirm === 'function') {
        onAddressConfirm(null);
      }
    } catch (err) {
      console.error('重置失败:', err);
    }
  };

  // 一键定位功能 - 纯点击回调，不依赖任何state
  const handleAutoLocate = async () => {
    setIsLocating(true);
    setError('');
    
    try {
      // 调用高德IP定位API
      const response = await fetch(
        'https://restapi.amap.com/v3/ip?key=9deea9030329e7a129ec9c5bb57d052a&output=JSON'
      );
      
      if (!response.ok) {
        throw new Error('定位服务不可用');
      }
      
      const data = await response.json();
      
      // 修复：检查 city 是否为空数组或空字符串
      const city = Array.isArray(data.city) ? '' : (data.city || '');
      if (data.status !== "1" || !city) {
        toast.error('自动定位失败，请手动输入地址');
        return;
      }
      
      // 将城市名填入地址输入框
      setAddress(city);
      
      // 调用高德Geocode接口，将城市名解析为精确坐标
      const locationInfo = await geocodeAddress(city);
      
      setLocationData(locationInfo);
      
      if (typeof onAddressConfirm === 'function') {
        onAddressConfirm(locationInfo);
      }
      
      // 平滑滚动到第二区域
      setTimeout(() => {
        try {
          const secondSection = document.querySelector('[data-second-section]');
          if (secondSection) {
            secondSection.scrollIntoView({ behavior: 'smooth' });
          }
        } catch (scrollErr) {
          console.error('滚动失败:', scrollErr);
        }
      }, 100);
    } catch (err) {
      console.error('自动定位失败:', err);
      toast.error('自动定位失败，请手动输入地址');
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <section className="relative py-12 md:py-20 px-5 animate-fade-in-up">
      {/* 背景插画 */}
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://nocode.meituan.com/photo/search?keyword=coffee,tea,drinks&width=1200&height=800')`
        }}
      />
      
      {/* 内容区域 */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <p className="text-xl md:text-2xl lg:text-4xl font-medium text-brand-text mb-2">
            现在是 {currentTime || '--:--'}
          </p>
          <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-brand-text">
            今天您想在哪里喝什么？
          </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="输入您的商圈或地址…"
              className="w-full px-4 py-3 rounded-lg border border-brand-border bg-white text-brand-text placeholder-brand-text/60 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              disabled={isLoading || isLocating}
            />
          </div>
          <div className="flex gap-2 sm:contents">
            <button
              onClick={handleAutoLocate}
              disabled={isLoading || isLocating}
              className="flex-1 sm:flex-none sm:w-auto px-4 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLocating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  定位中…
                </>
              ) : (
                <>
                  <LocateFixed className="h-4 w-4" />
                  定位
                </>
              )}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || isLocating || !address.trim()}
              className="flex-1 sm:flex-none sm:w-auto px-6 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  定位中…
                </>
              ) : (
                '确认'
              )}
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* 确认状态显示 */}
        {locationData && (
          <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
            <Check className="h-4 w-4" />
            <span className="text-sm">
              已定位到 {locationData.formatted_address || '未知地址'}
            </span>
            <button
              onClick={handleReset}
              className="ml-2 text-xs text-brand-primary hover:underline"
            >
              重新定位
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
