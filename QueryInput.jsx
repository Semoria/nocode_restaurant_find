import { useQueryProcessor } from '../hooks/useQueryProcessor';
import { CheckCircle, MapPin, Loader2, Send, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';
import DistrictSelector from './DistrictSelector';
import BaiduMap from './BaiduMap';

const QueryInput = () => {
  const [inputText, setInputText] = useState('');
  const { 
    processUserQuery, 
    isProcessing, 
    error, 
    currentQuery,
    showDistrictSelector,
    showLocationPrompt,
    availableDistricts,
    cityName,
    locationInfo,
    handleDistrictSelect,
    closeDistrictSelector,
    handleLocationPromptAction
  } = useQueryProcessor();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) {
      return;
    }

    try {
      await processUserQuery(inputText.trim());
      setInputText(''); // 清空输入框
    } catch (err) {
      console.error('处理查询失败:', err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="请输入您的餐厅需求，例如：'我想在北京找一家适合情侣约会的意大利餐厅，预算500元左右'"
            className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="3"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !inputText.trim()}
            className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </form>

      {currentQuery && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">查询处理成功！</h3>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>Query ID:</strong> {currentQuery.query_id}</p>
            <p><strong>状态:</strong> {currentQuery.status}</p>
            <p><strong>原始文本:</strong> {currentQuery.raw_text}</p>
            {currentQuery.parsed_conditions && (
              <div>
                <p><strong>解析结果:</strong></p>
                <pre className="mt-1 p-2 bg-green-100 rounded text-xs overflow-x-auto">
                  {JSON.stringify(currentQuery.parsed_conditions, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 商圈选择弹窗 */}
      {showDistrictSelector && (
        <DistrictSelector
          city={cityName}
          districts={availableDistricts}
          onSelect={handleDistrictSelect}
          onClose={closeDistrictSelector}
        />
      )}

      {/* 位置提示弹窗 */}
      {showLocationPrompt && locationInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <MapPin className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">当前搜索范围</h3>
            </div>
            
            <p className="text-gray-700 mb-4">
              {locationInfo.city} 全城（半径约 {locationInfo.distance} 英里）
            </p>
            
            {/* 使用百度地图组件展示位置信息 */}
            <div className="mb-4 h-48 rounded-lg overflow-hidden">
              <BaiduMap 
                center={{ 
                  lng: locationInfo.longitude || 116.404, 
                  lat: locationInfo.latitude || 39.915 
                }}
                zoom={10}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleLocationPromptAction('precise')}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                精确到具体商圈
              </button>
              <button
                onClick={() => handleLocationPromptAction('search')}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                就这样搜索
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryInput;
