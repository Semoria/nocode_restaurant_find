import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  searchPoiStores,
  extractBrandsAndMap,
  getDeepSeekRecommendations,
  processRecommendations
} from '@/lib/recommendationEngine';

const SecondSection = ({ onTagsExtracted, onPoiStoresFetched, onRecommendationsReceived, locationData, healthProfile }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedTags, setExtractedTags] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false);

  useEffect(() => {
    // 简单的可见性检测
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 简单的关键词匹配兜底方案
  const fallbackTagExtraction = (input) => {
    const tags = [];
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('血糖') || lowerInput.includes('升糖') || lowerInput.includes('糖分')) {
      tags.push('升糖低');
    }
    if (lowerInput.includes('经期') || lowerInput.includes('姨妈') || lowerInput.includes('生理期')) {
      tags.push('经期友好', '暖胃');
    }
    if (lowerInput.includes('暖胃') || lowerInput.includes('温热') || lowerInput.includes('热饮')) {
      tags.push('暖胃');
    }
    if (lowerInput.includes('秋冬') || lowerInput.includes('冬天') || lowerInput.includes('寒冷')) {
      tags.push('秋冬暖身');
    }
    if (lowerInput.includes('抹茶')) {
      tags.push('抹茶控');
    }
    if (lowerInput.includes('巧克力')) {
      tags.push('巧克力控');
    }
    if (lowerInput.includes('水果') || lowerInput.includes('果茶')) {
      tags.push('水果茶');
    }
    if (lowerInput.includes('奶茶') || lowerInput.includes('奶')) {
      tags.push('奶茶');
    }
    if (lowerInput.includes('咖啡')) {
      tags.push('咖啡');
    }
    if (lowerInput.includes('无糖')) {
      tags.push('无糖可选');
    }
    if (lowerInput.includes('半糖')) {
      tags.push('半糖推荐');
    }
    if (lowerInput.includes('上新') || lowerInput.includes('新品')) {
      tags.push('近期上新');
    }
    if (lowerInput.includes('红糖')) {
      tags.push('红糖');
    }
    if (lowerInput.includes('黑糖')) {
      tags.push('黑糖');
    }
    if (lowerInput.includes('小红书')) {
      tags.push('小红书实测');
    }
    // 新增标签的关键词匹配
    if (lowerInput.includes('贵') || lowerInput.includes('精品') || lowerInput.includes('高端')) {
      tags.push('高级');
    }
    if (lowerInput.includes('便宜') || lowerInput.includes('平价') || lowerInput.includes('学生')) {
      tags.push('平价');
    }
    if (lowerInput.includes('自习') || lowerInput.includes('学习') || lowerInput.includes('安静')) {
      tags.push('适合自习');
    }
    if (lowerInput.includes('聊天') || lowerInput.includes('朋友') || lowerInput.includes('下午茶')) {
      tags.push('氛围畅聊');
    }
    
    return tags;
  };

  const handleSearch = async () => {
    if (!userInput.trim()) return;
    
    setIsLoading(true);
    
    try {
      // 并行执行 DeepSeek 标签提取和 POI 搜索
      const [deepseekResponse, poiStores] = await Promise.all([
        // DeepSeek API 调用
        fetch('https://api.deepseek.com/chat/completions', {
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
                content: '你是一个饮品推荐标签提取器。用户会描述自己的需求，你需要从中提取出与饮品相关的标签。只返回 JSON 数组，不要其他文字。可用标签包括：升糖低、升糖中、升糖高、经期友好、暖胃、秋冬暖身、抹茶控、巧克力控、水果茶、奶茶、咖啡、无糖可选、半糖推荐、近期上新、红糖、黑糖、小红书实测、高级、平价、适合自习、氛围畅聊。如果用户提到血糖相关需求，默认加上"升糖低"。如果用户提到经期/姨妈，默认加上"经期友好"和"暖胃"。如果用户提到"贵一点没关系"、"精品"、"高端"等，加上"高级"。如果用户提到"便宜"、"学生党"、"预算有限"等，加上"平价"。如果用户提到"想找地方学习"、"自习"、"安静"等，加上"适合自习"。如果用户提到"约朋友聊天"、"下午茶聊天"、"聚会"等，加上"氛围畅聊"。'
              },
              {
                role: 'user',
                content: userInput
              }
            ],
            temperature: 0.3
          })
        }),
        // 高德 POI 搜索
        searchPoiStores(locationData.lng, locationData.lat)
      ]);
      
      // 处理 DeepSeek 响应
      const deepseekData = await deepseekResponse.json();
      let tags = [];
      
      try {
        // 尝试解析返回的JSON数组
        tags = JSON.parse(deepseekData.choices[0].message.content);
      } catch (parseError) {
        // 解析失败时使用兜底方案
        console.error('DeepSeek返回内容解析失败，使用兜底方案:', parseError);
        tags = fallbackTagExtraction(userInput);
      }
      
      setExtractedTags(tags);
      onTagsExtracted(tags);
      
      // 处理 POI 搜索结果
      onPoiStoresFetched(poiStores);

      // 如果POI搜索结果为空，直接返回
      if (poiStores.length === 0) {
        setIsLoading(false);
        return;
      }

      // 提取品牌信息和构建映射
      const { brandList, brandStoreMap } = extractBrandsAndMap(poiStores);

      // 显示骨架屏loading状态
      setIsRecommendationsLoading(true);
      onRecommendationsReceived([], true);

      // 记录开始时间，确保骨架屏最少显示800ms
      const startTime = Date.now();

      // 调用DeepSeek获取推荐（传递poiStores参数和健康档案）
      const rawRecommendations = await getDeepSeekRecommendations(brandList, userInput, tags, poiStores, healthProfile);

      // 处理推荐数据
      const processedRecommendations = await processRecommendations(rawRecommendations, brandStoreMap, healthProfile);

      // 确保最少显示800ms
      const elapsed = Date.now() - startTime;
      if (elapsed < 800) {
        await new Promise(resolve => setTimeout(resolve, 800 - elapsed));
      }

      setRecommendations(processedRecommendations);
      setIsRecommendationsLoading(false);
      onRecommendationsReceived(processedRecommendations, false);

    } catch (error) {
      console.error('搜索失败:', error);
      // API调用失败时使用兜底方案
      const fallbackTags = fallbackTagExtraction(userInput);
      setExtractedTags(fallbackTags);
      onTagsExtracted(fallbackTags);
      
      // 如果 DeepSeek 推荐失败，尝试用 Supabase 纯数据库匹配
      try {
        if (fallbackTags.length > 0) {
          const { data } = await supabase
            .from('beverages')
            .select('*, stores(*)')
            .overlaps('tags', fallbackTags)
            .limit(8);

          if (data && data.length > 0) {
            const dbRecommendations = data.map(item => ({
              brand: item.stores?.brand || '',
              beverage_name: item.name,
              reason: item.description || '数据库推荐',
              tags: item.tags || [],
              price_approx: item.price || 0,
              sugar_option: item.sugar_level || '',
              health_note: item.source_note || '',
              blood_sugar_data: item.blood_sugar_data || {},
              data_source: '小红书用户实测',
              data_badge: 'verified',
              store: item.stores ? {
                name: item.stores.name,
                distance: 0,
                address: item.stores.address || ''
              } : null
            })).filter(r => r.store);

            setRecommendations(dbRecommendations);
            onRecommendationsReceived(dbRecommendations, false);
            onPoiStoresFetched([]);
            return;
          }
        }
      } catch (dbError) {
        console.error('Supabase 兜底查询也失败:', dbError);
      }

      onPoiStoresFetched([]);
      onRecommendationsReceived([], false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section 
      data-second-section
      className={`py-12 md:py-20 px-5 transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-lg md:text-xl font-medium text-brand-text mb-6">
          您想找寻怎样的饮品？
        </h2>
        
        <div className="max-w-2xl mx-auto">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="例如：我最近生理期，想喝暖胃的，血糖别太高…"
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-brand-border bg-white text-brand-text placeholder-brand-text/60 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
            disabled={isLoading}
          />
          
          <button
            onClick={handleSearch}
            disabled={isLoading || !userInput.trim()}
            className="w-full sm:w-auto mt-4 px-6 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                AI 正在理解您的需求…
              </>
            ) : (
              '为我推荐'
            )}
          </button>
          
          {extractedTags.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-brand-text/80 mb-2">提取的标签：</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {extractedTags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-brand-light text-brand-text rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SecondSection;
