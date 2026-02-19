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
