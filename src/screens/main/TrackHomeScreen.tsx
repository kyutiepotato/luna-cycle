import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useCycle } from '../../context/CycleContext';
import { useTheme } from '../../context/ThemeContext';
import { Screen } from '../../components/common/Screen';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS, CYCLE_PHASES } from '../../constants/theme';
import Svg, { Path, Circle, Rect, Line, Polyline, Ellipse } from 'react-native-svg';

// ─── Safe haptics helper (no-op on web) ──────────────────────────────────────
const triggerHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconDrop({ size = 28, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C12 2 5 10 5 15a7 7 0 0 0 14 0C19 10 12 2 12 2z" fill={color} />
      <Path d="M9 15 Q10 18 12 18" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none" />
    </Svg>
  );
}

function IconPill({ size = 28, color = '#A78BFA' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4.5 12.5L12.5 4.5a5.657 5.657 0 0 1 8 8l-8 8a5.657 5.657 0 0 1-8-8z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Line x1="8" y1="8" x2="16" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function IconMasks({ size = 28, color = '#D97706' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 5c0-1.1.9-2 2-2h7a2 2 0 0 1 2 2v5c0 3-2 5-5.5 5S2 13 2 10V5z"
        fill={color} opacity="0.85" />
      <Path d="M5.5 9 Q6.5 11 8 9" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" />
      <Path d="M13 9c0-1.1.9-2 2-2h5a2 2 0 0 1 2 2v4c0 2.5-1.8 4.5-4.5 4.5S13 15.5 13 13V9z"
        fill={color} opacity="0.5" />
      <Path d="M15.5 13 Q17 11.5 18.5 13" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function IconLeaf({ size = 28, color = '#059669' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 8C8 10 5.9 16.17 3.82 19.82A1 1 0 0 0 5 21c10-5 15-10 13-17z"
        fill={color} stroke={color} strokeWidth="1" strokeLinejoin="round" />
      <Path d="M5 21 Q10 16 13 13" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none" />
    </Svg>
  );
}

function IconBook({ size = 28, color = '#0284C7' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 4h7a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H4V4z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M20 4h-7a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h8V4z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

function IconThermometer({ size = 28, color = '#E11D48' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Circle cx="11.5" cy="18.5" r="2.5" fill={color} opacity="0.8" />
      <Line x1="11.5" y1="16" x2="11.5" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function IconCheck({ size = 12, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="20,6 9,17 4,12" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Track options ────────────────────────────────────────────────────────────

const TRACK_OPTIONS = [
  {
    id: 'flow',
    screen: 'FlowTracker',
    renderIcon: (size = 28) => <IconDrop size={size} color={COLORS.primary[500]} />,
    title: 'Flow & Period',
    desc: 'Log bleeding intensity',
    gradient: ['#FFE4EA', '#FFBCCC'] as [string, string],
    accent: COLORS.primary[500],
  },
  {
    id: 'symptoms',
    screen: 'SymptomTracker',
    renderIcon: (size = 28) => <IconPill size={size} color={COLORS.secondary[500]} />,
    title: 'Symptoms',
    desc: 'Cramps, headaches & more',
    gradient: ['#EDE9FE', '#DDD6FE'] as [string, string],
    accent: COLORS.secondary[500],
  },
  {
    id: 'mood',
    screen: 'MoodTracker',
    renderIcon: (size = 28) => <IconMasks size={size} color="#D97706" />,
    title: 'Mood & Emotions',
    desc: 'How are you feeling?',
    gradient: ['#FEF9C3', '#FEF08A'] as [string, string],
    accent: '#D97706',
  },
  {
    id: 'wellness',
    screen: 'WellnessTracker',
    renderIcon: (size = 28) => <IconLeaf size={size} color="#059669" />,
    title: 'Wellness',
    desc: 'Sleep, water, exercise',
    gradient: ['#D1FAE5', '#A7F3D0'] as [string, string],
    accent: '#059669',
  },
  {
    id: 'journal',
    screen: 'Journal',
    renderIcon: (size = 28) => <IconBook size={size} color="#0284C7" />,
    title: 'Journal',
    desc: 'Your private space',
    gradient: ['#E0F2FE', '#BAE6FD'] as [string, string],
    accent: '#0284C7',
  },
  {
    id: 'temp',
    screen: 'WellnessTracker',
    renderIcon: (size = 28) => <IconThermometer size={size} color="#E11D48" />,
    title: 'Temperature',
    desc: 'Basal body temp (BBT)',
    gradient: ['#FFE4E6', '#FECDD3'] as [string, string],
    accent: '#E11D48',
  },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function TrackHomeScreen() {
  const navigation = useNavigation<any>();
  const { todayLog, prediction } = useCycle();
  const { colors } = useTheme();
  const today = format(new Date(), 'EEEE, MMMM d');
  const phase = prediction?.cycle_phase || 'follicular';
  const phaseConfig = CYCLE_PHASES[phase];

  const loggedToday = [
    todayLog?.is_period && 'flow',
    (todayLog?.symptoms as any[])?.length && 'symptoms',
    (todayLog?.moods as any[])?.length && 'mood',
    todayLog?.sleep_hours && 'wellness',
  ].filter(Boolean);

  return (
    <Screen scroll padding={false} style={{ backgroundColor: colors.background }}>
      <LinearGradient
        colors={[phaseConfig.gradient[0] + '50', colors.background]}
        style={styles.header}
      >
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Daily Log</Text>
        <Text style={[styles.headerDate, { color: colors.text.secondary }]}>{today}</Text>
        {loggedToday.length > 0 && (
          <View style={[styles.loggedBadge, { backgroundColor: '#4ADE8020', borderColor: '#4ADE8040' }]}>
            <IconCheck size={12} color="#059669" />
            <Text style={[styles.loggedText, { color: '#059669' }]}>
              {loggedToday.length} {loggedToday.length === 1 ? 'thing' : 'things'} logged today
            </Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.grid}>
        {TRACK_OPTIONS.map(opt => (
          <TrackCard
            key={opt.id}
            {...opt}
            isLogged={loggedToday.includes(opt.id)}
            onPress={() => {
              triggerHaptic();
              navigation.navigate(opt.screen);
            }}
          />
        ))}
      </View>

      <View style={[styles.periodSection, { marginHorizontal: SPACING[5], marginBottom: SPACING[6] }]}>
        <Text style={[styles.periodSectionTitle, { color: colors.text.primary }]}>Period status</Text>
        <PeriodToggle />
      </View>
    </Screen>
  );
}

function TrackCard({ renderIcon, title, desc, gradient, accent, isLogged, onPress }: any) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.trackCard, { opacity: pressed ? 0.88 : 1 }]}
    >
      <LinearGradient
        colors={gradient}
        style={[styles.trackCardInner, SHADOWS.sm]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {isLogged && (
          <View style={styles.loggedDot}>
            <IconCheck size={8} color="#FFFFFF" />
          </View>
        )}
        <View style={styles.trackCardIcon}>{renderIcon(28)}</View>
        <Text style={[styles.trackCardTitle, { color: '#1E1812' }]}>{title}</Text>
        <Text style={[styles.trackCardDesc, { color: '#52443C' }]}>{desc}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function PeriodToggle() {
  const { isOnPeriod, startPeriod, endPeriod } = useCycle();
  const { colors } = useTheme();

  return (
    <View style={styles.periodToggleRow}>
      <Pressable
        onPress={() => { if (!isOnPeriod) { triggerHaptic(); startPeriod(); } }}
        style={[
          styles.periodToggleBtn,
          {
            backgroundColor: isOnPeriod ? COLORS.primary[500] : colors.surfaceTertiary,
            borderColor: isOnPeriod ? COLORS.primary[500] : colors.border,
          },
        ]}
      >
        <IconDrop size={16} color={isOnPeriod ? '#FFFFFF' : COLORS.primary[400]} />
        <Text style={[styles.periodToggleBtnText, { color: isOnPeriod ? '#FFFFFF' : colors.text.secondary }]}>
          Period started
        </Text>
      </Pressable>
      <Pressable
        onPress={() => { if (isOnPeriod) { triggerHaptic(); endPeriod(); } }}
        style={[
          styles.periodToggleBtn,
          {
            backgroundColor: !isOnPeriod ? colors.surfaceTertiary : colors.surface,
            borderColor: !isOnPeriod ? COLORS.primary[200] : colors.border,
          },
        ]}
      >
        <IconCheck size={16} color={!isOnPeriod ? COLORS.primary[500] : colors.text.secondary} />
        <Text style={[styles.periodToggleBtnText, { color: !isOnPeriod ? COLORS.primary[500] : colors.text.secondary }]}>
          Period ended
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 60, paddingHorizontal: SPACING[5], paddingBottom: SPACING[5] },
  headerTitle: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES['3xl'], marginBottom: 4 },
  headerDate: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm, marginBottom: SPACING[3] },
  loggedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  loggedText: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING[4], gap: SPACING[3], marginBottom: SPACING[4] },
  trackCard: { width: '47%' },
  trackCardInner: { borderRadius: RADIUS['2xl'], padding: SPACING[4], gap: 6, minHeight: 110 },
  loggedDot: { position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: 9, backgroundColor: '#4ADE80', alignItems: 'center', justifyContent: 'center' },
  trackCardIcon: { alignItems: 'flex-start' },
  trackCardTitle: { fontFamily: FONTS.body.bold, fontSize: FONT_SIZES.base },
  trackCardDesc: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs },
  periodSection: {},
  periodSectionTitle: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES.lg, marginBottom: SPACING[3] },
  periodToggleRow: { flexDirection: 'row', gap: SPACING[3] },
  periodToggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: SPACING[4], borderRadius: RADIUS.xl, borderWidth: 1.5 },
  periodToggleBtnText: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.sm },
});