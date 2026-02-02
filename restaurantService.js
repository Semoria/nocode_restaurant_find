// 餐厅数据处理服务
import { supabase } from "@/integrations/supabase/client";
import { searchRestaurants } from './baiduMapApi';

// 价格档位计算函数
const calculatePriceLevel = (price) => {
  if (!price) return 2; // 默认中档
  
  const priceNum = parseFloat(price);
  if (isNaN(priceNum)) return 2;
  
  if (priceNum <= 50) return 1;
  if (priceNum <= 100) return 2;
  if (priceNum <= 200) return 3;
  return 4;
};

// 检查餐厅是否已存在
const checkRestaurantExists = async (restaurantId) => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 表示未找到记录
      throw error;
    }

    return data ? true : false;
  } catch (error) {
    console.error('检查餐厅是否存在失败:', error);
    throw error;
  }
};

// 插入餐厅记录
const insertRestaurant = async (restaurantData) => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .insert([restaurantData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('插入餐厅记录失败:', error);
    throw error;
  }
};

// 解析百度地图响应并写入数据库
export const parseAndSaveBaiduMapResponse = async (baiduResponse) => {
  try {
    // 步骤 6: 检查响应状态
    if (baiduResponse.status !== 0) {
      const errorMessages = {
        1: '服务器内部错误',
        2: '参数错误',
        3: '权限校验失败（AK 错误）',
        4: '配额用尽'
      };
      
      const message = errorMessages[baiduResponse.status] || baiduResponse.message || '未知错误';
      throw new Error(`百度地图搜索失败：${message}`);
    }

    // 步骤 7: 遍历每个餐厅并写入数据库
    const results = baiduResponse.results || [];
    const savedRestaurants = [];
    const errors = [];

    for (const result of results) {
      try {
        // 7.1 检查是否已存在
        const exists = await checkRestaurantExists(result.uid);
        
        if (exists) {
          console.log(`餐厅已存在，跳过: ${result.name} (${result.uid})`);
          continue;
        }

        // 7.2 构建餐厅对象
        const restaurantData = {
          restaurant_id: result.uid,
          name: result.name,
          alias: null, // 百度没有 alias
          city: result.city,
          district: result.area, // 区/商圈
          address: result.address,
          latitude: result.location.lat,
          longitude: result.location.lng,
          phone: result.telephone,
          
          // 分类处理
          categories: result.detail_info?.tag ? result.detail_info.tag.split(';') : [],
          cuisine_primary: result.detail_info?.tag ? result.detail_info.tag.split(';')[1] : '餐厅',
          
          // 价格处理
          avg_price: result.detail_info?.price ? parseFloat(result.detail_info.price) : null,
          price_level: calculatePriceLevel(result.detail_info?.price),
          
          // 评分
          rating: result.detail_info?.overall_rating ? parseFloat(result.detail_info.overall_rating) : 0,
          review_count: 0, // 百度默认不返回，可后续补充
          
          // 标签（后续可补充）
          environment_tags: [],
          special_tags: [],
          scene_tags: [],
          
          // 营业时间
          business_hours: {
            "default": result.detail_info?.shop_hours || "未知"
          },
          
          // 详细属性
          attributes: {
            "taste_rating": result.detail_info?.taste_rating,
            "service_rating": result.detail_info?.service_rating,
            "environment_rating": result.detail_info?.environment_rating,
            "brand": result.detail_info?.brand
          },
          
          // 地图链接
          place_id: result.uid,
          google_maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.name + ' ' + result.address)}`,
          
          // 热度分（简化版）
          popularity_score: result.detail_info?.overall_rating ? 
                            parseFloat(result.detail_info.overall_rating) * 10 : 0,
          
          scene_match_score: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // 执行插入
        const savedRestaurant = await insertRestaurant(restaurantData);
        savedRestaurants.push(savedRestaurant);
        
        console.log(`成功保存餐厅: ${result.name} (${result.uid})`);
      } catch (error) {
        console.error(`处理餐厅失败: ${result.name}`, error);
        errors.push({
          restaurant: result.name,
          error: error.message
        });
      }
    }

    // 步骤 9: 保存本次搜索的餐厅 ID 列表
    const baiduSearchResults = results.map(result => result.uid);
    const baiduSearchCount = results.length;

    return {
      success: true,
      savedCount: savedRestaurants.length,
      totalCount: baiduSearchCount,
      baidu_search_results: baiduSearchResults,
      baidu_search_count: baiduSearchCount,
      errors: errors
    };
  } catch (error) {
    console.error('解析并保存百度地图响应失败:', error);
    throw error;
  }
};

// 处理多页结果（可选）
export const fetchMultiplePages = async (searchParams, maxPages = 3) => {
  try {
    const allResults = [];
    
    for (let pageNum = 0; pageNum < maxPages; pageNum++) {
      // 构建带页码的请求参数
      const pagedParams = {
        ...searchParams,
        page_num: pageNum
      };
      
      // 调用百度地图API
      const response = await searchRestaurants(pagedParams);
      
      // 检查响应状态
      if (response.status !== 0) {
        console.warn(`第${pageNum + 1}页获取失败:`, response.message);
        break;
      }
      
      // 添加结果
      if (response.results && response.results.length > 0) {
        allResults.push(...response.results);
      } else {
        // 如果没有更多结果，停止翻页
        break;
      }
      
      // 如果总结果数小于每页数量，说明已经是最后一页
      if (response.total <= (pageNum + 1) * 20) {
        break;
      }
    }
    
    return allResults;
  } catch (error) {
    console.error('获取多页结果失败:', error);
    throw error;
  }
};
