import { useState, useEffect } from 'react';
import { Check, RotateCcw, Loader2, Navigation } from 'lucide-react';

const HeroSection = ({ onAddressConfirm }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeoLocating, setIsGeoLocating] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleConfirm = async () => {
    if (!address.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `https://restapi.amap.com/v3/geocode/geo?key=9deea9030329e7a129ec9c5bb57d052a&address=${encodeURIComponent(address)}&output=JSON`
      );
      const data = await response.json();
      
      if (data.status === "1" && data.geocodes && data.geocodes.length > 0) {
        const geocode = data.geocodes[0];
        const [lng, lat] = geocode.location.split(',').map(Number);
        
        const locationInfo = {
          lng,
          lat,
          formatted_address: geocode.formatted_address,
          city: geocode.city
        };
        
        setLocationData(locationInfo);
        onAddressConfirm(locationInfo);
        
        // 平滑滚动到第二区域
        setTimeout(() => {
          const secondSection = document.querySelector('[data-second-section]');
          if (secondSection) {
            secondSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        setError('未找到该地址，请尝试更详细的地址');
      }
    } catch (err) {
      setError('定位失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 一键获取当前定位
  const handleGeoLocate = async () => {
    if (!navigator.geolocation) {
      setError('您的浏览器不支持定位功能');
      return;
    }

    setIsGeoLocating(true);
    setError('');

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { longitude, latitude } = position.coords;

      // 高德逆地理编码：坐标 → 地址
      const response = await fetch(
        `https://restapi.amap.com/v3/geocode/regeo?key=9deea9030329e7a129ec9c5bb57d052a&location=${longitude},${latitude}&output=JSON`
      );
      const data = await response.json();

      if (data.status === '1' && data.regeocode) {
        const formatted = data.regeocode.formatted_address;
        const city = data.regeocode.addressComponent?.city ||
                     data.regeocode.addressComponent?.province || '';

        const locationInfo = {
          lng: longitude,
          lat: latitude,
          formatted_address: formatted,
          city: Array.isArray(city) ? city[0] || '' : city
        };

        setAddress(formatted);
        setLocationData(locationInfo);
        onAddressConfirm(locationInfo);

        setTimeout(() => {
          const secondSection = document.querySelector('[data-second-section]');
          if (secondSection) {
            secondSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        setError('逆地理编码失败，请手动输入地址');
      }
    } catch (err) {
      if (err.code === 1) {
        setError('定位权限被拒绝，请在浏览器设置中允许定位');
      } else if (err.code === 2) {
        setError('无法获取定位信息，请手动输入地址');
      } else if (err.code === 3) {
        setError('定位超时，请检查网络后重试');
      } else {
        setError('定位失败，请手动输入地址');
      }
    } finally {
      setIsGeoLocating(false);
    }
  };

  const handleReset = () => {
    setLocationData(null);
    setError('');
    setAddress('');
    onAddressConfirm(null);
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
            现在是 {currentTime}
          </p>
          <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-brand-text">
            今天您想在哪里喝什么？
          </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="输入您的商圈或地址…"
              className="w-full px-4 py-3 rounded-lg border border-brand-border bg-white text-brand-text placeholder-brand-text/60 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !address.trim()}
            className="w-full sm:w-auto px-6 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              已定位到 {locationData.formatted_address}
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
