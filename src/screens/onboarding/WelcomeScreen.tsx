import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { OnboardingStackParamList } from '../../types';
import { Button, Chip } from '../../components/common/UIComponents';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../constants/theme';

type NavProp = NativeStackNavigationProp<OnboardingStackParamList>;

// ─── Progress Dots ─────────────────────────────────────────────────────────────
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

// ─── Welcome Screen ────────────────────────────────────────────────────────────
export function WelcomeScreen() {
  const navigation = useNavigation<NavProp>();
  const { profile } = useAuth();

  return (
    <LinearGradient colors={['#FFF5F7', '#FDF9F7', '#F7F0EC']} style={styles.fullscreen}>
      <ScrollView contentContainerStyle={styles.centered}>
        <Text style={styles.bigEmoji}>🌙</Text>
        <Text style={styles.welcomeTitle}>
          Welcome to{'\n'}Luna
        </Text>
        <Text style={styles.welcomeSub}>
          {profile?.name ? `Hello, ${profile.name}! ` : ''}Your personal cycle companion.
          Private, compassionate, and intelligent.
        </Text>

        <View style={styles.featuresList}>
          {[
            { icon: '🌸', text: 'Track your cycle with ease' },
            { icon: '💜', text: 'Understand your body patterns' },
            { icon: '🔮', text: 'Smart predictions & insights' },
            { icon: '🔒', text: 'Private & always secure' },
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <Button
          label="Let's begin"
          onPress={() => navigation.navigate('CycleInfo')}
          size="lg"
          style={styles.ctaButton}
        />
        <ProgressDots current={0} total={4} />
      </ScrollView>
    </LinearGradient>
  );
}

// ─── Cycle Info Screen ────────────────────────────────────────────────────────
export function CycleInfoScreen() {
  const navigation = useNavigation<NavProp>();
  const { updateProfile } = useAuth();
  const { colors } = useTheme();
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [regularity, setRegularity] = useState<'regular' | 'irregular' | 'unsure'>('regular');

  const cycleLengths = [21, 24, 25, 26, 27, 28, 29, 30, 31, 32, 35, 40];
  const periodLengths = [2, 3, 4, 5, 6, 7, 8];

  const handleNext = async () => {
    await updateProfile({
      average_cycle_length: cycleLength,
      average_period_length: periodLength,
    });
    navigation.navigate('GoalSetup');
  };

  return (
    <LinearGradient colors={['#FFF5F7', '#FDF9F7']} style={styles.fullscreen}>
      <ScrollView contentContainerStyle={styles.scrollPadded}>
        <ProgressDots current={1} total={4} />

        <Text style={styles.screenTitle}>Tell us about your cycle</Text>
        <Text style={[styles.screenSub, { color: colors.text.secondary }]}>
          These help us get started. You can update them anytime.
        </Text>

        <Text style={[styles.sectionLabel, { color: colors.text.primary }]}>
          Usual cycle length
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {cycleLengths.map(l => (
            <Chip
              key={l}
              label={`${l}d`}
              selected={cycleLength === l}
              onPress={() => setCycleLength(l)}
              style={{ marginRight: 8 }}
            />
          ))}
        </ScrollView>

        <Text style={[styles.sectionLabel, { color: colors.text.primary }]}>
          Usual period length
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {periodLengths.map(l => (
            <Chip
              key={l}
              label={`${l}d`}
              selected={periodLength === l}
              onPress={() => setPeriodLength(l)}
              style={{ marginRight: 8 }}
            />
          ))}
        </ScrollView>

        <Text style={[styles.sectionLabel, { color: colors.text.primary }]}>
          How regular is your cycle?
        </Text>
        <View style={styles.regularityRow}>
          {(['regular', 'irregular', 'unsure'] as const).map(r => (
            <Chip
              key={r}
              label={r === 'regular' ? 'Regular' : r === 'irregular' ? 'Irregular' : 'Not sure'}
              selected={regularity === r}
              onPress={() => setRegularity(r)}
              style={{ marginRight: 8 }}
            />
          ))}
        </View>

        <Button label="Continue" onPress={handleNext} size="lg" style={styles.ctaButton} />
      </ScrollView>
    </LinearGradient>
  );
}

// ─── Goal Setup Screen ────────────────────────────────────────────────────────
export function GoalSetupScreen() {
  const navigation = useNavigation<NavProp>();
  const { updateProfile } = useAuth();
  const { colors } = useTheme();
  const [goals, setGoals] = useState<string[]>([]);
  const [ttc, setTtc] = useState(false);

  const goalOptions = [
    { id: 'track', label: 'Track my cycle', icon: '📅' },
    { id: 'symptoms', label: 'Monitor symptoms', icon: '💊' },
    { id: 'mood', label: 'Track mood & wellness', icon: '🧘‍♀️' },
    { id: 'understand', label: 'Understand my body', icon: '💡' },
    { id: 'conceive', label: 'Trying to conceive', icon: '🌱' },
    { id: 'avoid', label: 'Natural birth control', icon: '🛡️' },
  ];

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const handleNext = async () => {
    await updateProfile({ trying_to_conceive: goals.includes('conceive') });
    navigation.navigate('NotificationSetup');
  };

  return (
    <LinearGradient colors={['#FFF5F7', '#FDF9F7']} style={styles.fullscreen}>
      <ScrollView contentContainerStyle={styles.scrollPadded}>
        <ProgressDots current={2} total={4} />
        <Text style={styles.screenTitle}>What brings you here?</Text>
        <Text style={[styles.screenSub, { color: colors.text.secondary }]}>
          Select all that resonate with you
        </Text>

        <View style={styles.goalsGrid}>
          {goalOptions.map(g => (
            <Pressable
              key={g.id}
              onPress={() => toggleGoal(g.id)}
              style={[
                styles.goalCard,
                {
                  backgroundColor: goals.includes(g.id) ? COLORS.primary[50] : colors.surface,
                  borderColor: goals.includes(g.id) ? COLORS.primary[400] : colors.border,
                },
              ]}
            >
              <Text style={styles.goalIcon}>{g.icon}</Text>
              <Text style={[styles.goalLabel, { color: goals.includes(g.id) ? COLORS.primary[600] : colors.text.primary }]}>
                {g.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Button label="Continue" onPress={handleNext} size="lg" style={styles.ctaButton} />
      </ScrollView>
    </LinearGradient>
  );
}

// ─── Notification Setup Screen ────────────────────────────────────────────────
export function NotificationSetupScreen() {
  const navigation = useNavigation<NavProp>();
  const { updateProfile } = useAuth();
  const { colors } = useTheme();
  const [enabled, setEnabled] = useState(true);

  const handleNext = async () => {
    await updateProfile({ notifications_enabled: enabled });
    navigation.navigate('Complete');
  };

  return (
    <LinearGradient colors={['#FFF5F7', '#FDF9F7']} style={styles.fullscreen}>
      <View style={styles.centered}>
        <ProgressDots current={3} total={4} />
        <Text style={styles.bigEmoji}>🔔</Text>
        <Text style={styles.screenTitle}>Stay in the know</Text>
        <Text style={[styles.screenSub, { color: colors.text.secondary }]}>
          Luna can send gentle, discreet reminders about your cycle, ovulation window, and daily wellness check-ins.
        </Text>

        <View style={styles.notifOptions}>
          <Pressable
            onPress={() => setEnabled(true)}
            style={[styles.notifCard, {
              backgroundColor: enabled ? COLORS.primary[50] : colors.surface,
              borderColor: enabled ? COLORS.primary[400] : colors.border,
            }]}
          >
            <Text style={{ fontSize: 28 }}>💜</Text>
            <Text style={[styles.notifTitle, { color: enabled ? COLORS.primary[600] : colors.text.primary }]}>
              Yes, notify me
            </Text>
            <Text style={[styles.notifSub, { color: colors.text.secondary }]}>Gentle reminders, discreet wording</Text>
          </Pressable>

          <Pressable
            onPress={() => setEnabled(false)}
            style={[styles.notifCard, {
              backgroundColor: !enabled ? COLORS.primary[50] : colors.surface,
              borderColor: !enabled ? COLORS.primary[400] : colors.border,
            }]}
          >
            <Text style={{ fontSize: 28 }}>🤫</Text>
            <Text style={[styles.notifTitle, { color: !enabled ? COLORS.primary[600] : colors.text.primary }]}>
              Not right now
            </Text>
            <Text style={[styles.notifSub, { color: colors.text.secondary }]}>I'll check in manually</Text>
          </Pressable>
        </View>

        <Button label="Finish setup" onPress={handleNext} size="lg" style={styles.ctaButton} />
      </View>
    </LinearGradient>
  );
}

// ─── Complete Screen ──────────────────────────────────────────────────────────
export function OnboardingCompleteScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  return (
    <LinearGradient colors={['#FFF5F7', '#FDF9F7', '#F7F0EC']} style={styles.fullscreen}>
      <View style={styles.centered}>
        <Text style={styles.celebrationEmoji}>🎉</Text>
        <Text style={styles.screenTitle}>You're all set!</Text>
        <Text style={[styles.screenSub, { color: colors.text.secondary }]}>
          Luna is ready to support your journey. Start by logging your last period or let us know where you are in your cycle.
        </Text>

        <View style={styles.completionBadges}>
          {['Profile set up', 'Privacy protected', 'Ready to track'].map((badge, i) => (
            <View key={i} style={[styles.badge, { backgroundColor: COLORS.primary[50], borderColor: COLORS.primary[200] }]}>
              <Text style={{ fontSize: 14 }}>✓</Text>
              <Text style={[styles.badgeText, { color: COLORS.primary[600] }]}>{badge}</Text>
            </View>
          ))}
        </View>

        <Button
          label="Open Luna"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
          size="lg"
          style={styles.ctaButton}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fullscreen: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING[6] },
  scrollPadded: { flexGrow: 1, paddingHorizontal: SPACING[6], paddingTop: SPACING[12], paddingBottom: SPACING[8] },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING[8] },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: COLORS.primary[500], width: 24 },
  dotInactive: { backgroundColor: COLORS.primary[200] },
  bigEmoji: { fontSize: 72, marginBottom: SPACING[4] },
  celebrationEmoji: { fontSize: 72, marginBottom: SPACING[4] },
  welcomeTitle: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES['4xl'], color: COLORS.primary[700], textAlign: 'center', marginBottom: SPACING[4] },
  welcomeSub: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.base, color: COLORS.neutral[500], textAlign: 'center', lineHeight: 24, marginBottom: SPACING[8] },
  screenTitle: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES['3xl'], color: COLORS.primary[700], textAlign: 'center', marginBottom: SPACING[3] },
  screenSub: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.base, textAlign: 'center', lineHeight: 24, marginBottom: SPACING[8] },
  sectionLabel: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.base, marginBottom: SPACING[3], marginTop: SPACING[2] },
  chipRow: { flexDirection: 'row', marginBottom: SPACING[4] },
  regularityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING[4] },
  featuresList: { width: '100%', marginBottom: SPACING[8], gap: SPACING[3] },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING[3] },
  featureIcon: { fontSize: 22, width: 36, textAlign: 'center' },
  featureText: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.base, color: COLORS.neutral[600] },
  ctaButton: { width: '100%', marginTop: SPACING[4] },
  goalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: SPACING[6] },
  goalCard: { width: '47%', padding: SPACING[4], borderRadius: 16, borderWidth: 1.5, alignItems: 'center', gap: 8 },
  goalIcon: { fontSize: 28 },
  goalLabel: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.sm, textAlign: 'center' },
  notifOptions: { width: '100%', gap: SPACING[3], marginBottom: SPACING[6] },
  notifCard: { padding: SPACING[5], borderRadius: 20, borderWidth: 1.5, alignItems: 'center', gap: 6 },
  notifTitle: { fontFamily: FONTS.body.bold, fontSize: FONT_SIZES.md },
  notifSub: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm, textAlign: 'center' },
  completionBadges: { gap: 10, marginBottom: SPACING[8], width: '100%' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
  badgeText: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.base },
});
