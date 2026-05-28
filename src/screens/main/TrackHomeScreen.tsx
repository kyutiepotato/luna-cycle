import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { useCycle } from '../../context/CycleContext';
import { useTheme } from '../../context/ThemeContext';
import { Screen } from '../../components/common/Screen';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS, CYCLE_PHASES } from '../../constants/theme';
import * as Haptics from 'expo-haptics';

const TRACK_OPTIONS = [
  {
    id: 'flow',
    screen: 'FlowTracker',
    icon: '🩸',
    title: 'Flow & Period',
    desc: 'Log bleeding intensity',
    gradient: ['#FFE4EA', '#FFBCCC'] as [string, string],
    accent: COLORS.primary[500],
  },
  {
    id: 'symptoms',
    screen: 'SymptomTracker',
    icon: '💊',
    title: 'Symptoms',
    desc: 'Cramps, headaches & more',
    gradient: ['#EDE9FE', '#DDD6FE'] as [string, string],
    accent: COLORS.secondary[500],
  },
  {
    id: 'mood',
    screen: 'MoodTracker',
    icon: '🎭',
    title: 'Mood & Emotions',
    desc: 'How are you feeling?',
    gradient: ['#FEF9C3', '#FEF08A'] as [string, string],
    accent: '#D97706',
  },
  {
    id: 'wellness',
    screen: 'WellnessTracker',
    icon: '🌿',
    title: 'Wellness',
    desc: 'Sleep, water, exercise',
    gradient: ['#D1FAE5', '#A7F3D0'] as [string, string],
    accent: '#059669',
  },
  {
    id: 'journal',
    screen: 'Journal',
    icon: '📖',
    title: 'Journal',
    desc: 'Your private space',
    gradient: ['#E0F2FE', '#BAE6FD'] as [string, string],
    accent: '#0284C7',
  },
  {
    id: 'temp',
    screen: 'WellnessTracker',
    icon: '🌡️',
    title: 'Temperature',
    desc: 'Basal body temp (BBT)',
    gradient: ['#FFE4E6', '#FECDD3'] as [string, string],
    accent: '#E11D48',
  },
];

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
      {/* Header */}
      <LinearGradient
        colors={[phaseConfig.gradient[0] + '50', colors.background]}
        style={styles.header}
      >
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Daily Log</Text>
        <Text style={[styles.headerDate, { color: colors.text.secondary }]}>{today}</Text>

        {loggedToday.length > 0 && (
          <View style={[styles.loggedBadge, { backgroundColor: '#4ADE8020', borderColor: '#4ADE8040' }]}>
            <Text style={{ fontSize: 12 }}>✓</Text>
            <Text style={[styles.loggedText, { color: '#059669' }]}>
              {loggedToday.length} {loggedToday.length === 1 ? 'thing' : 'things'} logged today
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Track Grid */}
      <View style={styles.grid}>
        {TRACK_OPTIONS.map(opt => (
          <TrackCard
            key={opt.id}
            {...opt}
            isLogged={loggedToday.includes(opt.id)}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate(opt.screen);
            }}
          />
        ))}
      </View>

      {/* Quick period toggle */}
      <View style={[styles.periodSection, { marginHorizontal: SPACING[5], marginBottom: SPACING[6] }]}>
        <Text style={[styles.periodSectionTitle, { color: colors.text.primary }]}>
          Period status
        </Text>
        <PeriodToggle />
      </View>
    </Screen>
  );
}

function TrackCard({ icon, title, desc, gradient, accent, isLogged, onPress }: any) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.trackCard,
        { opacity: pressed ? 0.88 : 1 },
      ]}
    >
      <LinearGradient
        colors={gradient}
        style={[styles.trackCardInner, SHADOWS.sm]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {isLogged && (
          <View style={styles.loggedDot}>
            <Text style={{ fontSize: 8, color: '#FFFFFF' }}>✓</Text>
          </View>
        )}
        <Text style={styles.trackCardIcon}>{icon}</Text>
        <Text style={[styles.trackCardTitle, { color: '#1E1812' }]}>{title}</Text>
        <Text style={[styles.trackCardDesc, { color: '#52443C' }]}>{desc}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function PeriodToggle() {
  const { isOnPeriod, startPeriod, endPeriod, todayLog } = useCycle();
  const { colors } = useTheme();

  return (
    <View style={[styles.periodToggleRow]}>
      <Pressable
        onPress={() => !isOnPeriod && startPeriod()}
        style={[
          styles.periodToggleBtn,
          {
            backgroundColor: isOnPeriod ? COLORS.primary[500] : colors.surfaceTertiary,
            borderColor: isOnPeriod ? COLORS.primary[500] : colors.border,
          },
        ]}
      >
        <Text style={styles.periodToggleBtnIcon}>🩸</Text>
        <Text style={[styles.periodToggleBtnText, { color: isOnPeriod ? '#FFFFFF' : colors.text.secondary }]}>
          Period started
        </Text>
      </Pressable>
      <Pressable
        onPress={() => isOnPeriod && endPeriod()}
        style={[
          styles.periodToggleBtn,
          {
            backgroundColor: !isOnPeriod ? colors.surfaceTertiary : colors.surface,
            borderColor: !isOnPeriod ? COLORS.primary[200] : colors.border,
          },
        ]}
      >
        <Text style={styles.periodToggleBtnIcon}>✓</Text>
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
  trackCardIcon: { fontSize: 28 },
  trackCardTitle: { fontFamily: FONTS.body.bold, fontSize: FONT_SIZES.base },
  trackCardDesc: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs },
  periodSection: {},
  periodSectionTitle: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES.lg, marginBottom: SPACING[3] },
  periodToggleRow: { flexDirection: 'row', gap: SPACING[3] },
  periodToggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: SPACING[4], borderRadius: RADIUS.xl, borderWidth: 1.5 },
  periodToggleBtnIcon: { fontSize: 16 },
  periodToggleBtnText: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.sm },
});
