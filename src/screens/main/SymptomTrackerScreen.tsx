import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useCycle } from '../../context/CycleContext';
import { useTheme } from '../../context/ThemeContext';
import { Screen } from '../../components/common/Screen';
import { Button } from '../../components/common/UIComponents';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SYMPTOMS_CONFIG } from '../../constants/theme';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';

// ─── Safe haptics helper ──────────────────────────────────────────────────────
const triggerHaptic = (style: 'light' | 'success' = 'light') => {
  if (Platform.OS === 'web') return;
  if (style === 'success') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } else {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconArrowLeft({ size = 24, color = '#A78BFA' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12l7-7M5 12l7 7"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconCheck({ size = 16, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="20,6 9,17 4,12" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Symptom SVG icons ────────────────────────────────────────────────────────

function SymptomIcon({ symptomKey, size = 22, color = '#A78BFA' }: { symptomKey: string; size?: number; color?: string }) {
  switch (symptomKey) {
    case 'cramps':
    case 'back_pain':
    case 'joint_pain':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
            stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    case 'headache':
    case 'dizziness':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.5" fill="none" />
          <Path d="M12 8v4l3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'bloating':
    case 'digestive_issues':
    case 'nausea':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M17 8C8 10 5.9 16.17 3.82 19.82A1 1 0 0 0 5 21c10-5 15-10 13-17z"
            fill={color} opacity="0.7" />
          <Path d="M5 21 Q10 16 13 13" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none" />
        </Svg>
      );
    case 'acne':
    case 'breast_tenderness':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="3" fill={color} />
          <Circle cx="12" cy="12" r="7" stroke={color} strokeWidth="1.5" fill="none" opacity="0.4" />
        </Svg>
      );
    case 'fatigue':
    case 'insomnia':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={color} />
        </Svg>
      );
    case 'hot_flashes':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2C12 2 8 7 8 11a4 4 0 0 0 8 0c0-4-4-9-4-9z" fill={color} opacity="0.8" />
          <Line x1="8" y1="21" x2="16" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="12" y1="17" x2="12" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );
    case 'mood_swings':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" />
          <Path d="M8 9.5 Q9 8 10 9.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <Path d="M14 9.5 Q15 8 16 9.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <Path d="M9 14.5 Q12 13 15 14.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'appetite_changes':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M18 8h1a4 4 0 0 1 0 8h-1" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <Path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          <Line x1="6" y1="1" x2="6" y2="4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="10" y1="1" x2="10" y2="4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="14" y1="1" x2="14" y2="4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4.5 12.5L12.5 4.5a5.657 5.657 0 0 1 8 8l-8 8a5.657 5.657 0 0 1-8-8z"
            stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          <Line x1="8" y1="8" x2="16" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );
  }
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SymptomTrackerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { logSymptoms, getDayLog } = useCycle();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const date = route.params?.date || format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    (async () => {
      const log = await getDayLog(date);
      if (log?.symptoms) {
        const existing = (log.symptoms as any[]).map((s: any) => s.symptom || s);
        setSelected(existing);
      }
    })();
  }, [date]);

  const toggleSymptom = (key: string) => {
    triggerHaptic('light');
    setSelected(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await logSymptoms(selected, date);
      triggerHaptic('success');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save symptoms.');
    } finally {
      setIsSaving(false);
    }
  };

  const symptomKeys = Object.keys(SYMPTOMS_CONFIG) as Array<keyof typeof SYMPTOMS_CONFIG>;

  return (
    <Screen scroll padding={false} style={{ backgroundColor: colors.background }}>
      <LinearGradient colors={['#EDE9FE50', colors.background]} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <IconArrowLeft size={24} color={COLORS.secondary[500]} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text.primary }]}>Symptoms</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          {format(new Date(date), 'MMMM d')} · {selected.length} selected
        </Text>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.grid}>
          {symptomKeys.map(key => {
            const config = SYMPTOMS_CONFIG[key];
            const isSelected = selected.includes(key);
            return (
              <Pressable
                key={key}
                onPress={() => toggleSymptom(key)}
                style={[
                  styles.symptomCard,
                  {
                    backgroundColor: isSelected ? config.color + '20' : colors.surface,
                    borderColor: isSelected ? config.color : colors.border,
                  },
                ]}
              >
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: config.color }]}>
                    <IconCheck size={10} color="#FFFFFF" />
                  </View>
                )}
                <SymptomIcon symptomKey={key} size={24} color={config.color} />
                <Text style={[
                  styles.symptomLabel,
                  { color: isSelected ? config.color : colors.text.primary },
                ]}>
                  {config.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Button
          label={selected.length === 0 ? 'Log no symptoms' : `Save ${selected.length} symptom${selected.length > 1 ? 's' : ''}`}
          onPress={handleSave}
          isLoading={isSaving}
          size="lg"
          style={styles.saveBtn}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 60, paddingHorizontal: SPACING[5], paddingBottom: SPACING[5] },
  backBtn: { marginBottom: SPACING[3] },
  title: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES['3xl'], marginBottom: 4 },
  subtitle: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm },
  body: { paddingHorizontal: SPACING[5], paddingBottom: SPACING[10] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING[3], marginBottom: SPACING[6] },
  symptomCard: {
    width: '47%',
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    padding: SPACING[4],
    alignItems: 'center',
    gap: SPACING[2],
    minHeight: 90,
    justifyContent: 'center',
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomLabel: {
    fontFamily: FONTS.body.medium,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
  },
  saveBtn: { marginTop: SPACING[2] },
});