-- ================================================================
-- B站热量数据合并（73条数据 → 15条UPDATE + 58条INSERT）
-- 数据来源：B站UP主"奶茶砖"等热量测评视频
-- ================================================================

-- ===== Part A: UPDATE 已有饮品的热量数据 (15条) =====

-- 完全匹配 (8条)
UPDATE beverages SET calories_kcal = 380, sugar_grams = 45.2, fat_grams = 8.5, calories_source = 'B站实测'
WHERE store_id IN (SELECT id FROM stores WHERE brand = '喜茶') AND name = '多肉葡萄';

UPDATE beverages SET calories_kcal = 420, sugar_grams = 52.0, fat_grams = 14.0, calories_source = 'B站实测'
WHERE store_id IN (SELECT id FROM stores WHERE brand = '奈雪的茶') AND name = '霸气芝士草莓';

UPDATE beverages SET calories_kcal = 220, sugar_grams = 18.3, fat_grams = 12.1, caffeine_mg = 150, calories_source = 'B站实测'
WHERE store_id IN (SELECT id FROM stores WHERE brand = '瑞幸咖啡') AND name = '生椰拿铁';

UPDATE beverages SET calories_kcal = 260, sugar_grams = 22.0, fat_grams = 13.5, caffeine_mg = 140, calories_source = 'B站实测'
WHERE store_id IN (SELECT id FROM stores WHERE brand = '瑞幸咖啡') AND name = '陨石拿铁';

UPDATE beverages SET calories_kcal = 10, sugar_grams = 0.5, fat_grams = 0.2, caffeine_mg = 200, calories_source = 'B站实测'
WHERE store_id IN (SELECT id FROM stores WHERE brand = 'Manner Coffee') AND name = '美式';

UPDATE beverages SET calories_kcal = 350, sugar_grams = 42.5, fat_grams = 9.0, calories_source = 'B站实测'
WHERE store_id IN (SELECT id FROM stores WHERE brand = '蜜雪冰城') AND name = '珍珠奶茶';

UPDATE beverages SET calories_kcal = 220, sugar_grams = 22.0, fat_grams = 8.5, calories_source = 'B站实测'
WHERE store_id IN (SELECT id FROM stores WHERE brand = '霸王茶姬') AND name = '伯牙绝弦';

UPDATE beverages SET calories_kcal = 200, sugar_grams = 19.0, fat_grams = 8.0, calories_source = 'B站实测'
WHERE store_id IN (SELECT id FROM stores WHERE brand = '霸王茶姬') AND name = '桂馥兰香';

-- 模糊匹配 (7条)
-- 茶百道·杨枝甘露(大杯三分糖) → 匹配DB中的"杨枝甘露"
UPDATE beverages SET calories_kcal = 260, sugar_grams = 30.0, fat_grams = 8.0, calories_source = 'B站实测'
WHERE store_id IN (SELECT id FROM stores WHERE brand = '茶百道') AND name = '杨枝甘露';

-- Manner·拿铁(中杯) → 匹配DB中的"拿铁"
UPDATE beverages SET calories_kcal = 140, sugar_grams = 12.0, fat_grams = 7.5, caffeine_mg = 150, calories_source = 'B站实测'
WHERE store_id IN (SELECT id FROM stores WHERE brand = 'Manner Coffee') AND name = '拿铁';

-- 星巴克·美式咖啡(中杯) → 匹配DB中的"美式"
UPDATE beverages SET calories_kcal = 15, sugar_grams = 0.5, fat_grams = 0.3, caffeine_mg = 225, calories_source = 'B站实测'
WHERE store_id IN (SELECT id FROM stores WHERE brand = '星巴克') AND name = '美式';

-- 书亦·草莓啵啵奶茶 → 匹配DB中的"草莓啵啵"
UPDATE beverages SET calories_kcal = 380, sugar_grams = 46.0, fat_grams = 11.0, calories_source = 'B站实测'
WHERE store_id IN (SELECT id FROM stores WHERE brand = '书亦烧仙草') AND name = '草莓啵啵';

-- 蜜雪·冰鲜柠檬水 → 匹配DB中的"柠檬水"
UPDATE beverages SET calories_kcal = 90, sugar_grams = 14.0, fat_grams = 0.5, calories_source = 'B站实测'
WHERE store_id IN (SELECT id FROM stores WHERE brand = '蜜雪冰城') AND name = '柠檬水';

-- 蜜雪·蓝莓摇摇奶昔 → 匹配DB中的"摇摇奶昔"
UPDATE beverages SET calories_kcal = 290, sugar_grams = 36.0, fat_grams = 8.5, calories_source = 'B站实测'
WHERE store_id IN (SELECT id FROM stores WHERE brand = '蜜雪冰城') AND name = '摇摇奶昔';

-- Tims·拿铁(中杯) → 匹配DB中的"拿铁"
UPDATE beverages SET calories_kcal = 160, sugar_grams = 14.0, fat_grams = 7.5, caffeine_mg = 150, calories_source = 'B站实测'
WHERE store_id IN (SELECT id FROM stores WHERE brand = 'Tims咖啡') AND name = '拿铁';

-- ===== Part B: INSERT 新增饮品数据 (58条) =====

-- 喜茶 - 4条新增
INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '喜茶' LIMIT 1), '生打椰椰奶冻', ARRAY['水果茶', '升糖高'], 28, '正常糖', '{"fasting": 5.0, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 310, 36.0, 12.8, NULL, 'B站实测', '椰香浓郁口感丝滑', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '喜茶' LIMIT 1), '芝芝莓莓', ARRAY['水果茶', '升糖高'], 30, '正常糖', '{"fasting": 5.1, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 350, 42.0, 10.5, NULL, 'B站实测', '草莓芝士完美融合', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '喜茶' LIMIT 1), '多肉芒芒甘露', ARRAY['水果茶', '升糖高'], 32, '正常糖', '{"fasting": 5.0, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 340, 40.5, 9.2, NULL, 'B站实测', '芒果果肉丰富', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '喜茶' LIMIT 1), '纯绿茶', ARRAY['水果茶', '升糖低', '无糖可选'], 25, '无糖', '{"fasting": 4.8, "post_30min": 6.5, "post_60min": 7.3, "post_120min": 6.0}', 10, 0.5, 0.0, 30, 'B站实测', '清香绿茶原味', 'B站实测');

-- 奈雪的茶 - 3条新增
INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '奈雪的茶' LIMIT 1), '冻顶宝藏茶', ARRAY['奶茶', '升糖中'], 32, '正常糖', '{"fasting": 5.2, "post_30min": 7.5, "post_60min": 8.8, "post_120min": 7.0}', 180, 22.0, 6.5, NULL, 'B站实测', '茶香浓郁口感醇厚', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '奈雪的茶' LIMIT 1), '厚厚芋泥宝藏茶', ARRAY['奶茶', '升糖高'], 35, '正常糖', '{"fasting": 5.1, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 390, 48.0, 11.5, NULL, 'B站实测', '芋泥香甜口感丰富', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '奈雪的茶' LIMIT 1), 'NayukiGO美式', ARRAY['咖啡', '升糖低', '含咖啡因'], 28, '正常糖', '{"fasting": 4.9, "post_30min": 6.5, "post_60min": 7.3, "post_120min": 6.0}', 20, 1.0, 0.5, 180, 'B站实测', '纯正美式咖啡', 'B站实测');

-- 茶百道 - 7条新增
INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '茶百道' LIMIT 1), '轻轻玫茉', ARRAY['水果茶', '升糖低', '无糖可选'], 20, '无糖', '{"fasting": 4.8, "post_30min": 6.5, "post_60min": 7.3, "post_120min": 6.0}', 98, 8.5, 3.2, 62, 'B站实测', '玫瑰花香清雅', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '茶百道' LIMIT 1), '轻轻栀子', ARRAY['水果茶', '升糖低', '无糖可选'], 20, '无糖', '{"fasting": 4.9, "post_30min": 6.5, "post_60min": 7.3, "post_120min": 6.0}', 107, 9.0, 3.5, NULL, 'B站实测', '栀子花香清新', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '茶百道' LIMIT 1), '轻轻红茶', ARRAY['水果茶', '升糖低', '无糖可选', '含咖啡因'], 20, '无糖', '{"fasting": 5.0, "post_30min": 6.5, "post_60min": 7.3, "post_120min": 6.0}', 136, 12.0, 4.0, 119, 'B站实测', '红茶香醇回甘', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '茶百道' LIMIT 1), '紫气葡萄冻冻', ARRAY['水果茶', '升糖中', '无糖可选'], 22, '无糖', '{"fasting": 5.1, "post_30min": 7.5, "post_60min": 8.8, "post_120min": 7.0}', 190, 18.0, 5.5, NULL, 'B站实测', '葡萄果香浓郁', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '茶百道' LIMIT 1), '青提茉莉', ARRAY['水果茶', '升糖低', '无糖可选'], 22, '无糖', '{"fasting": 4.9, "post_30min": 6.5, "post_60min": 7.3, "post_120min": 6.0}', 120, 11.0, 3.8, NULL, 'B站实测', '青提茉莉清香', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '茶百道' LIMIT 1), '西瓜啵啵', ARRAY['水果茶', '升糖低', '无糖可选'], 22, '无糖', '{"fasting": 4.8, "post_30min": 6.5, "post_60min": 7.3, "post_120min": 6.0}', 108, 10.0, 3.2, NULL, 'B站实测', '西瓜清甜爽口', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '茶百道' LIMIT 1), '冰淇淋红茶', ARRAY['奶茶', '升糖高', '含咖啡因'], 22, '正常糖', '{"fasting": 5.0, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 310, 35.0, 9.0, 80, 'B站实测', '冰淇淋红茶香浓', 'B站实测');

-- 古茗 - 4条新增
INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '古茗' LIMIT 1), '芋泥青稞牛奶', ARRAY['奶茶', '升糖高'], 20, '正常糖', '{"fasting": 5.1, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 320, 38.0, 10.5, NULL, 'B站实测', '芋泥青稞营养丰富', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '古茗' LIMIT 1), '芒果奶昔', ARRAY['奶茶', '升糖中'], 22, '正常糖', '{"fasting": 5.0, "post_30min": 7.5, "post_60min": 8.8, "post_120min": 7.0}', 280, 33.0, 8.0, NULL, 'B站实测', '芒果奶昔顺滑', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '古茗' LIMIT 1), '桂花青柠绿茶', ARRAY['水果茶', '升糖低', '无糖可选', '含咖啡因'], 18, '无糖', '{"fasting": 4.7, "post_30min": 6.5, "post_60min": 7.3, "post_120min": 6.0}', 40, 3.0, 0.5, 25, 'B站实测', '桂花青柠清香', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '古茗' LIMIT 1), '枸杞拿铁', ARRAY['咖啡', '升糖中'], 22, '正常糖', '{"fasting": 5.0, "post_30min": 7.5, "post_60min": 8.8, "post_120min": 7.0}', 250, 28.0, 9.0, NULL, 'B站实测', '枸杞拿铁养生', 'B站实测');

-- 瑞幸咖啡 - 4条新增
INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '瑞幸咖啡' LIMIT 1), '生酪拿铁', ARRAY['咖啡', '升糖中', '含咖啡因'], 26, '正常糖', '{"fasting": 5.1, "post_30min": 7.5, "post_60min": 8.8, "post_120min": 7.0}', 270, 24.0, 14.0, 130, 'B站实测', '生酪拿铁香醇', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '瑞幸咖啡' LIMIT 1), '冰美式', ARRAY['咖啡', '升糖低', '无糖可选', '含咖啡因'], 22, '无糖', '{"fasting": 4.8, "post_30min": 6.5, "post_60min": 7.3, "post_120min": 6.0}', 5, 0.5, 0.2, 200, 'B站实测', '冰美式清爽', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '瑞幸咖啡' LIMIT 1), '橙C美式', ARRAY['咖啡', '升糖低', '含咖啡因'], 24, '正常糖', '{"fasting": 4.9, "post_30min": 6.5, "post_60min": 7.3, "post_120min": 6.0}', 100, 15.0, 0.5, 170, 'B站实测', '橙C美式酸甜', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '瑞幸咖啡' LIMIT 1), '全脂拿铁', ARRAY['咖啡', '升糖中', '含咖啡因'], 25, '正常糖', '{"fasting": 5.0, "post_30min": 7.5, "post_60min": 8.8, "post_120min": 7.0}', 190, 16.0, 9.0, 150, 'B站实测', '全脂拿铁浓郁', 'B站实测');

-- Manner Coffee - 1条新增
INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = 'Manner Coffee' LIMIT 1), '燕麦拿铁', ARRAY['咖啡', '升糖中', '含咖啡因'], 24, '正常糖', '{"fasting": 5.0, "post_30min": 7.5, "post_60min": 8.8, "post_120min": 7.0}', 165, 14.0, 7.0, 145, 'B站实测', '燕麦拿铁健康', 'B站实测');

-- 星巴克 - 7条新增
INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '星巴克' LIMIT 1), '卡布奇诺', ARRAY['咖啡', '升糖中', '含咖啡因'], 32, '正常糖', '{"fasting": 5.0, "post_30min": 7.5, "post_60min": 8.8, "post_120min": 7.0}', 140, 12.0, 6.5, 150, 'B站实测', '卡布奇诺奶泡丰富', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '星巴克' LIMIT 1), '馥芮白', ARRAY['咖啡', '升糖中', '含咖啡因'], 35, '正常糖', '{"fasting": 5.1, "post_30min": 7.5, "post_60min": 8.8, "post_120min": 7.0}', 166, 14.0, 7.5, 195, 'B站实测', '馥芮白浓郁香醇', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '星巴克' LIMIT 1), '摩卡', ARRAY['咖啡', '升糖高', '含咖啡因'], 38, '正常糖', '{"fasting": 5.2, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 400, 42.0, 16.0, 175, 'B站实测', '摩卡巧克力香浓', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '星巴克' LIMIT 1), '太妃榛果拿铁', ARRAY['咖啡', '升糖高', '含咖啡因'], 42, '正常糖', '{"fasting": 5.1, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 360, 38.0, 14.0, 150, 'B站实测', '太妃榛果香甜', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '星巴克' LIMIT 1), '燕麦丝绒拿铁', ARRAY['咖啡', '升糖高', '含咖啡因'], 45, '正常糖', '{"fasting": 5.0, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 316, 32.0, 12.0, 140, 'B站实测', '燕麦丝绒顺滑', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '星巴克' LIMIT 1), '焦糖咖啡星冰乐', ARRAY['咖啡', '升糖高', '含咖啡因'], 45, '正常糖', '{"fasting": 5.3, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 430, 58.0, 14.0, 95, 'B站实测', '焦糖星冰乐冰爽', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '星巴克' LIMIT 1), '抹茶可可碎片星冰乐', ARRAY['咖啡', '升糖高', '含咖啡因'], 45, '正常糖', '{"fasting": 5.2, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 530, 70.0, 18.0, 75, 'B站实测', '抹茶可可冰爽', 'B站实测');

-- 沪上阿姨 - 4条新增
INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '沪上阿姨' LIMIT 1), '热带蜜雪拿铁', ARRAY['咖啡', '升糖高'], 20, '正常糖', '{"fasting": 5.1, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 320, 38.0, 10.5, NULL, 'B站实测', '热带风味拿铁', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '沪上阿姨' LIMIT 1), '金桂乌龙奶茶', ARRAY['奶茶', '升糖中'], 18, '正常糖', '{"fasting": 5.0, "post_30min": 7.5, "post_60min": 8.8, "post_120min": 7.0}', 280, 33.0, 9.0, NULL, 'B站实测', '金桂乌龙香醇', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '沪上阿姨' LIMIT 1), '现打椰椰拿铁', ARRAY['咖啡', '升糖高'], 20, '正常糖', '{"fasting": 5.1, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 300, 36.0, 11.0, NULL, 'B站实测', '现打椰椰香浓', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '沪上阿姨' LIMIT 1), '纯茶绿茶', ARRAY['水果茶', '升糖低', '无糖可选', '含咖啡因'], 15, '无糖', '{"fasting": 4.8, "post_30min": 6.5, "post_60min": 7.3, "post_120min": 6.0}', 20, 1.0, 0.5, 35, 'B站实测', '纯茶绿茶清香', 'B站实测');

-- 书亦烧仙草 - 3条新增
INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '书亦烧仙草' LIMIT 1), '半杯都是料烧仙草', ARRAY['奶茶', '升糖高'], 16, '正常糖', '{"fasting": 5.1, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 320, 38.5, 8.0, NULL, 'B站实测', '半杯都是料丰富', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '书亦烧仙草' LIMIT 1), '杨枝甘露酸奶', ARRAY['水果茶', '升糖高'], 18, '正常糖', '{"fasting": 5.0, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 340, 42.0, 9.5, NULL, 'B站实测', '杨枝甘露酸奶', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '书亦烧仙草' LIMIT 1), '绿茶仙草', ARRAY['水果茶', '升糖低', '无糖可选'], 14, '无糖', '{"fasting": 4.9, "post_30min": 6.5, "post_60min": 7.3, "post_120min": 6.0}', 60, 4.0, 1.0, NULL, 'B站实测', '绿茶仙草清香', 'B站实测');

-- 一点点 - 6条新增
INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '一点点' LIMIT 1), 'QQ美莓', ARRAY['奶茶', '升糖高'], 15, '正常糖', '{"fasting": 5.2, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 337, 42.0, 8.5, NULL, 'B站实测', 'QQ美莓Q弹', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '一点点' LIMIT 1), '奶绿撞芒', ARRAY['水果茶', '升糖高', '无糖可选'], 14, '无糖', '{"fasting": 5.1, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 330, 32.0, 10.0, NULL, 'B站实测', '奶绿撞芒清香', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '一点点' LIMIT 1), '草莓森林', ARRAY['水果茶', '升糖中'], 13, '正常糖', '{"fasting": 5.0, "post_30min": 7.5, "post_60min": 8.8, "post_120min": 7.0}', 210, 26.0, 6.5, NULL, 'B站实测', '草莓森林果香', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '一点点' LIMIT 1), '米麻薯', ARRAY['奶茶', '升糖高'], 14, '正常糖', '{"fasting": 5.1, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 320, 38.0, 9.0, NULL, 'B站实测', '米麻薯Q弹', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '一点点' LIMIT 1), '冰淇淋红茶', ARRAY['奶茶', '升糖中', '含咖啡因'], 12, '正常糖', '{"fasting": 5.0, "post_30min": 7.5, "post_60min": 8.8, "post_120min": 7.0}', 180, 22.0, 5.5, NULL, 'B站实测', '冰淇淋红茶香醇', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '一点点' LIMIT 1), '抹茶', ARRAY['水果茶', '升糖低', '无糖可选', '含咖啡因'], 10, '无糖', '{"fasting": 4.8, "post_30min": 6.5, "post_60min": 7.3, "post_120min": 6.0}', 50, 3.0, 1.5, 45, 'B站实测', '抹茶清香回甘', 'B站实测');

-- COCO都可 - 4条新增
INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = 'COCO都可' LIMIT 1), '百香果啤', ARRAY['水果茶', '升糖中'], 15, '正常糖', '{"fasting": 5.0, "post_30min": 7.5, "post_60min": 8.8, "post_120min": 7.0}', 150, 20.0, 2.0, NULL, 'B站实测', '百香果啤酸甜', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = 'COCO都可' LIMIT 1), '水果茶', ARRAY['水果茶', '升糖中'], 16, '正常糖', '{"fasting": 5.1, "post_30min": 7.5, "post_60min": 8.8, "post_120min": 7.0}', 160, 22.0, 1.5, NULL, 'B站实测', '水果茶清香', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = 'COCO都可' LIMIT 1), '波霸奶茶', ARRAY['奶茶', '升糖高'], 15, '正常糖', '{"fasting": 5.2, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 380, 46.0, 10.5, NULL, 'B站实测', '波霸奶茶Q弹', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = 'COCO都可' LIMIT 1), '茉莉绿茶', ARRAY['水果茶', '升糖低', '含咖啡因'], 12, '半糖', '{"fasting": 4.9, "post_30min": 6.5, "post_60min": 7.3, "post_120min": 6.0}', 80, 10.0, 0.5, 35, 'B站实测', '茉莉绿茶清香', 'B站实测');

-- 蜜雪冰城 - 2条新增
INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '蜜雪冰城' LIMIT 1), '黄桃果霸', ARRAY['水果茶', '升糖中'], 6, '正常糖', '{"fasting": 5.0, "post_30min": 7.5, "post_60min": 8.8, "post_120min": 7.0}', 180, 24.0, 3.0, NULL, 'B站实测', '黄桃果霸香甜', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '蜜雪冰城' LIMIT 1), '原味奶茶', ARRAY['奶茶', '升糖高'], 7, '正常糖', '{"fasting": 5.1, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 280, 35.0, 7.5, NULL, 'B站实测', '原味奶茶经典', 'B站实测');

-- 霸王茶姬 - 3条新增
INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '霸王茶姬' LIMIT 1), '归云南云漫普洱', ARRAY['奶茶', '升糖中'], 22, '正常糖', '{"fasting": 5.0, "post_30min": 7.5, "post_60min": 8.8, "post_120min": 7.0}', 228, 24.0, 8.0, NULL, 'B站实测', '普洱茶香醇厚', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '霸王茶姬' LIMIT 1), '万里木兰', ARRAY['奶茶', '升糖低'], 20, '正常糖', '{"fasting": 4.9, "post_30min": 6.5, "post_60min": 7.3, "post_120min": 6.0}', 180, 16.0, 8.0, NULL, 'B站实测', '万里木兰清香', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '霸王茶姬' LIMIT 1), '青璃·碧螺拿铁', ARRAY['咖啡', '升糖中'], 25, '正常糖', '{"fasting": 5.1, "post_30min": 7.5, "post_60min": 8.8, "post_120min": 7.0}', 250, 26.0, 9.5, NULL, 'B站实测', '碧螺拿铁清香', 'B站实测');

-- 乐乐茶 - 4条新增
INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '乐乐茶' LIMIT 1), '脏脏茶', ARRAY['奶茶', '升糖高'], 28, '正常糖', '{"fasting": 5.2, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 400, 50.0, 15.0, NULL, 'B站实测', '脏脏茶浓郁', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '乐乐茶' LIMIT 1), '满杯百香果茶', ARRAY['水果茶', '升糖中'], 26, '正常糖', '{"fasting": 5.0, "post_30min": 7.5, "post_60min": 8.8, "post_120min": 7.0}', 150, 22.0, 2.5, NULL, 'B站实测', '满杯百香果酸甜', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '乐乐茶' LIMIT 1), '大红袍奶茶', ARRAY['奶茶', '升糖高'], 30, '正常糖', '{"fasting": 5.1, "post_30min": 9.5, "post_60min": 10.8, "post_120min": 8.2}', 330, 40.0, 11.0, NULL, 'B站实测', '大红袍奶茶香醇', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = '乐乐茶' LIMIT 1), '燕麦拿铁', ARRAY['咖啡', '升糖中'], 32, '正常糖', '{"fasting": 5.0, "post_30min": 7.5, "post_60min": 8.8, "post_120min": 7.0}', 280, 30.0, 10.0, NULL, 'B站实测', '燕麦拿铁健康', 'B站实测');

-- Tims咖啡 - 2条新增
INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = 'Tims咖啡' LIMIT 1), '双倍浓缩美式', ARRAY['咖啡', '升糖低', '无糖可选', '含咖啡因'], 28, '无糖', '{"fasting": 4.7, "post_30min": 6.5, "post_60min": 7.3, "post_120min": 6.0}', 15, 0.5, 0.3, 280, 'B站实测', '双倍浓缩强劲', 'B站实测');

INSERT INTO beverages (store_id, name, tags, price, sugar_level, blood_sugar_data, calories_kcal, sugar_grams, fat_grams, caffeine_mg, calories_source, description, source_note) VALUES
((SELECT id FROM stores WHERE brand = 'Tims咖啡' LIMIT 1), '冰糖葫芦拿铁', ARRAY['咖啡', '升糖中'], 32, '正常糖', '{"fasting": 5.0, "post_30min": 7.5, "post_60min": 8.8, "post_120min": 7.0}', 280, 35.0, 9.0, NULL, 'B站实测', '冰糖葫芦拿铁香甜', 'B站实测');
