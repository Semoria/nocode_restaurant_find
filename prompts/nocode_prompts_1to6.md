# SipWise — 给 nocode.cn 平台 AI 的 Prompt（需求1-6）

> 以下每个 Prompt 独立可用，按顺序执行。每个 Prompt 都基于 `nocode/` 文件夹的现有代码。
> 建议执行顺序：先 Prompt 6（最简单）→ Prompt 5 → Prompt 1 → Prompt 2 → Prompt 3 → Prompt 4

---

## Prompt 1：个人健康档案

```
请帮我实现「个人健康档案」功能。以下是现有代码结构和详细需求：

【现有代码结构】
- src/components/Header.jsx：目前只有左侧 "SipWise" logo 和右侧一个 Heart 收藏按钮
- src/components/HomePage.jsx：状态管理中心，管理 locationData、recommendations 等 state
- src/components/FavoritesDrawer.jsx：收藏抽屉，使用 Sheet 组件（来自 @/components/ui/sheet）
- src/lib/deviceId.js：提供 getDeviceId() 函数获取 localStorage 中的设备 UUID
- src/integrations/supabase/client.js：提供 supabase 客户端实例

【需要做的改动】

1. 修改 src/components/Header.jsx：
   - 在现有 Heart 按钮的【左边】新增一个「健康档案」图标按钮
   - 使用 lucide-react 的 ClipboardList 图标
   - 按钮样式与 Heart 按钮保持一致：p-2.5 hover:bg-brand-light rounded-full transition-colors hover:scale-110 transition-transform
   - 图标样式：h-6 w-6 text-brand-primary
   - 新增 onHealthProfileClick prop
   - 最终 header 右侧按钮排列：[健康档案(ClipboardList)] [收藏(Heart)]

2. 新建 src/components/HealthProfileDrawer.jsx：
   - 使用与 FavoritesDrawer.jsx 相同的 Sheet 组件（import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'）
   - 同样检测移动端：移动端 side="bottom" h-[80vh] rounded-t-2xl，桌面端 side="right" w-96
   - 标题：带图标「我的健康档案」

   表单字段（全部可选，不填也能保存）：

   a) 过敏原（多选 checkbox）：
      选项：牛奶、大豆、坚果、芒果、桃子、花生、小麦/麸质
      state: allergens (string[])

   b) 慢性病（多选 checkbox）：
      选项：糖尿病、高血脂、高血压、痛风、胃溃疡
      state: chronic_conditions (string[])

   c) 饮食偏好（多选 checkbox）：
      选项：素食、低碳水、生酮、无乳糖、清真
      state: diet_preferences (string[])

   d) 体质（单选 radio，初始为空，需求9的体质问卷完成后会回填）：
      选项：平和体质、阳虚体质、气虚体质、阴虚体质、湿热体质、痰湿体质、气郁体质、血瘀体质、特禀体质
      state: body_constitution (string)

   e) 上次月经日期（日历选择器）：
      使用 input type="date" 即可
      state: last_period_date (string, ISO date)

   f) 月经周期天数（数字输入，默认28）：
      state: period_cycle_days (number)

   g) 经期持续天数（数字输入，默认7）：
      state: period_duration_days (number)

   底部按钮：
   - 「保存」按钮（bg-brand-primary text-white rounded-lg）
   - 保存时：
     1) 存入 localStorage key "sipwise_health_profile"（JSON.stringify 整个对象）
     2) 同时 UPSERT 到 Supabase health_profiles 表（以 device_id 为唯一键）
     3) 保存成功后 toast.success('健康档案已保存')

   - 在保存按钮下方，增加一个「导入我的 CGM 数据」占位按钮：
     样式：w-full border-2 border-dashed border-gray-300 rounded-lg text-gray-400 py-3
     图标：Upload（来自 lucide-react）
     点击行为：toast('CGM 数据导入功能即将上线，敬请期待！')

   打开 Drawer 时：
   - 从 localStorage 读取 "sipwise_health_profile"
   - 如有数据则回填表单（编辑模式）
   - 如无数据则显示空表单（创建模式）

3. 修改 src/components/HomePage.jsx：
   - 新增 state: const [healthProfileOpen, setHealthProfileOpen] = useState(false);
   - 新增 state: const [healthProfile, setHealthProfile] = useState(null);
   - 在 useEffect 中初始化：从 localStorage 读取 "sipwise_health_profile" 并 setHealthProfile
   - 新增 handler: const handleHealthProfileClick = () => setHealthProfileOpen(true);
   - 新增 handler: const handleHealthProfileSave = (profile) => { setHealthProfile(profile); setHealthProfileOpen(false); };
   - 修改 <Header> 传入 onHealthProfileClick={handleHealthProfileClick}
   - 在 JSX 中添加 <HealthProfileDrawer open={healthProfileOpen} onOpenChange={setHealthProfileOpen} onSave={handleHealthProfileSave} />

4. 新建 Supabase migration SQL（在 src/supabase/migrations/ 下新建文件）：
```sql
CREATE TABLE IF NOT EXISTS health_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,
  allergens TEXT[] DEFAULT '{}',
  chronic_conditions TEXT[] DEFAULT '{}',
  diet_preferences TEXT[] DEFAULT '{}',
  body_constitution TEXT DEFAULT '',
  last_period_date DATE,
  period_cycle_days INTEGER DEFAULT 28,
  period_duration_days INTEGER DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous access" ON health_profiles FOR ALL USING (true) WITH CHECK (true);
```

请确保所有样式与现有项目一致（使用 TailwindCSS，brand-primary/brand-text/brand-light/brand-border 等自定义颜色）。
```

---

## Prompt 2：家庭组

```
请帮我实现「家庭组」功能。以下是现有代码结构和详细需求：

【前置条件】需求1（个人健康档案）已完成，Header.jsx 中已有 ClipboardList 和 Heart 两个按钮。

【需要做的改动】

1. 修改 src/components/Header.jsx：
   - 在现有的「健康档案 ClipboardList」按钮的【左边】再新增一个「家庭组」图标按钮
   - 使用 lucide-react 的 Users 图标
   - 按钮样式与其他按钮一致：p-2.5 hover:bg-brand-light rounded-full transition-colors hover:scale-110 transition-transform
   - 新增 onFamilyGroupClick prop
   - 最终 header 右侧按钮排列（从左到右）：[家庭组(Users)] [健康档案(ClipboardList)] [收藏(Heart)]

2. 新建 src/components/FamilyGroupDrawer.jsx：
   - 使用与 FavoritesDrawer.jsx 相同的 Sheet 组件
   - 移动端 side="bottom" h-[80vh] rounded-t-2xl，桌面端 side="right" w-96
   - 标题：Users 图标 + 「我的家庭组」

   功能流程：

   a) 未创建家庭组时：
      - 显示一个「创建家庭组」按钮（bg-brand-primary text-white rounded-lg w-full py-3）
      - 点击后：
        1) 在 Supabase family_groups 表插入一条记录（group_id 用 crypto.randomUUID()，device_id 用 getDeviceId()，role='creator'）
        2) 将 group_id 存入 localStorage "sipwise_family_group_id"
        3) toast.success('家庭组创建成功')
      - 同时显示「输入邀请码加入」区域：
        - 一个6位大写字母数字的输入框 + 「加入」按钮
        - 加入时查询 Supabase family_invites 表，验证邀请码有效（未过期、未使用）
        - 有效则将自己加入对应 group_id，更新邀请码 used_by 字段

   b) 已创建/已加入家庭组时：
      - 显示「邀请成员」按钮
      - 点击后：
        1) 生成6位邀请码（大写字母+数字随机组合）
        2) 存入 Supabase family_invites 表，expires_at 设为24小时后
        3) 显示邀请码，旁边有复制按钮（navigator.clipboard.writeText）
      - 显示成员列表：
        - 查询 family_groups 表中同一 group_id 的所有成员
        - 对每个成员，查询 health_profiles 表获取健康档案摘要
        - 展示：昵称（或 "成员1/成员2"）、体质、过敏原
        - 经期状态只显示「经期中」或「非经期」（不显示具体日期，保护隐私）

   c) 成员卡片上有「为 TA 推荐」按钮：
      - 点击后关闭 Drawer，将对方的健康档案设为当前推荐参考档案
      - 页面顶部显示提示条：「正在为 XX 推荐」+「切回自己」按钮

3. 修改 src/components/HomePage.jsx：
   - 新增 state: const [familyGroupOpen, setFamilyGroupOpen] = useState(false);
   - 新增 handler: const handleFamilyGroupClick = () => setFamilyGroupOpen(true);
   - 修改 <Header> 传入 onFamilyGroupClick={handleFamilyGroupClick}
   - 在 JSX 中添加 <FamilyGroupDrawer open={familyGroupOpen} onOpenChange={setFamilyGroupOpen} />

4. 新建 Supabase migration SQL：
```sql
CREATE TABLE IF NOT EXISTS family_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  device_id TEXT NOT NULL,
  nickname TEXT DEFAULT '',
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, device_id)
);

CREATE TABLE IF NOT EXISTS family_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code TEXT NOT NULL UNIQUE,
  creator_device_id TEXT NOT NULL,
  group_id UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous access" ON family_groups FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE family_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous access" ON family_invites FOR ALL USING (true) WITH CHECK (true);
```

请确保所有样式与现有项目一致。
```

---

## Prompt 3：推荐自动参考健康档案

```
请帮我修改推荐引擎，使其自动参考用户的健康档案。以下是现有代码和详细需求：

【现有代码】
- src/lib/recommendationEngine.js 中有 getDeepSeekRecommendations(brandList, userInput, tags, poiStores) 函数，调用 DeepSeek API 生成推荐
- src/components/SecondSection.jsx 调用这个函数生成推荐
- src/components/WordCloudSection.jsx 中的标签点击也调用这个函数
- src/components/HomePage.jsx 管理所有 state 并通过 props 传递

【前置条件】需求1已完成，HomePage.jsx 中已有 healthProfile state。

【需要做的改动】

1. 修改 src/components/HomePage.jsx：
   - 将 healthProfile 通过 props 传给 SecondSection 和 WordCloudSection：
     <SecondSection ... healthProfile={healthProfile} />
     <WordCloudSection ... healthProfile={healthProfile} />

2. 修改 src/lib/recommendationEngine.js：
   a) getDeepSeekRecommendations 函数签名改为：
      export async function getDeepSeekRecommendations(brandList, userInput, tags, poiStores = [], healthProfile = null)

   b) 在函数内部，构建 system prompt 时，如果 healthProfile 不为 null，在现有 system prompt 的末尾追加：

   ```
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
   6. 如果用户有胃溃疡，避免推荐高酸性饮品（如柠檬类）和空腹咖啡
   ```

   c) processRecommendations 函数签名改为：
      export async function processRecommendations(rawRecommendations, brandStoreMap, healthProfile = null)
      （目前不需要在这个函数中做额外处理，但预留参数方便后续需求4使用）

3. 修改 src/components/SecondSection.jsx：
   - 接收新 prop: healthProfile
   - 调用 getDeepSeekRecommendations 时传入 healthProfile：
     const rawRecommendations = await getDeepSeekRecommendations(brandList, userInput, tags, poiStores, healthProfile);

4. 修改 src/components/WordCloudSection.jsx：
   - 接收新 prop: healthProfile
   - handleTagClick 中调用 getDeepSeekRecommendations 时传入 healthProfile：
     const rawRecs = await getDeepSeekRecommendations(brandList, newTags.join('、'), newTags, stores, healthProfile);

请注意：不要改变现有的函数行为，只在 healthProfile 有值时才追加额外 prompt。healthProfile 为 null 时行为与之前完全一致。
```

---

## Prompt 4：生理期自动过滤冰饮（双轨推荐）

```
请帮我实现经期自动过滤冰饮功能，采用"双轨推荐"方案。以下是详细需求：

【前置条件】需求1和需求3已完成。healthProfile 已通过 props 传递到 SecondSection 和 WordCloudSection。

【需要做的改动】

1. 修改 src/lib/recommendationEngine.js，在文件顶部（AMAP_KEY 下方）新增：

   a) getPeriodStatus 函数：
   ```js
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
   ```

   b) PERIOD_BEVERAGES 常量（经期友好饮品知识库，21款推荐 + 禁忌关键词）：
   ```js
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
   ```

   c) 修改 getDeepSeekRecommendations 函数：
      在 healthProfile 注入部分（需求3已加的），追加经期判断：
      如果 getPeriodStatus(healthProfile).inPeriod 为 true，在 system prompt 末尾追加：
      ```
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
      4. 每杯饮品的 health_note 必须包含经期相关提示
      ```

   d) 修改 processRecommendations 函数：
      在返回结果前，如果 healthProfile 处于经期，对每个推荐结果做标记：
      - 饮品名含 bannedKeywords 中的关键词 → 添加 periodWarning: true
      - 饮品匹配 PERIOD_BEVERAGES.friendly → 添加 periodFriendly: true
      - 按 periodFriendly 优先排序，periodWarning 排最后

2. 修改 src/components/WordCloudSection.jsx（双轨推荐的轨道2）：
   - 接收新 prop: healthProfile（需求3已完成）
   - 从 recommendationEngine.js import getPeriodStatus 和 PERIOD_BEVERAGES
   - 在推荐列表区域的【上方】，当用户处于经期时，新增一个「经期特别推荐」区块：

   ```jsx
   {healthProfile && getPeriodStatus(healthProfile).inPeriod && (
     <div className="bg-red-50 rounded-2xl p-6 mb-6 border border-red-100">
       <h3 className="text-lg font-medium text-brand-text mb-2 flex items-center gap-2">
         <span>🩸</span> 经期特别推荐
       </h3>
       <p className="text-sm text-gray-500 mb-4">
         经期第{getPeriodStatus(healthProfile).dayOfPeriod}天，以下温热饮品适合你
       </p>
       <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2">
         {PERIOD_BEVERAGES.friendly.map((item, index) => {
           // 检查附近是否有该品牌门店
           const hasNearby = poiStores.some(s => s.name.includes(item.brand.split(/[（(]/)[0]));
           return (
             <div
               key={index}
               className="flex-shrink-0 w-40 bg-white rounded-xl p-3 border border-red-100 cursor-pointer hover:shadow-md transition-shadow"
               onClick={() => onSelectBeverage({
                 brand: item.brand,
                 beverage_name: item.name + '(热饮)',
                 reason: item.reason,
                 tags: item.tags,
                 price_approx: 0,
                 sugar_option: '少糖/无糖',
                 health_note: '✅ 经期推荐：' + item.reason,
                 blood_sugar_data: { fasting: 5.0, post_30min: 6.5, post_60min: 7.0, post_120min: 6.0, post_180min: 5.5 },
                 data_source: '经期推荐知识库',
                 data_badge: 'verified',
                 store: hasNearby ? poiStores.find(s => s.name.includes(item.brand.split(/[（(]/)[0])) : null,
                 periodFriendly: true
               })}
             >
               <div className="text-sm font-medium text-brand-text mb-1">🫖 {item.name}</div>
               <div className="text-xs text-gray-500 mb-2">{item.brand}</div>
               <div className="text-xs text-red-600 leading-relaxed">{item.reason}</div>
               <div className="mt-2 text-xs">
                 {hasNearby
                   ? <span className="text-green-600">📍 附近有门店</span>
                   : <span className="text-gray-400">请在外卖平台搜索</span>
                 }
               </div>
             </div>
           );
         })}
       </div>
     </div>
   )}
   ```

3. 修改 src/components/BeverageDetailDialog.jsx（可选增强）：
   - 如果 beverage.periodWarning 为 true，在弹窗顶部显示红色警告条：
     「⚠️ 经期不建议饮用此饮品」
   - 如果 beverage.periodFriendly 为 true，显示绿色推荐条：
     「✅ 经期友好饮品」
```

---

## Prompt 5：卡路里数据 + 运动可视化

```
请帮我在饮品详情弹窗中增加卡路里和运动量的可视化。以下是详细需求：

【现有代码】
- src/components/BeverageDetailDialog.jsx：饮品详情弹窗，已有血糖曲线图（使用 recharts 的 LineChart），位于弹窗中间部分
- src/lib/recommendationEngine.js：DeepSeek 推荐 JSON 结构目前有 blood_sugar_estimate 但没有热量数据
- 饮品对象结构：{ brand, beverage_name, reason, tags, price_approx, sugar_option, blood_sugar_data, health_note, data_source, data_badge, store }

【需要做的改动】

1. 修改 src/lib/recommendationEngine.js 的 getDeepSeekRecommendations 函数：
   在 system prompt 的 JSON 格式说明中，追加两个字段：
   ```
   "calories_estimate": 340,
   "sugar_grams_estimate": 42
   ```
   在规则部分追加：
   ```
   8. calories_estimate 给出该饮品一杯（中杯/标准杯）的预估热量（kcal），要合理：
      - 纯茶/美式：10-50kcal
      - 拿铁类：150-250kcal
      - 奶茶类：250-450kcal
      - 含奶油/珍珠的：400-600kcal
   9. sugar_grams_estimate 给出预估含糖量（g）
   ```

   在 processRecommendations 函数中，将 calories_estimate 和 sugar_grams_estimate 传到最终的推荐对象：
   ```js
   return {
     ...现有字段,
     calories_kcal: rec.calories_estimate || null,
     sugar_grams: rec.sugar_grams_estimate || null,
   };
   ```

   同时在 Supabase 查询增强部分，如果 beverages 表有 calories_kcal 字段，优先使用数据库值。

2. 修改 src/components/BeverageDetailDialog.jsx：
   在血糖曲线图（</ResponsiveContainer> 后面的 </div>）的【下方】，health_note 黄色卡片的【上方】，新增热量可视化区块：

   ```jsx
   {/* 热量与运动可视化 */}
   {(beverage.calories_kcal || beverage.calories_estimate) && (
     <div className="mb-4 bg-brand-light rounded-xl p-4">
       <div className="flex items-center justify-between mb-3">
         <h4 className="text-sm font-medium text-brand-text">热量与运动</h4>
         {/* 数据来源徽章 */}
         <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 text-xs rounded-full">
           {beverage.calories_source === 'verified' ? '🎬 B站实测' : '🤖 AI 估算'}
         </span>
       </div>

       {/* 热量进度条 */}
       <div className="mb-3">
         <div className="flex justify-between text-xs text-brand-text/70 mb-1">
           <span>🔥 预估热量</span>
           <span className="font-medium">{calories} kcal</span>
         </div>
         <div className="w-full bg-white rounded-full h-3 overflow-hidden">
           <div
             className="h-full rounded-full transition-all duration-500"
             style={{
               width: `${Math.min((calories / 600) * 100, 100)}%`,
               backgroundColor: calories > 400 ? '#ef4444' : calories > 200 ? '#f59e0b' : '#22c55e'
             }}
           />
         </div>
       </div>

       {/* 跑步等价 */}
       <div className="mb-3">
         <div className="flex justify-between text-xs text-brand-text/70 mb-1">
           <span>🏃 相当于慢跑</span>
           <span className="font-medium">{Math.round(calories / 10)} 分钟</span>
         </div>
         <div className="w-full bg-white rounded-full h-3 overflow-hidden">
           <div
             className="h-full bg-blue-400 rounded-full transition-all duration-500"
             style={{ width: `${Math.min((Math.round(calories / 10) / 60) * 100, 100)}%` }}
           />
         </div>
       </div>

       {/* 含糖量（如有） */}
       {sugarGrams && (
         <div>
           <div className="flex justify-between text-xs text-brand-text/70 mb-1">
             <span>🍬 含糖量</span>
             <span className="font-medium">约 {sugarGrams}g</span>
           </div>
           <div className="w-full bg-white rounded-full h-3 overflow-hidden">
             <div
               className="h-full bg-purple-400 rounded-full transition-all duration-500"
               style={{ width: `${Math.min((sugarGrams / 70) * 100, 100)}%` }}
             />
           </div>
         </div>
       )}
     </div>
   )}
   ```

   在组件顶部添加变量计算：
   ```js
   const calories = beverage.calories_kcal || beverage.calories_estimate || 0;
   const sugarGrams = beverage.sugar_grams || beverage.sugar_grams_estimate || 0;
   ```

3. 在 src/components/WordCloudSection.jsx 的推荐卡片中，在价格和糖度旁边也简单显示热量：
   在现有的 ¥{rec.price_approx} 和 {rec.sugar_option} 之后追加：
   ```jsx
   {rec.calories_kcal && (
     <span className="text-xs text-orange-500">
       🔥{rec.calories_kcal}kcal
     </span>
   )}
   ```

请不要修改现有的血糖曲线图部分，热量可视化是新增在它下方的独立区块。
```

---

## Prompt 6：品牌合作卡片

```
请帮我在首页底部新增一张品牌合作卡片。这是最简单的改动，只需修改一个文件。

【需要修改的文件】src/components/Footer.jsx

【现有代码】
Footer.jsx 中目前有：
- 科普卡片1（BookOpen 图标 + "血糖与饮品的关系"）
- 科普卡片2（Heart 图标 + "如何聪明地喝奶茶？"）
- 底部 slogan："SipWise — 喝得明白，喝得健康 🍵"

【需要做的改动】

1. 在文件顶部 import 中，追加 Handshake 图标：
   把 import { Heart, BookOpen } from 'lucide-react';
   改为 import { Heart, BookOpen, Handshake } from 'lucide-react';

2. 在科普卡片2和底部 slogan 之间，插入第3张卡片（使用完全相同的样式）：

```jsx
{/* 品牌合作卡片 */}
<div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-border">
  <div className="flex items-center gap-2 mb-3">
    <Handshake className="h-5 w-5 text-brand-primary" />
    <h3 className="font-bold text-brand-text">品牌合作</h3>
  </div>
  <p className="text-sm text-gray-600 leading-relaxed">
    对于一些养生茶饮品牌，可以找我们 SipWise 网站主动合作。由 SipWise 出具"血糖友好认证"或"经期友好认证"标签，可以实现反向赋能品牌；也可找我们合作，打通品牌小程序，使得用户在 SipWise 选好饮品后一键跳转下单，并自动备注"不另外加糖/热/加膳食纤维"等健康定制选项。
  </p>
</div>
```

3. 不要修改其他任何内容（科普卡片1、科普卡片2、底部slogan都保持不变）。
```

---

## 执行顺序建议

| 顺序 | Prompt | 复杂度 | 依赖 |
|------|--------|--------|------|
| 1 | Prompt 6（品牌合作卡片） | ⭐ 最简单，1个文件 | 无 |
| 2 | Prompt 5（卡路里可视化） | ⭐⭐ 2个文件 | 无 |
| 3 | Prompt 1（个人健康档案） | ⭐⭐⭐ 新建组件+改3个文件 | 无 |
| 4 | Prompt 3（推荐参考档案） | ⭐⭐ 改4个文件 | 依赖 Prompt 1 |
| 5 | Prompt 4（经期过滤双轨） | ⭐⭐⭐⭐ 最复杂 | 依赖 Prompt 1+3 |
| 6 | Prompt 2（家庭组） | ⭐⭐⭐ 新建组件 | 依赖 Prompt 1 |
