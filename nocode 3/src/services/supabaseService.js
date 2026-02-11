import { supabase } from "@/integrations/supabase/client";

// 根据品牌名和标签查询匹配的饮品
export const searchDrinksByBrandsAndTags = async (brands, tags) => {
  try {
    const { data, error } = await supabase
      .from('drinks')
      .select('*')
      .in('brand_name', brands)
      .overlaps('tags', tags);

    if (error) {
      console.error('Supabase查询失败:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('数据库查询失败:', error);
    throw error;
  }
};

// 根据饮品ID获取血糖数据
export const getBloodSugarDataByDrinkId = async (drinkId) => {
  try {
    const { data, error } = await supabase
      .from('blood_sugar_data')
      .select('*')
      .eq('drink_id', drinkId);

    if (error) {
      console.error('血糖数据查询失败:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('血糖数据查询失败:', error);
    throw error;
  }
};

// 计算两点之间的Haversine距离（单位：米）
const calculateHaversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // 地球半径（米）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// 从Supabase stores表中获取附近店铺（fallback机制）
export const getNearbyStoresFromSupabase = async (userLng, userLat, radius = 2000) => {
  try {
    const { data: stores, error } = await supabase
      .from('stores')
      .select('*');

    if (error) {
      console.error('Supabase stores查询失败:', error);
      throw error;
    }

    if (!stores || stores.length === 0) {
      return [];
    }

    // 计算每个店铺与用户的距离，并过滤在指定半径内的店铺
    const nearbyStores = stores
      .map(store => {
        const distance = calculateHaversineDistance(
          userLat, 
          userLng, 
          store.lat, 
          store.lng
        );
        return {
          ...store,
          distance: Math.round(distance) // 转换为整数米
        };
      })
      .filter(store => store.distance <= radius)
      .sort((a, b) => a.distance - b.distance); // 按距离排序

    return nearbyStores;
  } catch (error) {
    console.error('获取附近店铺失败:', error);
    throw error;
  }
};
