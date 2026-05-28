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

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - SPACING[5] * 2 - SPACING[8];

type Tab = 'overview' | 'symptoms' | 'mood' | 'wellness';

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

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'symptoms', label: 'Symptoms', icon: '💊' },
    { key: 'mood', label: 'Mood', icon: '🎭' },
    { key: 'wellness', label: 'Wellness', icon: '🌿' },
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
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, { color: activeTab === tab.key ? '#FFFFFF' : colors.text.secondary }]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.content}>
        {/* ── Overview Tab ──────────────────────────────────── */}
        {activeTab === 'overview' && (
          <>
            {/* Cycle stats cards */}
            {stats && (
              <View style={styles.statsGrid}>
                <StatCard label="Avg cycle" value={`${stats.average_length}d`} icon="🔄" color={COLORS.primary[400]} />
                <StatCard label="Avg period" value={`${stats.average_period_length}d`} icon="🩸" color="#F472B6" />
                <StatCard label="Shortest" value={`${stats.shortest_cycle}d`} icon="↓" color="#34D399" />
                <StatCard label="Longest" value={`${stats.longest_cycle}d`} icon="↑" color="#60A5FA" />
              </View>
            )}

            {/* Regularity indicator */}
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
                    {stats.cycle_regularity === 'regular' ? 'Consistent cycle length ✨'
                      : stats.cycle_regularity === 'slightly_irregular' ? '±5 day variance'
                      : 'High variance — track more'}
                  </Text>
                </View>
              </View>
            )}

            {/* Cycle length bar chart */}
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

            {/* Insights */}
            {insights.length > 0 && (
              <>
                <SectionHeader title="Personalized insights" />
                {insights.map(insight => (
                  <View key={insight.id} style={[styles.insightRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.insightIconBg, { backgroundColor: insight.color + '20' }]}>
                      <Text style={{ fontSize: 20 }}>{insight.icon}</Text>
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

        {/* ── Symptoms Tab ──────────────────────────────────── */}
        {activeTab === 'symptoms' && (
          <>
            <Text style={[styles.tabIntro, { color: colors.text.secondary }]}>
              Most logged symptoms over the past 6 months
            </Text>
            {topSymptoms.length === 0 ? (
              <EmptyAnalytics icon="💊" message="Log symptoms to see patterns" />
            ) : (
              topSymptoms.map(([symptom, count]) => {
                const config = SYMPTOMS_CONFIG[symptom as keyof typeof SYMPTOMS_CONFIG];
                const max = topSymptoms[0]?.[1] || 1;
                return config ? (
                  <View key={symptom} style={[styles.freqRow, { borderBottomColor: colors.border }]}>
                    <Text style={{ fontSize: 20, width: 30 }}>{config.icon}</Text>
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

        {/* ── Mood Tab ──────────────────────────────────── */}
        {activeTab === 'mood' && (
          <>
            <Text style={[styles.tabIntro, { color: colors.text.secondary }]}>
              Your emotional patterns over the past 60 days
            </Text>
            {moodCounts.length === 0 ? (
              <EmptyAnalytics icon="🎭" message="Log your mood to see trends" />
            ) : (
              <>
                <View style={styles.moodGrid}>
                  {moodCounts.map(([mood, count]) => {
                    const config = MOODS_CONFIG[mood as keyof typeof MOODS_CONFIG];
                    return config ? (
                      <View key={mood} style={[styles.moodStatCard, { backgroundColor: config.color + '20', borderColor: config.color + '40' }]}>
                        <Text style={styles.moodStatEmoji}>{config.emoji}</Text>
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

        {/* ── Wellness Tab ──────────────────────────────────── */}
        {activeTab === 'wellness' && (
          <>
            <View style={styles.wellnessStatsGrid}>
              <WellnessStatCard icon="😴" label="Avg sleep" value={`${avgSleep}h`} color="#818CF8" />
              <WellnessStatCard icon="💧" label="Avg water" value={`${avgWater} gl`} color="#60A5FA" />
              <WellnessStatCard icon="🏃‍♀️" label="Active days" value={`${wellnessData.filter(d => d.exercise_minutes > 0).length}`} color="#4ADE80" />
            </View>

            {wellnessData.length === 0 ? (
              <EmptyAnalytics icon="🌿" message="Track wellness daily to see trends" />
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

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: color + '15', borderColor: color + '30' }]}>
      <Text style={styles.statCardIcon}>{icon}</Text>
      <Text style={[styles.statCardValue, { color }]}>{value}</Text>
      <Text style={[styles.statCardLabel, { color: colors.text.secondary }]}>{label}</Text>
    </View>
  );
}

function WellnessStatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wStatCard, { backgroundColor: color + '15', borderColor: color + '30' }]}>
      <Text style={{ fontSize: 24 }}>{icon}</Text>
      <Text style={[{ fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES.xl, color }]}>{value}</Text>
      <Text style={[{ fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs, color: colors.text.secondary }]}>{label}</Text>
    </View>
  );
}

function EmptyAnalytics({ icon, message }: { icon: string; message: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.emptyAnalytics}>
      <Text style={{ fontSize: 40 }}>{icon}</Text>
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
  tabIcon: { fontSize: 14 },
  tabLabel: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.sm },
  content: { paddingHorizontal: SPACING[5], paddingBottom: SPACING[8] },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING[3], marginBottom: SPACING[4] },
  statCard: { width: '47%', borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING[4], alignItems: 'center', gap: 4 },
  statCardIcon: { fontSize: 22 },
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
  freqLabel: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.sm, width: 110 },
  freqBarWrap: { flex: 1, height: 8, backgroundColor: '#EDE1D9', borderRadius: 4, overflow: 'hidden' },
  freqBar: { height: 8, borderRadius: 4 },
  freqCount: { fontFamily: FONTS.body.bold, fontSize: FONT_SIZES.sm, width: 30, textAlign: 'right' },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING[3], marginBottom: SPACING[4] },
  moodStatCard: { width: '30%', borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING[3], alignItems: 'center', gap: 4 },
  moodStatEmoji: { fontSize: 24 },
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
  emptyAnalytics: { alignItems: 'center', paddingVertical: SPACING[10], gap: SPACING[3] },
});
