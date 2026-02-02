// 商圈数据配置
export const cityDistricts = {
  '上海': [
    {name: '陆家嘴', district: 'Lujiazui', lat: 31.2397, lon: 121.4990},
    {name: '静安寺', district: 'Jing\'an Temple', lat: 31.2247, lon: 121.4450},
    {name: '南京东路', district: 'East Nanjing Road', lat: 31.2346, lon: 121.4812},
    {name: '徐家汇', district: 'Xujiahui', lat: 31.1889, lon: 121.4363},
    {name: '虹桥', district: 'Hongqiao', lat: 31.1973, lon: 121.3150},
    {name: '浦东机场附近', district: 'Pudong Airport', lat: 31.1443, lon: 121.8083},
    {name: '迪士尼附近', district: 'Disney Resort', lat: 31.1433, lon: 121.6661},
    {name: '随便，整个城市都可以', district: 'Anywhere', lat: 31.2304, lon: 121.4737, radius: 25000}
  ],
  '洛杉矶': [
    {name: 'Downtown', district: 'Downtown', lat: 34.0407, lon: -118.2468},
    {name: 'Beverly Hills', district: 'Beverly Hills', lat: 34.0736, lon: -118.4004},
    {name: 'Santa Monica', district: 'Santa Monica', lat: 34.0195, lon: -118.4912},
    {name: 'Hollywood', district: 'Hollywood', lat: 34.0928, lon: -118.3287},
    {name: 'Pasadena', district: 'Pasadena', lat: 34.1478, lon: -118.1445},
    {name: 'Anywhere in LA', district: 'Anywhere in LA', lat: 34.0522, lon: -118.2437, radius: 25000}
  ]
};

// 获取城市商圈列表
export const getDistrictsByCity = (city) => {
  return cityDistricts[city] || [];
};
