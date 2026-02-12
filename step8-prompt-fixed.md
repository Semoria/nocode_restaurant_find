# 【Step 8】饮品详情弹窗 + Recharts 血糖曲线

## 要新建的文件
`src/components/BeverageDetailDialog.jsx`

## 要修改的文件
`src/components/WordCloudSection.jsx`（添加点击事件和引入 Dialog）

---

## 一、修改 WordCloudSection.jsx

1. 在文件顶部添加引入：
```js
import BeverageDetailDialog from './BeverageDetailDialog';
```

2. 在组件内添加状态：
```js
const [selectedBeverage, setSelectedBeverage] = useState(null);
```

3. 将推荐列表中饮品名称（当前第 106-108 行）改为可点击：
```jsx
<div
  className="font-medium text-brand-text cursor-pointer hover:underline"
  onClick={() => setSelectedBeverage(rec)}
>
  🧋 {rec.beverage_name}
</div>
```

4. 在 return 的 `</section>` 之前，添加 Dialog 组件：
```jsx
<BeverageDetailDialog
  beverage={selectedBeverage}
  open={!!selectedBeverage}
  onClose={() => setSelectedBeverage(null)}
/>
```

---

## 二、新建 BeverageDetailDialog.jsx

### 需要的 import
```js
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { Heart, CheckCircle, Zap, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
```

### 组件接收的 Props
```js
{ beverage, open, onClose }
```

其中 `beverage` 的数据结构为（与 processRecommendations 输出一致）：
```js
{
  brand: "喜茶",
  beverage_name: "多肉葡萄",
  reason: "升糖较低，适合血糖敏感人群",
  tags: ["升糖低", "水果茶"],
  price_approx: 25,
  sugar_option: "少糖",
  health_note: "含咖啡因，孕妇慎饮",
  blood_sugar_data: {
    fasting: 5.2,
    post_30min: 7.0,
    post_60min: 7.8,
    post_120min: 6.2,
    post_180min: 5.5
  },
  data_source: "小红书用户实测",
  data_badge: "verified" | "estimated",
  store: {
    name: "喜茶（静安寺店）",
    distance: 350,
    address: "静安区南京西路xxx号"
  }
}
```

### 卡片布局（从上到下）

1. **顶部区域**
   - 左侧：饮品名（text-xl font-bold）
   - 右侧：数据来源角标
     - `data_badge === "verified"` → 绿色小标签，CheckCircle 图标 + "小红书实测"
     - `data_badge === "estimated"` → 蓝色小标签，Zap 图标 + "AI 估算"
   - 第二行：店铺名（text-sm text-gray-500）+ 价格（text-brand-primary font-bold）+ 推荐糖度 sugar_option（text-sm text-gray-500）

2. **标签行**
   - 横向排列所有 tags，胶囊样式：`px-2 py-1 bg-brand-light text-brand-text rounded-full text-xs`

3. **推荐理由**
   - 显示 `reason` 字段，斜体灰色小字

4. **血糖曲线图（Recharts）**
   - 注意：如果 `beverage.blood_sugar_data` 为 null 或 undefined，显示 "暂无血糖数据" 占位文字，不渲染图表
   - 如果有数据，将 blood_sugar_data 转换为数组格式：
   ```js
   const chartData = [
     { time: "餐前", value: blood_sugar_data.fasting },
     { time: "30min", value: blood_sugar_data.post_30min },
     { time: "60min", value: blood_sugar_data.post_60min },
     { time: "120min", value: blood_sugar_data.post_120min },
     { time: "180min", value: blood_sugar_data.post_180min },
   ];
   ```
   - 使用 ResponsiveContainer width="100%" height={250}
   - LineChart 内部：
     - XAxis dataKey="time"，fontSize 12
     - YAxis domain={[3.5, 13]}，unit=" mmol/L"，fontSize 12
     - Line type="monotone" dataKey="value" stroke="#D4A574" strokeWidth={2} dot={{ r: 5 }}
     - ReferenceLine y={7.8} stroke="#999" strokeDasharray="3 3" label="餐后2h正常上限"
     - ReferenceLine y={11.1} stroke="#ef4444" strokeDasharray="3 3" label="糖尿病诊断线"
     - Tooltip formatter: `(value) => [value + " mmol/L", "血糖值"]`

5. **健康提示**（仅在 health_note 存在时显示）
   - 淡黄色背景条 `bg-yellow-50 rounded-lg p-3`
   - Info 图标（lucide）+ health_note 文字

6. **底部收藏按钮**
   - 使用 localStorage 存储收藏状态
   - key: `"favorite_beverages"`，值: JSON 数组，存储 `{ brand, beverage_name, sugar_option, price_approx }` 对象
   - 初始化时检查当前饮品是否已收藏（按 brand + beverage_name 匹配）
   - Heart 图标，未收藏时空心灰色，已收藏时填充红色 `fill-red-500 text-red-500`
   - 点击切换收藏状态，同步更新 localStorage

### DialogContent 样式要求
- 添加 className: `max-w-md max-h-[85vh] overflow-y-auto`
- 不需要自定义动画，使用现有 Dialog 组件自带的动画即可
- 关闭按钮已内置在 DialogContent 中（右上角 X），不需要额外添加

---

## 不需要修改的文件
- `SecondSection.jsx` — 不动
- `HomePage.jsx` — 不动（不需要新的 state 传递，Dialog 完全在 WordCloudSection 内部管理）
- `dialog.jsx` — 不动（使用现有组件，不改全局样式）
- `Footer.jsx`、`Header.jsx`、`HeroSection.jsx` — 不动
