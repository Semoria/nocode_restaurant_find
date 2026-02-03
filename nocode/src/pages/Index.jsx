import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { smartGeocode, getDistrictCoordinates, getGeocodingServiceStatus } from '@/lib/geocoding';

const Index = () => {
  const [searchText, setSearchText] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [testAddress, setTestAddress] = useState('');
  const [geocodeResult, setGeocodeResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [serviceStatus, setServiceStatus] = useState(null);

  const districts = [
    '陆家嘴', '静安寺', '南京东路', '徐家汇',
    '虹桥', '外滩', '新天地', '人民广场'
  ];

  // 组件挂载时检查服务状态
  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const status = await getGeocodingServiceStatus();
      setServiceStatus(status);
      console.log('地理编码服务状态:', status);
    } catch (error) {
      console.error('检查服务状态失败:', error);
      setServiceStatus({
        networkAvailable: false,
        apiAvailable: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleSearch = () => {
    setIsDialogOpen(true);
  };

  const handleDistrictSelect = (district) => {
    console.log('用户选择商圈:', district);
    setIsDialogOpen(false);
  };

  const handleRandomSelect = () => {
    console.log('用户选择商圈: 全上海');
    setIsDialogOpen(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTestGeocoding = async () => {
    if (!testAddress.trim()) {
      setErrorMessage('请输入地址');
      return;
    }
    
    setIsLoading(true);
    setGeocodeResult(null);
    setErrorMessage('');
    
    try {
      console.log('开始测试地理编码:', testAddress.trim());
      
      // 首先尝试从预设坐标获取
      const presetCoords = getDistrictCoordinates(testAddress.trim());
      if (presetCoords) {
        console.log('使用预设坐标');
        setGeocodeResult({
          ...presetCoords,
          source: '预设坐标'
        });
      } else {
        console.log('使用智能地理编码');
        // 使用智能地理编码
        const result = await smartGeocode(testAddress.trim());
        setGeocodeResult({
          ...result,
          source: result.latitude === 31.2304 && result.longitude === 121.4737 ? '降级坐标' : '地理编码API'
        });
      }
    } catch (error) {
      console.error('地理编码测试失败:', error);
      setErrorMessage(error.message || '地理编码失败');
      setGeocodeResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearTestResult = () => {
    setGeocodeResult(null);
    setErrorMessage('');
    setTestAddress('');
  };

  const refreshServiceStatus = () => {
    checkServiceStatus();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 主要内容区域 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            觅食
          </h1>
          <p className="text-xl text-gray-600">
            在上海，发现你的下一顿好饭
          </p>
        </div>

        {/* 搜索框区域 */}
        <div className="w-full max-w-2xl">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入商圈、地址、或直接输入'上海'"
              className="flex-1 px-6 py-4 text-lg border-2 border-gray-200 rounded-full shadow-lg focus:outline-none focus:border-blue-500 focus:shadow-xl transition-all duration-200"
            />
            <button
              onClick={handleSearch}
              className="px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              搜索
            </button>
          </div>
        </div>

        {/* 服务状态提示 */}
        {serviceStatus && !serviceStatus.networkAvailable && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-yellow-800">网络连接异常，部分功能可能受限</span>
            </div>
          </div>
        )}
      </div>

      {/* 底部留白区域 */}
      <div className="h-32"></div>

      {/* 商圈选择弹窗 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-gray-900 mb-6">
              您想在哪个区域用餐？
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            {districts.map((district) => (
              <Button
                key={district}
                onClick={() => handleDistrictSelect(district)}
                className="h-20 bg-white border-2 border-gray-200 text-gray-800 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
              >
                <span className="text-lg font-medium">{district}</span>
              </Button>
            ))}
          </div>
          
          <div className="flex justify-center">
            <Button
              onClick={handleRandomSelect}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-medium rounded-full shadow-lg hover:from-purple-600 hover:to-pink-600 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-300"
            >
              随便逛逛～ 全上海都行
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 测试 Geocoding 区域 */}
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-80">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">测试地理编码</h3>
          <div className="flex gap-2">
            {(geocodeResult || errorMessage) && (
              <button
                onClick={clearTestResult}
                className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
              >
                清除
              </button>
            )}
            <button
              onClick={refreshServiceStatus}
              className="text-sm text-blue-500 hover:text-blue-700 px-2 py-1 rounded"
              title="刷新服务状态"
            >
              ↻
            </button>
          </div>
        </div>
        
        {/* 服务状态指示器 */}
        {serviceStatus && (
          <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
            <div className="flex items-center justify-between">
              <span>网络状态:</span>
              <span className={serviceStatus.networkAvailable ? 'text-green-600' : 'text-red-600'}>
                {serviceStatus.networkAvailable ? '正常' : '异常'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>API状态:</span>
              <span className={serviceStatus.apiAvailable ? 'text-green-600' : 'text-red-600'}>
                {serviceStatus.apiAvailable ? '可用' : '不可用'}
              </span>
            </div>
          </div>
        )}
        
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={testAddress}
            onChange={(e) => setTestAddress(e.target.value)}
            placeholder="输入地址进行测试"
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleTestGeocoding();
              }
            }}
          />
          <button
            onClick={handleTestGeocoding}
            disabled={isLoading || !testAddress.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '处理中...' : '测试'}
          </button>
        </div>
        
        {errorMessage && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 text-sm">{errorMessage}</p>
          </div>
        )}
        
        {geocodeResult && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
            <div className="space-y-1">
              <p className="text-sm text-gray-700">
                <span className="font-medium">纬度:</span> {geocodeResult.latitude.toFixed(6)}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">经度:</span> {geocodeResult.longitude.toFixed(6)}
              </p>
              {geocodeResult.source && (
                <p className="text-xs text-gray-500">
                  数据来源: {geocodeResult.source}
                </p>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-3 text-xs text-gray-500">
          <p>支持的商圈: {districts.join('、')}</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
