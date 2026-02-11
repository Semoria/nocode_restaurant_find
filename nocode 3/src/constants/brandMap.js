// 品牌映射表，用于从POI店名中提取标准品牌名
export const BRAND_MAP = {
  "喜茶": "喜茶",
  "HEYTEA": "喜茶", 
  "奈雪": "奈雪的茶",
  "奈雪的茶": "奈雪的茶",
  "霸王茶姬": "霸王茶姬",
  "瑞幸": "瑞幸咖啡",
  "luckin": "瑞幸咖啡",
  "星巴克": "星巴克",
  "Starbucks": "星巴克",
  "茶百道": "茶百道",
  "古茗": "古茗",
  "沪上阿姨": "沪上阿姨",
  "一点点": "一点点",
  "Manner": "Manner",
  "MANNER": "Manner"
};

// 从店名中提取品牌名的函数
export const extractBrandFromStoreName = (storeName) => {
  // 遍历品牌映射表，查找匹配的品牌关键词
  for (const [keyword, brandName] of Object.entries(BRAND_MAP)) {
    if (storeName.toLowerCase().includes(keyword.toLowerCase())) {
      return brandName;
    }
  }
  return null; // 未识别到已知品牌
};
