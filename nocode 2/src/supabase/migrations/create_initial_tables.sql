-- 创建 stores 表
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  city TEXT DEFAULT '北京',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 beverages 表
CREATE TABLE IF NOT EXISTS beverages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  price NUMERIC(5,1),
  sugar_level TEXT,
  blood_sugar_data JSONB,
  image_url TEXT,
  description TEXT,
  source_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 favorites 表
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  beverage_id UUID REFERENCES beverages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(device_id, beverage_id)
);

-- 创建附近店铺查询函数（使用 Haversine 公式）
CREATE OR REPLACE FUNCTION nearby_stores(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  brand TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  city TEXT,
  created_at TIMESTAMPTZ,
  distance_km DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.brand,
    s.latitude,
    s.longitude,
    s.address,
    s.city,
    s.created_at,
    (
      6371 * acos(
        cos(radians(lat)) * cos(radians(s.latitude)) * 
        cos(radians(s.longitude) - radians(lng)) + 
        sin(radians(lat)) * sin(radians(s.latitude))
      )
    ) AS distance_km
  FROM stores s
  WHERE (
    6371 * acos(
      cos(radians(lat)) * cos(radians(s.latitude)) * 
      cos(radians(s.longitude) - radians(lng)) + 
      sin(radians(lat)) * sin(radians(s.latitude))
    )
  ) <= radius_km
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- 为 beverages.tags 创建 GIN 索引
CREATE INDEX IF NOT EXISTS idx_beverages_tags ON beverages USING GIN(tags);

-- 开启所有表的 RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE beverages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 设置 stores 表的策略
CREATE POLICY "允许匿名用户读取stores" ON stores
  FOR SELECT TO anon USING (true);

-- 设置 beverages 表的策略
CREATE POLICY "允许匿名用户读取beverages" ON beverages
  FOR SELECT TO anon USING (true);

-- 设置 favorites 表的策略
CREATE POLICY "允许匿名用户读取favorites" ON favorites
  FOR SELECT TO anon USING (true);

CREATE POLICY "允许匿名用户插入favorites" ON favorites
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "允许匿名用户删除favorites" ON favorites
  FOR DELETE TO anon USING (true);
