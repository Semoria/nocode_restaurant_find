-- 修复favorites表结构以匹配当前代码需求
-- 先删掉旧的 favorites 表（如果存在）
DROP TABLE IF EXISTS favorites;

-- 创建新的favorites表，使用beverage_key而不是beverage_id
CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  beverage_key text NOT NULL,
  beverage_data jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(device_id, beverage_key)
);

-- 启用行级安全策略
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 设置匿名用户策略
CREATE POLICY "anon_select" ON favorites FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert" ON favorites FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_delete" ON favorites FOR DELETE TO anon USING (true);
