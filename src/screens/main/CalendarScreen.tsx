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

      // Mark each day in range
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
              icon="🌸"
              label="Next period"
              date={prediction.next_period_start}
              color={COLORS.period}
            />
            <PredictionRow
              icon="✨"
              label="Ovulation"
              date={prediction.ovulation_date}
              color={COLORS.ovulation}
            />
            <PredictionRow
              icon="🌱"
              label="Fertile window"
              date={`${prediction.fertile_window_start} – ${prediction.fertile_window_end}`}
              color={COLORS.fertile}
              isRange
            />
            <PredictionRow
              icon="💜"
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

function DayDetailCard({ log }: { log: DayEntry }) {
  const { colors } = useTheme();
  const symptoms = (log.symptoms as any[]) || [];
  const moods = (log.moods as string[]) || [];

  return (
    <Card style={styles.dayDetailCard}>
      <View style={styles.dayDetailRow}>
        {log.is_period && (
          <View style={[styles.dayDetailChip, { backgroundColor: COLORS.period + '20' }]}>
            <Text style={{ fontSize: 14 }}>🩸</Text>
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
        <Text style={[styles.dayDetailMeta, { color: colors.text.secondary }]}>
          😴 {log.sleep_hours}h sleep  💧 {log.water_intake || 0} glasses  🏃 {log.exercise_minutes || 0} min
        </Text>
      )}
      {log.notes && (
        <Text style={[styles.dayDetailNotes, { color: colors.text.secondary }]} numberOfLines={2}>
          📝 {log.notes}
        </Text>
      )}
    </Card>
  );
}

function PredictionRow({ icon, label, date, color, isRange }: { icon: string; label: string; date: string; color: string; isRange?: boolean }) {
  const { colors } = useTheme();
  const formatted = isRange ? date : format(parseISO(date), 'MMM d');
  return (
    <View style={[styles.predictionRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.predIconBg, { backgroundColor: color + '20' }]}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
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
  dayDetailMeta: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs, marginTop: SPACING[2] },
  dayDetailNotes: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs, marginTop: SPACING[1] },
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
