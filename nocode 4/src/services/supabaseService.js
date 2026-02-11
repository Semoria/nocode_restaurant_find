import { supabase } from "@/integrations/supabase/client";

// 将tags字段统一转换为JavaScript数组（兼容不同Supabase平台的返回格式）
const ensureTagsArray = (tags) => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // PostgreSQL 原始数组格式: {tag1,tag2,tag3}
    }
    return tags.replace(/^\{|\}$/g, '').split(',').map(t => t.trim().replace(/^"|"$/g, ''));
  }
  return [];
};

// 根据品牌名和标签查询匹配的饮品
export const searchDrinksByBrandsAndTags = async (brands, tags) => {
  try {
    console.log('[SipWise] 查询饮品 - 品牌:', brands, '标签:', tags);

    // 先尝试使用 .overlaps() 查询
    let { data, error } = await supabase
      .from('drinks')
      .select('*')
      .in('brand_name', brands)
      .overlaps('tags', tags);

    console.log('[SipWise] overlaps查询结果:', { count: data?.length, error: error?.message });

    // 如果 .overlaps() 失败或返回空结果，则使用前端过滤作为兜底
    if (error || !data || data.length === 0) {
      console.warn('[SipWise] overlaps不可用或无结果，使用前端过滤兜底');

      // 只按品牌查询
      const { data: brandData, error: brandError } = await supabase
        .from('drinks')
        .select('*')
        .in('brand_name', brands);

      console.log('[SipWise] 品牌查询结果:', { count: brandData?.length, error: brandError?.message });

      if (brandError) {
        console.error('[SipWise] Supabase品牌查询失败:', brandError);
        throw brandError;
      }

      if (!brandData || brandData.length === 0) {
        console.warn('[SipWise] drinks表中没有找到这些品牌的饮品，请检查drinks表是否有数据');
        return [];
      }

      // 前端过滤标签交集 — 兼容tags为字符串或数组
      data = brandData.filter(drink => {
        const drinkTags = ensureTagsArray(drink.tags);
        return drinkTags.some(tag => tags.includes(tag));
      });

      console.log('[SipWise] 前端过滤后匹配饮品:', data.length);
    }

    // 确保返回的每个drink的tags都是数组格式
    return (data || []).map(drink => ({
      ...drink,
      tags: ensureTagsArray(drink.tags)
    }));
  } catch (error) {
    console.error('[SipWise] 数据库查询失败:', error);
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
          // 字段映射：将数据库字段映射为与高德API一致的格式
          name: store.store_name,      // store_name -> name
          brandName: store.brand_name, // brand_name -> brandName
          location: `${store.lng},${store.lat}`, // 添加location字段以匹配高德格式
          address: store.address,
          lng: store.lng,
          lat: store.lat,
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
