import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Use localStorage on web, SecureStore on native
const ExpoSecureStoreAdapter = Platform.OS === 'web'
  ? {
      getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key: string, value: string) => {
        localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        localStorage.removeItem(key);
        return Promise.resolve();
      },
    }
  : {
      getItem: (key: string) => SecureStore.getItemAsync(key),
      setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    };

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    // Allow web to detect session from URL (needed for magic links / OAuth on web)
    detectSessionInUrl: Platform.OS === 'web',
  },
  global: {
    headers: {
      // Tells PostgREST to return data even when RLS policies are active
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
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