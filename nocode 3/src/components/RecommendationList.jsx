import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const RecommendationList = ({ recommendations }) => {
  const [expandedDrink, setExpandedDrink] = useState(null);

  const toggleDrinkExpansion = (drinkId) => {
    setExpandedDrink(expandedDrink === drinkId ? null : drinkId);
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.466-.888-6.086-2.338M12 21a9 9 0 100-18 9 9 0 000 18z" />
          </svg>
        </div>
        <p className="text-gray-500 mb-4">附近暂未找到匹配的店铺</p>
        <p className="text-gray-400 text-sm">试试扩大范围或更换关键词？</p>
      </div>
    );
  }

  const totalStores = recommendations.length;
  const totalDrinks = recommendations.reduce((sum, store) => sum + store.matchedDrinks.length, 0);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 px-6 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          为您找到以下推荐
        </h2>
        <p className="text-sm text-gray-500">
          共 {totalStores} 家店铺 · {totalDrinks} 款饮品 · 2公里内
        </p>
      </div>

      <div className="space-y-3">
        {recommendations.map((store, index) => (
          <div 
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-5 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* 店铺信息 */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {store.name}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {store.address}
                </p>
              </div>
              <span className="text-xs text-gray-400 ml-2">
                {store.distance}m
              </span>
            </div>

            <div className="border-t border-gray-100 my-3"></div>

            {/* 匹配的饮品列表 */}
            <div className="space-y-2">
              {store.matchedDrinks.map((drink) => (
                <div key={drink.id}>
                  <div 
                    className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => toggleDrinkExpansion(drink.id)}
                  >
                    <span className="text-sm text-gray-900">
                      {drink.drink_name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {drink.tags.slice(0, 2).map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {expandedDrink === drink.id ? 
                        <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      }
                    </div>
                  </div>
                  
                  {/* 展开的血糖详情 */}
                  {expandedDrink === drink.id && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg animate-fade-in">
                      <div className="text-xs text-gray-600 mb-2">血糖变化参考</div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-gray-500">餐前</div>
                          <div className="font-medium">5.2</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500">30分钟</div>
                          <div className="font-medium">7.1</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500">60分钟</div>
                          <div className="font-medium">7.8</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500">120分钟</div>
                          <div className="font-medium">6.2</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationList;
