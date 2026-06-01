import { DarkTheme, DefaultTheme } from '@react-navigation/native';

// ─── Color Palette ─────────────────────────────────────────────────────────────
export const COLORS = {
  // Primary – soft blush rose
  primary: {
    50: '#FFF5F7',
    100: '#FFE4EA',
    200: '#FFBCCC',
    300: '#FF8FAD',
    400: '#FF6B95',
    500: '#E84B7A',
    600: '#C73568',
    700: '#A02455',
    800: '#7A1842',
    900: '#540F2E',
  },
  // Secondary – warm lavender
  secondary: {
    50: '#F7F5FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
  // Tertiary – peach glow
  tertiary: {
    50: '#FFF8F4',
    100: '#FFEEDE',
    200: '#FFD5B5',
    300: '#FFB87A',
    400: '#FF9A4D',
    500: '#F97316',
    600: '#EA6207',
    700: '#C2510A',
    800: '#9A4110',
    900: '#7C3510',
  },
  // Neutral – warm cream
  neutral: {
    0: '#FFFFFF',
    50: '#FDF9F7',
    100: '#F7F0EC',
    200: '#EDE1D9',
    300: '#DDD0C8',
    400: '#C5B4AA',
    500: '#A89890',
    600: '#8B7B72',
    700: '#6E5F56',
    800: '#52443C',
    900: '#3A302A',
    950: '#1E1812',
  },
  // Semantic
  success: '#4ADE80',
  warning: '#FCD34D',
  error: '#F87171',
  info: '#60A5FA',
  // Phase colors
  period: '#FF6B95',
  fertile: '#86EFAC',
  ovulation: '#FCD34D',
  pms: '#C4B5FD',
  follicular: '#BAE6FD',
};

// ─── Typography ────────────────────────────────────────────────────────────────
export const FONTS = {
  display: {
    light: 'Fraunces-Light',
    regular: 'Fraunces-Regular',
    semiBold: 'Fraunces-SemiBold',
  },
  body: {
    regular: 'DM-Sans-Regular',
    medium: 'DM-Sans-Medium',
    bold: 'DM-Sans-Bold',
  },
};

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 19,
  xl: 22,
  '2xl': 26,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const LINE_HEIGHTS = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,
};

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const SPACING = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
};

// ─── Border Radius ────────────────────────────────────────────────────────────
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const SHADOWS = {
  sm: {
    shadowColor: '#E84B7A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#E84B7A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#E84B7A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 8,
  },
  soft: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
};

// ─── Light Theme ──────────────────────────────────────────────────────────────
export const LIGHT_THEME = {
  background: '#FDF9F7',
  surface: '#FFFFFF',
  surfaceSecondary: '#FFF5F7',
  surfaceTertiary: '#F7F0EC',
  border: '#EDE1D9',
  borderLight: '#F7F0EC',
  text: {
    primary: '#3A302A',
    secondary: '#8B7B72',
    tertiary: '#A89890',
    inverse: '#FFFFFF',
    accent: '#E84B7A',
  },
  icon: {
    primary: '#52443C',
    secondary: '#A89890',
    accent: '#E84B7A',
  },
  tabBar: {
    background: '#FFFFFF',
    border: '#F7F0EC',
    active: '#E84B7A',
    inactive: '#C5B4AA',
  },
};

// ─── Dark Theme ───────────────────────────────────────────────────────────────
export const DARK_THEME = {
  background: '#1E1812',
  surface: '#2A2118',
  surfaceSecondary: '#332820',
  surfaceTertiary: '#3D3028',
  border: '#52443C',
  borderLight: '#3D3028',
  text: {
    primary: '#F7F0EC',
    secondary: '#C5B4AA',
    tertiary: '#A89890',
    inverse: '#1E1812',
    accent: '#FF8FAD',
  },
  icon: {
    primary: '#EDE1D9',
    secondary: '#A89890',
    accent: '#FF8FAD',
  },
  tabBar: {
    background: '#2A2118',
    border: '#3D3028',
    active: '#FF8FAD',
    inactive: '#6E5F56',
  },
};

// ─── Navigation Theme ─────────────────────────────────────────────────────────
export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: LIGHT_THEME.background,
    card: LIGHT_THEME.surface,
    text: LIGHT_THEME.text.primary,
    border: LIGHT_THEME.border,
    primary: COLORS.primary[500],
    notification: COLORS.primary[500],
  },
};

// ─── Cycle Phase Config ───────────────────────────────────────────────────────
// icon: plain string key — rendered by PhaseIcon() in your screen components
export const CYCLE_PHASES = {
  menstrual: {
    label: 'Period',
    color: COLORS.period,
    gradient: ['#FFB8CC', '#FF6B95'],
    icon: 'menstrual',
    description: 'Your period days',
  },
  follicular: {
    label: 'Rising',
    color: COLORS.follicular,
    gradient: ['#BAE6FD', '#7DD3FC'],
    icon: 'follicular',
    description: 'Energy returning',
  },
  ovulation: {
    label: 'Peak',
    color: COLORS.ovulation,
    gradient: ['#FEF08A', '#FCD34D'],
    icon: 'ovulation',
    description: 'Ovulation window',
  },
  luteal: {
    label: 'Luteal',
    color: '#C084FC',
    gradient: ['#DDD6FE', '#C4B5FD'],
    icon: 'luteal',
    description: 'Wind-down phase',
  },
  pms: {
    label: 'PMS',
    color: COLORS.pms,
    gradient: ['#EDE9FE', '#C4B5FD'],
    icon: 'pms',
    description: 'Pre-period days',
  },
};

// ─── Symptom Config ───────────────────────────────────────────────────────────
// icon: plain string key — rendered by SymptomIcon() in AnalyticsScreen
export const SYMPTOMS_CONFIG = {
  cramps:             { label: 'Cramps',            icon: 'cramps',            color: '#F87171' },
  headache:           { label: 'Headache',          icon: 'headache',          color: '#FB923C' },
  bloating:           { label: 'Bloating',          icon: 'bloating',          color: '#FBBF24' },
  acne:               { label: 'Acne',              icon: 'acne',              color: '#F472B6' },
  fatigue:            { label: 'Fatigue',           icon: 'fatigue',           color: '#A78BFA' },
  nausea:             { label: 'Nausea',            icon: 'nausea',            color: '#34D399' },
  back_pain:          { label: 'Back Pain',         icon: 'back_pain',         color: '#60A5FA' },
  mood_swings:        { label: 'Mood Swings',       icon: 'mood_swings',       color: '#F59E0B' },
  breast_tenderness:  { label: 'Breast Tenderness', icon: 'breast_tenderness', color: '#EC4899' },
  insomnia:           { label: 'Insomnia',          icon: 'insomnia',          color: '#818CF8' },
  hot_flashes:        { label: 'Hot Flashes',       icon: 'hot_flashes',       color: '#EF4444' },
  dizziness:          { label: 'Dizziness',         icon: 'dizziness',         color: '#06B6D4' },
  appetite_changes:   { label: 'Appetite',          icon: 'appetite_changes',  color: '#10B981' },
  joint_pain:         { label: 'Joint Pain',        icon: 'joint_pain',        color: '#6366F1' },
  digestive_issues:   { label: 'Digestive',         icon: 'digestive_issues',  color: '#84CC16' },
};

// ─── Mood Config ──────────────────────────────────────────────────────────────
// emoji field renamed to icon, value is plain string key — rendered by MoodIcon() in AnalyticsScreen
export const MOODS_CONFIG = {
  happy:       { label: 'Happy',       icon: 'happy',       color: '#FCD34D' },
  calm:        { label: 'Calm',        icon: 'calm',        color: '#86EFAC' },
  sad:         { label: 'Sad',         icon: 'sad',         color: '#93C5FD' },
  anxious:     { label: 'Anxious',     icon: 'anxious',     color: '#FCA5A5' },
  irritable:   { label: 'Irritable',   icon: 'irritable',   color: '#F87171' },
  energetic:   { label: 'Energetic',   icon: 'energetic',   color: '#FDE68A' },
  tired:       { label: 'Tired',       icon: 'tired',       color: '#C4B5FD' },
  emotional:   { label: 'Emotional',   icon: 'emotional',   color: '#FBCFE8' },
  focused:     { label: 'Focused',     icon: 'focused',     color: '#6EE7B7' },
  hopeful:     { label: 'Hopeful',     icon: 'hopeful',     color: '#BAE6FD' },
  overwhelmed: { label: 'Overwhelmed', icon: 'overwhelmed', color: '#DDD6FE' },
  content:     { label: 'Content',     icon: 'content',     color: '#FDE68A' },
};

// ─── Flow Config ──────────────────────────────────────────────────────────────
export const FLOW_CONFIG = {
  spotting:   { label: 'Spotting',    dots: 1, color: '#FBCFE8' },
  light:      { label: 'Light',       dots: 2, color: '#F9A8D4' },
  medium:     { label: 'Medium',      dots: 3, color: '#F472B6' },
  heavy:      { label: 'Heavy',       dots: 4, color: '#E84B7A' },
  very_heavy: { label: 'Very Heavy',  dots: 5, color: '#BE185D' },
};