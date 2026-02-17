import { useState, useEffect } from 'react';
import { Check, Loader2, LocateFixed } from 'lucide-react';
import { toast } from 'sonner';

const AMAP_KEY = '9deea9030329e7a129ec9c5bb57d052a';

const HeroSection = ({ onAddressConfirm }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIPLocating, setIsIPLocating] = useState(false);
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

  // 公共：地址字符串 → 坐标（纯异步函数，不触碰 state）
  const geocodeAddress = async (addressStr) => {
    const response = await fetch(
      `https://restapi.amap.com/v3/geocode/geo?key=${AMAP_KEY}&address=${encodeURIComponent(addressStr)}&output=JSON`
    );
    const data = await response.json();

    if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
      const geocode = data.geocodes[0];
      const [lng, lat] = geocode.location.split(',').map(Number);
      return {
        lng,
        lat,
        formatted_address: geocode.formatted_address,
        city: geocode.city,
      };
    }
    return null;
  };

  const scrollToNext = () => {
    setTimeout(() => {
      const secondSection = document.querySelector('[data-second-section]');
      if (secondSection) {
        secondSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // 手动输入地址后点"确认"
  const handleConfirm = async () => {
    if (!address.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const locationInfo = await geocodeAddress(address);

      if (locationInfo) {
        setLocationData(locationInfo);
        onAddressConfirm(locationInfo);
        scrollToNext();
      } else {
        setError('未找到该地址，请尝试更详细的地址');
      }
    } catch {
      setError('定位失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 一键定位：调用高德 IP 定位 API，纯点击事件，不使用 useEffect
  const handleIPLocate = async () => {
    setIsIPLocating(true);
    setError('');

    try {
      const ipRes = await fetch(
        `https://restapi.amap.com/v3/ip?key=${AMAP_KEY}&output=JSON`
      );
      const ipData = await ipRes.json();

      if (ipData.status !== '1' || !ipData.city) {
        toast.error('自动定位失败，请手动输入地址');
        return;
      }

      const city = ipData.city; // 例如 "上海市"
      setAddress(city);         // 填入输入框，让用户看到结果

      const locationInfo = await geocodeAddress(city);

      if (locationInfo) {
        setLocationData(locationInfo);
        onAddressConfirm(locationInfo);
        scrollToNext();
      } else {
        toast.error('自动定位失败，请手动输入地址');
      }
    } catch {
      toast.error('自动定位失败，请手动输入地址');
    } finally {
      setIsIPLocating(false);
    }
  };

  const handleReset = () => {
    setLocationData(null);
    setError('');
    setAddress('');
    onAddressConfirm(null);
  };

  const anyLoading = isLoading || isIPLocating;

  return (
    <section className="relative py-12 md:py-20 px-5 animate-fade-in-up">
      {/* 背景插画 */}
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://nocode.meituan.com/photo/search?keyword=coffee,tea,drinks&width=1200&height=800')`,
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

        <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
          {/* 地址输入框 */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              placeholder="输入您的商圈或地址…"
              className="w-full px-4 py-3 rounded-lg border border-brand-border bg-white text-brand-text placeholder-brand-text/60 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              disabled={anyLoading}
            />
          </div>

          {/* 一键定位按钮 */}
          <button
            onClick={handleIPLocate}
            disabled={anyLoading}
            title="通过IP自动定位当前城市"
            className="w-full sm:w-auto px-4 py-2.5 bg-white border border-brand-border text-brand-primary rounded-lg hover:bg-brand-light transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {isIPLocating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>定位中…</span>
              </>
            ) : (
              <>
                <LocateFixed className="h-4 w-4" />
                <span>定位</span>
              </>
            )}
          </button>

          {/* 确认按钮 */}
          <button
            onClick={handleConfirm}
            disabled={anyLoading || !address.trim()}
            className="w-full sm:w-auto px-6 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>确认中…</span>
              </>
            ) : (
              '确认'
            )}
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 text-red-500 text-sm">{error}</div>
        )}

        {/* 定位成功状态 */}
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
