-- 创建家庭组表
CREATE TABLE IF NOT EXISTS family_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  device_id TEXT NOT NULL,
  nickname TEXT DEFAULT '',
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, device_id)
);

-- 创建家庭邀请表
CREATE TABLE IF NOT EXISTS family_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code TEXT NOT NULL UNIQUE,
  creator_device_id TEXT NOT NULL,
  group_id UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 启用行级安全策略
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous access" ON family_groups FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE family_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous access" ON family_invites FOR ALL USING (true) WITH CHECK (true);
