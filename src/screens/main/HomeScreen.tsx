import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Dimensions, RefreshControl, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { format, isToday, parseISO } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useCycle } from '../../context/CycleContext';
import { useTheme } from '../../context/ThemeContext';
import { CycleRing, PhaseBadge } from '../../components/tracking/CycleRing';
import { Card, SectionHeader, Button } from '../../components/common/UIComponents';
import { generateInsights, getDailyAffirmation } from '../../services/insightsService';
import { getCycleDay } from '../../services/cycleEngine';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS, CYCLE_PHASES, FLOW_CONFIG, MOODS_CONFIG } from '../../constants/theme';
import { FlowIntensity, MoodType } from '../../types';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const { prediction, stats, cycles, todayLog, isOnPeriod, startPeriod, endPeriod, logFlow, logMoods, refreshAll, isLoading } = useCycle();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }, [refreshAll]);

  const lastCycle = cycles[0];
  const cycleDay = lastCycle ? getCycleDay(lastCycle.start_date) : 1;
  const phase = prediction?.cycle_phase || 'follicular';
  const phaseConfig = CYCLE_PHASES[phase];
  const affirmation = getDailyAffirmation(phase);

  const insights = generateInsights({
    prediction: prediction ?? undefined,
    stats: stats ?? undefined,
    recentSymptoms: [],
    wellnessData: {
      avgSleep: undefined,
      avgWater: undefined,
    },
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayMoods = (todayLog?.moods as MoodType[]) || [];
  const todayFlow = todayLog?.flow as FlowIntensity | undefined;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary[400]} />
      }
    >
      {/* ── Header gradient ─────────────────────────────────── */}
      <LinearGradient
        colors={isDark
          ? ['#332820', colors.background]
          : [phaseConfig.gradient[0] + '60', colors.background]}
        style={[styles.headerGradient, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.greeting, { color: colors.text.secondary }]}>
              {greeting()}{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''} ✨
            </Text>
            <Text style={[styles.dateText, { color: colors.text.tertiary }]}>
              {format(new Date(), 'EEEE, MMMM d')}
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Profile')}
            style={[styles.avatarButton, { backgroundColor: COLORS.primary[100] }]}
          >
            <Text style={styles.avatarEmoji}>👤</Text>
          </Pressable>
        </View>

        {/* ── Cycle Ring ──────────────────────────────────────── */}
        <View style={styles.ringWrapper}>
          <CycleRing
            phase={phase}
            daysUntilPeriod={prediction?.days_until_period ?? 14}
            cycleDay={cycleDay}
            cycleLength={stats?.average_length || 28}
            confidence={prediction?.confidence}
            size={width * 0.62}
          />
        </View>

        {/* Phase badge */}
        <View style={styles.phaseBadgeRow}>
          <PhaseBadge phase={phase} />
          {prediction && (
            <View style={[styles.nextPeriodChip, { backgroundColor: colors.surfaceTertiary }]}>
              <Text style={[styles.nextPeriodText, { color: colors.text.secondary }]}>
                {prediction.days_until_period === 0
                  ? 'Period may start today'
                  : `Next period in ${prediction.days_until_period}d`}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* ── Quick Log ────────────────────────────────────────── */}
        <View style={styles.quickLogRow}>
          <QuickLogButton
            icon={isOnPeriod ? '🛑' : '🌸'}
            label={isOnPeriod ? 'End period' : 'Start period'}
            color={COLORS.primary[500]}
            onPress={() => isOnPeriod ? endPeriod() : startPeriod()}
          />
          <QuickLogButton
            icon="💊"
            label="Symptoms"
            color={COLORS.secondary[400]}
            onPress={() => navigation.navigate('Track', { screen: 'SymptomTracker' })}
          />
          <QuickLogButton
            icon="😊"
            label="Mood"
            color={COLORS.tertiary[400]}
            onPress={() => navigation.navigate('Track', { screen: 'MoodTracker' })}
          />
          <QuickLogButton
            icon="📖"
            label="Journal"
            color="#4ADE80"
            onPress={() => navigation.navigate('Track', { screen: 'Journal' })}
          />
        </View>

        {/* ── Today's Log Summary ────────────────────────────── */}
        {(todayFlow || todayMoods.length > 0) && (
          <Card style={styles.todayCard}>
            <Text style={[styles.todayTitle, { color: colors.text.primary }]}>Today's log</Text>
            <View style={styles.todayChips}>
              {todayFlow && (
                <View style={[styles.logChip, { backgroundColor: COLORS.primary[100] }]}>
                  <Text style={styles.logChipEmoji}>🩸</Text>
                  <Text style={[styles.logChipText, { color: COLORS.primary[600] }]}>
                    {FLOW_CONFIG[todayFlow]?.label}
                  </Text>
                </View>
              )}
              {todayMoods.slice(0, 3).map(m => (
                <View key={m} style={[styles.logChip, { backgroundColor: MOODS_CONFIG[m]?.color + '30' }]}>
                  <Text style={styles.logChipEmoji}>{MOODS_CONFIG[m]?.emoji}</Text>
                  <Text style={[styles.logChipText, { color: colors.text.secondary }]}>
                    {MOODS_CONFIG[m]?.label}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* ── Daily Affirmation ────────────────────────────────── */}
        <LinearGradient
          colors={[phaseConfig.gradient[0] + '40', phaseConfig.gradient[1] + '20']}
          style={styles.affirmationCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.affirmationEmoji}>{phaseConfig.icon}</Text>
          <Text style={[styles.affirmationText, { color: colors.text.primary }]}>
            {affirmation}
          </Text>
        </LinearGradient>

        {/* ── Upcoming Events ──────────────────────────────────── */}
        {prediction && (
          <View style={styles.section}>
            <SectionHeader title="Coming up" action="Calendar" onAction={() => navigation.navigate('Calendar')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventsScroll}>
              <UpcomingEvent
                icon="🌸"
                title="Period"
                date={prediction.next_period_start}
                color={COLORS.period}
              />
              <UpcomingEvent
                icon="✨"
                title="Ovulation"
                date={prediction.ovulation_date}
                color={COLORS.ovulation}
              />
              <UpcomingEvent
                icon="🌱"
                title="Fertile window"
                date={prediction.fertile_window_start}
                color={COLORS.fertile}
              />
              <UpcomingEvent
                icon="💜"
                title="PMS window"
                date={prediction.pms_start}
                color={COLORS.pms}
              />
            </ScrollView>
          </View>
        )}

        {/* ── Insights ─────────────────────────────────────────── */}
        {insights.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Insights for you"
              action="See all"
              onAction={() => navigation.navigate('Analytics')}
            />
            <View style={styles.insightsList}>
              {insights.slice(0, 3).map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </View>
          </View>
        )}

        {/* ── Cycle Stats Strip ────────────────────────────────── */}
        {stats && (
          <View style={styles.section}>
            <SectionHeader title="Your cycle" action="Analytics" onAction={() => navigation.navigate('Analytics')} />
            <View style={styles.statsRow}>
              <StatPill label="Avg length" value={`${stats.average_length}d`} />
              <StatPill label="Period" value={`${stats.average_period_length}d`} />
              <StatPill label="Tracked" value={`${stats.cycles_tracked}`} />
              <StatPill
                label="Regularity"
                value={stats.cycle_regularity === 'regular' ? '✓' : '~'}
                color={stats.cycle_regularity === 'regular' ? '#4ADE80' : '#FCD34D'}
              />
            </View>
          </View>
        )}

        {/* ── Wellness Quick Log ────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader title="Wellness" />
          <View style={styles.wellnessRow}>
            <WellnessTile icon="💧" label="Water" value={todayLog?.water_intake ?? 0} unit="glasses" onPress={() => navigation.navigate('Track', { screen: 'WellnessTracker' })} />
            <WellnessTile icon="😴" label="Sleep" value={todayLog?.sleep_hours ?? 0} unit="hrs" onPress={() => navigation.navigate('Track', { screen: 'WellnessTracker' })} />
            <WellnessTile icon="🏃‍♀️" label="Exercise" value={todayLog?.exercise_minutes ?? 0} unit="min" onPress={() => navigation.navigate('Track', { screen: 'WellnessTracker' })} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function QuickLogButton({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.quickLogBtn, { backgroundColor: color + '18' }]}>
      <Text style={styles.quickLogIcon}>{icon}</Text>
      <Text style={[styles.quickLogLabel, { color: colors.text.secondary }]}>{label}</Text>
    </Pressable>
  );
}

function UpcomingEvent({ icon, title, date, color }: { icon: string; title: string; date: string; color: string }) {
  const { colors } = useTheme();
  const d = parseISO(date);
  const label = isToday(d) ? 'Today' : format(d, 'MMM d');
  return (
    <View style={[styles.eventCard, { backgroundColor: color + '18', borderColor: color + '40' }]}>
      <Text style={styles.eventIcon}>{icon}</Text>
      <Text style={[styles.eventTitle, { color: colors.text.primary }]}>{title}</Text>
      <Text style={[styles.eventDate, { color }]}>{label}</Text>
    </View>
  );
}

function InsightCard({ insight }: { insight: any }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.insightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.insightIconBg, { backgroundColor: insight.color + '20' }]}>
        <Text style={styles.insightIcon}>{insight.icon}</Text>
      </View>
      <View style={styles.insightContent}>
        <Text style={[styles.insightTitle, { color: colors.text.primary }]}>{insight.title}</Text>
        <Text style={[styles.insightBody, { color: colors.text.secondary }]} numberOfLines={2}>
          {insight.body}
        </Text>
      </View>
    </View>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color?: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statPill, { backgroundColor: colors.surfaceTertiary }]}>
      <Text style={[styles.statValue, { color: color || COLORS.primary[500] }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>{label}</Text>
    </View>
  );
}

function WellnessTile({ icon, label, value, unit, onPress }: { icon: string; label: string; value: number; unit: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.wellnessTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={styles.wellnessTileIcon}>{icon}</Text>
      <Text style={[styles.wellnessTileValue, { color: colors.text.primary }]}>{value}</Text>
      <Text style={[styles.wellnessTileUnit, { color: colors.text.tertiary }]}>{unit}</Text>
      <Text style={[styles.wellnessTileLabel, { color: colors.text.secondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: { paddingHorizontal: SPACING[5], paddingBottom: SPACING[6] },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING[4] },
  greeting: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.base },
  dateText: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm, marginTop: 2 },
  avatarButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 18 },
  ringWrapper: { alignItems: 'center', marginVertical: SPACING[4] },
  phaseBadgeRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING[3], marginTop: SPACING[2] },
  nextPeriodChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  nextPeriodText: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs },
  body: { paddingHorizontal: SPACING[5] },
  quickLogRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING[4] },
  quickLogBtn: { flex: 1, marginHorizontal: 4, borderRadius: RADIUS.lg, paddingVertical: SPACING[3], alignItems: 'center', gap: 4 },
  quickLogIcon: { fontSize: 22 },
  quickLogLabel: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs },
  todayCard: { marginBottom: SPACING[4] },
  todayTitle: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.sm, marginBottom: SPACING[2] },
  todayChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  logChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  logChipEmoji: { fontSize: 13 },
  logChipText: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.xs },
  affirmationCard: { borderRadius: RADIUS['2xl'], padding: SPACING[5], marginBottom: SPACING[6], alignItems: 'center', gap: 8 },
  affirmationEmoji: { fontSize: 28 },
  affirmationText: { fontFamily: FONTS.display.regular, fontSize: FONT_SIZES.md, textAlign: 'center', lineHeight: 26 },
  section: { marginBottom: SPACING[6] },
  eventsScroll: { marginHorizontal: -SPACING[5], paddingHorizontal: SPACING[5] },
  eventCard: { width: 110, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING[3], marginRight: SPACING[3], alignItems: 'center', gap: 4 },
  eventIcon: { fontSize: 22 },
  eventTitle: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.xs, textAlign: 'center' },
  eventDate: { fontFamily: FONTS.body.bold, fontSize: FONT_SIZES.sm },
  insightsList: { gap: SPACING[3] },
  insightCard: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING[3], padding: SPACING[4], borderRadius: RADIUS.xl, borderWidth: 1 },
  insightIconBg: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  insightIcon: { fontSize: 20 },
  insightContent: { flex: 1 },
  insightTitle: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.sm, marginBottom: 2 },
  insightBody: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs, lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: SPACING[2] },
  statPill: { flex: 1, borderRadius: RADIUS.lg, padding: SPACING[3], alignItems: 'center', gap: 2 },
  statValue: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES.md },
  statLabel: { fontFamily: FONTS.body.regular, fontSize: 10, textAlign: 'center' },
  wellnessRow: { flexDirection: 'row', gap: SPACING[3] },
  wellnessTile: { flex: 1, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING[3], alignItems: 'center', gap: 2 },
  wellnessTileIcon: { fontSize: 22 },
  wellnessTileValue: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES.xl },
  wellnessTileUnit: { fontFamily: FONTS.body.regular, fontSize: 10 },
  wellnessTileLabel: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.xs },
});
