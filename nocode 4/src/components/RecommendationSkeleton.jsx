import React from 'react';

const RecommendationSkeleton = () => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8 px-6">
      <div className="mb-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((index) => (
          <div 
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
          >
            {/* 店铺信息骨架 */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </div>

            <div className="border-t border-gray-100 my-3"></div>

            {/* 饮品列表骨架 */}
            <div className="space-y-2">
              {[1, 2].map((drinkIndex) => (
                <div key={drinkIndex} className="flex justify-between items-center p-2">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="flex space-x-1">
                    <div className="h-5 bg-gray-200 rounded-full w-12"></div>
                    <div className="h-5 bg-gray-200 rounded-full w-10"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationSkeleton;
