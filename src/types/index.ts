// ─── User & Auth ──────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  date_of_birth?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  date_of_birth?: string;
  average_cycle_length: number;
  average_period_length: number;
  last_period_start?: string;
  contraceptive_method?: string;
  trying_to_conceive: boolean;
  notifications_enabled: boolean;
  biometric_enabled: boolean;
  pin_enabled: boolean;
  privacy_mode: boolean;
  theme: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
}

// ─── Cycle ────────────────────────────────────────────────────────────────────
export type FlowIntensity = 'spotting' | 'light' | 'medium' | 'heavy' | 'very_heavy';
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'pms';

export interface CycleEntry {
  id: string;
  user_id: string;
  start_date: string;
  end_date?: string;
  cycle_length?: number;
  period_length?: number;
  is_irregular: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DayEntry {
  id: string;
  user_id: string;
  date: string;
  flow?: FlowIntensity;
  is_period: boolean;
  is_spotting: boolean;
  symptoms: Symptom[];
  moods: MoodType[];
  sleep_hours?: number;
  water_intake?: number;
  exercise_minutes?: number;
  temperature?: number;
  cervical_mucus?: CervicalMucusType;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ─── Symptoms ─────────────────────────────────────────────────────────────────
export type Symptom =
  | 'cramps'
  | 'headache'
  | 'bloating'
  | 'acne'
  | 'fatigue'
  | 'nausea'
  | 'back_pain'
  | 'mood_swings'
  | 'breast_tenderness'
  | 'insomnia'
  | 'hot_flashes'
  | 'dizziness'
  | 'appetite_changes'
  | 'joint_pain'
  | 'digestive_issues';

export type SymptomSeverity = 1 | 2 | 3; // mild, moderate, severe

export interface SymptomEntry {
  symptom: Symptom;
  severity: SymptomSeverity;
}

// ─── Mood ─────────────────────────────────────────────────────────────────────
export type MoodType =
  | 'happy'
  | 'calm'
  | 'sad'
  | 'anxious'
  | 'irritable'
  | 'energetic'
  | 'tired'
  | 'emotional'
  | 'focused'
  | 'hopeful'
  | 'overwhelmed'
  | 'content';

export type CervicalMucusType = 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg_white';

// ─── Predictions ──────────────────────────────────────────────────────────────
export interface CyclePrediction {
  next_period_start: string;
  next_period_end: string;
  ovulation_date: string;
  fertile_window_start: string;
  fertile_window_end: string;
  pms_start: string;
  confidence: number; // 0–100
  cycle_phase: CyclePhase;
  days_until_period: number;
  is_irregular: boolean;
}

export interface PredictedDay {
  date: string;
  type: 'period' | 'fertile' | 'ovulation' | 'pms';
  confidence: number;
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface CycleStats {
  average_length: number;
  shortest_cycle: number;
  longest_cycle: number;
  average_period_length: number;
  cycle_regularity: 'regular' | 'slightly_irregular' | 'irregular';
  cycles_tracked: number;
}

export interface SymptomFrequency {
  symptom: Symptom;
  count: number;
  percentage: number;
  most_common_phase: CyclePhase;
}

export interface MoodTrend {
  date: string;
  mood: MoodType;
  cycle_day: number;
}

// ─── Insights ─────────────────────────────────────────────────────────────────
export interface Insight {
  id: string;
  type: 'tip' | 'pattern' | 'warning' | 'celebration';
  title: string;
  body: string;
  icon: string;
  created_at: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────
export interface NotificationSettings {
  period_reminder: boolean;
  period_reminder_days: number;
  ovulation_reminder: boolean;
  fertile_window_reminder: boolean;
  daily_log_reminder: boolean;
  daily_log_time: string; // HH:mm
  pms_reminder: boolean;
  medication_reminders: MedicationReminder[];
}

export interface MedicationReminder {
  id: string;
  name: string;
  time: string;
  enabled: boolean;
}

// ─── Journal ──────────────────────────────────────────────────────────────────
export interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  content: string;
  mood?: MoodType;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  PinSetup: undefined;
  BiometricSetup: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  CycleInfo: undefined;
  GoalSetup: undefined;
  NotificationSetup: undefined;
  Complete: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Track: undefined;
  Analytics: undefined;
  Profile: undefined;
};

export type TrackStackParamList = {
  TrackHome: undefined;
  SymptomTracker: { date?: string };
  MoodTracker: { date?: string };
  FlowTracker: { date?: string };
  WellnessTracker: { date?: string };
  Journal: undefined;
  JournalEntry: { id?: string; date?: string };
};
