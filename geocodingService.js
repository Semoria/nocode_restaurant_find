// 地理编码服务
import { supabase } from "@/integrations/supabase/client";

// 从城市坐标表获取坐标
export const getCityCoordinates = async (city, cityZh) => {
  try {
    const { data, error } = await supabase
      .from('city_coordinates')
      .select('latitude, longitude, default_radius')
      .or(`city_name.eq.${city},city_name_zh.eq.${cityZh}`)
      .limit(1)
      .single();

    if (error) {
      console.error('查询城市坐标失败:', error);
      return null;
    }

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      distance_preference: data.default_radius / 1609, // 转换为英里
      location_source: 'city_center'
    };
  } catch (err) {
    console.error('获取城市坐标异常:', err);
    return null;
  }
};

// 移除了 Nominatim API 相关代码，因为我们已经有城市坐标表
