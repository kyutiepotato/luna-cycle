import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useCycle } from '../../context/CycleContext';
import { useTheme } from '../../context/ThemeContext';
import { Screen } from '../../components/common/Screen';
import { Button } from '../../components/common/UIComponents';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, FLOW_CONFIG } from '../../constants/theme';
import { FlowIntensity } from '../../types';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';

// ─── Safe haptics helper (no-op on web) ──────────────────────────────────────
const triggerHaptic = (style: 'light' | 'medium' | 'success' = 'light') => {
  if (Platform.OS === 'web') return;
  if (style === 'success') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } else if (style === 'medium') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } else {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconCheck({ size = 18, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="20,6 9,17 4,12" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconCircle({ size = 18, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" />
    </Svg>
  );
}

// ─── Flow Tracker ─────────────────────────────────────────────────────────────
export default function FlowTrackerScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { logFlow, getDayLog } = useCycle();
  const { colors } = useTheme();
  const [selectedFlow, setSelectedFlow] = useState<FlowIntensity | null>(null);
  const [isSpotting, setIsSpotting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const date = route.params?.date || format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    (async () => {
      const log = await getDayLog(date);
      if (log?.flow) setSelectedFlow(log.flow as FlowIntensity);
      if (log?.is_spotting) setIsSpotting(true);
    })();
  }, [date]);

  const handleSave = async () => {
    if (!selectedFlow) { Alert.alert('Select flow', 'Please select a flow intensity.'); return; }
    setIsSaving(true);
    try {
      await logFlow(selectedFlow, date);
      triggerHaptic('success');
      navigation.goBack();
    } catch { Alert.alert('Error', 'Failed to save.'); }
    finally { setIsSaving(false); }
  };

  const flows: { key: FlowIntensity; drops: number }[] = [
    { key: 'spotting',   drops: 1 },
    { key: 'light',      drops: 2 },
    { key: 'medium',     drops: 3 },
    { key: 'heavy',      drops: 4 },
    { key: 'very_heavy', drops: 5 },
  ];

  return (
    <Screen scroll={false} padding={false} style={{ backgroundColor: colors.background }}>
      <LinearGradient colors={['#FFE4EA', colors.background]} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: COLORS.primary[500] }]}>←</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text.primary }]}>Flow intensity</Text>
        <Text style={[styles.date, { color: colors.text.secondary }]}>{format(new Date(date), 'MMMM d')}</Text>
      </LinearGradient>

      <View style={styles.body}>
        {flows.map(({ key, drops }) => {
          const config = FLOW_CONFIG[key];
          const isSelected = selectedFlow === key;
          return (
            <Pressable
              key={key}
              onPress={() => { triggerHaptic('medium'); setSelectedFlow(key); }}
              style={[
                styles.flowCard,
                {
                  backgroundColor: isSelected ? config.color + '20' : colors.surface,
                  borderColor: isSelected ? config.color : colors.border,
                },
              ]}
            >
              <View style={styles.flowDrops}>
                {Array.from({ length: drops }).map((_, i) => (
                  <View key={i} style={[styles.drop, { backgroundColor: config.color }]} />
                ))}
                {Array.from({ length: 5 - drops }).map((_, i) => (
                  <View key={i} style={[styles.drop, { backgroundColor: config.color + '30' }]} />
                ))}
              </View>
              <Text style={[styles.flowLabel, { color: isSelected ? config.color : colors.text.primary }]}>
                {config.label}
              </Text>
              {isSelected
                ? <IconCheck size={18} color={config.color} />
                : <IconCircle size={18} color={colors.border} />
              }
            </Pressable>
          );
        })}

        <Pressable
          onPress={() => { triggerHaptic('light'); setIsSpotting(!isSpotting); }}
          style={[
            styles.spottingToggle,
            {
              backgroundColor: isSpotting ? COLORS.primary[50] : colors.surfaceTertiary,
              borderColor: isSpotting ? COLORS.primary[400] : colors.border,
            },
          ]}
        >
          {isSpotting
            ? <IconCheck size={18} color={COLORS.primary[500]} />
            : <IconCircle size={18} color={colors.text.tertiary} />
          }
          <View>
            <Text style={[styles.spottingLabel, { color: colors.text.primary }]}>Log as spotting only</Text>
            <Text style={[styles.spottingHint, { color: colors.text.tertiary }]}>Not counted as a period day</Text>
          </View>
        </Pressable>

        <Button label="Save flow" onPress={handleSave} isLoading={isSaving} size="lg" style={{ marginTop: SPACING[4] }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 60, paddingHorizontal: SPACING[5], paddingBottom: SPACING[5] },
  backBtn: { marginBottom: SPACING[3] },
  backArrow: { fontSize: 24 },
  title: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES['3xl'], marginBottom: 4 },
  date: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm },
  body: { paddingHorizontal: SPACING[5], paddingTop: SPACING[2] },
  flowCard: { flexDirection: 'row', alignItems: 'center', padding: SPACING[4], borderRadius: RADIUS.xl, borderWidth: 1.5, marginBottom: SPACING[3], gap: SPACING[4] },
  flowDrops: { flexDirection: 'row', gap: 6 },
  drop: { width: 14, height: 20, borderRadius: 7 },
  flowLabel: { flex: 1, fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.md },
  spottingToggle: { flexDirection: 'row', alignItems: 'center', gap: SPACING[3], padding: SPACING[4], borderRadius: RADIUS.xl, borderWidth: 1.5, marginTop: SPACING[2] },
  spottingLabel: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.base },
  spottingHint: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs },
});