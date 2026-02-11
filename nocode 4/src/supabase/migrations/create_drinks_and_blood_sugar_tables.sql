-- 创建饮品表
CREATE TABLE IF NOT EXISTS drinks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_name TEXT NOT NULL,          -- 品牌名，如「喜茶」「瑞幸」「霸王茶姬」
  drink_name TEXT NOT NULL,          -- 饮品名，如「多肉葡萄」「生椰拿铁」
  tags TEXT[] NOT NULL,              -- 标签数组，如 {"低升糖","水果系","清爽"}
  sugar_level TEXT DEFAULT '正常糖',  -- 糖度选项：无糖/少糖/半糖/正常糖
  calories INT,                      -- 大约热量 kcal
  caffeine BOOLEAN DEFAULT false,    -- 是否含咖啡因
  image_url TEXT,                    -- 饮品图片 URL（可为空）
  description TEXT,                  -- 一句话描述
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建血糖实测数据表
CREATE TABLE IF NOT EXISTS blood_sugar_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  drink_id UUID REFERENCES drinks(id),
  tester_name TEXT DEFAULT '匿名用户',   -- 测试者昵称
  fasting NUMERIC(4,1),                  -- 餐前血糖 mmol/L
  post_30min NUMERIC(4,1),               -- 餐后30分钟
  post_60min NUMERIC(4,1),               -- 餐后60分钟
  post_120min NUMERIC(4,1),              -- 餐后120分钟
  sugar_level_label TEXT,                 -- 升糖评级：低升糖/中升糖/高升糖
  source TEXT DEFAULT '模拟数据',         -- 数据来源说明
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入模拟饮品数据（30条以上）
INSERT INTO drinks (brand_name, drink_name, tags, sugar_level, calories, caffeine, image_url, description) VALUES
-- 喜茶系列
('喜茶', '多肉葡萄（少糖）', '{"水果系","清爽","低卡"}', '少糖', 220, false, 'https://nocode.meituan.com/photo/search?keyword=grape,drink&width=400&height=300', '新鲜葡萄果肉搭配清爽茶底'),
('喜茶', '芝芝桃桃', '{"水果系","奶香浓郁","养颜"}', '正常糖', 280, false, 'https://nocode.meituan.com/photo/search?keyword=peach,drink&width=400&height=300', '水蜜桃果肉与芝士奶盖的完美结合'),
('喜茶', '满杯红柚', '{"水果系","清爽","低升糖"}', '少糖', 180, false, 'https://nocode.meituan.com/photo/search?keyword=pomegranate,drink&width=400&height=300', '红柚果粒丰富，酸甜清爽'),
('喜茶', '烤黑糖波波奶茶', '{"红糖","奶香浓郁","暖身"}', '正常糖', 320, true, 'https://nocode.meituan.com/photo/search?keyword=brown,sugar,milk,tea&width=400&height=300', '经典黑糖珍珠奶茶，温暖香甜'),
('喜茶', '芋泥波波', '{"低升糖","奶香浓郁","助消化"}', '半糖', 260, false, 'https://nocode.meituan.com/photo/search?keyword=taro,drink&width=400&height=300', '香芋泥搭配Q弹珍珠'),

-- 奈雪的茶系列
('奈雪的茶', '霸气橙子', '{"水果系","清爽","养颜"}', '正常糖', 240, false, 'https://nocode.meituan.com/photo/search?keyword=orange,drink&width=400&height=300', '新鲜橙子切片，维C满满'),
('奈雪的茶', '草莓撞撞宝藏茶', '{"水果系","奶香浓郁","低卡"}', '少糖', 250, false, 'https://nocode.meituan.com/photo/search?keyword=strawberry,milk,tea&width=400&height=300', '草莓果粒与奶茶的甜蜜碰撞'),
('奈雪的茶', 'miss可可宝藏茶', '{"巧克力","奶香浓郁","提神"}', '正常糖', 350, true, 'https://nocode.meituan.com/photo/search?keyword=chocolate,drink&width=400&height=300', '浓郁巧克力风味，能量满满'),
('奈雪的茶', '鸭屎香柠檬茶', '{"清爽","无咖啡因","助消化"}', '少糖', 120, false, 'https://nocode.meituan.com/photo/search?keyword=lemon,tea&width=400&height=300', '清香柠檬配鸭屎香茶底'),
('奈雪的茶', '红糖珍珠鲜奶茶', '{"红糖","暖身","经期友好"}', '正常糖', 310, false, 'https://nocode.meituan.com/photo/search?keyword=brown,sugar,pearl,milk,tea&width=400&height=300', '温暖红糖珍珠，特别适合女生'),

-- 霸王茶姬系列
('霸王茶姬', '伯牙绝弦', '{"奶香浓郁","低升糖","提神"}', '半糖', 180, true, 'https://nocode.meituan.com/photo/search?keyword=classic,milk,tea&width=400&height=300', '经典奶茶，茶香浓郁'),
('霸王茶姬', '春日桃桃', '{"水果系","奶香浓郁","养颜"}', '正常糖', 260, false, 'https://nocode.meituan.com/photo/search?keyword=peach,milk,tea&width=400&height=300', '白桃乌龙与奶盖的春日邂逅'),
('霸王茶姬', '去云南·玫瑰普洱', '{"暖身","养颜","助消化"}', '无糖', 150, true, 'https://nocode.meituan.com/photo/search?keyword=rose,puer,tea&width=400&height=300', '云南玫瑰普洱茶，温润养颜'),
('霸王茶姬', '桂馥兰香', '{"低升糖","提神","无咖啡因"}', '少糖', 160, false, 'https://nocode.meituan.com/photo/search?keyword=osmanthus,tea&width=400&height=300', '桂花乌龙茶，清香淡雅'),
('霸王茶姬', '青青糯山', '{"低升糖","清爽","助消化"}', '无糖', 130, false, 'https://nocode.meituan.com/photo/search?keyword=glutinous,rice,tea&width=400&height=300', '糯米香绿茶，清香回甘'),

-- 瑞幸咖啡系列
('瑞幸咖啡', '生椰拿铁', '{"奶香浓郁","提神","低卡"}', '半糖', 200, true, 'https://nocode.meituan.com/photo/search?keyword=coconut,latte&width=400&height=300', '椰子清香与咖啡的完美融合'),
('瑞幸咖啡', '丝绒拿铁', '{"奶香浓郁","提神","低升糖"}', '半糖', 220, true, 'https://nocode.meituan.com/photo/search?keyword=velvet,latte&width=400&height=300', '丝滑口感，浓郁咖啡香'),
('瑞幸咖啡', '抹茶拿铁', '{"抹茶","奶香浓郁","提神"}', '正常糖', 280, true, 'https://nocode.meituan.com/photo/search?keyword=matcha,latte&width=400&height=300', '日式抹茶与咖啡的创意结合'),
('瑞幸咖啡', '厚乳拿铁', '{"奶香浓郁","提神","高蛋白"}', '半糖', 240, true, 'https://nocode.meituan.com/photo/search?keyword=thick,milk,latte&width=400&height=300', '浓郁厚乳，口感醇厚'),
('瑞幸咖啡', '耶加雪菲', '{"提神","无咖啡因","低升糖"}', '无糖', 5, false, 'https://nocode.meituan.com/photo/search?keyword=ethiopian,coffee&width=400&height=300', '单品咖啡，果香浓郁'),

-- 星巴克系列
('星巴克', '抹茶星冰乐', '{"抹茶","奶香浓郁","提神"}', '正常糖', 320, true, 'https://nocode.meituan.com/photo/search?keyword=matcha,frappuccino&width=400&height=300', '抹茶与奶油的冰爽组合'),
('星巴克', '焦糖玛奇朵', '{"奶香浓郁","提神","暖身"}', '正常糖', 290, true, 'https://nocode.meituan.com/photo/search?keyword=caramel,macchiato&width=400&height=300', '经典意式咖啡，香甜顺滑'),
('星巴克', '美式咖啡', '{"提神","低卡","无咖啡因"}', '无糖', 10, false, 'https://nocode.meituan.com/photo/search?keyword=americano&width=400&height=300', '纯正美式，提神醒脑'),
('星巴克', '红茶拿铁', '{"暖身","无咖啡因","助消化"}', '半糖', 250, false, 'https://nocode.meituan.com/photo/search?keyword=black,tea,latte&width=400&height=300', '英式红茶与牛奶的温暖搭配'),
('星巴克', '巧克力星冰乐', '{"巧克力","奶香浓郁","提神"}', '正常糖', 380, true, 'https://nocode.meituan.com/photo/search?keyword=chocolate,frappuccino&width=400&height=300', '浓郁巧克力冰沙，甜蜜满足'),

-- 其他品牌
('茶百道', '杨枝甘露', '{"水果系","清爽","养颜"}', '少糖', 230, false, 'https://nocode.meituan.com/photo/search?keyword=mango,pudding,drink&width=400&height=300', '芒果与西柚的港式经典'),
('古茗', '芝士莓莓', '{"水果系","奶香浓郁","低卡"}', '少糖', 210, false, 'https://nocode.meituan.com/photo/search?keyword=cheese,strawberry,drink&width=400&height=300', '草莓果粒配咸香芝士'),
('沪上阿姨', '血糯米奶茶', '{"暖身","助消化","低升糖"}', '半糖', 270, false, 'https://nocode.meituan.com/photo/search?keyword=red,rice,milk,tea&width=400&height=300', '血糯米增加饱腹感，营养丰富'),
('一点点', '波霸奶茶', '{"奶香浓郁","提神","暖身"}', '正常糖', 300, true, 'https://nocode.meituan.com/photo/search?keyword=boba,milk,tea&width=400&height=300', '经典台式奶茶，Q弹波霸'),
('Manner', '燕麦拿铁', '{"低升糖","高蛋白","提神"}', '无糖', 180, true, 'https://nocode.meituan.com/photo/search?keyword=oat,latte&width=400&height=300', '燕麦奶替代，健康选择');

-- 插入模拟血糖数据（为每款饮品插入1-3条记录）
-- 喜茶系列血糖数据
INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员A', 5.2, 6.8, 7.2, 5.8, '低升糖' FROM drinks WHERE drink_name = '多肉葡萄（少糖）';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员B', 4.8, 7.5, 8.1, 6.5, '中升糖' FROM drinks WHERE drink_name = '芝芝桃桃';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员C', 5.0, 6.5, 6.9, 5.5, '低升糖' FROM drinks WHERE drink_name = '满杯红柚';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员A', 5.3, 8.2, 9.5, 7.2, '中升糖' FROM drinks WHERE drink_name = '烤黑糖波波奶茶';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员B', 4.9, 7.0, 7.6, 6.0, '低升糖' FROM drinks WHERE drink_name = '芋泥波波';

-- 奈雪的茶系列血糖数据
INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员C', 5.1, 7.2, 7.8, 6.2, '低升糖' FROM drinks WHERE drink_name = '霸气橙子';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员A', 4.7, 7.8, 8.9, 7.0, '中升糖' FROM drinks WHERE drink_name = '草莓撞撞宝藏茶';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员B', 5.4, 9.2, 10.8, 8.5, '高升糖' FROM drinks WHERE drink_name = 'miss可可宝藏茶';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员C', 4.8, 6.2, 6.5, 5.2, '低升糖' FROM drinks WHERE drink_name = '鸭屎香柠檬茶';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员A', 5.0, 8.5, 9.8, 7.5, '中升糖' FROM drinks WHERE drink_name = '红糖珍珠鲜奶茶';

-- 霸王茶姬系列血糖数据
INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员B', 5.2, 6.9, 7.4, 6.0, '低升糖' FROM drinks WHERE drink_name = '伯牙绝弦';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员C', 4.9, 7.6, 8.3, 6.8, '中升糖' FROM drinks WHERE drink_name = '春日桃桃';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员A', 5.1, 6.8, 7.1, 5.7, '低升糖' FROM drinks WHERE drink_name = '去云南·玫瑰普洱';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员B', 4.7, 6.5, 6.8, 5.4, '低升糖' FROM drinks WHERE drink_name = '桂馥兰香';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员C', 5.3, 6.7, 7.0, 5.8, '低升糖' FROM drinks WHERE drink_name = '青青糯山';

-- 瑞幸咖啡系列血糖数据
INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员A', 5.0, 7.2, 7.9, 6.3, '低升糖' FROM drinks WHERE drink_name = '生椰拿铁';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员B', 4.8, 7.0, 7.5, 6.0, '低升糖' FROM drinks WHERE drink_name = '丝绒拿铁';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员C', 5.2, 8.0, 9.2, 7.2, '中升糖' FROM drinks WHERE drink_name = '抹茶拿铁';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员A', 4.9, 7.5, 8.1, 6.5, '中升糖' FROM drinks WHERE drink_name = '厚乳拿铁';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员B', 5.1, 5.8, 6.0, 5.2, '低升糖' FROM drinks WHERE drink_name = '耶加雪菲';

-- 星巴克系列血糖数据
INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员C', 4.7, 8.8, 10.5, 8.2, '高升糖' FROM drinks WHERE drink_name = '抹茶星冰乐';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员A', 5.3, 8.5, 9.8, 7.8, '中升糖' FROM drinks WHERE drink_name = '焦糖玛奇朵';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员B', 4.8, 5.5, 5.8, 5.0, '低升糖' FROM drinks WHERE drink_name = '美式咖啡';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员C', 5.0, 7.2, 7.8, 6.3, '低升糖' FROM drinks WHERE drink_name = '红茶拿铁';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员A', 4.9, 9.5, 11.2, 9.0, '高升糖' FROM drinks WHERE drink_name = '巧克力星冰乐';

-- 其他品牌血糖数据
INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员B', 5.2, 7.0, 7.6, 6.2, '低升糖' FROM drinks WHERE drink_name = '杨枝甘露';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员C', 4.8, 7.3, 8.0, 6.5, '低升糖' FROM drinks WHERE drink_name = '芝士莓莓';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员A', 5.1, 7.5, 8.2, 6.8, '中升糖' FROM drinks WHERE drink_name = '血糯米奶茶';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员B', 4.7, 8.0, 9.5, 7.5, '中升糖' FROM drinks WHERE drink_name = '波霸奶茶';

INSERT INTO blood_sugar_data (drink_id, tester_name, fasting, post_30min, post_60min, post_120min, sugar_level_label) 
SELECT id, '测试员C', 5.0, 6.8, 7.2, 5.8, '低升糖' FROM drinks WHERE drink_name = '燕麦拿铁';

-- 启用Row Level Security并设置策略
ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drinks_public_read" ON drinks FOR SELECT USING (true);

ALTER TABLE blood_sugar_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bsd_public_read" ON blood_sugar_data FOR SELECT USING (true);
