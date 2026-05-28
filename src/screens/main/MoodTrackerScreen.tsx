import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useCycle } from '../../context/CycleContext';
import { useTheme } from '../../context/ThemeContext';
import { Screen } from '../../components/common/Screen';
import { Button } from '../../components/common/UIComponents';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, MOODS_CONFIG } from '../../constants/theme';
import { MoodType } from '../../types';

export default function MoodTrackerScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { logMoods, getDayLog } = useCycle();
  const { colors } = useTheme();
  const [selectedMoods, setSelectedMoods] = useState<MoodType[]>([]);
  const [energy, setEnergy] = useState(3); // 1–5 scale
  const [isSaving, setIsSaving] = useState(false);
  const date = route.params?.date || format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    (async () => {
      const log = await getDayLog(date);
      if (log?.moods) setSelectedMoods(log.moods as MoodType[]);
    })();
  }, [date]);

  const toggleMood = (mood: MoodType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMoods(prev =>
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await logMoods(selectedMoods, date);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save mood.');
    } finally {
      setIsSaving(false);
    }
  };

  const energyLabels = ['😴', '😕', '😐', '🙂', '⚡'];

  return (
    <Screen scroll padding={false} style={{ backgroundColor: colors.background }}>
      <LinearGradient colors={['#FEF9C3', colors.background]} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>How are you feeling?</Text>
        <Text style={[styles.headerDate, { color: colors.text.secondary }]}>
          {format(new Date(date), 'MMMM d')}
        </Text>
      </LinearGradient>

      <View style={styles.body}>
        {/* Mood grid */}
        <Text style={[styles.sectionLabel, { color: colors.text.primary }]}>
          Select all that apply
        </Text>
        <View style={styles.moodGrid}>
          {(Object.keys(MOODS_CONFIG) as MoodType[]).map(mood => {
            const config = MOODS_CONFIG[mood];
            const isSelected = selectedMoods.includes(mood);

            return (
              <Pressable
                key={mood}
                onPress={() => toggleMood(mood)}
                style={({ pressed }) => [
                  styles.moodBtn,
                  {
                    backgroundColor: isSelected ? config.color + '40' : colors.surface,
                    borderColor: isSelected ? config.color : colors.border,
                    transform: [{ scale: pressed ? 0.95 : isSelected ? 1.04 : 1 }],
                  },
                ]}
              >
                <Text style={styles.moodEmoji}>{config.emoji}</Text>
                <Text style={[styles.moodLabel, { color: isSelected ? '#3A302A' : colors.text.secondary }]}>
                  {config.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Energy level */}
        <View style={[styles.energyCard, { backgroundColor: colors.surfaceTertiary }]}>
          <Text style={[styles.energyTitle, { color: colors.text.primary }]}>Energy level today</Text>
          <View style={styles.energyRow}>
            {energyLabels.map((emoji, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setEnergy(i + 1);
                }}
                style={[
                  styles.energyBtn,
                  {
                    backgroundColor: energy === i + 1 ? COLORS.tertiary[400] + '30' : 'transparent',
                    borderColor: energy === i + 1 ? COLORS.tertiary[400] : 'transparent',
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Text style={[styles.energyEmoji, { fontSize: energy === i + 1 ? 30 : 24 }]}>
                  {emoji}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.energyHint, { color: colors.text.tertiary }]}>
            Low energy → High energy
          </Text>
        </View>

        {/* Selected moods summary */}
        {selectedMoods.length > 0 && (
          <View style={[styles.summaryCard, { backgroundColor: COLORS.secondary[50], borderColor: COLORS.secondary[200] }]}>
            <Text style={[styles.summaryText, { color: COLORS.secondary[700] }]}>
              Feeling: {selectedMoods.map(m => MOODS_CONFIG[m]?.emoji).join(' ')}
            </Text>
          </View>
        )}

        <Button
          label={selectedMoods.length === 0 ? 'Save mood' : `Save ${selectedMoods.length} mood${selectedMoods.length > 1 ? 's' : ''}`}
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
  backArrow: { fontSize: 24, color: '#D97706' },
  headerTitle: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES['3xl'], marginBottom: 4 },
  headerDate: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm },
  body: { paddingHorizontal: SPACING[5] },
  sectionLabel: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES.lg, marginBottom: SPACING[4] },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING[3], marginBottom: SPACING[5] },
  moodBtn: {
    width: '22%', borderRadius: RADIUS.xl, borderWidth: 1.5,
    paddingVertical: SPACING[3], alignItems: 'center', gap: 4,
  },
  moodEmoji: { fontSize: 26 },
  moodLabel: { fontFamily: FONTS.body.medium, fontSize: 10, textAlign: 'center' },
  energyCard: { borderRadius: RADIUS.xl, padding: SPACING[5], marginBottom: SPACING[5] },
  energyTitle: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.base, marginBottom: SPACING[4], textAlign: 'center' },
  energyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING[3] },
  energyBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  energyEmoji: {},
  energyHint: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs, textAlign: 'center' },
  summaryCard: { borderRadius: RADIUS.lg, padding: SPACING[4], borderWidth: 1, marginBottom: SPACING[4], alignItems: 'center' },
  summaryText: { fontFamily: FONTS.display.regular, fontSize: FONT_SIZES.xl },
  saveBtn: {},
});
