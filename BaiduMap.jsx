import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, MapPin } from 'lucide-react';

const BaiduMap = ({ 
  center = { lng: 116.404, lat: 39.915 }, 
  zoom = 15, 
  style = { width: '100%', height: '400px' },
  onMapReady 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapError, setMapError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setMapError(null);

        // 检查百度地图API是否可用
        if (window.baiduMapAPIFailed) {
          throw new Error('百度地图API不可用');
        }

        // 等待百度地图API加载
        let retryCount = 0;
        const maxRetries = 10;
        
        while (typeof window.BMap === 'undefined' && retryCount < maxRetries && mounted) {
          if (window.baiduMapAPIFailed) {
            throw new Error('百度地图API加载失败');
          }
          
          await new Promise(resolve => setTimeout(resolve, 500));
          retryCount++;
        }

        if (!mounted) return;

        if (typeof window.BMap === 'undefined') {
          throw new Error('百度地图API加载超时');
        }

        // 创建地图实例
        const map = new window.BMap.Map(mapRef.current);
        mapInstanceRef.current = map;

        // 设置中心点坐标
        const point = new window.BMap.Point(center.lng, center.lat);
        
        // 初始化地图
        map.centerAndZoom(point, zoom);
        
        // 启用滚轮缩放
        map.enableScrollWheelZoom(true);
        
        // 添加地图控件
        map.addControl(new window.BMap.NavigationControl());
        map.addControl(new window.BMap.ScaleControl());
        map.addControl(new window.BMap.OverviewMapControl());

        // 地图加载完成回调
        if (onMapReady && mounted) {
          onMapReady(map);
        }

        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('百度地图初始化失败:', error);
        if (mounted) {
          setMapError(error.message);
          setIsLoading(false);
        }
      }
    };

    initializeMap();

    // 清理函数
    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.clearOverlays();
        } catch (error) {
          console.warn('清理地图覆盖物失败:', error);
        }
      }
    };
  }, [center.lng, center.lat, zoom, onMapReady]);

  // 如果有错误，显示错误信息
  if (mapError) {
    return (
      <div 
        style={style}
        className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg"
      >
        <div className="text-center p-4">
          <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">地图暂时无法加载</p>
          <p className="text-xs text-gray-500">{mapError}</p>
        </div>
      </div>
    );
  }

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div 
        style={style}
        className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg"
      >
        <div className="text-center p-4">
          <MapPin className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-pulse" />
          <p className="text-sm text-gray-600">地图加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      style={style}
      className="baidu-map-container rounded-lg overflow-hidden"
    />
  );
};

export default BaiduMap;
