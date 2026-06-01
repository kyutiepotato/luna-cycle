import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format, subDays, parseISO } from 'date-fns';
import { useCycle } from '../../context/CycleContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cycleService } from '../../services/cycleService';
import { Screen } from '../../components/common/Screen';
import { Card, SectionHeader } from '../../components/common/UIComponents';
import { generateInsights } from '../../services/insightsService';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, CYCLE_PHASES, SYMPTOMS_CONFIG, MOODS_CONFIG } from '../../constants/theme';
import Svg, { Path, Circle, Ellipse, Line, Rect, Polyline, G } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - SPACING[5] * 2 - SPACING[8];

type Tab = 'overview' | 'symptoms' | 'mood' | 'wellness';

// ─── SVG Icons ──────────────────────────────────────────────────────────────

/** Bar chart — Overview tab */
function IconBarChart({ size = 16, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="12" width="4" height="9" rx="1" fill={color} opacity="0.6" />
      <Rect x="10" y="7" width="4" height="14" rx="1" fill={color} />
      <Rect x="17" y="3" width="4" height="18" rx="1" fill={color} opacity="0.8" />
    </Svg>
  );
}

/** Pill — Symptoms tab */
function IconPill({ size = 16, color = '#A78BFA' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 12.5L12.5 4.5a5.657 5.657 0 0 1 8 8l-8 8a5.657 5.657 0 0 1-8-8z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round"
      />
      <Line x1="8" y1="8" x2="16" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

/** Drama / mood masks — Mood tab */
function IconMask({ size = 16, color = '#FB923C' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 4h6a2 2 0 0 1 2 2v5a4 4 0 0 1-8 0V6a2 2 0 0 1 0-2z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round"
      />
      <Path d="M8 10 Q9 11.5 10 10" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <Path
        d="M13 8h6a2 2 0 0 1 2 2v3a4 4 0 0 1-8 0V10a2 2 0 0 1 0-2z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round"
      />
      <Path d="M16 14 Q17 12.5 18 14" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** Leaf / seedling — Wellness tab */
function IconLeaf({ size = 16, color = '#4ADE80' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 20C6 20 8 14 12 10C16 6 21 5 21 5C21 5 20 10 16 14C12 18 6 20 6 20Z"
        fill={color} opacity="0.85"
      />
      <Line x1="6" y1="20" x2="12" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

/** Cycle arrows — Avg cycle stat */
function IconCycle({ size = 22, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 12a9 9 0 0 1 15-6.7L21 8"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"
      />
      <Path
        d="M21 12a9 9 0 0 1-15 6.7L3 16"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"
      />
      <Path d="M17 5l4 3-3 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M7 19l-4-3 3-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

/** Drop — Avg period stat */
function IconDrop({ size = 22, color = '#F472B6' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2 C12 2 5 10 5 15a7 7 0 0 0 14 0C19 10 12 2 12 2z" fill={color} />
      <Path d="M9 15 Q10 18 12 18" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none" />
    </Svg>
  );
}

/** Arrow down — Shortest */
function IconArrowDown({ size = 22, color = '#34D399' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="4" x2="12" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M6 14l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

/** Arrow up — Longest */
function IconArrowUp({ size = 22, color = '#60A5FA' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="20" x2="12" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M6 10l6-6 6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

/** Moon — Sleep */
function IconMoon({ size = 24, color = '#818CF8' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={color} />
    </Svg>
  );
}

/** Water drop — Water */
function IconWater({ size = 24, color = '#60A5FA' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2 C12 2 5 10 5 15a7 7 0 0 0 14 0C19 10 12 2 12 2z" fill={color} />
      <Path d="M9 15 Q10 18 12 18" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none" />
    </Svg>
  );
}

/** Runner — Active days */
function IconRunner({ size = 24, color = '#4ADE80' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="13" cy="4" r="1.5" fill={color} />
      <Path d="M7 20l3-5 3 2 2-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M10 9l1 4 4 1 2-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

/** Sparkle — for insights with unknown/generic icon keys */
function IconSparkle({ size = 20, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2 L13.5 9 L20 12 L13.5 15 L12 22 L10.5 15 L4 12 L10.5 9 Z" fill={color} />
      <Circle cx="19" cy="5" r="1.5" fill={color} opacity="0.6" />
      <Circle cx="5" cy="19" r="1" fill={color} opacity="0.4" />
    </Svg>
  );
}

/**
 * Resolves an insight type key to an SVG icon.
 * Pass insight.type (e.g. 'chart', 'period', 'sleep') instead of insight.icon.
 * Falls back to IconSparkle for unknown keys.
 */
function InsightIcon({ iconKey, color }: { iconKey: string; color: string }) {
  const size = 20;
  switch (iconKey) {
    case 'chart':
    case 'overview':
    case 'trend':      return <IconBarChart size={size} color={color} />;
    case 'period':
    case 'flow':       return <IconDrop size={size} color={color} />;
    case 'sleep':      return <IconMoon size={size} color={color} />;
    case 'water':
    case 'hydration':  return <IconWater size={size} color={color} />;
    case 'exercise':
    case 'activity':   return <IconRunner size={size} color={color} />;
    case 'cycle':
    case 'regularity': return <IconCycle size={size} color={color} />;
    case 'symptom':    return <IconPill size={size} color={color} />;
    case 'wellness':
    case 'nutrition':  return <IconLeaf size={size} color={color} />;
    case 'mood':       return <IconMask size={size} color={color} />;
    default:           return <IconSparkle size={size} color={color} />;
  }
}

/**
 * Resolves a symptom type key to an SVG icon.
 * Pass the symptom key string (e.g. 'cramps', 'bloating') from SYMPTOMS_CONFIG.
 * Common groupings are mapped below; everything else falls back to IconSparkle.
 */
function SymptomIcon({ iconKey, color }: { iconKey: string; color: string }) {
  const size = 20;
  switch (iconKey) {
    case 'cramps':
    case 'headache':
    case 'backpain':
    case 'pain':       return <IconPill size={size} color={color} />;
    case 'spotting':
    case 'bleeding':
    case 'flow':       return <IconDrop size={size} color={color} />;
    case 'bloating':
    case 'nausea':
    case 'fatigue':
    case 'wellness':   return <IconLeaf size={size} color={color} />;
    case 'acne':
    case 'tender':     return <IconSparkle size={size} color={color} />;
    default:           return <IconSparkle size={size} color={color} />;
  }
}

/**
 * Resolves a mood key to an expressive SVG face.
 * Pass the mood key string (e.g. 'happy', 'anxious') from MOODS_CONFIG
 * instead of the emoji field.
 */
function MoodIcon({ moodKey, color }: { moodKey: string; color: string }) {
  const size = 24;

  switch (moodKey) {
    case 'sad':
    case 'overwhelmed':
    case 'low':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" />
          <Circle cx="9" cy="10" r="1" fill={color} />
          <Circle cx="15" cy="10" r="1" fill={color} />
          <Path d="M8.5 15.5 Q12 12 15.5 15.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </Svg>
      );

    case 'anxious':
    case 'nervous':
    case 'stressed':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" />
          <Path d="M8 9.5 Q9 8 10 9.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <Path d="M14 9.5 Q15 8 16 9.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <Path d="M9 14.5 Q12 13 15 14.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </Svg>
      );

    case 'irritable':
    case 'angry':
    case 'frustrated':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" />
          <Path d="M8 8.5 L10 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M16 8.5 L14 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <Circle cx="9" cy="11" r="1" fill={color} />
          <Circle cx="15" cy="11" r="1" fill={color} />
          <Path d="M8.5 15.5 Q12 12 15.5 15.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </Svg>
      );

    case 'energetic':
    case 'excited':
    case 'motivated':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2 L13.5 9 L20 12 L13.5 15 L12 22 L10.5 15 L4 12 L10.5 9 Z" fill={color} />
        </Svg>
      );

    case 'focused':
    case 'calm':
    case 'neutral':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" />
          <Circle cx="9" cy="10" r="1" fill={color} />
          <Circle cx="15" cy="10" r="1" fill={color} />
          <Line x1="9" y1="14" x2="15" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );

    // happy / content / hopeful / default
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" />
          <Circle cx="9" cy="10" r="1" fill={color} />
          <Circle cx="15" cy="10" r="1" fill={color} />
          <Path d="M8.5 14.5 Q12 18 15.5 14.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </Svg>
      );
  }
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const { cycles, stats, prediction } = useCycle();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [symptomFreq, setSymptomFreq] = useState<Record<string, number>>({});
  const [moodHistory, setMoodHistory] = useState<{ date: string; moods: string[] }[]>([]);
  const [wellnessData, setWellnessData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [sf, mh, wd] = await Promise.all([
        cycleService.getSymptomFrequency(user.id, 6),
        cycleService.getMoodHistory(user.id, 60),
        cycleService.getWellnessHistory(user.id, 30),
      ]);
      setSymptomFreq(sf);
      setMoodHistory(mh);
      setWellnessData(wd);
    })();
  }, [user]);

  const insights = useMemo(() => generateInsights({
    prediction: prediction ?? undefined,
    stats: stats ?? undefined,
  }), [prediction, stats]);

  const cycleLengthHistory = useMemo(() => {
    const lengths: { label: string; length: number }[] = [];
    for (let i = 1; i < cycles.length; i++) {
      const prev = cycles[i];
      const curr = cycles[i - 1];
      const diff = Math.abs(
        (new Date(curr.start_date).getTime() - new Date(prev.start_date).getTime()) / 86400000
      );
      if (diff >= 15 && diff <= 60) {
        lengths.push({ label: format(parseISO(prev.start_date), 'MMM'), length: diff });
      }
    }
    return lengths.slice(-6).reverse();
  }, [cycles]);

  const topSymptoms = useMemo(() =>
    Object.entries(symptomFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8),
    [symptomFreq]
  );

  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    moodHistory.forEach(({ moods }) => {
      moods.forEach(m => { counts[m] = (counts[m] || 0) + 1; });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [moodHistory]);

  const avgSleep = useMemo(() => {
    const withSleep = wellnessData.filter(d => d.sleep_hours);
    return withSleep.length ? (withSleep.reduce((s, d) => s + d.sleep_hours, 0) / withSleep.length).toFixed(1) : '—';
  }, [wellnessData]);

  const avgWater = useMemo(() => {
    const withWater = wellnessData.filter(d => d.water_intake);
    return withWater.length ? Math.round(withWater.reduce((s, d) => s + d.water_intake, 0) / withWater.length) : '—';
  }, [wellnessData]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <IconBarChart size={14} color={activeTab === 'overview' ? '#FFFFFF' : COLORS.primary[400]} /> },
    { key: 'symptoms', label: 'Symptoms', icon: <IconPill size={14} color={activeTab === 'symptoms' ? '#FFFFFF' : '#A78BFA'} /> },
    { key: 'mood', label: 'Mood', icon: <IconMask size={14} color={activeTab === 'mood' ? '#FFFFFF' : '#FB923C'} /> },
    { key: 'wellness', label: 'Wellness', icon: <IconLeaf size={14} color={activeTab === 'wellness' ? '#FFFFFF' : '#4ADE80'} /> },
  ];

  return (
    <Screen scroll padding={false} style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <LinearGradient colors={['#EDE9FE50', colors.background]} style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Insights</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          {stats ? `${stats.cycles_tracked} cycles · ${format(new Date(), 'MMMM yyyy')}` : 'Start tracking to see insights'}
        </Text>
      </LinearGradient>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
        <View style={styles.tabs}>
          {tabs.map(tab => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tab,
                {
                  backgroundColor: activeTab === tab.key ? COLORS.primary[500] : colors.surfaceTertiary,
                  borderColor: activeTab === tab.key ? COLORS.primary[500] : colors.border,
                },
              ]}
            >
              <View style={styles.tabIconWrapper}>{tab.icon}</View>
              <Text style={[styles.tabLabel, { color: activeTab === tab.key ? '#FFFFFF' : colors.text.secondary }]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.content}>
        {/* ── Overview Tab ────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <>
            {stats && (
              <View style={styles.statsGrid}>
                <StatCard label="Avg cycle" value={`${stats.average_length}d`} icon={<IconCycle size={22} color={COLORS.primary[400]} />} color={COLORS.primary[400]} />
                <StatCard label="Avg period" value={`${stats.average_period_length}d`} icon={<IconDrop size={22} color="#F472B6" />} color="#F472B6" />
                <StatCard label="Shortest" value={`${stats.shortest_cycle}d`} icon={<IconArrowDown size={22} color="#34D399" />} color="#34D399" />
                <StatCard label="Longest" value={`${stats.longest_cycle}d`} icon={<IconArrowUp size={22} color="#60A5FA" />} color="#60A5FA" />
              </View>
            )}

            {stats && (
              <View style={[styles.regularityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.regularityLabel, { color: colors.text.secondary }]}>Cycle regularity</Text>
                <View style={styles.regularityRow}>
                  <View style={[styles.regularityDot, {
                    backgroundColor: stats.cycle_regularity === 'regular' ? '#4ADE80'
                      : stats.cycle_regularity === 'slightly_irregular' ? '#FCD34D' : '#F87171',
                  }]} />
                  <Text style={[styles.regularityText, { color: colors.text.primary }]}>
                    {stats.cycle_regularity === 'regular' ? 'Regular'
                      : stats.cycle_regularity === 'slightly_irregular' ? 'Slightly irregular'
                      : 'Irregular'}
                  </Text>
                  <Text style={[styles.regularityHint, { color: colors.text.tertiary }]}>
                    {stats.cycle_regularity === 'regular' ? 'Consistent cycle length'
                      : stats.cycle_regularity === 'slightly_irregular' ? '±5 day variance'
                      : 'High variance — track more'}
                  </Text>
                </View>
              </View>
            )}

            {cycleLengthHistory.length > 1 && (
              <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.chartTitle, { color: colors.text.primary }]}>Cycle length history</Text>
                <View style={styles.barChart}>
                  {cycleLengthHistory.map((c, i) => {
                    const maxLen = Math.max(...cycleLengthHistory.map(x => x.length));
                    const h = (c.length / maxLen) * 120;
                    return (
                      <View key={i} style={styles.barCol}>
                        <Text style={[styles.barValue, { color: COLORS.primary[500] }]}>{c.length}</Text>
                        <View style={[styles.bar, { height: h, backgroundColor: COLORS.primary[300] + 'AA' }]}>
                          <LinearGradient colors={[COLORS.primary[300], COLORS.primary[500]]} style={{ flex: 1, borderRadius: 4 }} />
                        </View>
                        <Text style={[styles.barLabel, { color: colors.text.tertiary }]}>{c.label}</Text>
                      </View>
                    );
                  })}
                </View>
                <View style={[styles.avgLine, { backgroundColor: colors.border }]}>
                  <Text style={[styles.avgLabel, { color: colors.text.tertiary }]}>
                    Avg: {stats?.average_length}d
                  </Text>
                </View>
              </View>
            )}

            {insights.length > 0 && (
              <>
                <SectionHeader title="Personalized insights" />
                {insights.map(insight => (
                  <View key={insight.id} style={[styles.insightRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.insightIconBg, { backgroundColor: insight.color + '20' }]}>
                      <InsightIcon iconKey={insight.type ?? insight.id} color={insight.color} />
                    </View>
                    <View style={styles.insightText}>
                      <Text style={[styles.insightTitle, { color: colors.text.primary }]}>{insight.title}</Text>
                      <Text style={[styles.insightBody, { color: colors.text.secondary }]}>{insight.body}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {/* ── Symptoms Tab ────────────────────────────────────── */}
        {activeTab === 'symptoms' && (
          <>
            <Text style={[styles.tabIntro, { color: colors.text.secondary }]}>
              Most logged symptoms over the past 6 months
            </Text>
            {topSymptoms.length === 0 ? (
              <EmptyAnalytics icon={<IconPill size={40} color={COLORS.secondary[300]} />} message="Log symptoms to see patterns" />
            ) : (
              topSymptoms.map(([symptom, count]) => {
                const config = SYMPTOMS_CONFIG[symptom as keyof typeof SYMPTOMS_CONFIG];
                const max = topSymptoms[0]?.[1] || 1;
                return config ? (
                  <View key={symptom} style={[styles.freqRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.freqIconWrapper}>
                      <SymptomIcon iconKey={symptom} color={config.color} />
                    </View>
                    <Text style={[styles.freqLabel, { color: colors.text.primary }]}>{config.label}</Text>
                    <View style={styles.freqBarWrap}>
                      <View style={[styles.freqBar, { width: `${(count / max) * 100}%`, backgroundColor: config.color + '80' }]} />
                    </View>
                    <Text style={[styles.freqCount, { color: config.color }]}>{count}×</Text>
                  </View>
                ) : null;
              })
            )}
          </>
        )}

        {/* ── Mood Tab ────────────────────────────────────── */}
        {activeTab === 'mood' && (
          <>
            <Text style={[styles.tabIntro, { color: colors.text.secondary }]}>
              Your emotional patterns over the past 60 days
            </Text>
            {moodCounts.length === 0 ? (
              <EmptyAnalytics icon={<IconMask size={40} color={COLORS.tertiary[300]} />} message="Log your mood to see trends" />
            ) : (
              <>
                <View style={styles.moodGrid}>
                  {moodCounts.map(([mood, count]) => {
                    const config = MOODS_CONFIG[mood as keyof typeof MOODS_CONFIG];
                    return config ? (
                      <View key={mood} style={[styles.moodStatCard, { backgroundColor: config.color + '20', borderColor: config.color + '40' }]}>
                        <View style={styles.moodStatIconWrapper}>
                          <MoodIcon moodKey={mood} color={config.color} />
                        </View>
                        <Text style={[styles.moodStatLabel, { color: colors.text.primary }]}>{config.label}</Text>
                        <Text style={[styles.moodStatCount, { color: config.color }]}>{count}x</Text>
                      </View>
                    ) : null;
                  })}
                </View>
                <View style={[styles.moodCalHeatmap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.chartTitle, { color: colors.text.primary }]}>Last 30 days</Text>
                  <View style={styles.heatmapGrid}>
                    {Array.from({ length: 30 }).map((_, i) => {
                      const d = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd');
                      const dayMoods = moodHistory.find(m => m.date === d)?.moods || [];
                      const hasPositive = dayMoods.some(m => ['happy', 'calm', 'energetic', 'focused', 'content', 'hopeful'].includes(m));
                      const hasNegative = dayMoods.some(m => ['sad', 'anxious', 'irritable', 'overwhelmed'].includes(m));
                      const color = dayMoods.length === 0 ? colors.border
                        : hasPositive && !hasNegative ? '#4ADE8080'
                        : hasNegative && !hasPositive ? '#F8717180'
                        : '#FCD34D80';
                      return (
                        <View key={i} style={[styles.heatCell, { backgroundColor: color }]} />
                      );
                    })}
                  </View>
                  <View style={styles.heatLegend}>
                    {[{ color: '#4ADE80', label: 'Positive' }, { color: '#FCD34D', label: 'Mixed' }, { color: '#F87171', label: 'Difficult' }].map(l => (
                      <View key={l.label} style={styles.heatLegendItem}>
                        <View style={[styles.heatLegendDot, { backgroundColor: l.color }]} />
                        <Text style={[styles.heatLegendText, { color: colors.text.tertiary }]}>{l.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}
          </>
        )}

        {/* ── Wellness Tab ────────────────────────────────────── */}
        {activeTab === 'wellness' && (
          <>
            <View style={styles.wellnessStatsGrid}>
              <WellnessStatCard icon={<IconMoon size={24} color="#818CF8" />} label="Avg sleep" value={`${avgSleep}h`} color="#818CF8" />
              <WellnessStatCard icon={<IconWater size={24} color="#60A5FA" />} label="Avg water" value={`${avgWater} gl`} color="#60A5FA" />
              <WellnessStatCard icon={<IconRunner size={24} color="#4ADE80" />} label="Active days" value={`${wellnessData.filter(d => d.exercise_minutes > 0).length}`} color="#4ADE80" />
            </View>

            {wellnessData.length === 0 ? (
              <EmptyAnalytics icon={<IconLeaf size={40} color="#4ADE80" />} message="Track wellness daily to see trends" />
            ) : (
              <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.chartTitle, { color: colors.text.primary }]}>Sleep last 14 days</Text>
                <View style={styles.barChart}>
                  {wellnessData.slice(-14).map((d, i) => {
                    const h = ((d.sleep_hours || 0) / 12) * 100;
                    return (
                      <View key={i} style={styles.barCol}>
                        <View style={[styles.bar, { height: h, minHeight: 2, backgroundColor: '#818CF880' }]}>
                          <LinearGradient colors={['#A78BFA', '#818CF8']} style={{ flex: 1, borderRadius: 3 }} />
                        </View>
                        <Text style={[styles.barLabel, { color: colors.text.tertiary, fontSize: 9 }]}>
                          {format(parseISO(d.date), 'dd')}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </Screen>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: color + '15', borderColor: color + '30' }]}>
      <View style={styles.statCardIconWrapper}>{icon}</View>
      <Text style={[styles.statCardValue, { color }]}>{value}</Text>
      <Text style={[styles.statCardLabel, { color: colors.text.secondary }]}>{label}</Text>
    </View>
  );
}

function WellnessStatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wStatCard, { backgroundColor: color + '15', borderColor: color + '30' }]}>
      <View style={styles.wStatIconWrapper}>{icon}</View>
      <Text style={[{ fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES.xl, color }]}>{value}</Text>
      <Text style={[{ fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs, color: colors.text.secondary }]}>{label}</Text>
    </View>
  );
}

function EmptyAnalytics({ icon, message }: { icon: React.ReactNode; message: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.emptyAnalytics}>
      <View style={styles.emptyIconWrapper}>{icon}</View>
      <Text style={[{ fontFamily: FONTS.body.regular, color: colors.text.tertiary, textAlign: 'center' }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 60, paddingHorizontal: SPACING[5], paddingBottom: SPACING[4] },
  title: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES['3xl'], marginBottom: 4 },
  subtitle: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm },
  tabsScroll: { marginVertical: SPACING[3] },
  tabs: { flexDirection: 'row', paddingHorizontal: SPACING[5], gap: SPACING[2] },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1 },
  tabIconWrapper: { alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.sm },
  content: { paddingHorizontal: SPACING[5], paddingBottom: SPACING[8] },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING[3], marginBottom: SPACING[4] },
  statCard: { width: '47%', borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING[4], alignItems: 'center', gap: 4 },
  statCardIconWrapper: { alignItems: 'center', justifyContent: 'center' },
  statCardValue: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES['2xl'] },
  statCardLabel: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs },
  regularityCard: { borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING[4], marginBottom: SPACING[4] },
  regularityLabel: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs, marginBottom: SPACING[2] },
  regularityRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING[2] },
  regularityDot: { width: 12, height: 12, borderRadius: 6 },
  regularityText: { fontFamily: FONTS.body.bold, fontSize: FONT_SIZES.base },
  regularityHint: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs, flex: 1, textAlign: 'right' },
  chartCard: { borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING[4], marginBottom: SPACING[4] },
  chartTitle: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.base, marginBottom: SPACING[4] },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 140, gap: 4 },
  barCol: { alignItems: 'center', gap: 4, flex: 1 },
  bar: { width: '100%', borderRadius: 4, overflow: 'hidden' },
  barValue: { fontFamily: FONTS.body.bold, fontSize: 9 },
  barLabel: { fontFamily: FONTS.body.regular, fontSize: 9 },
  avgLine: { height: 1, marginTop: SPACING[2] },
  avgLabel: { fontFamily: FONTS.body.regular, fontSize: 10, textAlign: 'right' },
  insightRow: { flexDirection: 'row', gap: SPACING[3], padding: SPACING[4], borderRadius: RADIUS.xl, borderWidth: 1, marginBottom: SPACING[3] },
  insightIconBg: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  insightText: { flex: 1 },
  insightTitle: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.sm, marginBottom: 3 },
  insightBody: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs, lineHeight: 17 },
  tabIntro: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm, marginBottom: SPACING[4] },
  freqRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING[3], paddingVertical: SPACING[3], borderBottomWidth: 1 },
  freqIconWrapper: { width: 30, alignItems: 'center', justifyContent: 'center' },
  freqLabel: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.sm, width: 110 },
  freqBarWrap: { flex: 1, height: 8, backgroundColor: '#EDE1D9', borderRadius: 4, overflow: 'hidden' },
  freqBar: { height: 8, borderRadius: 4 },
  freqCount: { fontFamily: FONTS.body.bold, fontSize: FONT_SIZES.sm, width: 30, textAlign: 'right' },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING[3], marginBottom: SPACING[4] },
  moodStatCard: { width: '30%', borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING[3], alignItems: 'center', gap: 4 },
  moodStatIconWrapper: { alignItems: 'center', justifyContent: 'center' },
  moodStatLabel: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.xs },
  moodStatCount: { fontFamily: FONTS.body.bold, fontSize: FONT_SIZES.sm },
  moodCalHeatmap: { borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING[4] },
  heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: SPACING[3] },
  heatCell: { width: (CHART_WIDTH - 6 * 5) / 7, height: 20, borderRadius: 4 },
  heatLegend: { flexDirection: 'row', gap: SPACING[4] },
  heatLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heatLegendDot: { width: 10, height: 10, borderRadius: 5 },
  heatLegendText: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs },
  wellnessStatsGrid: { flexDirection: 'row', gap: SPACING[3], marginBottom: SPACING[4] },
  wStatCard: { flex: 1, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING[4], alignItems: 'center', gap: 4 },
  wStatIconWrapper: { alignItems: 'center', justifyContent: 'center' },
  emptyAnalytics: { alignItems: 'center', paddingVertical: SPACING[10], gap: SPACING[3] },
  emptyIconWrapper: { alignItems: 'center', justifyContent: 'center' },
});