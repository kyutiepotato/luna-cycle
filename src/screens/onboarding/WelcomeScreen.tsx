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
import Svg, { Path, Circle, Rect, Ellipse, Polyline, Line, Polygon } from 'react-native-svg';

type NavProp = NativeStackNavigationProp<OnboardingStackParamList>;

// ─── SVG Icons ─────────────────────────────────────────────────────────────────

function IconMoon() {
  return (
    <Svg width={72} height={72} viewBox="0 0 48 48" fill="none">
      <Path d="M36 25.5A14 14 0 0 1 18 9a14 14 0 1 0 18 16.5z" fill="#C084A0" stroke="#C084A0" strokeWidth="1.5" strokeLinejoin="round" />
      <Circle cx="37" cy="12" r="2" fill="#F0A8C0" />
      <Circle cx="32" cy="8" r="1.2" fill="#F0A8C0" />
      <Circle cx="40" cy="18" r="1.2" fill="#F0A8C0" />
    </Svg>
  );
}

function IconFlower() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="2.5" fill="#C084A0" />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const r = deg * (Math.PI / 180);
        const cx = 12 + 5 * Math.cos(r);
        const cy = 12 + 5 * Math.sin(r);
        return <Ellipse key={i} cx={cx} cy={cy} rx="2.5" ry="1.5" transform={`rotate(${deg} ${cx} ${cy})`} fill="#C084A0" opacity="0.7" />;
      })}
    </Svg>
  );
}

function IconHeartPulse() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#C084A0" />
      <Polyline points="7,12 9,9 11,14 13,11 15,12" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function IconCrystalBall() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="11" r="7" fill="#C084A0" opacity="0.85" />
      <Circle cx="10" cy="9" r="2" fill="white" opacity="0.3" />
      <Circle cx="10" cy="9" r="0.8" fill="white" opacity="0.6" />
      <Rect x="9" y="18" width="6" height="1.5" rx="0.75" fill="#C084A0" opacity="0.6" />
      <Rect x="7" y="20" width="10" height="1.5" rx="0.75" fill="#C084A0" opacity="0.4" />
    </Svg>
  );
}

function IconShieldLock() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6L12 2z" fill="#C084A0" stroke="#C084A0" strokeWidth="1" strokeLinejoin="round" />
      <Circle cx="12" cy="11" r="2" fill="white" opacity="0.8" />
      <Rect x="11" y="12.5" width="2" height="3" rx="0.5" fill="white" opacity="0.8" />
    </Svg>
  );
}

function IconBell() {
  return (
    <Svg width={72} height={72} viewBox="0 0 48 48" fill="none">
      <Path d="M24 4a14 14 0 0 0-14 14v8l-3 4v2h34v-2l-3-4v-8A14 14 0 0 0 24 4z" fill="#C084A0" stroke="#C084A0" strokeWidth="1.5" strokeLinejoin="round" />
      <Path d="M20 36a4 4 0 0 0 8 0" fill="white" opacity="0.6" />
      <Circle cx="30" cy="10" r="4" fill="#F9A8D4" />
    </Svg>
  );
}

function IconNotifyYes() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#C084A0" />
    </Svg>
  );
}

function IconNotifyNo() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6L12 2z" fill="#C084A0" opacity="0.3" stroke="#C084A0" strokeWidth="1.5" strokeLinejoin="round" />
      <Line x1="9" y1="9" x2="15" y2="15" stroke="#C084A0" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="15" y1="9" x2="9" y2="15" stroke="#C084A0" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function IconCelebration() {
  return (
    <Svg width={72} height={72} viewBox="0 0 48 48" fill="none">
      <Path d="M24 28 L14 20 Q12 14 18 14 Q22 14 24 20 Q26 14 30 14 Q36 14 34 20 Z" fill="#C084A0" opacity="0.9" />
      <Rect x="21" y="27" width="6" height="8" rx="2" fill="#C084A0" />
      <Circle cx="8" cy="28" r="2" fill="#FBCFE8" opacity="0.7" />
      <Circle cx="40" cy="24" r="1.5" fill="#FBCFE8" opacity="0.7" />
      <Circle cx="36" cy="36" r="2" fill="#C084A0" opacity="0.5" />
      <Circle cx="12" cy="36" r="1.2" fill="#C084A0" opacity="0.5" />
      <Polygon points="10,10 11.5,14 13,10 11.5,13" fill="#F9A8D4" opacity="0.8" />
      <Polygon points="38,8 39,12 40,8 39,11" fill="#F9A8D4" opacity="0.8" />
    </Svg>
  );
}

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
        <IconMoon />
        <Text style={styles.welcomeTitle}>
          Welcome to{'\n'}Luna
        </Text>
        <Text style={styles.welcomeSub}>
          {profile?.name ? `Hello, ${profile.name}! ` : ''}Your personal cycle companion.
          Private, compassionate, and intelligent.
        </Text>

        <View style={styles.featuresList}>
          {[
            { icon: <IconFlower />, text: 'Track your cycle with ease' },
            { icon: <IconHeartPulse />, text: 'Understand your body patterns' },
            { icon: <IconCrystalBall />, text: 'Smart predictions & insights' },
            { icon: <IconShieldLock />, text: 'Private & always secure' },
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}>{f.icon}</View>
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

function GoalIcon({ id }: { id: string }) {
  switch (id) {
    case 'track':
      return (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="4" width="18" height="17" rx="3" stroke="#C084A0" strokeWidth="1.5" fill="none" />
          <Line x1="3" y1="9" x2="21" y2="9" stroke="#C084A0" strokeWidth="1.5" />
          <Line x1="8" y1="2" x2="8" y2="6" stroke="#C084A0" strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="16" y1="2" x2="16" y2="6" stroke="#C084A0" strokeWidth="1.5" strokeLinecap="round" />
          <Circle cx="12" cy="15" r="1.5" fill="#C084A0" />
        </Svg>
      );
    case 'symptoms':
      return (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Path d="M4.5 12.5L12.5 4.5a5.657 5.657 0 0 1 8 8l-8 8a5.657 5.657 0 0 1-8-8z" stroke="#C084A0" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          <Line x1="8" y1="8" x2="16" y2="16" stroke="#C084A0" strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );
    case 'mood':
      return (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Path d="M12 20c-3-2-6-5-6-9a6 6 0 0 1 6-6 6 6 0 0 1 6 6c0 4-3 7-6 9z" fill="#C084A0" opacity="0.85" />
          <Path d="M6 14c-2-1-4-3-4-6a5 5 0 0 1 5-4c.5 2 .5 4-.5 6" fill="#C084A0" opacity="0.5" />
          <Path d="M18 14c2-1 4-3 4-6a5 5 0 0 0-5-4c-.5 2-.5 4 .5 6" fill="#C084A0" opacity="0.5" />
        </Svg>
      );
    case 'understand':
      return (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Path d="M9 18h6M10 21h4M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3 6H8c-1.7-1.3-3-3.5-3-6a7 7 0 0 1 7-7z" stroke="#C084A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    case 'conceive':
      return (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Line x1="12" y1="22" x2="12" y2="10" stroke="#C084A0" strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M12 10C12 7 10 4 6 4c0 4 2 7 6 6z" fill="#C084A0" opacity="0.8" />
          <Path d="M12 14c0-3 2-5 6-5c0 4-2 6-6 5z" fill="#C084A0" opacity="0.6" />
        </Svg>
      );
    case 'avoid':
      return (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6L12 2z" fill="#C084A0" opacity="0.2" stroke="#C084A0" strokeWidth="1.5" strokeLinejoin="round" />
          <Polyline points="9,12 11,14 15,10" stroke="#C084A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    default:
      return null;
  }
}

export function GoalSetupScreen() {
  const navigation = useNavigation<NavProp>();
  const { updateProfile } = useAuth();
  const { colors } = useTheme();
  const [goals, setGoals] = useState<string[]>([]);
  const [ttc, setTtc] = useState(false);

  const goalOptions = [
    { id: 'track', label: 'Track my cycle' },
    { id: 'symptoms', label: 'Monitor symptoms' },
    { id: 'mood', label: 'Track mood & wellness' },
    { id: 'understand', label: 'Understand my body' },
    { id: 'conceive', label: 'Trying to conceive' },
    { id: 'avoid', label: 'Natural birth control' },
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
              <GoalIcon id={g.id} />
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
        <IconBell />
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
            <IconNotifyYes />
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
            <IconNotifyNo />
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
  const { refreshProfile } = useAuth();

  return (
    <LinearGradient colors={['#FFF5F7', '#FDF9F7', '#F7F0EC']} style={styles.fullscreen}>
      <View style={styles.centered}>
        <IconCelebration />
        <Text style={styles.screenTitle}>You're all set!</Text>
        <Text style={[styles.screenSub, { color: colors.text.secondary }]}>
          Luna is ready to support your journey. Start by logging your last period or let us know where you are in your cycle.
        </Text>

        <View style={styles.completionBadges}>
          {['Profile set up', 'Privacy protected', 'Ready to track'].map((badge, i) => (
            <View key={i} style={[styles.badge, { backgroundColor: COLORS.primary[50], borderColor: COLORS.primary[200] }]}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Polyline points="20,6 9,17 4,12" stroke="#C084A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={[styles.badgeText, { color: COLORS.primary[600] }]}>{badge}</Text>
            </View>
          ))}
        </View>

        <Button
          label="Open Luna"
          onPress={async () => {
            await refreshProfile();
          }}
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
  featureIcon: { fontSize: 22, width: 36, textAlign: 'center', alignItems: 'center' },
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

export default WelcomeScreen;