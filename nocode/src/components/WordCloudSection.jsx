import { useState } from 'react';
import { CheckCircle, Zap } from 'lucide-react';

const WordCloudSection = ({ extractedTags = [], poiStores = [], recommendations = [], isRecommendationsLoading = false }) => {
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

  return (
    <section className="py-12 md:py-20 px-5">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-8 text-center">
          热门饮品标签
        </h2>
        
        {extractedTags.length > 0 ? (
          <div className="bg-brand-light rounded-2xl p-8 mb-8">
            <h3 className="text-lg font-medium text-brand-text mb-4 text-center">
              根据您的需求提取的标签
            </h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {extractedTags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-brand-primary text-white rounded-full text-base font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-brand-light rounded-2xl p-8 min-h-64 flex items-center justify-center mb-8">
            <p className="text-brand-text/60 text-lg">
              词云区域 - 即将展示热门饮品标签
            </p>
          </div>
        )}

        {/* 推荐列表 */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-brand-text mb-4 text-center">
            为您推荐
          </h3>
          
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
                className="bg-white rounded-xl border border-brand-border p-4 md:p-5 hover:shadow-md transition duration-200"
              >
                <div className="flex justify-between items-start mb-4">
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
                        <div className="font-medium text-brand-text cursor-pointer hover:underline">
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
