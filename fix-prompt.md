# 修复 SecondSection.jsx — 补全三个缺失函数

## 要修改的文件
`nocode/src/components/SecondSection.jsx`

## 问题描述
`handleSearch` 函数中调用了三个未定义的函数，导致运行时报错 `ReferenceError`：
- `extractBrandsAndMap`（第 171 行）
- `getDeepSeekRecommendations`（第 178 行）
- `processRecommendations`（第 181 行）

请在该文件中补全这三个函数的实现，**不要修改已有的 handleSearch 逻辑和 UI 部分**。

---

## 修改 1：在文件顶部添加 Supabase import

在 `import { useEffect, useState } from 'react';` 的下一行添加：

```js
import { supabase } from '@/integrations/supabase/client';
```

---

## 修改 2：在组件内部、`handleSearch` 函数之前，添加以下三个函数

### 函数一：extractBrandsAndMap

```js
const extractBrandsAndMap = (poiStores) => {
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
      tel: store.tel || ''
    });
  });

  const brandList = Object.keys(brandStoreMap);
  return { brandList, brandStoreMap };
};
```

### 函数二：getDeepSeekRecommendations

```js
const getDeepSeekRecommendations = async (brandList, userInput, tags) => {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer sk-6fcd604753324744a228f58bbf41f894',
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
    "health_note": "简短健康提示（如含咖啡因、经期建议热饮等）"
  }
]

规则：
1. 只推荐用户附近实际存在的品牌的饮品，不要编造品牌
2. 每个品牌最多推荐 2 款饮品
3. 总共推荐 5-8 款饮品
4. blood_sugar_estimate 要合理：空腹一般 4.5-5.8，升糖低的饮品 post_60min 不超过 8.0，升糖高的可到 10-12
5. 优先推荐符合用户需求的饮品，其次考虑热门度
6. price_approx 给出该饮品的大概价格（元）`
        },
        {
          role: 'user',
          content: `我附近有这些品牌：${brandList.join('、')}。\n\n我的需求：${userInput}\n\n提取到的标签：${tags.join('、')}`
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
};
```

### 函数三：processRecommendations

```js
const processRecommendations = async (rawRecommendations, brandStoreMap) => {
  if (!rawRecommendations || rawRecommendations.length === 0) return [];

  const processed = await Promise.all(
    rawRecommendations.map(async (rec) => {
      // 1. 去 Supabase 查询是否有匹配的血糖实测数据
      let dataSource = 'AI 基于公开信息估算';
      let dataBadge = 'estimated';
      let bloodSugarData = rec.blood_sugar_estimate || {
        fasting: 5.2, post_30min: 7.0, post_60min: 7.8, post_120min: 6.2, post_180min: 5.5
      };

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
        store: nearestStore
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

  return result;
};
```

---

## 修改 3：给 handleSearch 的 catch 块添加 Supabase 兜底

将 `handleSearch` 函数的 catch 块（目前在第 187-196 行）替换为：

```js
} catch (error) {
  console.error('搜索失败:', error);
  const fallbackTags = fallbackTagExtraction(userInput);
  setExtractedTags(fallbackTags);
  onTagsExtracted(fallbackTags);

  // 如果 DeepSeek 推荐失败，尝试用 Supabase 纯数据库匹配
  try {
    if (fallbackTags.length > 0) {
      const { data } = await supabase
        .from('beverages')
        .select('*, stores(*)')
        .overlaps('tags', fallbackTags)
        .limit(8);

      if (data && data.length > 0) {
        const dbRecommendations = data.map(item => ({
          brand: item.stores?.brand || '',
          beverage_name: item.name,
          reason: item.description || '数据库推荐',
          tags: item.tags || [],
          price_approx: item.price || 0,
          sugar_option: item.sugar_level || '',
          health_note: item.source_note || '',
          blood_sugar_data: item.blood_sugar_data || {},
          data_source: '小红书用户实测',
          data_badge: 'verified',
          store: item.stores ? {
            name: item.stores.name,
            distance: 0,
            address: item.stores.address || ''
          } : null
        })).filter(r => r.store);

        setRecommendations(dbRecommendations);
        onRecommendationsReceived(dbRecommendations, false);
        onPoiStoresFetched([]);
        return;
      }
    }
  } catch (dbError) {
    console.error('Supabase 兜底查询也失败:', dbError);
  }

  onPoiStoresFetched([]);
  onRecommendationsReceived([], false);
}
```

---

## 不需要修改的部分

- `WordCloudSection.jsx` — 展示层已完整，数据结构兼容
- `HomePage.jsx` — 状态管理和 props 传递已正确
- `HeroSection.jsx` — 地址定位已完整
- 已有的 `fallbackTagExtraction`、`searchPoiStores`、UI 模板代码 — 全部保留不动

## 最终验证

修改完成后，`SecondSection.jsx` 应该：
1. 顶部有 `import { supabase }`
2. 组件内包含 `extractBrandsAndMap`、`getDeepSeekRecommendations`、`processRecommendations` 三个函数定义
3. `handleSearch` 中对这三个函数的调用能正常执行
4. catch 块包含 Supabase 兜底逻辑
