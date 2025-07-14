-- 体調記録テーブル
CREATE TABLE IF NOT EXISTS health_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('good', 'normal', 'bad')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 日付とユーザーIDの組み合わせでユニーク制約
CREATE UNIQUE INDEX IF NOT EXISTS health_records_user_date_idx ON health_records(user_id, date);

-- スケジュールテーブル
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  is_all_day BOOLEAN DEFAULT FALSE,
  calendar_source TEXT DEFAULT 'manual',
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ユーザー設定テーブル
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  font_size INTEGER DEFAULT 16 CHECK (font_size >= 12 AND font_size <= 24),
  week_starts_monday BOOLEAN DEFAULT FALSE,
  google_calendar_connected BOOLEAN DEFAULT FALSE,
  apple_calendar_connected BOOLEAN DEFAULT FALSE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  reminder_time TIME DEFAULT '09:00:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) の設定
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "Users can view own health records" ON health_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health records" ON health_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health records" ON health_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health records" ON health_records
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own schedules" ON schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedules" ON schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedules" ON schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedules" ON schedules
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);
