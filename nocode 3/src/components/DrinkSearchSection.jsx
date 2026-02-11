import React, { useState, useEffect } from 'react';
import { useLocation } from '../contexts/LocationContext';
import { extractBrandFromStoreName } from '../constants/brandMap';
import { searchNearbyDrinkStores } from '../services/amapService';
import { searchDrinksByBrandsAndTags, getNearbyStoresFromSupabase } from '../services/supabaseService';
import RecommendationList from './RecommendationList';
import RecommendationSkeleton from './RecommendationSkeleton';

const DrinkSearchSection = () => {
  const { coordinates, locationName } = useLocation();
  const [drinkInput, setDrinkInput] = useState('');
  const [extractedTags, setExtractedTags] = useState([]);
  const [activeTags, setActiveTags] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // 词云标签映射
  const tagCloudOptions = [
    { display: '秋冬暖身', value: '暖身', size: 'text-sm' },
    { display: '姨妈经期', value: '经期友好', size: 'text-base' },
    { display: '抹茶控', value: '抹茶', size: 'text-sm' },
    { display: '巧克力控', value: '巧克力', size: 'text-sm' },
    { display: '红糖暖饮', value: '红糖', size: 'text-sm' },
    { display: '近期上新', value: '近期上新', size: 'text-sm' },
    { display: '低升糖', value: '低升糖', size: 'text-base' },
    { display: '无咖啡因', value: '无咖啡因', size: 'text-sm' },
    { display: '低卡轻负担', value: '低卡', size: 'text-sm' },
    { display: '水果清爽', value: '水果系', size: 'text-sm' },
    { display: '提神醒脑', value: '提神', size: 'text-sm' },
    { display: '奶香浓郁', value: '奶香浓郁', size: 'text-sm' }
  ];

  // 自动触发搜索
  useEffect(() => {
    if (activeTags.length > 0 && coordinates) {
      handleSearchRecommendations();
    }
  }, [activeTags, coordinates]);

  const handleAnalyze = async () => {
    if (!drinkInput.trim()) return;

    setIsAnalyzing(true);
    setError('');
    setExtractedTags([]);

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer sk-6fcd604753324744a228f58bbf41f894',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `你是一个饮品推荐标签提取器。用户会描述他们的身体状态、口味偏好或需求。
请从用户输入中提取关键标签（tags），返回一个 JSON 数组。

可用标签包括但不限于：
["暖身", "经期友好", "低升糖", "抹茶", "巧克力", "红糖", "近期上新", "无咖啡因", 
"低卡", "高蛋白", "水果系", "奶香浓郁", "清爽", "提神", "助消化", "养颜"]

只返回 JSON 数组，不要任何其他文字。
示例输入：「最近生理期想喝暖胃的，同时血糖波动有点大」
示例输出：["经期友好", "暖身", "低升糖"]`
            },
            {
              role: 'user',
              content: drinkInput
            }
          ]
        })
      });

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // 尝试解析 JSON，如果失败则用正则提取
      let tags;
      try {
        tags = JSON.parse(content);
      } catch (e) {
        const match = content.match(/\[.*\]/);
        if (match) {
          tags = JSON.parse(match[0]);
        } else {
          throw new Error('无法解析标签');
        }
      }
      
      setExtractedTags(tags);
      
      // 合并标签并去重
      const mergedTags = [...new Set([...activeTags, ...tags])];
      setActiveTags(mergedTags);
    } catch (err) {
      setError('AI 分析暂时不可用，请直接点击下方词云选择标签');
      console.error('DeepSeek API调用失败:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTagClick = (tagValue) => {
    let newActiveTags;
    if (activeTags.includes(tagValue)) {
      // 取消选中
      newActiveTags = activeTags.filter(tag => tag !== tagValue);
    } else {
      // 添加选中
      newActiveTags = [...activeTags, tagValue];
    }
    setActiveTags(newActiveTags);
  };

  const handleSearchRecommendations = async () => {
    if (!coordinates || activeTags.length === 0) return;

    setIsSearching(true);
    setError('');
    setRecommendations(null);
    setIsUsingFallback(false);

    try {
      let nearbyStores = [];
      let usingFallback = false;

      // Step 1: 尝试调用高德POI搜索
      try {
        nearbyStores = await searchNearbyDrinkStores(coordinates.lng, coordinates.lat);
        if (nearbyStores.length === 0) {
          throw new Error('高德返回空结果');
        }
      } catch (amapError) {
        console.warn('高德POI搜索失败，使用Supabase fallback:', amapError);
        // 使用Supabase作为fallback
        nearbyStores = await getNearbyStoresFromSupabase(coordinates.lng, coordinates.lat);
        usingFallback = true;
        setIsUsingFallback(true);
      }

      // Step 2: 提取品牌名
      const storesWithBrands = nearbyStores.map(store => ({
        ...store,
        brandName: extractBrandFromStoreName(store.name)
      })).filter(store => store.brandName); // 只保留识别到品牌的店铺

      // Step 3: 获取所有识别到的品牌
      const recognizedBrands = [...new Set(storesWithBrands.map(store => store.brandName))];
      
      if (recognizedBrands.length === 0) {
        setRecommendations([]);
        return;
      }

      // Step 4: 查询匹配的饮品
      const matchedDrinks = await searchDrinksByBrandsAndTags(recognizedBrands, activeTags);
      
      // Step 5: 合并结果
      const recommendationsWithDrinks = storesWithBrands.map(store => {
        const storeMatchedDrinks = matchedDrinks.filter(drink => 
          drink.brand_name === store.brandName
        );
        return {
          ...store,
          matchedDrinks
        };
      }).filter(store => store.matchedDrinks.length > 0); // 只保留有匹配饮品的店铺

      // 按距离排序
      recommendationsWithDrinks.sort((a, b) => a.distance - b.distance);
      
      setRecommendations(recommendationsWithDrinks);
    } catch (err) {
      setError('搜索失败，请稍后重试');
      console.error('推荐搜索失败:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto mt-16 px-6">
      {/* 第二搜索区 - 仅在定位成功后显示 */}
      {coordinates && (
        <div className="animate-fade-in-up mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              您想找寻怎样的饮品？
            </h2>
            <p className="text-sm text-gray-500">
              描述您的需求、口味偏好或身体状态
            </p>
          </div>

          <div className="w-full max-w-md mx-auto">
            <textarea
              value={drinkInput}
              onChange={(e) => setDrinkInput(e.target.value)}
              placeholder="如：最近生理期想喝暖胃的，希望低升糖控制血糖…"
              className="w-full h-20 p-4 text-gray-900 bg-white border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-all duration-300 ease-out resize-none"
              disabled={isAnalyzing}
            />
            
            <div className="mt-4">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !drinkInput.trim()}
                className="h-10 px-6 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-out"
              >
                {isAnalyzing ? '分析中...' : '为我推荐'}
              </button>
            </div>

            {/* 错误信息 */}
            {error && (
              <div className="mt-4 text-sm text-red-500 animate-fade-in">
                {error}
              </div>
            )}

            {/* 提取的标签 */}
            {extractedTags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {extractedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 热门需求词云 - 始终显示 */}
      <div className="relative py-8 px-4 rounded-2xl bg-gradient-to-b from-transparent via-gray-100 to-transparent">
        <h3 className="text-center text-base font-medium text-gray-400 mb-6">
          或者，快速选择您的需求
        </h3>
        
        <div className="flex flex-wrap justify-center gap-2.5">
          {tagCloudOptions.map((tag) => (
            <button
              key={tag.value}
              onClick={() => handleTagClick(tag.value)}
              className={`
                ${tag.size}
                px-4 py-2 rounded-full border transition-all duration-200 ease-out
                ${activeTags.includes(tag.value)
                  ? 'bg-gray-900 text-white border-gray-900' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-sm'
                }
              `}
            >
              {tag.display}
            </button>
          ))}
        </div>
      </div>

      {/* 选中的标签显示 */}
      {activeTags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <span className="text-sm text-gray-500">已选择：</span>
          {activeTags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 搜索结果区域 */}
      {coordinates && activeTags.length > 0 && (
        <div className="mt-8">
          {isSearching ? (
            <RecommendationSkeleton />
          ) : (
            <>
              {isUsingFallback && (
                <div className="text-center mb-4">
                  <span className="text-xs text-gray-400">当前为模拟店铺数据</span>
                </div>
              )}
              <RecommendationList recommendations={recommendations} />
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default DrinkSearchSection;
