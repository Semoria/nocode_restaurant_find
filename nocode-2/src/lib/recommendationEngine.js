import { supabase } from '@/integrations/supabase/client';
const DEEPSEEK_API_KEY = 'sk-6fcd604753324744a228f58bbf41f894';
const AMAP_KEY = '9deea9030329e7a129ec9c5bb57d052a';

/**
 * 推断店铺场景标签
 * @param {Object} store - 店铺信息
 * @returns {string[]} 场景标签数组
 */
function inferStoreSceneTags(store) {
  const tags = [];
  const cost = parseFloat(store.cost);
  const type = store.poi_type || '';
  const name = store.name || '';

  // 高级/平价 判断（基于人均消费）
  if (!isNaN(cost)) {
    if (cost >= 40) tags.push('高级');
    else if (cost <= 15) tags.push('平价');
  }

  // 适合自习 判断（书店类型 或 名字含书店/图书馆）
  if (type.includes('书店') || name.includes('书店') || 
      name.includes('西西弗') || name.includes('言几又') ||
      name.includes('图书')) {
    tags.push('适合自习');
  }

  // 氛围畅聊 判断（通常空间较大）
  if (name.includes('喜茶') || name.includes('奈雪') || 
      name.includes('茶颜') || store.business_area !== '') {
    tags.push('氛围畅聊');
  }

  return tags;
}

/**
 * 搜索附近 POI 门店
 * @param {number} lng - 经度
 * @param {number} lat - 纬度
 * @returns {Promise<Array>} POI 门店列表
 */
export async function searchPoiStores(lng, lat) {
  try {
    // 第一次搜索：2km 范围内
    let response = await fetch(
      `https://restapi.amap.com/v3/place/around?key=${AMAP_KEY}&location=${lng},${lat}&radius=2000&keywords=奶茶|咖啡|饮品|书店咖啡|精品咖啡&output=JSON&extensions=all`
    );
    let data = await response.json();
    
    // 如果 2km 内没有结果，扩大到 4km 重新搜索
    if (!data.pois || data.pois.length === 0) {
      response = await fetch(
        `https://restapi.amap.com/v3/place/around?key=${AMAP_KEY}&location=${lng},${lat}&radius=4000&keywords=奶茶|咖啡|饮品|书店咖啡|精品咖啡&output=JSON&extensions=all`
      );
      data = await response.json();
    }
    
    if (data.pois && data.pois.length > 0) {
      // 提取需要的字段
      const stores = data.pois.map(poi => ({
        name: poi.name,
        location: poi.location,
        address: poi.address,
        distance: poi.distance,
        tel: poi.tel || '',
        rating: poi.biz_ext?.rating || null,
        cost: poi.biz_ext?.cost || null,
        poi_type: poi.type || '',
        business_area: poi.business_area || ''
      }));
      return stores;
    }
    
    return [];
  } catch (error) {
    console.error('POI 搜索失败:', error);
    return [];
  }
}

/**
 * 从 POI 结果中提取品牌列表和品牌-门店映射
 * @param {Array} poiStores - POI 搜索结果
 * @returns {{ brandList: string[], brandStoreMap: Object }}
 */
export function extractBrandsAndMap(poiStores) {
  const brandStoreMap = {};

  poiStores.forEach(store => {
    // 从店铺名提取品牌：取第一个括号（中文或英文）前的部分
    // 例如 "喜茶（静安寺店）" → "喜茶"，"瑞幸咖啡（日月光店）" → "瑞幸咖啡"
    let brand = store.name.split(/[（(]/)[0].trim();
    // 去掉常见后缀
    brand = brand.replace(/(咖啡|饮品|茶饮|奶茶店)$/, '') || brand;
    // 如果清洗后为空，保留原始提取
    if (!brand) brand = store.name.split(/[（(]/)[0].trim();

    if (!brandStoreMap[brand]) {
      brandStoreMap[brand] = [];
    }
    brandStoreMap[brand].push({
      name: store.name,
      distance: Number(store.distance),
      address: store.address,
      tel: store.tel || '',
      rating: store.rating,
      cost: store.cost,
      poi_type: store.poi_type,
      business_area: store.business_area
    });
  });

  const brandList = Object.keys(brandStoreMap);
  return { brandList, brandStoreMap };
}

/**
 * 获取用户经期状态
 * @param {Object} profile - 用户健康档案
 * @returns {Object} 经期状态信息
 */
export function getPeriodStatus(profile) {
  if (!profile?.last_period_date) return { inPeriod: false, dayOfPeriod: 0 };
  const lastPeriod = new Date(profile.last_period_date);
  const cycleLen = profile.period_cycle_days || 28;
  const periodLen = profile.period_duration_days || 7;
  const today = new Date();
  const daysSinceLast = Math.floor((today - lastPeriod) / 86400000);
  const dayInCycle = ((daysSinceLast % cycleLen) + cycleLen) % cycleLen;
  if (dayInCycle < periodLen) {
    return { inPeriod: true, dayOfPeriod: dayInCycle + 1 };
  }
  return { inPeriod: false, dayOfPeriod: 0 };
}

/**
 * 经期友好饮品知识库
 */
export const PERIOD_BEVERAGES = {
  friendly: [
    { brand: '霸王茶姬', name: '伯牙绝弦', temp: '热饮', reason: '原叶茶+真牛奶,GI=14,暖宫低负担', tags: ['低GI','暖宫'] },
    { brand: '霸王茶姬', name: '万里木兰', temp: '热饮', reason: '纯原叶茶,热量低,咖啡因低', tags: ['暖身','低热量'] },
    { brand: '霸王茶姬', name: '桂馥兰香', temp: '热饮', reason: '花香茶底GI=19,低糖热饮', tags: ['低GI','花香'] },
    { brand: '喜茶', name: '纯绿妍茶后', temp: '热饮', reason: '无糖纯绿茶仅10kcal', tags: ['无糖','清淡'] },
    { brand: '喜茶', name: '酷黑莓桑', temp: '热饮', reason: '莓类富含铁质,有助补铁', tags: ['补铁','低糖'] },
    { brand: '喜茶', name: '满杯红柚', temp: '热饮', reason: '柚子含维C,助铁吸收', tags: ['维生素C','助铁吸收'] },
    { brand: '奈雪的茶', name: '轻柠茶', temp: '热饮', reason: '含维C助铁吸收,低糖暖身', tags: ['维生素C','低糖'] },
    { brand: '茶百道', name: '轻轻玫茉', temp: '热饮', reason: '玫瑰疏肝解郁活血,暖宫缓解痉挛', tags: ['玫瑰活血','疏肝'] },
    { brand: '茶百道', name: '红糖奶茶', temp: '热饮', reason: '红糖补血活血,经期首选', tags: ['红糖补血','经期首选'] },
    { brand: '瑞幸咖啡', name: '拿铁', temp: '热饮', reason: '牛奶补钙+适量咖啡因', tags: ['补钙','热饮'] },
    { brand: '蜜雪冰城', name: '热红糖姜茶', temp: '热饮', reason: '驱寒暖宫活血,经期经典', tags: ['驱寒','暖宫','经期首选'] },
    { brand: '古茗', name: '红豆抹茶', temp: '热饮', reason: '红豆补血利尿减水肿', tags: ['红豆补血','利尿消肿'] },
    { brand: 'COCO都可', name: '红枣桂圆奶茶', temp: '热饮', reason: '红枣桂圆补气血养血', tags: ['补气血','养血'] },
    { brand: '沪上阿姨', name: '红枣枸杞奶茶', temp: '热饮', reason: '补气血养肝', tags: ['红枣枸杞','补气血'] },
    { brand: '沪上阿姨', name: '桂花糯米茶', temp: '热饮', reason: '桂花活血散瘀', tags: ['桂花活血','暖身'] },
    { brand: '乐乐茶', name: '玫瑰乌龙', temp: '热饮', reason: '玫瑰疏肝活血,情绪调节', tags: ['玫瑰疏肝','情绪调节'] },
    { brand: '书亦烧仙草', name: '烧仙草红豆', temp: '热饮', reason: '红豆消肿,少糖选择', tags: ['清热','红豆消肿'] },
    { brand: '一点点', name: '红豆牛奶', temp: '热饮', reason: '补铁补钙利尿消肿', tags: ['补铁','补钙'] },
    { brand: '星巴克', name: '热拿铁', temp: '热饮', reason: '补钙温热,约150kcal', tags: ['补钙','温热'] },
    { brand: 'Manner Coffee', name: '热拿铁', temp: '热饮', reason: '精品咖啡补钙', tags: ['精品咖啡','补钙'] },
    { brand: 'Tims咖啡', name: '热燕麦拿铁', temp: '热饮', reason: '植物基低乳糖暖身', tags: ['植物基','暖身'] },
  ],
  bannedKeywords: ['冰', '冰沙', '冰饮', '星冰乐', '冰淇淋', '冰美式', '冰奶昔'],
  cautionKeywords: ['美式', '浓缩']
};

/**
 * 调用 DeepSeek API 获取饮品推荐
 * @param {string[]} brandList - 附近品牌列表
 * @param {string} userInput - 用户需求文本
 * @param {string[]} tags - 提取的标签
 * @param {Array} poiStores - POI 店铺信息（用于场景标签推断）
 * @param {Object} healthProfile - 用户健康档案
 * @returns {Promise<Array>} 原始推荐数据
 */
export async function getDeepSeekRecommendations(brandList, userInput, tags, poiStores = [], healthProfile = null) {
  // 为每个店铺推断场景标签
  const storeSceneInfo = poiStores.map(store => {
    const sceneTags = inferStoreSceneTags(store);
    return {
      name: store.name,
      distance: store.distance,
      cost: store.cost,
      sceneTags: sceneTags
    };
  });

  // 构建店铺信息描述
  const storeDescriptions = storeSceneInfo.map(store => {
    const costText = store.cost ? `人均${store.cost}元` : '人均消费未知';
    const sceneText = store.sceneTags.length > 0 ? `, 场景标签预判: [${store.sceneTags.join(', ')}]` : '';
    return `- ${store.name}, 距离${store.distance}m, ${costText}${sceneText}`;
  }).join('\n');

  // 构建健康档案信息
  let healthInfo = '';
  if (healthProfile) {
    healthInfo = `

用户健康档案信息（请严格参考）：
- 过敏原：${healthProfile.allergens?.join('、') || '无'}
- 慢性病：${healthProfile.chronic_conditions?.join('、') || '无'}
- 饮食偏好：${healthProfile.diet_preferences?.join('、') || '无'}
- 体质：${healthProfile.body_constitution || '未设置'}

基于健康档案的额外规则（最高优先级）：
1. 如果用户有过敏原，绝对不推荐含该成分的饮品（如过敏牛奶则不推荐任何含牛奶的饮品）
2. 如果用户有糖尿病，只推荐升糖低的饮品，sugar_option 强制为"无糖"
3. 如果用户有高血脂，避免推荐含奶油、芝士奶盖的饮品
4. 如果用户有高血压，避免推荐高咖啡因饮品
5. 如果用户有痛风，避免推荐含果糖过高的饮品
6. 如果用户有胃溃疡，避免推荐高酸性饮品（如柠檬类）和空腹咖啡`;
  }

  // 检查经期状态并添加经期相关规则
  let periodInfo = '';
  if (healthProfile) {
    const periodStatus = getPeriodStatus(healthProfile);
    if (periodStatus.inPeriod) {
      const day = periodStatus.dayOfPeriod;
      periodInfo = `

⚠️ 用户当前处于经期第${day}天，请严格遵守：
1. 绝对不推荐任何冰饮、冰沙、冰奶昔、星冰乐、冰淇淋类饮品
2. 不推荐高咖啡因冷饮（冰美式、冰拿铁等）
3. 优先推荐以下经期友好热饮：
   - 蜜雪冰城·热红糖姜茶（驱寒暖宫活血）
   - 茶百道·红糖奶茶热饮（红糖补血活血）
   - 茶百道·轻轻玫茉热饮（玫瑰疏肝活血）
   - COCO·红枣桂圆奶茶热饮（补气血养血）
   - 沪上阿姨·红枣枸杞奶茶热饮（补气血养肝）
   - 霸王茶姬·伯牙绝弦热饮（GI=14暖宫低负担）
   - 各品牌热拿铁（牛奶补钙+温热）
4. 每杯饮品的 health_note 必须包含经期相关提示`;
    }
  }

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `你是一个专业的饮品健康推荐师。用户会告诉你附近有哪些饮品品牌，以及他们的需求。你需要根据你对这些品牌真实菜单的了解，推荐符合用户需求的具体饮品。

严格按以下 JSON 格式返回，不要返回任何其他文字：
[
  {
    "brand": "品牌名",
    "beverage_name": "饮品全名",
    "reason": "一句话推荐理由（30字以内）",
    "tags": ["标签1", "标签2"],
    "price_approx": 25,
    "sugar_option": "推荐点单的糖度（如无糖/少糖/半糖）",
    "blood_sugar_estimate": {
      "fasting": 5.2,
      "post_30min": 7.0,
      "post_60min": 7.8,
      "post_120min": 6.2,
      "post_180min": 5.5
    },
    "calories_estimate": 340,
    "sugar_grams_estimate": 42,
    "health_note": "简短健康提示（如含咖啡因、经期建议热饮等）"
  }
]

规则：
1. 只推荐用户附近实际存在的品牌的饮品，不要编造品牌
2. 每个品牌最多推荐 2 款饮品
3. 总共推荐 5-8 款饮品
4. blood_sugar_estimate 要合理：空腹一般 4.5-5.8，升糖低的饮品 post_60min 不超过 8.0，升糖高的可到 10-12
5. 优先推荐符合用户需求的饮品，其次考虑热门度
6. price_approx 给出该饮品的大概价格（元）
7. 标签说明：
   - 高级：标注此饮品价格偏高（>30元），适合追求品质的用户
   - 平价：标注此饮品价格亲民（<20元），适合预算敏感用户
   - 适合自习：标注此店铺安静、有座位，适合学习工作
   - 氛围畅聊：标注此店铺空间宽敞、氛围活跃，适合朋友聚会
8. calories_estimate 给出该饮品一杯（中杯/标准杯）的预估热量（kcal），要合理：
   - 纯茶/美式：10-50kcal
   - 拿铁类：150-250kcal
   - 奶茶类：250-450kcal
   - 含奶油/珍珠的：400-600kcal
9. sugar_grams_estimate 给出预估含糖量（g）

请结合店铺的场景标签预判，为推荐饮品附上合适的场景标签（高级/平价/适合自习/氛围畅聊），若预判标签与饮品特性不符可调整，若没有预判标签则根据饮品价格自行判断高级/平价。${healthInfo}${periodInfo}`
        },
        {
          role: 'user',
          content: `我附近有这些品牌：${brandList.join('、')}。\n\n附近店铺信息：\n${storeDescriptions}\n\n我的需求：${userInput}\n\n提取到的标签：${tags.join('、')}`
        }
      ],
      temperature: 0.5
    })
  });

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (e) {
    // 如果 JSON 解析失败，尝试用正则提取 JSON 部分
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  }
}

/**
 * 用 Supabase 数据增强推荐结果
 * @param {Array} rawRecommendations - DeepSeek 返回的原始推荐
 * @param {Object} brandStoreMap - 品牌-门店映射
 * @param {Object} healthProfile - 用户健康档案
 * @returns {Promise<Array>} 增强后的推荐列表
 */
export async function processRecommendations(rawRecommendations, brandStoreMap, healthProfile = null) {
  if (!rawRecommendations || rawRecommendations.length === 0) return [];

  const processed = await Promise.all(
    rawRecommendations.map(async (rec) => {
      // 1. 去 Supabase 查询是否有匹配的血糖实测数据
      let dataSource = 'AI 基于公开信息估算';
      let dataBadge = 'estimated';
      let bloodSugarData = rec.blood_sugar_estimate || {
        fasting: 5.2, post_30min: 7.0, post_60min: 7.8, post_120min: 6.2, post_180min: 5.5
      };

      // 新增：提取热量实测数据（来自B站）
      let dbCalories = null;
      let dbSugarGrams = null;
      let dbFatGrams = null;
      let dbCaffeineMg = null;
      let caloriesSource = '';

      try {
        const { data } = await supabase
          .from('beverages')
          .select('*, stores(*)')
          .ilike('name', `%${rec.beverage_name}%`)
          .limit(1);

        if (data && data.length > 0 && data[0].blood_sugar_data) {
          bloodSugarData = data[0].blood_sugar_data;
          dataSource = '小红书用户实测';
          dataBadge = 'verified';
        }

        // 新增：提取热量实测数据（来自B站）
        if (data[0].calories_kcal) {
          dbCalories = data[0].calories_kcal;
          dbSugarGrams = data[0].sugar_grams;
          dbFatGrams = data[0].fat_grams;
          dbCaffeineMg = data[0].caffeine_mg;
          caloriesSource = data[0].calories_source || 'B站实测';
        }
      } catch (err) {
        console.error('Supabase 查询失败:', err);
      }

      // 2. 关联最近的门店
      const stores = brandStoreMap[rec.brand];
      const nearestStore = stores
        ? [...stores].sort((a, b) => a.distance - b.distance)[0]
        : null;

      return {
        brand: rec.brand,
        beverage_name: rec.beverage_name,
        reason: rec.reason,
        tags: rec.tags || [],
        price_approx: rec.price_approx,
        sugar_option: rec.sugar_option,
        health_note: rec.health_note || '',
        blood_sugar_data: bloodSugarData,
        data_source: dataSource,
        data_badge: dataBadge,
        store: nearestStore,
        // 新增热量字段
        calories_kcal: dbCalories || rec.calories_estimate || null,
        sugar_grams: dbSugarGrams || rec.sugar_grams_estimate || null,
        calories_source: caloriesSource || (rec.calories_estimate ? 'AI估算' : ''),
        fat_grams: dbFatGrams || null,
        caffeine_mg: dbCaffeineMg || null,
        // 新增AI估算字段
        calories_estimate: rec.calories_estimate,
        sugar_grams_estimate: rec.sugar_grams_estimate
      };
    })
  );

  // 3. 按距离排序，过滤无店铺的，取前 5 家店铺的饮品
  const withStore = processed.filter(r => r.store);
  withStore.sort((a, b) => a.store.distance - b.store.distance);

  // 只保留前 5 家不同店铺
  const seenStores = new Set();
  const result = [];
  for (const rec of withStore) {
    if (seenStores.size >= 5 && !seenStores.has(rec.store.name)) continue;
    seenStores.add(rec.store.name);
    result.push(rec);
  }

  // 4. 如果用户处于经期，对推荐结果进行标记和排序
  if (healthProfile) {
    const periodStatus = getPeriodStatus(healthProfile);
    if (periodStatus.inPeriod) {
      // 为每个推荐添加经期相关标记
      result.forEach(rec => {
        // 检查是否包含禁忌关键词
        const hasBannedKeyword = PERIOD_BEVERAGES.bannedKeywords.some(keyword => 
          rec.beverage_name.includes(keyword)
        );
        if (hasBannedKeyword) {
          rec.periodWarning = true;
        }

        // 检查是否为经期友好饮品
        const isFriendly = PERIOD_BEVERAGES.friendly.some(item => 
          rec.brand.includes(item.brand.split(/[（(]/)[0]) && 
          rec.beverage_name.includes(item.name)
        );
        if (isFriendly) {
          rec.periodFriendly = true;
        }
      });

      // 重新排序：友好饮品优先，警告饮品排最后
      result.sort((a, b) => {
        if (a.periodFriendly && !b.periodFriendly) return -1;
        if (!a.periodFriendly && b.periodFriendly) return 1;
        if (a.periodWarning && !b.periodWarning) return 1;
        if (!a.periodWarning && b.periodWarning) return -1;
        return 0;
      });
    }
  }

  return result;
}
