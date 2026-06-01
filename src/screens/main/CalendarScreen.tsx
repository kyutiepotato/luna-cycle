import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { format, parseISO, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useCycle } from '../../context/CycleContext';
import { useTheme } from '../../context/ThemeContext';
import { CyclePredictionEngine } from '../../services/cycleEngine';
import { Card, SectionHeader } from '../../components/common/UIComponents';
import { Screen } from '../../components/common/Screen';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, CYCLE_PHASES } from '../../constants/theme';
import { DayEntry, CyclePhase } from '../../types';
import Svg, { Path, Circle, Ellipse, Line } from 'react-native-svg';

type MarkedDates = Record<string, {
  color?: string;
  textColor?: string;
  startingDay?: boolean;
  endingDay?: boolean;
  marked?: boolean;
  dotColor?: string;
  selected?: boolean;
  selectedColor?: string;
}>;

const LEGEND = [
  { color: COLORS.period, label: 'Period' },
  { color: COLORS.fertile, label: 'Fertile' },
  { color: COLORS.ovulation, label: 'Ovulation' },
  { color: COLORS.pms, label: 'PMS' },
];

// ─── SVG Icons ─────────────────────────────────────────────────────────────────

function IconDrop({ size = 13, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2 C12 2 5 10 5 15a7 7 0 0 0 14 0C19 10 12 2 12 2z" fill={color} />
    </Svg>
  );
}

function IconMoon({ size = 13, color = '#818CF8' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={color} />
    </Svg>
  );
}

function IconWater({ size = 13, color = '#38BDF8' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2 C12 2 5 10 5 15a7 7 0 0 0 14 0C19 10 12 2 12 2z" fill={color} />
      <Path d="M9 15 Q10 18 12 18" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none" />
    </Svg>
  );
}

function IconRunner({ size = 13, color = '#FB923C' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="13" cy="4" r="1.5" fill={color} />
      <Path d="M7 20l3-5 3 2 2-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M10 9l1 4 4 1 2-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function IconNote({ size = 13, color = '#94A3B8' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round"
      />
      <Path d="M14 3v6h6" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Line x1="8" y1="13" x2="16" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="8" y1="17" x2="13" y2="17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function IconFlowerSm({ size = 16, color = '#C084A0' }: { size?: number; color?: string }) {
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

function IconStar({ size = 16, color = '#FBBF24' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2 L13.5 9 L20 12 L13.5 15 L12 22 L10.5 15 L4 12 L10.5 9 Z" fill={color} />
    </Svg>
  );
}

function IconSeedling({ size = 16, color = '#4ADE80' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="22" x2="12" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M12 10C12 7 10 4 6 4c0 4 2 7 6 6z" fill={color} opacity="0.8" />
      <Path d="M12 14c0-3 2-5 6-5c0 4-2 6-6 5z" fill={color} opacity="0.6" />
    </Svg>
  );
}

function IconHeart({ size = 16, color = '#A78BFA' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={color} />
    </Svg>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function CalendarScreen() {
  const { cycles, prediction, getDayLogs, stats } = useCycle();
  const { colors, isDark } = useTheme();
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedDayLog, setSelectedDayLog] = useState<DayEntry | null>(null);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));

  const engine = useMemo(() => new CyclePredictionEngine(cycles), [cycles]);

  // Build marked dates from actual logs + predictions
  const markedDates = useMemo((): MarkedDates => {
    const marks: MarkedDates = {};
    const today = format(new Date(), 'yyyy-MM-dd');

    // Mark actual period days from cycles
    cycles.forEach(cycle => {
      const start = cycle.start_date;
      const end = cycle.end_date || start;

      let d = parseISO(start);
      const endD = parseISO(end);
      while (d <= endD) {
        const ds = format(d, 'yyyy-MM-dd');
        marks[ds] = {
          color: COLORS.period,
          textColor: '#FFFFFF',
          startingDay: ds === start,
          endingDay: ds === end,
        };
        d = new Date(d.getTime() + 86400000);
      }
    });

    // Add predictions
    const predicted = engine.generatePredictedDays(3);
    predicted.forEach(pd => {
      if (!marks[pd.date]) {
        const colorMap: Record<string, string> = {
          period: COLORS.period + '80',
          fertile: COLORS.fertile + '99',
          ovulation: COLORS.ovulation + 'BB',
          pms: COLORS.pms + '80',
        };
        marks[pd.date] = {
          color: colorMap[pd.type] || COLORS.primary[200],
          textColor: pd.type === 'ovulation' ? '#7C3AED' : pd.type === 'pms' ? '#6D28D9' : '#374151',
          startingDay: true,
          endingDay: true,
        };
      }
    });

    // Highlight selected date
    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: marks[selectedDate]?.color || COLORS.primary[400],
      };
    }

    // Today
    if (!marks[today]) {
      marks[today] = { marked: true, dotColor: COLORS.primary[400] };
    }

    return marks;
  }, [cycles, engine, selectedDate]);

  const handleDayPress = async (day: DateData) => {
    setSelectedDate(day.dateString);
    try {
      const start = day.dateString;
      const logs = await getDayLogs(start, start);
      setSelectedDayLog(logs[0] || null);
    } catch { }
  };

  const calendarTheme = {
    backgroundColor: colors.surface,
    calendarBackground: colors.surface,
    textSectionTitleColor: colors.text.secondary,
    selectedDayBackgroundColor: COLORS.primary[500],
    selectedDayTextColor: '#FFFFFF',
    todayTextColor: COLORS.primary[500],
    dayTextColor: colors.text.primary,
    textDisabledColor: colors.text.tertiary,
    dotColor: COLORS.primary[500],
    monthTextColor: colors.text.primary,
    indicatorColor: COLORS.primary[500],
    textDayFontFamily: FONTS.body.regular,
    textMonthFontFamily: FONTS.display.semiBold,
    textDayHeaderFontFamily: FONTS.body.medium,
    textDayFontSize: 14,
    textMonthFontSize: 17,
    textDayHeaderFontSize: 12,
    arrowColor: COLORS.primary[500],
  };

  const selectedLog = selectedDayLog;
  const isSelectedPeriod = markedDates[selectedDate]?.color?.startsWith(COLORS.period.substring(0, 7));

  return (
    <Screen scroll padding={false} style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: 60, backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Cycle Calendar</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          {stats ? `${stats.cycles_tracked} cycles tracked · Avg ${stats.average_length}d` : 'Start tracking your cycle'}
        </Text>
      </View>

      {/* Calendar */}
      <View style={[styles.calendarWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Calendar
          markingType="period"
          markedDates={markedDates}
          onDayPress={handleDayPress}
          theme={calendarTheme}
          style={styles.calendar}
          enableSwipeMonths
        />
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        {LEGEND.map(l => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: l.color }]} />
            <Text style={[styles.legendText, { color: colors.text.secondary }]}>{l.label}</Text>
          </View>
        ))}
      </View>

      {/* Selected Day Detail */}
      <View style={styles.detailSection}>
        <Text style={[styles.selectedDateLabel, { color: colors.text.primary }]}>
          {format(parseISO(selectedDate), 'MMMM d, yyyy')}
        </Text>

        {selectedLog ? (
          <DayDetailCard log={selectedLog} />
        ) : (
          <View style={[styles.emptyDay, { backgroundColor: colors.surfaceTertiary }]}>
            <Text style={[styles.emptyDayText, { color: colors.text.tertiary }]}>
              No data logged for this day
            </Text>
          </View>
        )}
      </View>

      {/* Upcoming Predictions */}
      {prediction && (
        <View style={styles.upcomingSection}>
          <SectionHeader title="Upcoming predictions" />
          <View style={styles.predictionsList}>
            <PredictionRow
              icon={<IconFlowerSm size={16} color={COLORS.period} />}
              label="Next period"
              date={prediction.next_period_start}
              color={COLORS.period}
            />
            <PredictionRow
              icon={<IconStar size={16} color={COLORS.ovulation} />}
              label="Ovulation"
              date={prediction.ovulation_date}
              color={COLORS.ovulation}
            />
            <PredictionRow
              icon={<IconSeedling size={16} color={COLORS.fertile} />}
              label="Fertile window"
              date={`${prediction.fertile_window_start} – ${prediction.fertile_window_end}`}
              color={COLORS.fertile}
              isRange
            />
            <PredictionRow
              icon={<IconHeart size={16} color={COLORS.pms} />}
              label="PMS window"
              date={prediction.pms_start}
              color={COLORS.pms}
            />
          </View>
          <View style={[styles.confidenceBar, { backgroundColor: colors.surfaceTertiary }]}>
            <Text style={[styles.confidenceLabel, { color: colors.text.secondary }]}>
              Prediction confidence
            </Text>
            <View style={styles.confidenceTrack}>
              <View
                style={[styles.confidenceFill, {
                  width: `${prediction.confidence}%`,
                  backgroundColor: prediction.confidence >= 80 ? '#4ADE80' : prediction.confidence >= 60 ? '#FCD34D' : '#F87171',
                }]}
              />
            </View>
            <Text style={[styles.confidenceValue, { color: colors.text.primary }]}>
              {prediction.confidence}%
            </Text>
          </View>
        </View>
      )}
    </Screen>
  );
}

// ─── DayDetailCard ─────────────────────────────────────────────────────────────

function DayDetailCard({ log }: { log: DayEntry }) {
  const { colors } = useTheme();
  const symptoms = (log.symptoms as any[]) || [];
  const moods = (log.moods as string[]) || [];

  return (
    <Card style={styles.dayDetailCard}>
      <View style={styles.dayDetailRow}>
        {log.is_period && (
          <View style={[styles.dayDetailChip, { backgroundColor: COLORS.period + '20' }]}>
            <IconDrop size={14} color={COLORS.period} />
            <Text style={[styles.dayDetailChipText, { color: COLORS.period }]}>
              {log.flow ? log.flow.charAt(0).toUpperCase() + log.flow.slice(1) : 'Period'}
            </Text>
          </View>
        )}
        {moods.slice(0, 3).map((m: string) => (
          <View key={m} style={[styles.dayDetailChip, { backgroundColor: COLORS.secondary[100] }]}>
            <Text style={[styles.dayDetailChipText, { color: COLORS.secondary[600] }]}>{m}</Text>
          </View>
        ))}
        {symptoms.slice(0, 2).map((s: any) => (
          <View key={s.symptom || s} style={[styles.dayDetailChip, { backgroundColor: COLORS.tertiary[100] }]}>
            <Text style={[styles.dayDetailChipText, { color: COLORS.tertiary[600] }]}>{s.symptom || s}</Text>
          </View>
        ))}
      </View>
      {log.sleep_hours && (
        <View style={styles.dayDetailMetaRow}>
          <IconMoon size={13} color="#818CF8" />
          <Text style={[styles.dayDetailMeta, { color: colors.text.secondary }]}>
            {log.sleep_hours}h sleep
          </Text>
          <IconWater size={13} color="#38BDF8" />
          <Text style={[styles.dayDetailMeta, { color: colors.text.secondary }]}>
            {log.water_intake || 0} glasses
          </Text>
          <IconRunner size={13} color="#FB923C" />
          <Text style={[styles.dayDetailMeta, { color: colors.text.secondary }]}>
            {log.exercise_minutes || 0} min
          </Text>
        </View>
      )}
      {log.notes && (
        <View style={styles.dayDetailNotesRow}>
          <IconNote size={13} color="#94A3B8" />
          <Text style={[styles.dayDetailNotes, { color: colors.text.secondary }]} numberOfLines={2}>
            {log.notes}
          </Text>
        </View>
      )}
    </Card>
  );
}

// ─── PredictionRow ─────────────────────────────────────────────────────────────

function PredictionRow({ icon, label, date, color, isRange }: { icon: React.ReactNode; label: string; date: string; color: string; isRange?: boolean }) {
  const { colors } = useTheme();
  const formatted = isRange ? date : format(parseISO(date), 'MMM d');
  return (
    <View style={[styles.predictionRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.predIconBg, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <Text style={[styles.predLabel, { color: colors.text.primary }]}>{label}</Text>
      <Text style={[styles.predDate, { color }]}>{formatted}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: SPACING[5], paddingBottom: SPACING[4] },
  title: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES['3xl'], marginBottom: 4 },
  subtitle: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm },
  calendarWrapper: { borderRadius: RADIUS['2xl'], marginHorizontal: SPACING[5], borderWidth: 1, overflow: 'hidden', marginBottom: SPACING[4] },
  calendar: { borderRadius: RADIUS['2xl'] },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: SPACING[5], marginHorizontal: SPACING[5], marginBottom: SPACING[5] },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs },
  detailSection: { paddingHorizontal: SPACING[5], marginBottom: SPACING[5] },
  selectedDateLabel: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES.lg, marginBottom: SPACING[3] },
  emptyDay: { borderRadius: RADIUS.xl, padding: SPACING[5], alignItems: 'center' },
  emptyDayText: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm },
  dayDetailCard: {},
  dayDetailRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING[2] },
  dayDetailChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  dayDetailChipText: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.xs },
  dayDetailMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING[2] },
  dayDetailMeta: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs, marginRight: 4 },
  dayDetailNotesRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginTop: SPACING[1] },
  dayDetailNotes: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs, flex: 1 },
  upcomingSection: { paddingHorizontal: SPACING[5], marginBottom: SPACING[6] },
  predictionsList: { borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: SPACING[4] },
  predictionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING[3], borderBottomWidth: 1, gap: SPACING[3] },
  predIconBg: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  predLabel: { flex: 1, fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.sm },
  predDate: { fontFamily: FONTS.body.bold, fontSize: FONT_SIZES.sm },
  confidenceBar: { borderRadius: RADIUS.lg, padding: SPACING[4] },
  confidenceLabel: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs, marginBottom: SPACING[2] },
  confidenceTrack: { height: 6, borderRadius: 3, backgroundColor: '#EDE1D9', marginBottom: SPACING[1] },
  confidenceFill: { height: 6, borderRadius: 3 },
  confidenceValue: { fontFamily: FONTS.body.bold, fontSize: FONT_SIZES.sm, textAlign: 'right' },
});