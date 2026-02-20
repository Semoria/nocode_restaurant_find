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
