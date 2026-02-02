-- 创建城市坐标表
CREATE TABLE IF NOT EXISTS city_coordinates (
    id SERIAL PRIMARY KEY,
    city_name TEXT UNIQUE NOT NULL,          -- 英文名称
    city_name_zh TEXT,                       -- 中文名称
    latitude DECIMAL(10, 8) NOT NULL,        -- 城市中心纬度
    longitude DECIMAL(11, 8) NOT NULL,       -- 城市中心经度
    default_radius INTEGER DEFAULT 15000,    -- 默认搜索半径（米）
    country TEXT,                            -- 国家代码
    created_at TIMESTAMP DEFAULT NOW()
);

-- 插入常用城市数据
INSERT INTO city_coordinates (city_name, city_name_zh, latitude, longitude, default_radius, country) VALUES
-- 中国
('Shanghai', '上海', 31.2304, 121.4737, 15000, 'CN'),
('Beijing', '北京', 39.9042, 116.4074, 20000, 'CN'),
('Guangzhou', '广州', 23.1291, 113.2644, 15000, 'CN'),
('Shenzhen', '深圳', 22.5431, 114.0579, 15000, 'CN'),
('Chengdu', '成都', 30.5728, 104.0668, 15000, 'CN'),
('Hangzhou', '杭州', 30.2741, 120.1551, 15000, 'CN'),
-- 美国
('Los Angeles', '洛杉矶', 34.0522, -118.2437, 15000, 'US'),
('New York', '纽约', 40.7128, -74.0060, 15000, 'US'),
('San Francisco', '旧金山', 37.7749, -122.4194, 10000, 'US'),
('Chicago', '芝加哥', 41.8781, -87.6298, 15000, 'US'),
-- 其他
('London', '伦敦', 51.5074, -0.1278, 15000, 'UK'),
('Paris', '巴黎', 48.8566, 2.3522, 12000, 'FR'),
('Tokyo', '东京', 35.6762, 139.6503, 15000, 'JP'),
('Singapore', '新加坡', 1.3521, 103.8198, 10000, 'SG');

CREATE INDEX idx_city_name ON city_coordinates(city_name);
CREATE INDEX idx_city_name_zh ON city_coordinates(city_name_zh);
