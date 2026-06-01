import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useCycle } from '../../context/CycleContext';
import { useTheme } from '../../context/ThemeContext';
import { Screen } from '../../components/common/Screen';
import { Button } from '../../components/common/UIComponents';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS } from '../../constants/theme';
import Svg, { Path, Circle, Line, Rect, Polyline } from 'react-native-svg';

// ─── SVG Icons ─────────────────────────────────────────────────────────────────

/** Left arrow — back button */
function IconArrowLeft({ size = 24, color = '#059669' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M12 5l-7 7 7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Moon — sleep */
function IconMoon({ size = 26, color = '#818CF8' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={color} />
      <Circle cx="17" cy="5" r="1.2" fill={color} opacity="0.5" />
      <Circle cx="20" cy="8" r="0.8" fill={color} opacity="0.4" />
    </Svg>
  );
}

/** Water drop — water intake */
function IconWater({ size = 26, color = '#60A5FA' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C12 2 5 10 5 15a7 7 0 0 0 14 0C19 10 12 2 12 2z" fill={color} />
      <Path d="M9 15 Q10 18 12 18" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none" />
    </Svg>
  );
}

/** Runner — exercise */
function IconRunner({ size = 26, color = '#4ADE80' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="14" cy="4" r="2" fill={color} />
      <Path d="M6 20l4-6 3 3 3-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M11 9l2 4 4 1 2-4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

/** Thermometer — temperature */
function IconThermometer({ size = 26, color = '#E11D48' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Circle cx="11.5" cy="18.5" r="2.5" fill={color} opacity="0.8" />
      <Line x1="11.5" y1="16" x2="11.5" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// ─── Icon map for WellnessSlider ──────────────────────────────────────────────

function SliderIcon({ id, size = 26, color }: { id: string; size?: number; color: string }) {
  switch (id) {
    case 'sleep':    return <IconMoon size={size} color={color} />;
    case 'water':    return <IconWater size={size} color={color} />;
    case 'exercise': return <IconRunner size={size} color={color} />;
    default:         return null;
  }
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function WellnessTrackerScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { logWellness, getDayLog } = useCycle();
  const { colors } = useTheme();
  const date = route.params?.date || format(new Date(), 'yyyy-MM-dd');

  const [sleep, setSleep] = useState(7.5);
  const [water, setWater] = useState(6);
  const [exercise, setExercise] = useState(0);
  const [temp, setTemp] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const log = await getDayLog(date);
      if (log) {
        if (log.sleep_hours) setSleep(log.sleep_hours);
        if (log.water_intake) setWater(log.water_intake);
        if (log.exercise_minutes) setExercise(log.exercise_minutes);
        if (log.temperature) setTemp(String(log.temperature));
      }
    })();
  }, [date]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await logWellness({
        sleep_hours: sleep,
        water_intake: water,
        exercise_minutes: exercise,
        temperature: temp ? parseFloat(temp) : undefined,
      }, date);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch { Alert.alert('Error', 'Failed to save wellness data.'); }
    finally { setIsSaving(false); }
  };

  return (
    <Screen scroll padding={false} style={{ backgroundColor: colors.background }}>
      <LinearGradient colors={['#D1FAE5', colors.background]} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <IconArrowLeft size={24} color="#059669" />
        </Pressable>
        <Text style={[styles.title, { color: colors.text.primary }]}>Wellness</Text>
        <Text style={[styles.date, { color: colors.text.secondary }]}>{format(new Date(date), 'MMMM d')}</Text>
      </LinearGradient>

      <View style={styles.body}>
        {/* Sleep */}
        <WellnessSlider
          iconId="sleep" label="Sleep" value={sleep} min={0} max={12} step={0.5} unit="hours"
          color="#818CF8" onChange={setSleep}
          hint={sleep < 6 ? 'Below recommended' : sleep >= 8 ? 'Great!' : 'Almost there'}
        />

        {/* Water */}
        <WellnessSlider
          iconId="water" label="Water intake" value={water} min={0} max={16} step={1} unit="glasses"
          color="#60A5FA" onChange={setWater}
          hint={water < 6 ? 'Drink more water' : water >= 8 ? 'Well hydrated!' : 'Keep going'}
        />

        {/* Exercise */}
        <WellnessSlider
          iconId="exercise" label="Exercise" value={exercise} min={0} max={120} step={5} unit="minutes"
          color="#4ADE80" onChange={setExercise}
          hint={exercise === 0 ? 'Even a short walk counts' : exercise >= 30 ? 'Great movement!' : 'Nice!'}
        />

        {/* Temperature */}
        <View style={[styles.tempCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.tempHeader}>
            <IconThermometer size={26} color="#E11D48" />
            <View>
              <Text style={[styles.wellnessLabel, { color: colors.text.primary }]}>Basal body temperature</Text>
              <Text style={[styles.wellnessHint, { color: colors.text.tertiary }]}>Optional — helps track ovulation</Text>
            </View>
          </View>
          <View style={[styles.tempInput, { backgroundColor: colors.surfaceTertiary, borderColor: colors.border }]}>
            <TextInput
              value={temp}
              onChangeText={setTemp}
              keyboardType="decimal-pad"
              placeholder="36.5"
              placeholderTextColor={colors.text.tertiary}
              style={[styles.tempInputText, { color: colors.text.primary }]}
            />
            <Text style={[styles.tempUnit, { color: colors.text.secondary }]}>°C</Text>
          </View>
        </View>

        <Button label="Save wellness" onPress={handleSave} isLoading={isSaving} size="lg" style={styles.saveBtn} />
      </View>
    </Screen>
  );
}

function WellnessSlider({ iconId, label, value, min, max, step, unit, color, onChange, hint }: {
  iconId: string; label: string; value: number; min: number; max: number;
  step: number; unit: string; color: string; onChange: (v: number) => void; hint: string;
}) {
  const { colors } = useTheme();
  const percentage = ((value - min) / (max - min)) * 100;

  const decrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(Math.max(min, Math.round((value - step) * 10) / 10));
  };
  const increment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(Math.min(max, Math.round((value + step) * 10) / 10));
  };

  return (
    <View style={[styles.wellnessCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.wellnessHeader}>
        <View style={styles.wellnessIcon}>
          <SliderIcon id={iconId} size={26} color={color} />
        </View>
        <View style={styles.wellnessInfo}>
          <Text style={[styles.wellnessLabel, { color: colors.text.primary }]}>{label}</Text>
          <Text style={[styles.wellnessHint, { color }]}>{hint}</Text>
        </View>
        <Text style={[styles.wellnessValue, { color }]}>{value} <Text style={styles.wellnessUnit}>{unit}</Text></Text>
      </View>
      <View style={styles.sliderRow}>
        <Pressable onPress={decrement} style={[styles.sliderBtn, { backgroundColor: color + '20' }]}>
          <Text style={[styles.sliderBtnText, { color }]}>−</Text>
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
        <Pressable onPress={increment} style={[styles.sliderBtn, { backgroundColor: color + '20' }]}>
          <Text style={[styles.sliderBtnText, { color }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 60, paddingHorizontal: SPACING[5], paddingBottom: SPACING[5] },
  backBtn: { marginBottom: SPACING[3] },
  backArrow: { fontSize: 24 },
  title: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES['3xl'], marginBottom: 4 },
  date: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm },
  body: { paddingHorizontal: SPACING[5] },
  wellnessCard: { borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING[4], marginBottom: SPACING[3] },
  wellnessHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING[3], marginBottom: SPACING[3] },
  wellnessIcon: { alignItems: 'center', justifyContent: 'center' },
  wellnessInfo: { flex: 1 },
  wellnessLabel: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.base },
  wellnessHint: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs },
  wellnessValue: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES.xl },
  wellnessUnit: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm, color: '#A89890' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING[3] },
  sliderBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sliderBtnText: { fontFamily: FONTS.body.bold, fontSize: FONT_SIZES.xl, lineHeight: 24 },
  track: { flex: 1, height: 8, backgroundColor: '#EDE1D9', borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  tempCard: { borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING[4], marginBottom: SPACING[3] },
  tempHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING[3], marginBottom: SPACING[3] },
  tempIcon: { fontSize: 26 },
  tempInput: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, borderWidth: 1.5, paddingHorizontal: SPACING[4] },
  tempInputText: { flex: 1, fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES['2xl'], paddingVertical: 12 },
  tempUnit: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.lg },
  saveBtn: { marginTop: SPACING[2] },
});