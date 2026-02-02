import { parseUserQuery } from '../services/deepseekApi';
import { getDistrictsByCity } from '../data/districts';
import { parseAndSaveBaiduMapResponse } from '../services/restaurantService';
import { getCityCoordinates } from '../services/geocodingService';
import { searchRestaurants } from '../services/baiduMapApi';
import { useState } from 'react';
import { createUserQuery, updateUserQuery } from '../services/databaseService';

const useQueryProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuery, setCurrentQuery] = useState(null);
  const [showDistrictSelector, setShowDistrictSelector] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [cityName, setCityName] = useState('');
  const [locationInfo, setLocationInfo] = useState(null);

  const processUserQuery = async (rawText, userId = 'default_user') => {
    setIsProcessing(true);
    setError(null);

    try {
      // 步骤 1: 写入 user_queries 表
      console.log('步骤 1: 创建用户查询记录...');
      const queryRecord = await createUserQuery(rawText, userId);
      setCurrentQuery(queryRecord);
      
      // 步骤 2: 调用 DeepSeek API 解析
      console.log('步骤 2: 调用 DeepSeek API 解析...');
      const parsedConditions = await parseUserQuery(rawText);
      
      // 添加调试日志
      console.log('DeepSeek 返回的 parsed_conditions:', parsedConditions);
      console.log('坐标信息:', {
        latitude: parsedConditions.latitude,
        longitude: parsedConditions.longitude,
        city: parsedConditions.city
      });
      
      // 步骤 3: 解析 API 响应并更新记录
      console.log('步骤 3: 更新用户查询记录...');
      const updatedQuery = await updateUserQuery(queryRecord.query_id, {
        parsed_conditions: parsedConditions,
        status: 'searching'
      });
      
      setCurrentQuery(updatedQuery);
      
      // 流程 1.5: 智能位置补全
      console.log('流程 1.5: 智能位置补全...');
      await handleLocationCompletion(parsedConditions, updatedQuery);
      
      setIsProcessing(false);
      return updatedQuery;
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
      
      if (currentQuery) {
        try {
          await updateUserQuery(currentQuery.query_id, {
            status: 'error'
          });
        } catch (updateErr) {
          console.error('更新错误状态失败:', updateErr);
        }
      }
      
      throw err;
    }
  };

  const handleLocationCompletion = async (parsedConditions, queryRecord) => {
    // 检查是否已有坐标
    if (parsedConditions.latitude && parsedConditions.longitude) {
      console.log('✅ 已有坐标信息，直接执行百度地图搜索');
      console.log('坐标:', {
        latitude: parsedConditions.latitude,
        longitude: parsedConditions.longitude
      });
      
      // 直接执行百度地图搜索
      await executeBaiduMapSearch(queryRecord);
      return;
    }
    
    // 检查是否有城市信息
    if (parsedConditions.city) {
      console.log('尝试从城市坐标表获取坐标...');
      const cityCoords = await getCityCoordinates(
        parsedConditions.city, 
        parsedConditions.city_zh
      );
      
      if (cityCoords) {
        console.log('从城市坐标表获取到坐标:', cityCoords);
        
        // 正确处理字段名和单位
        const updatedQuery = await updateUserQuery(queryRecord.query_id, {
          parsed_conditions: {
            ...parsedConditions,
            latitude: cityCoords.latitude,
            longitude: cityCoords.longitude,
            // 处理 default_radius（米）转为 distance_preference（公里）
            distance_preference: cityCoords.default_radius 
              ? cityCoords.default_radius / 1000 
              : 10,  // 默认 10 公里
            location_source: 'city_center'
          }
        });
        
        setCurrentQuery(updatedQuery);
        
        // 显示位置提示，包含坐标信息
        setLocationInfo({
          city: parsedConditions.city_zh || parsedConditions.city,
          distance: cityCoords.default_radius 
            ? (cityCoords.default_radius / 1000).toFixed(1)  // 公里
            : '10',
          latitude: cityCoords.latitude,
          longitude: cityCoords.longitude
        });
        setShowLocationPrompt(true);
        return;
      }
      
      // 城市坐标表中未找到
      setError(`抱歉，无法识别城市"${parsedConditions.city}"，请换个说法试试？`);
      return;
    }
    
    // 没有城市信息
    setError('请告诉我你想在哪个城市吃饭～');
  };

  const handleDistrictSelect = async (district) => {
    if (!currentQuery?.query_id) {
      setError('商圈选择失败：无法获取当前查询ID，请刷新页面重试');
      return;
    }

    try {
      console.log('--- 开始商圈更新流程 ---');
      
      // 强制转换数据类型，防止数据库因 String/Number 不匹配报错
      const lat = parseFloat(district.lat || district.latitude);
      const lng = parseFloat(district.lon || district.lng || district.longitude);
      const radius = district.radius ? parseFloat(district.radius) : 3000;

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error(`坐标转换失败: lat=${lat}, lng=${lng}`);
      }

      const updatedConditions = {
        ...currentQuery.parsed_conditions,
        latitude: lat,
        longitude: lng,
        district: district.district || district.name || '未知商圈',
        distance_preference: radius / 1000, // 米转公里
        location_source: 'user_selected_district'
      };

      // 清理掉可能导致 JSON 序列化失败的 undefined 
      Object.keys(updatedConditions).forEach(key => 
        updatedConditions[key] === undefined && delete updatedConditions[key]
      );

      console.log('待更新的数据载荷:', updatedConditions);

      // 数据库更新（独立捕获错误）
      let updatedQuery;
      try {
        updatedQuery = await updateUserQuery(currentQuery.query_id, {
          parsed_conditions: updatedConditions,
          status: 'searching' // 同步更新状态
        });
        setCurrentQuery(updatedQuery);
        setShowDistrictSelector(false);
      } catch (dbErr) {
        console.error('--- 数据库写入阶段崩溃 ---');
        console.error('错误代码:', dbErr.code);
        console.error('详细消息:', dbErr.message);
        setError(`数据库同步失败: ${dbErr.message}`);
        return; 
      }

      // 执行搜索（与数据库逻辑解耦）
      console.log('数据库更新成功，开始搜索...');
      await executeBaiduMapSearch(updatedQuery);

    } catch (err) {
      console.error('--- 逻辑处理阶段崩溃 ---');
      console.error(err);
      setError(`程序执行错误: ${err.message}`);
    }
  };

  const closeDistrictSelector = () => {
    setShowDistrictSelector(false);
    setIsProcessing(false);
  };

  const handleLocationPromptAction = async (action) => {
    if (action === 'precise') {
      // 显示商圈选择
      const city = locationInfo.city;
      const districts = getDistrictsByCity(city);
      
      if (districts.length > 0) {
        setCityName(city);
        setAvailableDistricts(districts);
        setShowDistrictSelector(true);
      } else {
        setError('选择商圈的步骤3失败：未找到该城市的商圈信息');
      }
      setShowLocationPrompt(false);
    } else {
      // 直接搜索
      setShowLocationPrompt(false);
      console.log('继续执行流程 2: 调用百度地图API...');
      
      if (currentQuery) {
        await executeBaiduMapSearch(currentQuery);
      } else {
        setError('选择商圈的步骤4失败：当前查询记录不存在');
      }
    }
  };

  // 执行百度地图搜索
  const executeBaiduMapSearch = async (queryRecord) => {
    try {
      setIsProcessing(true);
      const { parsed_conditions } = queryRecord;

      // 检查百度地图API是否可用
      if (window.baiduMapAPIFailed) {
        throw new Error('地图服务暂时不可用，但您的查询已保存。请稍后重试或联系技术支持。');
      }

      // 严格检查搜索参数
      if (!parsed_conditions.latitude || !parsed_conditions.longitude) {
        throw new Error('搜索失败：坐标缺失，无法定位。');
      }

      console.log('执行百度地图搜索，参数:', {
        latitude: parsed_conditions.latitude,
        longitude: parsed_conditions.longitude,
        cuisine: parsed_conditions.cuisine,
        distance_preference: parsed_conditions.distance_preference
      });

      // 调用百度 API
      const searchResults = await searchRestaurants(parsed_conditions);
      
      // 检查百度是否真的返回了结果
      if (!searchResults || (searchResults.status !== 0 && searchResults.status !== '0')) {
        throw new Error(`百度地图接口异常: ${searchResults?.message || '未知错误'}`);
      }

      if (!searchResults.results || searchResults.results.length === 0) {
        // 这是业务逻辑错误，不是程序崩溃，建议友好提示
        setError('在该区域没找到符合条件的餐厅，换个地方试试？');
        setIsProcessing(false);
        return;
      }

      // 保存数据
      const saveResult = await parseAndSaveBaiduMapResponse(searchResults);
      
      // 更新最终状态
      const updatedQuery = await updateUserQuery(queryRecord.query_id, {
        status: 'completed',
        backend_parameters: {
          ...queryRecord.backend_parameters,
          baidu_map_response: { 
            total: searchResults.results.length,
            status: 'ok' 
          }
        }
      });

      setCurrentQuery(updatedQuery);
      setIsProcessing(false);
      return { searchResults, saveResult };

    } catch (error) {
      console.error('❌ 百度搜索链路核心报错:', error);
      // 这里直接将具体的 error.message 抛出，不要包装成模糊的"程序执行错误"
      setError(error.message); 
      setIsProcessing(false);
      
      if (queryRecord) {
        try {
          await updateUserQuery(queryRecord.query_id, {
            status: 'error'
          });
        } catch (updateErr) {
          console.error('更新错误状态失败:', updateErr);
        }
      }
      
      throw error;
    }
  };

  return {
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
  };
};

export { useQueryProcessor };
