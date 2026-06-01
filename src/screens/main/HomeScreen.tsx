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
import Svg, { Path, Circle, Rect, Ellipse, Polyline, Line, Polygon, G } from 'react-native-svg';

const { width } = Dimensions.get('window');

// ─── SVG Icons ─────────────────────────────────────────────────────────────────

/** Sparkle — greeting */
function IconSparkle({ size = 16, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2 L13.5 9 L20 12 L13.5 15 L12 22 L10.5 15 L4 12 L10.5 9 Z" fill={color} />
      <Circle cx="19" cy="5" r="1.5" fill={color} opacity="0.6" />
      <Circle cx="5" cy="19" r="1" fill={color} opacity="0.4" />
    </Svg>
  );
}

/** User / profile avatar */
function IconUser({ size = 18, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" fill={color} />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill={color} opacity="0.6" />
    </Svg>
  );
}

/** Stop / end period */
function IconStop({ size = 22, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="4" width="16" height="16" rx="3" fill={color} />
    </Svg>
  );
}

/** Flower / start period */
function IconFlower({ size = 22, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="2.5" fill={color} />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const r = deg * (Math.PI / 180);
        const cx = 12 + 5 * Math.cos(r);
        const cy = 12 + 5 * Math.sin(r);
        return <Ellipse key={i} cx={cx} cy={cy} rx="2.5" ry="1.5" transform={`rotate(${deg} ${cx} ${cy})`} fill={color} opacity="0.7" />;
      })}
    </Svg>
  );
}

/** Pill — symptoms */
function IconPill({ size = 22, color = '#A78BFA' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4.5 12.5L12.5 4.5a5.657 5.657 0 0 1 8 8l-8 8a5.657 5.657 0 0 1-8-8z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Line x1="8" y1="8" x2="16" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

/** Smiley — mood */
function IconSmile({ size = 22, color = '#FB923C' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="9" cy="10" r="1" fill={color} />
      <Circle cx="15" cy="10" r="1" fill={color} />
      <Path d="M8.5 14.5 Q12 18 15.5 14.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** Book — journal */
function IconBook({ size = 22, color = '#4ADE80' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 4h7a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H4V4z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M20 4h-7a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h8V4z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

/** Blood drop — flow log chip */
function IconDrop({ size = 13, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2 C12 2 5 10 5 15a7 7 0 0 0 14 0C19 10 12 2 12 2z" fill={color} />
    </Svg>
  );
}

/** Flower small — affirmation / upcoming period */
function IconFlowerSm({ size = 28, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="2.5" fill={color} />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const r = deg * (Math.PI / 180);
        const cx = 12 + 5 * Math.cos(r);
        const cy = 12 + 5 * Math.sin(r);
        return <Ellipse key={i} cx={cx} cy={cy} rx="2.5" ry="1.5" transform={`rotate(${deg} ${cx} ${cy})`} fill={color} opacity="0.7" />;
      })}
    </Svg>
  );
}

/** Star sparkle — ovulation */
function IconStar({ size = 22, color = '#FBBF24' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2 L13.5 9 L20 12 L13.5 15 L12 22 L10.5 15 L4 12 L10.5 9 Z" fill={color} />
    </Svg>
  );
}

/** Seedling — fertile window */
function IconSeedling({ size = 22, color = '#4ADE80' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="22" x2="12" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M12 10C12 7 10 4 6 4c0 4 2 7 6 6z" fill={color} opacity="0.8" />
      <Path d="M12 14c0-3 2-5 6-5c0 4-2 6-6 5z" fill={color} opacity="0.6" />
    </Svg>
  );
}

/** Heart — PMS window */
function IconHeart({ size = 22, color = '#A78BFA' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={color} />
    </Svg>
  );
}

/** Water drop — wellness */
function IconWater({ size = 22, color = '#38BDF8' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2 C12 2 5 10 5 15a7 7 0 0 0 14 0C19 10 12 2 12 2z" fill={color} />
      <Path d="M9 15 Q10 18 12 18" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none" />
    </Svg>
  );
}

/** Moon — sleep */
function IconMoon({ size = 22, color = '#818CF8' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={color} />
    </Svg>
  );
}

/** Runner — exercise */
function IconRunner({ size = 22, color = '#FB923C' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="13" cy="4" r="1.5" fill={color} />
      <Path d="M7 20l3-5 3 2 2-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M10 9l1 4 4 1 2-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

/** Checkmark — regularity */
function IconCheck({ size = 16, color = '#4ADE80' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="20,6 9,17 4,12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

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
            <View style={styles.greetingRow}>
              <Text style={[styles.greeting, { color: colors.text.secondary }]}>
                {greeting()}{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}
              </Text>
              <IconSparkle size={14} color={COLORS.primary[400]} />
            </View>
            <Text style={[styles.dateText, { color: colors.text.tertiary }]}>
              {format(new Date(), 'EEEE, MMMM d')}
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Profile')}
            style={[styles.avatarButton, { backgroundColor: COLORS.primary[100] }]}
          >
            <IconUser size={18} color={COLORS.primary[500]} />
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
            icon={isOnPeriod
              ? <IconStop size={22} color={COLORS.primary[500]} />
              : <IconFlower size={22} color={COLORS.primary[500]} />}
            label={isOnPeriod ? 'End period' : 'Start period'}
            color={COLORS.primary[500]}
            onPress={() => isOnPeriod ? endPeriod() : startPeriod()}
          />
          <QuickLogButton
            icon={<IconPill size={22} color={COLORS.secondary[400]} />}
            label="Symptoms"
            color={COLORS.secondary[400]}
            onPress={() => navigation.navigate('Track', { screen: 'SymptomTracker' })}
          />
          <QuickLogButton
            icon={<IconSmile size={22} color={COLORS.tertiary[400]} />}
            label="Mood"
            color={COLORS.tertiary[400]}
            onPress={() => navigation.navigate('Track', { screen: 'MoodTracker' })}
          />
          <QuickLogButton
            icon={<IconBook size={22} color="#4ADE80" />}
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
                  <IconDrop size={13} color={COLORS.primary[500]} />
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
          <IconFlowerSm size={28} color={COLORS.primary[400]} />
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
                icon={<IconFlowerSm size={22} color={COLORS.period} />}
                title="Period"
                date={prediction.next_period_start}
                color={COLORS.period}
              />
              <UpcomingEvent
                icon={<IconStar size={22} color={COLORS.ovulation} />}
                title="Ovulation"
                date={prediction.ovulation_date}
                color={COLORS.ovulation}
              />
              <UpcomingEvent
                icon={<IconSeedling size={22} color={COLORS.fertile} />}
                title="Fertile window"
                date={prediction.fertile_window_start}
                color={COLORS.fertile}
              />
              <UpcomingEvent
                icon={<IconHeart size={22} color={COLORS.pms} />}
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
            <WellnessTile icon={<IconWater size={22} color="#38BDF8" />} label="Water" value={todayLog?.water_intake ?? 0} unit="glasses" onPress={() => navigation.navigate('Track', { screen: 'WellnessTracker' })} />
            <WellnessTile icon={<IconMoon size={22} color="#818CF8" />} label="Sleep" value={todayLog?.sleep_hours ?? 0} unit="hrs" onPress={() => navigation.navigate('Track', { screen: 'WellnessTracker' })} />
            <WellnessTile icon={<IconRunner size={22} color="#FB923C" />} label="Exercise" value={todayLog?.exercise_minutes ?? 0} unit="min" onPress={() => navigation.navigate('Track', { screen: 'WellnessTracker' })} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function QuickLogButton({ icon, label, color, onPress }: { icon: React.ReactNode; label: string; color: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.quickLogBtn, { backgroundColor: color + '18' }]}>
      <View style={styles.quickLogIcon}>{icon}</View>
      <Text style={[styles.quickLogLabel, { color: colors.text.secondary }]}>{label}</Text>
    </Pressable>
  );
}

function UpcomingEvent({ icon, title, date, color }: { icon: React.ReactNode; title: string; date: string; color: string }) {
  const { colors } = useTheme();
  const d = parseISO(date);
  const label = isToday(d) ? 'Today' : format(d, 'MMM d');
  return (
    <View style={[styles.eventCard, { backgroundColor: color + '18', borderColor: color + '40' }]}>
      <View style={styles.eventIcon}>{icon}</View>
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

function WellnessTile({ icon, label, value, unit, onPress }: { icon: React.ReactNode; label: string; value: number; unit: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.wellnessTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.wellnessTileIcon}>{icon}</View>
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
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
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
  quickLogIcon: { alignItems: 'center', justifyContent: 'center' },
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
  eventIcon: { alignItems: 'center', justifyContent: 'center' },
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
  wellnessTileIcon: { alignItems: 'center', justifyContent: 'center' },
  wellnessTileValue: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES.xl },
  wellnessTileUnit: { fontFamily: FONTS.body.regular, fontSize: 10 },
  wellnessTileLabel: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.xs },
});