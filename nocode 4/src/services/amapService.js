// 高德地图POI搜索服务
const AMAP_KEY = '9deea9030329e7a129ec9c5bb57d052a';

export const searchNearbyDrinkStores = async (lng, lat) => {
  try {
    const response = await fetch(
      `https://restapi.amap.com/v3/place/around?` +
      `key=${AMAP_KEY}&` +
      `location=${lng},${lat}&` +
      `keywords=奶茶|咖啡|茶饮|饮品&` +
      `types=050301|050302&` +
      `radius=2000&` +
      `offset=30&` +
      `sortrule=distance`
    );
    
    const data = await response.json();
    
    if (data.status === '1' && data.pois) {
      return data.pois.map(poi => ({
        name: poi.name,
        location: poi.location,
        distance: parseInt(poi.distance),
        address: poi.address,
        lng: parseFloat(poi.location.split(',')[0]),
        lat: parseFloat(poi.location.split(',')[1])
      }));
    } else {
      throw new Error('POI搜索失败');
    }
  } catch (error) {
    console.error('高德POI搜索失败:', error);
    throw error;
  }
};
