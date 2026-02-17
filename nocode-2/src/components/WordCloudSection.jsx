import { useState, useEffect } from 'react';
import { CheckCircle, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  searchPoiStores,
  extractBrandsAndMap,
  getDeepSeekRecommendations,
  processRecommendations
} from '@/lib/recommendationEngine';

const WordCloudSection = ({ 
  extractedTags = [], 
  poiStores = [], 
  recommendations = [], 
  isRecommendationsLoading = false,
  locationData,
  onSelectBeverage,
  onRecommendationsReceived
}) => {
  const [tagCounts, setTagCounts] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [wordCloudLoading, setWordCloudLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // 从 Supabase 获取标签数据
  useEffect(() => {
    const fetchTags = async () => {
      const { data } = await supabase.from('beverages').select('tags');
      if (!data) return;
      const tagMap = {};
      data.forEach(b => b.tags?.forEach(t => {
        tagMap[t] = (tagMap[t] || 0) + 1;
      }));
      const sorted = Object.entries(tagMap)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);
      setTagCounts(sorted);
    };
    fetchTags();
  }, []);

  // 分阶段loading文案
  useEffect(() => {
    if (!isRecommendationsLoading) {
      setLoadingText('');
      return;
    }
    setLoadingText('正在定位附近的饮品店…');
    const t1 = setTimeout(() => setLoadingText('AI 正在分析您的需求…'), 1500);
    const t2 = setTimeout(() => setLoadingText('正在为您挑选最合适的饮品…'), 3000);
    const t3 = setTimeout(() => setLoadingText('快好了，再等一下…'), 5000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isRecommendationsLoading]);

  // 词云标签点击处理
  const handleTagClick = async (tag) => {
    // 1. 切换选中状态
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);

    // 2. 如果没有选中任何 tag，清空推荐
    if (newTags.length === 0) {
      onRecommendationsReceived([], false);
      return;
    }

    // 3. 检查定位
    if (!locationData) {
      toast('请先输入地址定位哦 📍');
      return;
    }

    // 4. 触发推荐流程（复用公共函数）
    setWordCloudLoading(true);
    onRecommendationsReceived([], true);  // 通知父组件进入 loading
    try {
      // 记录开始时间，确保骨架屏最少显示800ms
      const startTime = Date.now();

      const stores = await searchPoiStores(locationData.lng, locationData.lat);
      const { brandList, brandStoreMap } = extractBrandsAndMap(stores);
      const rawRecs = await getDeepSeekRecommendations(
        brandList,
        newTags.join('、'),    // 将选中的标签作为用户需求
        newTags
      );
      const finalRecs = await processRecommendations(rawRecs, brandStoreMap);

      // 确保最少显示800ms
      const elapsed = Date.now() - startTime;
      if (elapsed < 800) {
        await new Promise(resolve => setTimeout(resolve, 800 - elapsed));
      }

      onRecommendationsReceived(finalRecs, false);
    } catch (err) {
      console.error('词云推荐失败:', err);
      toast.error('推荐失败，请重试');
      onRecommendationsReceived([], false);
    }
    setWordCloudLoading(false);
  };

  // 骨架屏组件
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl border border-brand-border p-4 md:p-5 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-3">
        <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
        <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  // 按店铺分组推荐
  const groupRecommendationsByStore = () => {
    const storeGroups = {};
    
    recommendations.forEach(rec => {
      if (rec.store) {
        const storeKey = rec.store.name;
        if (!storeGroups[storeKey]) {
          storeGroups[storeKey] = {
            store: rec.store,
            recommendations: []
          };
        }
        storeGroups[storeKey].recommendations.push(rec);
      }
    });
    
    return Object.values(storeGroups);
  };

  const storeGroups = groupRecommendationsByStore();

  // 词云标签颜色
  const TAG_COLORS = ['#8B6F47', '#D4A574', '#6B8E6B', '#7B9EC4', '#C47B7B'];

  return (
    <section className="py-12 md:py-20 px-5">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-8 text-center">
          热门饮品标签
        </h2>
        
        {/* 词云区域 */}
        <div className="bg-brand-light rounded-2xl p-8 mb-8">
          <h3 className="text-lg font-medium text-brand-text mb-4 text-center">
            点击标签获取推荐
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {tagCounts.map((item, index) => {
              const isSelected = selectedTags.includes(item.tag);
              const colorIndex = index % TAG_COLORS.length;
              const sizeClass = item.count > 10 ? 'text-lg px-4 py-2'
                              : item.count > 5 ? 'text-base px-3 py-1.5'
                              : 'text-sm px-3 py-1.5';

              return (
                <button
                  key={item.tag}
                  onClick={() => handleTagClick(item.tag)}
                  className={`rounded-full font-medium transition-all duration-200 min-h-[36px] animate-fade-in-up opacity-0
                    ${sizeClass}
                    ${isSelected
                      ? 'text-white shadow-md scale-105'
                      : 'bg-white border border-brand-border text-brand-text hover:border-brand-primary'
                    }`}
                  style={{
                    backgroundColor: isSelected ? TAG_COLORS[colorIndex] : undefined,
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {item.tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 推荐列表 */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-brand-text mb-4 text-center">
            为您推荐
          </h3>
          
          {/* loading文案 */}
          {isRecommendationsLoading && (
            <div className="text-center mb-6">
              <p className="text-sm text-brand-primary animate-pulse">{loadingText}</p>
            </div>
          )}

          {isRecommendationsLoading ? (
            // 骨架屏
            <>
              {[1, 2, 3].map(i => (
                <SkeletonCard key={i} />
              ))}
            </>
          ) : storeGroups.length > 0 ? (
            // 推荐列表
            storeGroups.map((group, index) => (
              <div 
                key={index}
                className="w-full bg-white rounded-xl border border-brand-border p-4 md:p-5 hover:shadow-md transition duration-200 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-4">
                  <div className="text-2xl font-bold text-brand-primary">
                    {group.store.distance}m
                  </div>
                  <div className="text-sm text-brand-text/60">
                    {group.store.name}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {group.recommendations.map((rec, recIndex) => (
                    <div key={recIndex}>
                      <div className="flex justify-between items-start mb-2">
                        <div
                          className="font-medium text-brand-text cursor-pointer hover:underline"
                          onClick={() => onSelectBeverage(rec)}
                        >
                          🧋 {rec.beverage_name}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-brand-primary font-medium">
                            ¥{rec.price_approx}
                          </span>
                          <span className="text-sm text-brand-text/60">
                            {rec.sugar_option}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-brand-text/50 italic mb-2">
                        「{rec.reason}」
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        {rec.data_badge === "verified" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                            <CheckCircle className="h-3 w-3" />
                            小红书实测
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                            <Zap className="h-3 w-3" />
                            AI 估算
                          </span>
                        )}
                        
                        <div className="flex flex-wrap gap-1">
                          {rec.tags.map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className="text-xs text-brand-accent"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {rec.health_note && (
                        <div className="text-xs text-brand-text/70 mb-2">
                          💡 {rec.health_note}
                        </div>
                      )}
                      
                      {/* 血糖数据 */}
                      <div className="text-xs text-brand-text/60">
                        血糖指数: 空腹 {rec.blood_sugar_data.fasting} → 
                        30分钟 {rec.blood_sugar_data.post_30min} → 
                        60分钟 {rec.blood_sugar_data.post_60min} → 
                        120分钟 {rec.blood_sugar_data.post_120min}
                        {rec.blood_sugar_data.post_180min && ` → 180分钟 ${rec.blood_sugar_data.post_180min}`}
                      </div>
                      
                      {/* 分割线 */}
                      {recIndex < group.recommendations.length - 1 && (
                        <div className="border-t border-brand-border/50 mt-4"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            // 空状态
            <div className="bg-white rounded-xl border border-brand-border p-8 text-center">
              <p className="text-brand-text/60">
                暂无符合您要求的推荐，换个需求试试？ 🧋
              </p>
            </div>
          )}
        </div>

        {/* 附近店铺信息 */}
        <div className="bg-brand-light rounded-2xl p-8 mt-8">
          <h3 className="text-lg font-medium text-brand-text mb-4 text-center">
            附近饮品店铺
          </h3>
          
          {poiStores.length > 0 ? (
            <div className="space-y-4">
              {poiStores.map((store, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-brand-text">{store.name}</h4>
                      <p className="text-sm text-brand-text/70 mt-1">{store.address}</p>
                      {store.tel && (
                        <p className="text-sm text-brand-text/70 mt-1">电话: {store.tel}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-brand-primary font-medium">
                        {store.distance}米
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-brand-text/60">
                附近暂无饮品店铺
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WordCloudSection;
