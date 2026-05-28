import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Secure storage adapter for Supabase auth tokens
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Database Query Helpers ───────────────────────────────────────────────────
export const db = {
  // User profiles
  profiles: () => supabase.from('user_profiles'),

  // Cycle entries
  cycles: () => supabase.from('cycle_entries'),

  // Day logs
  dayLogs: () => supabase.from('day_logs'),

  // Journal entries
  journal: () => supabase.from('journal_entries'),

  // Notification settings
  notificationSettings: () => supabase.from('notification_settings'),
};

// ─── Supabase Database Schema (SQL for reference) ─────────────────────────────
/*
-- Run these in Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT,
  date_of_birth DATE,
  average_cycle_length INTEGER DEFAULT 28,
  average_period_length INTEGER DEFAULT 5,
  last_period_start DATE,
  contraceptive_method TEXT,
  trying_to_conceive BOOLEAN DEFAULT FALSE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  biometric_enabled BOOLEAN DEFAULT FALSE,
  pin_enabled BOOLEAN DEFAULT FALSE,
  privacy_mode BOOLEAN DEFAULT FALSE,
  theme TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cycle Entries
CREATE TABLE cycle_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  cycle_length INTEGER,
  period_length INTEGER,
  is_irregular BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Day Logs (per-day tracking)
CREATE TABLE day_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  flow TEXT,
  is_period BOOLEAN DEFAULT FALSE,
  is_spotting BOOLEAN DEFAULT FALSE,
  symptoms JSONB DEFAULT '[]',
  moods JSONB DEFAULT '[]',
  sleep_hours DECIMAL(4,2),
  water_intake INTEGER,
  exercise_minutes INTEGER,
  temperature DECIMAL(5,2),
  cervical_mucus TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Journal Entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Settings
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  period_reminder BOOLEAN DEFAULT TRUE,
  period_reminder_days INTEGER DEFAULT 2,
  ovulation_reminder BOOLEAN DEFAULT TRUE,
  fertile_window_reminder BOOLEAN DEFAULT FALSE,
  daily_log_reminder BOOLEAN DEFAULT TRUE,
  daily_log_time TEXT DEFAULT '20:00',
  pms_reminder BOOLEAN DEFAULT TRUE,
  medication_reminders JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row-Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can only access own profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own cycles" ON cycle_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own day logs" ON day_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own journal" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own notifications" ON notification_settings
  FOR ALL USING (auth.uid() = user_id);

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_cycle_entries_updated_at
  BEFORE UPDATE ON cycle_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_day_logs_updated_at
  BEFORE UPDATE ON day_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
*/
