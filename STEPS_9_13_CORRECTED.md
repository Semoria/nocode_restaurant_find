# Step 9-13 修正版 Prompt（已修复全部隐患和 Bug）

> 以下 prompt 基于 GitHub 仓库实际代码审计后重写。
> 每处修改均标注了【修正原因】。

---

## Step 9 — 收藏功能升级（localStorage → Supabase + 收藏列表侧边栏）

```
【Step 9】收藏功能升级为 Supabase

⚠️ 当前 BeverageDetailDialog.jsx 中已有 localStorage 收藏逻辑，需要替换。

━━━ 修改 1：创建 deviceId 工具函数 ━━━

新建文件 src/lib/deviceId.js：

export function getDeviceId() {
  let id = localStorage.getItem('sipwise_device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('sipwise_device_id', id);
  }
  return id;
}

━━━ 修改 2：favorites 表结构调整 ━━━

因为 DeepSeek 推荐的饮品不一定在 beverages 表中，原来的 beverage_id 外键不再适用。
在 Supabase SQL Editor 执行：

-- 先删掉旧的 favorites 表（旧表有 beverage_id FK 约束，不兼容新设计）
DROP TABLE IF EXISTS favorites;

CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  beverage_key text NOT NULL,
  beverage_data jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(device_id, beverage_key)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select" ON favorites FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert" ON favorites FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_delete" ON favorites FOR DELETE TO anon USING (true);

━━━ 修改 3：改造 BeverageDetailDialog.jsx 的收藏逻辑 ━━━

1. 删除现有的 localStorage 收藏逻辑（读取/写入 "favorite_beverages" 的所有代码）

2. 添加 import：
   import { supabase } from '@/integrations/supabase/client';
   import { getDeviceId } from '@/lib/deviceId';

3. 在组件内添加状态和逻辑：
   const [isFavorited, setIsFavorited] = useState(false);
   const [favoriteLoading, setFavoriteLoading] = useState(false);

   // 打开弹窗时检查是否已收藏
   useEffect(() => {
     if (!beverage || !open) return;
     const checkFavorite = async () => {
       const deviceId = getDeviceId();
       const { data } = await supabase
         .from('favorites')
         .select('id')
         .eq('device_id', deviceId)
         .eq('beverage_key', `${beverage.brand}::${beverage.beverage_name}`)
         .maybeSingle();
       setIsFavorited(!!data);
     };
     checkFavorite();
   }, [beverage, open]);

   // 切换收藏
   const toggleFavorite = async () => {
     setFavoriteLoading(true);
     const deviceId = getDeviceId();
     const beverageKey = `${beverage.brand}::${beverage.beverage_name}`;

     try {
       if (isFavorited) {
         await supabase
           .from('favorites')
           .delete()
           .eq('device_id', deviceId)
           .eq('beverage_key', beverageKey);
         setIsFavorited(false);
       } else {
         await supabase
           .from('favorites')
           .insert({
             device_id: deviceId,
             beverage_key: beverageKey,
             beverage_data: beverage    // ⚠️【关键修正】直接传对象，不要 JSON.stringify！
                                        // Supabase 的 jsonb 列会自动序列化 JS 对象。
                                        // 如果你写 JSON.stringify(beverage) 会导致双重编码，
                                        // 读取时需要 parse 两次才能拿到对象。
           });
         setIsFavorited(true);
       }
     } catch (err) {
       console.error('收藏操作失败:', err);
     }
     setFavoriteLoading(false);
   };

4. 收藏按钮保留心跳缩放动画（已有的 scale 动画保留）

━━━ 修改 4：新建 FavoritesDrawer.jsx（收藏列表侧边栏） ━━━

新建 src/components/FavoritesDrawer.jsx

⚠️【关键修正】使用项目中已有的 Sheet 组件，不要自己从头写侧边栏。
项目里已经有 src/components/ui/sheet.jsx（基于 Radix Dialog）。

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/deviceId';
import { Heart, X, Coffee } from 'lucide-react';
import { useState, useEffect } from 'react';

Props: { open, onOpenChange, onSelectBeverage }

功能：

1. 打开时查询 Supabase：
   useEffect(() => {
     if (!open) return;
     const fetchFavorites = async () => {
       const deviceId = getDeviceId();
       const { data } = await supabase
         .from('favorites')
         .select('*')
         .eq('device_id', deviceId)
         .order('created_at', { ascending: false });
       setFavorites(data || []);
     };
     fetchFavorites();
   }, [open]);

2. ⚠️【关键修正】beverage_data 是 jsonb 类型，Supabase 返回时已经是 JS 对象，
   不需要 JSON.parse！直接使用：
   const bev = item.beverage_data;  // 已经是对象，不要 JSON.parse

3. 删除收藏：
   const removeFavorite = async (beverageKey) => {
     const deviceId = getDeviceId();
     await supabase
       .from('favorites')
       .delete()
       .eq('device_id', deviceId)
       .eq('beverage_key', beverageKey);
     setFavorites(prev => prev.filter(f => f.beverage_key !== beverageKey));
   };

4. 列表项 UI：
   - 每条显示：饮品名 + 品牌名 + 价格 + 数据来源标记
   - 点击某条 → 调用 onSelectBeverage(item.beverage_data) → 父组件打开详情弹窗
   - 右侧小 X 按钮可删除收藏（点击 X 按钮调用 removeFavorite，需要 e.stopPropagation 防止触发父级点击）

5. 空状态："还没有收藏哦，去探索一下吧 ☕"

6. ⚠️【关键修正】侧边栏需要响应式，移动端从底部滑入，桌面端从右侧滑入：

   // 检测移动端
   const [isMobile, setIsMobile] = useState(false);
   useEffect(() => {
     const check = () => setIsMobile(window.innerWidth < 768);
     check();
     window.addEventListener('resize', check);
     return () => window.removeEventListener('resize', check);
   }, []);

   return (
     <Sheet open={open} onOpenChange={onOpenChange}>
       <SheetContent
         side={isMobile ? "bottom" : "right"}
         className={
           isMobile
             ? "h-[80vh] rounded-t-2xl"
             : "w-80"
         }
       >
         <SheetHeader>
           <SheetTitle className="flex items-center gap-2">
             <Heart className="h-5 w-5 text-red-500 fill-red-500" />
             我的收藏
           </SheetTitle>
         </SheetHeader>
         {/* 移动端顶部拖拽把手 */}
         {isMobile && (
           <div className="flex justify-center py-2">
             <div className="w-10 h-1 bg-gray-300 rounded-full" />
           </div>
         )}
         <div className="overflow-y-auto flex-1 mt-4 space-y-3">
           {favorites.length === 0 ? (
             <div className="text-center text-gray-400 py-12">
               <Coffee className="h-12 w-12 mx-auto mb-3 opacity-50" />
               <p>还没有收藏哦，去探索一下吧 ☕</p>
             </div>
           ) : (
             favorites.map(item => { /* 列表项 */ })
           )}
         </div>
       </SheetContent>
     </Sheet>
   );

━━━ 修改 5：在 HomePage.jsx 中集成 ━━━

⚠️【关键修正】不要创建两个 BeverageDetailDialog 实例。
只在 HomePage 层级放一个 Dialog 实例，WordCloudSection 和 FavoritesDrawer 都通过 props 回调打开它。

1. 引入组件：
   import FavoritesDrawer from '@/components/FavoritesDrawer';
   import BeverageDetailDialog from '@/components/BeverageDetailDialog';

2. 添加 state：
   const [favDrawerOpen, setFavDrawerOpen] = useState(false);
   const [selectedBeverage, setSelectedBeverage] = useState(null);
   const [beverageDialogOpen, setBeverageDialogOpen] = useState(false);

3. 处理函数：
   const handleSelectBeverage = (bev) => {
     setSelectedBeverage(bev);
     setBeverageDialogOpen(true);
     setFavDrawerOpen(false);  // 关闭收藏抽屉
   };

4. Header 组件需要接收 onFavoritesClick prop：
   修改 Header.jsx，给 Heart 按钮添加 onClick：
   <Header onFavoritesClick={() => setFavDrawerOpen(true)} />

   Header.jsx 中：
   const Header = ({ onFavoritesClick }) => {
     return (
       <header className="flex justify-between items-center px-5 py-4">
         <div className="text-2xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
           SipWise
         </div>
         <button
           onClick={onFavoritesClick}
           className="p-2 hover:bg-brand-light rounded-full transition-colors"
         >
           <Heart className="h-6 w-6 text-brand-primary" />
         </button>
       </header>
     );
   };

5. 渲染：
   <FavoritesDrawer
     open={favDrawerOpen}
     onOpenChange={setFavDrawerOpen}
     onSelectBeverage={handleSelectBeverage}
   />
   <BeverageDetailDialog
     open={beverageDialogOpen}
     onOpenChange={setBeverageDialogOpen}
     beverage={selectedBeverage}
   />

6. ⚠️【关键修正】同时修改 WordCloudSection，让它也通过 props 回调打开 Dialog：
   WordCloudSection 接收新 prop: onSelectBeverage
   点击饮品名时调用 onSelectBeverage(recommendation) 而不是自己管 Dialog

   在 HomePage 中传递：
   <WordCloudSection
     ...已有 props...
     onSelectBeverage={handleSelectBeverage}
   />
```

✅ 验收标准
* 首次访问 → localStorage 中出现 sipwise_device_id
* 点击收藏 → Supabase favorites 表新增记录（可在 Dashboard 验证）
* 再次打开同一饮品详情 → ❤ 已经是红色（已收藏状态）
* 再次点击 → 记录删除，❤ 变回灰色
* Header ❤ 点击 → 侧边栏弹出（桌面右侧/移动端底部），显示已收藏的饮品列表
* 收藏列表点击某条 → 打开该饮品的详情弹窗（含曲线图）
* 空收藏 → 显示空状态提示
* 收藏按钮有心跳缩放动画
* **只有一个 BeverageDetailDialog 实例**（在 HomePage 层级）

---

## Step 10 — 词云功能补全（点击触发 DeepSeek 推荐）

```
【Step 10】词云点击 → 触发 DeepSeek 推荐

⚠️ WordCloudSection.jsx 已存在。检查并确保以下功能完整：

━━━ 修改 1：提取公共函数到 recommendationEngine.js ━━━

⚠️【关键修正】这是最重要的一步，必须完整执行。
目前 extractBrandsAndMap、getDeepSeekRecommendations、processRecommendations
这三个函数定义在 SecondSection.jsx 中。同时 searchPoiStores 也在 SecondSection.jsx 中。
需要将它们全部提取到公共文件，供 SecondSection 和 WordCloudSection 共用。

新建 src/lib/recommendationEngine.js：

import { supabase } from '@/integrations/supabase/client';

const DEEPSEEK_API_KEY = 'sk-6fcd604753324744a228f58bbf41f894';
const AMAP_KEY = '9deea9030329e7a129ec9c5bb57d052a';

/**
 * 搜索附近 POI 门店
 * @param {number} lng - 经度
 * @param {number} lat - 纬度
 * @returns {Promise<Array>} POI 门店列表
 */
export async function searchPoiStores(lng, lat) {
  // 从 SecondSection.jsx 中原样剪切 searchPoiStores 函数的完整实现
  // 包括 2km → 4km 的 fallback 逻辑
  // 注意：使用上面的 AMAP_KEY 常量替代硬编码的 key
}

/**
 * 从 POI 结果中提取品牌列表和品牌-门店映射
 * @param {Array} poiStores - POI 搜索结果
 * @returns {{ brandList: string[], brandStoreMap: Object }}
 */
export function extractBrandsAndMap(poiStores) {
  // 从 SecondSection.jsx 中原样剪切此函数的完整实现
}

/**
 * 调用 DeepSeek API 获取饮品推荐
 * @param {string[]} brandList - 附近品牌列表
 * @param {string} userInput - 用户需求文本
 * @param {string[]} tags - 提取的标签
 * @returns {Promise<Array>} 原始推荐数据
 */
export async function getDeepSeekRecommendations(brandList, userInput, tags) {
  // 从 SecondSection.jsx 中原样剪切此函数的完整实现
  // 注意：使用上面的 DEEPSEEK_API_KEY 常量替代硬编码的 key
}

/**
 * 用 Supabase 数据增强推荐结果
 * @param {Array} rawRecommendations - DeepSeek 返回的原始推荐
 * @param {Object} brandStoreMap - 品牌-门店映射
 * @returns {Promise<Array>} 增强后的推荐列表
 */
export async function processRecommendations(rawRecommendations, brandStoreMap) {
  // 从 SecondSection.jsx 中原样剪切此函数的完整实现
}

⚠️【关键修正】提取完成后，必须同步修改 SecondSection.jsx：
将 SecondSection.jsx 中这四个函数的原始定义全部删除，
替换为从公共文件 import：

import {
  searchPoiStores,
  extractBrandsAndMap,
  getDeepSeekRecommendations,
  processRecommendations
} from '@/lib/recommendationEngine';

确保 SecondSection.jsx 中调用这些函数的代码不需要任何改动
（函数签名保持一致）。

━━━ 修改 2：词云标签数据获取 ━━━

词云标签应从 Supabase 动态获取。
由于 nocode 平台可能不支持 rpc 调用，直接使用前端方案：

在 WordCloudSection.jsx 中添加：
const [tagCounts, setTagCounts] = useState([]);

useEffect(() => {
  const fetchTags = async () => {
    const { data } = await supabase.from('beverages').select('tags');
    if (!data) return;
    const tagMap = {};
    data.forEach(b => b.tags?.forEach(t => {
      tagMap[t] = (tagMap[t] || 0) + 1;
    }));
    const sorted = Object.entries(tagMap)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
    setTagCounts(sorted);
  };
  fetchTags();
}, []);

━━━ 修改 3：词云点击触发 DeepSeek 推荐 ━━━

⚠️【关键修正】使用 locationData（不是 userLocation），与项目现有 prop 命名一致。

WordCloudSection 需要接收以下新 props（修改 HomePage 传入）：
- locationData: { lat, lng, ... }（用户已定位的坐标，当前未传给 WordCloudSection）
- onSelectBeverage: (beverage) => void（Step 9 已加）

在 HomePage.jsx 中补充传递：
<WordCloudSection
  extractedTags={extractedTags}
  poiStores={poiStores}
  recommendations={recommendations}
  isRecommendationsLoading={isRecommendationsLoading}
  locationData={locationData}                          // ← 新增
  onSelectBeverage={handleSelectBeverage}               // ← Step 9 已加
  onRecommendationsReceived={handleRecommendationsReceived}  // ← 新增（复用已有 setter）
/>

词云 tag 点击后的完整流程：
const [selectedTags, setSelectedTags] = useState([]);
const [wordCloudLoading, setWordCloudLoading] = useState(false);

import {
  searchPoiStores,
  extractBrandsAndMap,
  getDeepSeekRecommendations,
  processRecommendations
} from '@/lib/recommendationEngine';
import { toast } from 'sonner';

const handleTagClick = async (tag) => {
  // 1. 切换选中状态
  const newTags = selectedTags.includes(tag)
    ? selectedTags.filter(t => t !== tag)
    : [...selectedTags, tag];
  setSelectedTags(newTags);

  // 2. 如果没有选中任何 tag，清空推荐
  if (newTags.length === 0) {
    onRecommendationsReceived([], false);
    return;
  }

  // 3. 检查定位
  if (!locationData) {
    toast('请先输入地址定位哦 📍');
    return;
  }

  // 4. 触发推荐流程（复用公共函数）
  setWordCloudLoading(true);
  onRecommendationsReceived([], true);  // 通知父组件进入 loading
  try {
    const stores = await searchPoiStores(locationData.lng, locationData.lat);
    const { brandList, brandStoreMap } = extractBrandsAndMap(stores);
    const rawRecs = await getDeepSeekRecommendations(
      brandList,
      newTags.join('、'),    // 将选中的标签作为用户需求
      newTags
    );
    const finalRecs = await processRecommendations(rawRecs, brandStoreMap);
    onRecommendationsReceived(finalRecs, false);
  } catch (err) {
    console.error('词云推荐失败:', err);
    toast.error('推荐失败，请重试');
    onRecommendationsReceived([], false);
  }
  setWordCloudLoading(false);
};

━━━ 修改 4：推荐列表显示位置 ━━━

⚠️【关键修正】推荐列表状态已提升到 HomePage（recommendations state）。
SecondSection 和 WordCloudSection 都通过 onRecommendationsReceived 回调更新同一个 state。
推荐列表在 WordCloudSection 中渲染（当前已有渲染逻辑，保持不变）。

这意味着：
- SecondSection 搜索 → 更新 HomePage 的 recommendations → WordCloudSection 显示
- WordCloudSection 词云点击 → 也更新 HomePage 的 recommendations → 同一位置显示
两者共享同一个推荐列表，不会出现两处列表。

━━━ 修改 5：词云样式和动画 ━━━

确保以下样式已实现：

词云 tag 的渲染：
const TAG_COLORS = ['#8B6F47', '#D4A574', '#6B8E6B', '#7B9EC4', '#C47B7B'];

{tagCounts.map((item, index) => {
  const isSelected = selectedTags.includes(item.tag);
  const colorIndex = index % TAG_COLORS.length;
  const sizeClass = item.count > 10 ? 'text-lg px-4 py-2'
                  : item.count > 5 ? 'text-base px-3 py-1.5'
                  : 'text-sm px-3 py-1.5';  // ⚠️ 最小号也用 text-sm，确保移动端可点击

  return (
    <button
      key={item.tag}
      onClick={() => handleTagClick(item.tag)}
      className={`rounded-full font-medium transition-all duration-200 min-h-[36px]
        ${sizeClass}
        ${isSelected
          ? 'text-white shadow-md scale-105'
          : 'bg-white border border-brand-border text-brand-text hover:border-brand-primary'
        }`}
      style={{
        backgroundColor: isSelected ? TAG_COLORS[colorIndex] : undefined,
        animationDelay: `${index * 50}ms`,
      }}
    >
      {item.tag}
    </button>
  );
})}

词云容器添加 stagger fade-in：
<div className="flex flex-wrap gap-2 justify-center">
  {tagCounts.map((item, index) => (
    <button
      ...
      className="... animate-fade-in-up opacity-0"
      style={{ animationDelay: `${index * 50}ms` }}
    >
```

✅ 验收标准
* 词云标签从 Supabase beverages 表的 tags 字段动态加载
* 点击 "升糖低" tag → 高亮 + 触发 DeepSeek 推荐 → 列表出现
* 再点 "暖胃" → 两个 tag 都高亮 → 列表根据两个标签刷新
* 取消一个 tag → 列表再次刷新
* 取消所有 tag → 列表清空
* 未定位时点击 tag → toast 提示先定位
* searchPoiStores、extractBrandsAndMap、getDeepSeekRecommendations、processRecommendations 四个函数已提取到 src/lib/recommendationEngine.js
* SecondSection.jsx 改为从 recommendationEngine.js import，原有搜索流程不受影响
* 词云 stagger 动画正常

---

## Step 11 — Footer 科普文字区

```
【Step 11】Footer 科普区

━━━ 修改 1：丰富 Footer 内容 ━━━

当前 Footer.jsx 只有一段简单的"关于 SipWise"文字。
将其扩展为两张科普卡片 + 底部 slogan：

import { Heart, BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-light py-12 px-5 mt-12">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* 科普卡片 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-border">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-5 w-5 text-brand-primary" />
            <h3 className="font-bold text-brand-text">血糖与饮品的关系</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            餐后血糖在 30-60 分钟达到峰值，高糖饮品可能导致血糖快速飙升至
            10+ mmol/L。选择低 GI、少糖的饮品有助于维持血糖平稳，
            减少"糖分过山车"带来的疲倦感。
          </p>
        </div>

        {/* 科普卡片 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-border">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-5 w-5 text-brand-primary" />
            <h3 className="font-bold text-brand-text">如何聪明地喝奶茶？</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            选择三分糖或无糖 · 用鲜奶替代奶精 · 少加珍珠等淀粉配料 ·
            搭配膳食纤维一起饮用 · 避免空腹喝高糖饮品。
            小小的选择改变，就能让你享受美味的同时更健康。
          </p>
        </div>

        {/* 底部 slogan */}
        <p className="text-center text-sm text-gray-400 pt-4">
          SipWise — 喝得明白，喝得健康 🍵
        </p>
      </div>
    </footer>
  );
};

export default Footer;

━━━ 注意事项 ━━━

Footer 应始终显示在页面最底部，不受推荐列表有无的影响。
确保 HomePage.jsx 中 <Footer /> 在所有内容之后渲染，
且不包裹在任何 {locationData && ...} 条件判断中。

当前 HomePage 结构应该是：
<div>
  <Header ... />
  <HeroSection ... />
  {locationData && (
    <>
      <SecondSection ... />
      <WordCloudSection ... />
    </>
  )}
  <Footer />                    ← 在条件渲染之外，始终显示
  <FavoritesDrawer ... />
  <BeverageDetailDialog ... />
</div>
```

✅ 验收标准
* 科普文字完整（两段卡片 + 图标）
* 底部 slogan 居中
* 无论是否搜索过，Footer 都可见
* Footer 始终在页面最底部

---

## Step 12 — 骨架屏 + 动效 polish

```
【Step 12】骨架屏 + 整体动效 polish

━━━ 修改 1：骨架屏触发时机确认 ━━━

当前 WordCloudSection.jsx 已有 SkeletonCard 组件和 isRecommendationsLoading 判断。
确保以下两个入口都能触发骨架屏：
1. SecondSection "为我推荐" 按钮 → 设置 isRecommendationsLoading=true → 骨架屏显示
2. WordCloudSection 词云点击 → 设置 isRecommendationsLoading=true → 骨架屏显示

检查 HomePage.jsx 中 handleRecommendationsReceived 是否同时接收 loading 状态：
const handleRecommendationsReceived = (recs, isLoading) => {
  setRecommendations(recs);
  setIsRecommendationsLoading(isLoading);
};

骨架屏最少显示 800ms，避免闪烁：
// 在 SecondSection 或调用推荐的地方：
const startTime = Date.now();
// ... 执行推荐流程 ...
const elapsed = Date.now() - startTime;
if (elapsed < 800) {
  await new Promise(r => setTimeout(r, 800 - elapsed));
}
onRecommendationsReceived(finalRecs, false);

━━━ 修改 2：loading 文案分阶段 ━━━

⚠️【关键修正】使用 useEffect + cleanup 防止内存泄漏。

在 WordCloudSection.jsx 的骨架屏区域上方添加 loading 文案：

const [loadingText, setLoadingText] = useState('');

useEffect(() => {
  if (!isRecommendationsLoading) {
    setLoadingText('');
    return;
  }
  setLoadingText('正在定位附近的饮品店…');
  const t1 = setTimeout(() => setLoadingText('AI 正在分析您的需求…'), 1500);
  const t2 = setTimeout(() => setLoadingText('正在为您挑选最合适的饮品…'), 3000);
  const t3 = setTimeout(() => setLoadingText('快好了，再等一下…'), 5000);
  return () => {            // ⚠️ 必须 cleanup，否则组件卸载后 setState 会报错
    clearTimeout(t1);
    clearTimeout(t2);
    clearTimeout(t3);
  };
}, [isRecommendationsLoading]);

渲染：
{isRecommendationsLoading && (
  <div className="text-center mb-6">
    <p className="text-sm text-brand-primary animate-pulse">{loadingText}</p>
  </div>
)}

━━━ 修改 3：推荐列表入场动画 ━━━

为推荐卡片添加 stagger fade-in-up 动画。

在 src/index.css 中添加（检查是否已有，没有才加）：

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out forwards;
  opacity: 0;
}

在 WordCloudSection 的推荐卡片容器中：
{recommendations.map((rec, index) => (
  <div
    key={index}
    className="... animate-fade-in-up"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    {/* 卡片内容 */}
  </div>
))}

━━━ 修改 4：动效检查清单 ━━━

逐一检查以下动画，缺失的补上：

1. Hero 区域首屏 fade-in：
   HeroSection 外层添加：
   className="animate-fade-in-up"
   （使用上面定义的同一动画）

2. SecondSection slide-up：
   已有 transition-all duration-500 的 opacity+translate-y 过渡 ✓

3. 词云 stagger fade-in：
   Step 10 已添加 ✓

4. 详情 Dialog 从下方滑入：
   BeverageDetailDialog 使用 shadcn Dialog，自带 data-[state=open]:animate-in 过渡 ✓
   如果不够明显，可以在 DialogContent 添加：
   className="... data-[state=open]:slide-in-from-bottom-4"

5. 收藏侧边栏滑入：
   使用 Sheet 组件，自带 slide-in 动画 ✓

6. 收藏按钮心跳动画：
   检查 BeverageDetailDialog 中的收藏按钮是否有：
   className="... transition-transform active:scale-90"
   以及收藏成功时的脉冲效果：
   animate-ping 或 animate-bounce（一次性）

━━━ 补充：项目已安装 framer-motion (^11.3.9) 但未使用 ━━━

如果需要更复杂的动画（如 AnimatePresence 切换），可以使用 framer-motion。
但对于当前需求，CSS 动画足够，不需要引入额外复杂度。
```

✅ 验收标准
* 搜索全程显示骨架屏（覆盖整个推荐链条 3-6 秒）
* 骨架屏最少 800ms，避免闪烁
* loading 文案有变化（至少 3 个阶段）
* loading 文案的 setTimeout 有 cleanup（不会内存泄漏）
* 推荐卡片 stagger 入场（每张延迟 100ms）
* 所有过渡动画无突兀跳变
* Hero 区域有 fade-in
* 详情 Dialog 有从下方滑入效果

---

## Step 13 — 移动端响应式适配

```
【Step 13】移动端响应式 polish

━━━ 检查 1：BeverageDetailDialog 移动端适配 ━━━

1. Dialog 移动端应接近全屏：
   DialogContent 的 className：
   "w-[95vw] max-w-md max-h-[85vh] overflow-y-auto rounded-2xl p-5
    md:w-auto md:max-w-md md:max-h-[90vh]"

2. 血糖曲线图（Recharts）在窄屏下适配：
   <ResponsiveContainer width="100%" height={220}>
   XAxis: tick={{ fontSize: 11 }}
   YAxis: width={35} tick={{ fontSize: 10 }}
   如果 YAxis 标签 "mmol/L" 溢出，改为 hide 或在图表标题中标注单位

3. 数据来源角标（data_badge）：
   移动端放在标题下方独占一行：
   <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
     <h2 className="text-lg font-bold">{beverage.beverage_name}</h2>
     <span className="text-xs ...">{badge}</span>
   </div>

━━━ 检查 2：FavoritesDrawer 移动端适配 ━━━

⚠️ Step 9 已处理了响应式（移动端 bottom / 桌面端 right），这里只需验证：
1. 移动端：从底部滑入，h-[80vh]，rounded-t-2xl，有拖拽把手 ✓
2. 桌面端：从右侧滑入，w-80 ✓
3. 列表项 touch target 足够大（每项 min-h-[48px]，padding py-3）

━━━ 检查 3：词云 tag 触摸区域 ━━━

Step 10 已将最小号 tag 设为 text-sm + min-h-[36px]。
额外确保：
- 移动端 tag 之间有 gap-2（已有）
- tag 的 padding 至少 px-3 py-1.5

━━━ 检查 4：Header 移动端适配 ━━━

Header.jsx：
- Logo 移动端：text-xl，桌面端：text-2xl
  className="text-xl md:text-2xl font-bold"
- 收藏按钮 touch target ≥ 44px：
  className="p-2.5 hover:bg-brand-light rounded-full transition-colors"
  （p-2.5 + 24px icon = 44px total）

━━━ 检查 5：HeroSection 移动端适配 ━━━

- 地址输入框 + 确认按钮：移动端堆叠排列
  <div className="flex flex-col sm:flex-row gap-3">
    <input className="flex-1 ..." />
    <button className="w-full sm:w-auto ..." />
  </div>
- 标题文字移动端：text-2xl，桌面端：text-3xl

━━━ 检查 6：SecondSection 移动端适配 ━━━

- textarea + "为我推荐" 按钮：
  textarea: className="w-full ..."
  按钮: className="w-full sm:w-auto ..."

━━━ 检查 7：推荐卡片移动端适配 ━━━

- 移动端全宽：
  卡片 className="w-full ..."
- 距离 + 店名移动端纵向排列：
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
    <span className="text-sm text-gray-500">{distance}</span>
    <span className="font-medium">{storeName}</span>
  </div>

━━━ 检查 8：Footer 移动端适配 ━━━

- 科普卡片：mx-4（移动端留边距）
  className="max-w-2xl mx-auto px-4 md:px-0 space-y-6"

━━━ 检查 9：全局 ━━━

1. 375px 宽度下无水平滚动条：
   确保根容器有 overflow-x-hidden：
   <div className="min-h-screen bg-brand-bg overflow-x-hidden">

2. 所有图片/图表有 max-width: 100%

━━━ 最终移动端全链路测试 ━━━

用 Chrome DevTools 切到 iPhone SE (375px) 和 iPhone 14 Pro (393px)：
1. 首页加载 → Hero 完整可见，无溢出
2. 输入地址 → 确认按钮可点击，不被键盘遮挡
3. 输入需求 → 推荐按钮可点击，全宽显示
4. 推荐列表 → 卡片全宽，内容不溢出
5. 点击饮品 → Dialog 弹出接近全屏，曲线图完整不溢出
6. 点击收藏 → 心跳动画
7. 打开收藏抽屉 → bottom sheet 样式，从底部滑入
8. 点击词云 tag → 推荐刷新
9. 滑到底部 → 科普文字完整
10. 反复操作无白屏崩溃
```

✅ 验收标准
* 375px 下无水平滚动条
* 所有按钮 touch target ≥ 44px（Header 收藏按钮）或 ≥ 36px（词云 tag）
* BeverageDetailDialog 移动端 w-[95vw]，内容不溢出
* 血糖曲线图在窄屏完整显示，轴标签不重叠
* FavoritesDrawer 移动端从底部滑入
* 地址输入框、推荐按钮移动端全宽
* 推荐卡片全宽，距离+店名纵向排列
* Footer 移动端有足够边距

---

## 跨步骤执行注意事项

### 执行顺序建议

**Step 10 建议拆成两次执行：**

第一次：只做"提取函数到 recommendationEngine.js + SecondSection 改 import"。
执行完后测试 SecondSection 的推荐流程是否仍然正常。

第二次：做"词云点击触发推荐 + 词云从 Supabase 加载标签"。

**原因：** Step 10 的函数提取是最容易出错的操作。如果一次性做完，
出问题时很难分辨是函数提取的问题还是词云逻辑的问题。

### 每步执行完必做

每执行完一个 Step，务必在浏览器中测试，并在开发者控制台检查：
1. 无红色报错
2. 网络请求正常（Supabase / DeepSeek / 高德）
3. 功能符合验收标准

### 全局风险提醒

1. Step 10 修改 SecondSection.jsx 时，不要覆盖 Step 9 对 HomePage.jsx 的改动
   （selectedBeverage、favDrawerOpen 等 state）
2. 如果 AI 提示要"重写"某个文件，务必检查是否会丢失之前步骤的代码
3. 建议每步完成后在 no-code 平台做一次"保存/版本快照"（如果支持的话）
