import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';

const HeroSection = () => {
  const { coordinates, setCoordinates, locationName, setLocationName } = useLocation();
  const [locationInput, setLocationInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!locationInput.trim()) return;

    setIsSearching(true);
    setError('');
    setCoordinates(null);
    setLocationName('');

    try {
      const response = await fetch(
        `https://restapi.amap.com/v3/geocode/geo?key=9deea9030329e7a129ec9c5bb57d052a&address=${encodeURIComponent(locationInput)}&city=全国`
      );
      
      const data = await response.json();
      
      if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
        const firstResult = data.geocodes[0];
        const [lng, lat] = firstResult.location.split(',').map(Number);
        
        setCoordinates({ lng, lat });
        setLocationName(firstResult.formatted_address || firstResult.formatted);
        
        // 平滑滚动到下一个section
        setTimeout(() => {
          window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
          });
        }, 500);
      } else {
        setError('未找到该地址，请尝试更具体的描述');
      }
    } catch (err) {
      setError('搜索失败，请稍后重试');
      console.error('地理编码API调用失败:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6">
      <div className="w-full max-w-2xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
          今天，您想在哪里喝什么？
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          输入您所在的商圈或地址
        </p>
        
        <div className="relative w-full max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="如：徐家汇、延安西路、南京东路…"
              className="w-full h-12 pl-12 pr-16 text-gray-900 bg-white border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-all duration-300 ease-out"
              disabled={isSearching}
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-900"></div>
              </div>
            )}
          </div>
          
          {/* 搜索结果反馈 */}
          {(locationName || error) && (
            <div className={`mt-4 text-sm animate-fade-in ${
              error ? 'text-red-500' : 'text-emerald-500'
            }`}>
              {error || `📍 已定位到：${locationName}`}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
