import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useCycle } from '../../context/CycleContext';
import { useTheme } from '../../context/ThemeContext';
import { Screen } from '../../components/common/Screen';
import { Button } from '../../components/common/UIComponents';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS, SYMPTOMS_CONFIG } from '../../constants/theme';
import { Symptom, SymptomSeverity } from '../../types';

type SelectedSymptoms = Partial<Record<Symptom, SymptomSeverity>>;

export default function SymptomTrackerScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { logSymptoms, getDayLog } = useCycle();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<SelectedSymptoms>({});
  const [isSaving, setIsSaving] = useState(false);
  const date = route.params?.date || format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    (async () => {
      const log = await getDayLog(date);
      if (log?.symptoms) {
        const existing: SelectedSymptoms = {};
        (log.symptoms as any[]).forEach((s: any) => {
          existing[s.symptom as Symptom] = s.severity || 1;
        });
        setSelected(existing);
      }
    })();
  }, [date]);

  const toggleSymptom = (symptom: Symptom) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(prev => {
      if (prev[symptom]) {
        const next = { ...prev };
        delete next[symptom];
        return next;
      }
      return { ...prev, [symptom]: 1 };
    });
  };

  const setSeverity = (symptom: Symptom, severity: SymptomSeverity) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(prev => ({ ...prev, [symptom]: severity }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const symptoms = Object.entries(selected).map(([symptom, severity]) => ({
        symptom: symptom as Symptom,
        severity: severity!,
      }));
      await logSymptoms(symptoms, date);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', 'Failed to save symptoms. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCount = Object.keys(selected).length;

  return (
    <Screen scroll padding={false} style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <LinearGradient colors={['#EDE9FE', colors.background]} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: COLORS.secondary[500] }]}>←</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Symptoms</Text>
        <Text style={[styles.headerDate, { color: colors.text.secondary }]}>
          {format(new Date(date), 'MMMM d')}
        </Text>
        {selectedCount > 0 && (
          <View style={[styles.countBadge, { backgroundColor: COLORS.secondary[100] }]}>
            <Text style={[styles.countText, { color: COLORS.secondary[600] }]}>
              {selectedCount} selected
            </Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.body}>
        <Text style={[styles.sectionHint, { color: colors.text.secondary }]}>
          Tap to log a symptom. Hold to adjust severity.
        </Text>

        <View style={styles.symptomsGrid}>
          {(Object.keys(SYMPTOMS_CONFIG) as Symptom[]).map(symptom => {
            const config = SYMPTOMS_CONFIG[symptom];
            const isSelected = !!selected[symptom];
            const severity = selected[symptom] || 1;

            return (
              <Pressable
                key={symptom}
                onPress={() => toggleSymptom(symptom)}
                style={[
                  styles.symptomCard,
                  {
                    backgroundColor: isSelected ? config.color + '20' : colors.surface,
                    borderColor: isSelected ? config.color + '60' : colors.border,
                  },
                ]}
              >
                <Text style={styles.symptomIcon}>{config.icon}</Text>
                <Text style={[styles.symptomLabel, { color: isSelected ? config.color : colors.text.secondary }]}>
                  {config.label}
                </Text>

                {isSelected && (
                  <View style={styles.severityRow}>
                    {([1, 2, 3] as SymptomSeverity[]).map(s => (
                      <Pressable
                        key={s}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          setSeverity(symptom, s);
                        }}
                        style={[
                          styles.severityDot,
                          {
                            backgroundColor: severity >= s ? config.color : config.color + '30',
                            transform: [{ scale: severity === s ? 1.2 : 1 }],
                          },
                        ]}
                      />
                    ))}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Severity legend */}
        <View style={[styles.legendCard, { backgroundColor: colors.surfaceTertiary }]}>
          <Text style={[styles.legendTitle, { color: colors.text.secondary }]}>Severity dots</Text>
          <View style={styles.legendRow}>
            {[{ dots: 1, label: 'Mild' }, { dots: 2, label: 'Moderate' }, { dots: 3, label: 'Severe' }].map(l => (
              <View key={l.label} style={styles.legendItem}>
                <View style={styles.legendDots}>
                  {Array.from({ length: l.dots }).map((_, i) => (
                    <View key={i} style={[styles.legendDot, { backgroundColor: COLORS.secondary[400] }]} />
                  ))}
                </View>
                <Text style={[styles.legendLabel, { color: colors.text.tertiary }]}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Button
          label={selectedCount === 0 ? 'Save (no symptoms)' : `Save ${selectedCount} symptom${selectedCount > 1 ? 's' : ''}`}
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
  backArrow: { fontSize: 24 },
  headerTitle: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES['3xl'], marginBottom: 4 },
  headerDate: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm, marginBottom: SPACING[3] },
  countBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  countText: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.xs },
  body: { paddingHorizontal: SPACING[5] },
  sectionHint: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs, marginBottom: SPACING[4] },
  symptomsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING[3], marginBottom: SPACING[5] },
  symptomCard: {
    width: '30%', borderRadius: RADIUS.xl, borderWidth: 1.5,
    padding: SPACING[3], alignItems: 'center', gap: 4, minHeight: 90,
  },
  symptomIcon: { fontSize: 24 },
  symptomLabel: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.xs, textAlign: 'center' },
  severityRow: { flexDirection: 'row', gap: 4, marginTop: 2 },
  severityDot: { width: 8, height: 8, borderRadius: 4 },
  legendCard: { borderRadius: RADIUS.xl, padding: SPACING[4], marginBottom: SPACING[5] },
  legendTitle: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.xs, marginBottom: SPACING[2] },
  legendRow: { flexDirection: 'row', gap: SPACING[6] },
  legendItem: { alignItems: 'center', gap: 4 },
  legendDots: { flexDirection: 'row', gap: 3 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs },
  saveBtn: {},
});
