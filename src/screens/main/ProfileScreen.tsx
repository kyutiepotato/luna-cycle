import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Switch, Alert, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { useCycle } from '../../context/CycleContext';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/authService';
import { Screen } from '../../components/common/Screen';
import { Button, Divider } from '../../components/common/UIComponents';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS, CYCLE_PHASES } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { cycles, stats, prediction } = useCycle();
  const { colors, mode, setMode, isDark } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const phase = prediction?.cycle_phase || 'follicular';
  const phaseConfig = CYCLE_PHASES[phase];

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out', style: 'destructive', onPress: async () => {
          setIsSigningOut(true);
          await signOut();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account and all health data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete permanently', style: 'destructive', onPress: () => Alert.alert('Contact support', 'Please email support@luna.app to delete your account.') },
      ]
    );
  };

  const toggleNotifications = async (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateProfile({ notifications_enabled: val });
  };

  const togglePrivacyMode = async (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateProfile({ privacy_mode: val });
  };

  return (
    <Screen scroll padding={false} style={{ backgroundColor: colors.background }}>
      {/* ── Profile Header ──────────────────────────────────── */}
      <LinearGradient
        colors={[phaseConfig.gradient[0] + '50', colors.background]}
        style={styles.headerGradient}
      >
        <View style={styles.avatarCircle}>
          <LinearGradient
            colors={[phaseConfig.gradient[0], phaseConfig.gradient[1]]}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarEmoji}>🌙</Text>
          </LinearGradient>
        </View>
        <Text style={[styles.profileName, { color: colors.text.primary }]}>
          {profile?.name || user?.email?.split('@')[0] || 'Luna User'}
        </Text>
        <Text style={[styles.profileEmail, { color: colors.text.secondary }]}>
          {user?.email}
        </Text>
        {profile?.created_at && (
          <Text style={[styles.profileSince, { color: colors.text.tertiary }]}>
            Tracking since {format(new Date(profile.created_at), 'MMMM yyyy')}
          </Text>
        )}
      </LinearGradient>

      {/* ── Cycle Stats Summary ──────────────────────────────── */}
      {stats && (
        <View style={[styles.statsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <StatItem value={String(stats.cycles_tracked)} label="Cycles" color={COLORS.primary[500]} />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <StatItem value={`${stats.average_length}d`} label="Avg cycle" color={COLORS.secondary[400]} />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <StatItem
            value={stats.cycle_regularity === 'regular' ? 'Regular' : 'Varies'}
            label="Pattern"
            color={stats.cycle_regularity === 'regular' ? '#4ADE80' : '#FCD34D'}
          />
        </View>
      )}

      <View style={styles.sections}>
        {/* ── Cycle Settings ─────────────────────────────────── */}
        <SettingsSection title="Cycle settings" icon="🩸">
          <SettingsRow label="Average cycle length" value={`${profile?.average_cycle_length || 28} days`} />
          <SettingsRow label="Average period length" value={`${profile?.average_period_length || 5} days`} />
          <SettingsRow label="Trying to conceive" value={profile?.trying_to_conceive ? 'Yes' : 'No'} />
          <SettingsRow
            label="Last period started"
            value={cycles[0] ? format(new Date(cycles[0].start_date), 'MMM d, yyyy') : 'Not logged'}
          />
        </SettingsSection>

        {/* ── Notifications ──────────────────────────────────── */}
        <SettingsSection title="Notifications" icon="🔔">
          <SettingsToggleRow
            label="Period reminders"
            hint="Get notified before your period"
            value={profile?.notifications_enabled ?? true}
            onChange={toggleNotifications}
          />
          <SettingsRow label="Reminder days before" value="2 days" />
          <SettingsRow label="Daily log reminder" value="8:00 PM" />
        </SettingsSection>

        {/* ── Privacy & Security ─────────────────────────────── */}
        <SettingsSection title="Privacy & security" icon="🔒">
          <SettingsToggleRow
            label="Privacy mode"
            hint="Hide sensitive details on home screen"
            value={profile?.privacy_mode ?? false}
            onChange={togglePrivacyMode}
          />
          <BiometricRow />
          <SettingsRow label="Data encryption" value="Enabled ✓" valueColor="#4ADE80" />
          <SettingsRow label="Cloud sync" value="Supabase secure" />
        </SettingsSection>

        {/* ── Appearance ─────────────────────────────────────── */}
        <SettingsSection title="Appearance" icon="🎨">
          <View style={styles.themeRow}>
            {(['light', 'dark', 'system'] as const).map(m => (
              <Pressable
                key={m}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMode(m); }}
                style={[
                  styles.themeBtn,
                  {
                    backgroundColor: mode === m ? COLORS.primary[500] : colors.surfaceTertiary,
                    borderColor: mode === m ? COLORS.primary[500] : colors.border,
                  },
                ]}
              >
                <Text style={{ fontSize: 16 }}>
                  {m === 'light' ? '☀️' : m === 'dark' ? '🌙' : '⚙️'}
                </Text>
                <Text style={[styles.themeBtnText, { color: mode === m ? '#FFFFFF' : colors.text.secondary }]}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </SettingsSection>

        {/* ── Account ────────────────────────────────────────── */}
        <SettingsSection title="Account" icon="👤">
          <SettingsRow label="Account type" value="Personal" />
          <SettingsRow label="Member since" value={profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : '—'} />
          <Pressable style={styles.actionRow} onPress={() => Alert.alert('Export data', 'Your data export will be sent to your email within 24 hours.')}>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>Export my data</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </SettingsSection>

        {/* ── About ──────────────────────────────────────────── */}
        <SettingsSection title="About Luna" icon="🌙">
          <SettingsRow label="Version" value="1.0.0" />
          <SettingsRow label="Build" value="Production" />
          <Pressable style={styles.actionRow} onPress={() => Alert.alert('Privacy Policy', 'Visit luna.app/privacy for our full privacy policy.')}>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>Privacy policy</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
          <Pressable style={styles.actionRow} onPress={() => Alert.alert('Terms of Service', 'Visit luna.app/terms for our full terms of service.')}>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>Terms of service</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </SettingsSection>

        {/* ── Sign Out ───────────────────────────────────────── */}
        <Button
          label="Sign out"
          onPress={handleSignOut}
          variant="secondary"
          size="lg"
          isLoading={isSigningOut}
          style={styles.signOutBtn}
        />
        <Pressable onPress={handleDeleteAccount} style={styles.deleteBtn}>
          <Text style={[styles.deleteBtnText, { color: COLORS.error }]}>Delete account</Text>
        </Pressable>

        <Text style={[styles.privacyFooter, { color: colors.text.tertiary }]}>
          🔒 Your health data is encrypted and stored securely. Luna never sells or shares your personal information.
        </Text>
      </View>
    </Screen>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SettingsSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{title}</Text>
      </View>
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

function SettingsRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.settingsLabel, { color: colors.text.primary }]}>{label}</Text>
      <Text style={[styles.settingsValue, { color: valueColor || colors.text.secondary }]}>{value}</Text>
    </View>
  );
}

function SettingsToggleRow({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
      <View style={styles.settingsLabelGroup}>
        <Text style={[styles.settingsLabel, { color: colors.text.primary }]}>{label}</Text>
        <Text style={[styles.settingsHint, { color: colors.text.tertiary }]}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#DDD6FE', true: COLORS.primary[400] }}
        thumbColor={value ? COLORS.primary[600] : '#FFFFFF'}
      />
    </View>
  );
}

function BiometricRow() {
  const { colors } = useTheme();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');

  React.useEffect(() => {
    (async () => {
      const avail = await authService.isBiometricAvailable();
      setBiometricAvailable(avail);
      if (avail) setBiometricType(await authService.getBiometricType());
    })();
  }, []);

  if (!biometricAvailable) return null;

  return (
    <View style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
      <View style={styles.settingsLabelGroup}>
        <Text style={[styles.settingsLabel, { color: colors.text.primary }]}>{biometricType}</Text>
        <Text style={[styles.settingsHint, { color: colors.text.tertiary }]}>Quick & secure login</Text>
      </View>
      <Switch
        value={false}
        onValueChange={() => Alert.alert(biometricType, 'Coming soon — biometric login will be enabled in the next update.')}
        trackColor={{ false: '#DDD6FE', true: COLORS.primary[400] }}
        thumbColor={'#FFFFFF'}
      />
    </View>
  );
}

function StatItem({ value, label, color }: { value: string; label: string; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 60,
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
    alignItems: 'center',
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: SPACING[4],
    ...SHADOWS.md,
  },
  avatarGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 42 },
  profileName: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES['2xl'], marginBottom: 4 },
  profileEmail: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm, marginBottom: 4 },
  profileSince: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING[5],
    borderRadius: RADIUS['2xl'],
    borderWidth: 1,
    marginBottom: SPACING[5],
    overflow: 'hidden',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: SPACING[4] },
  statDivider: { width: 1 },
  statValue: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES.xl, marginBottom: 2 },
  statLabel: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs },
  sections: { paddingHorizontal: SPACING[5], paddingBottom: SPACING[10] },
  section: { marginBottom: SPACING[5] },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginBottom: SPACING[2],
    paddingLeft: SPACING[1],
  },
  sectionTitle: { fontFamily: FONTS.body.bold, fontSize: FONT_SIZES.base },
  sectionCard: { borderRadius: RADIUS['2xl'], borderWidth: 1, overflow: 'hidden' },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[4],
    borderBottomWidth: 1,
  },
  settingsLabelGroup: { flex: 1, marginRight: SPACING[3] },
  settingsLabel: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.base },
  settingsHint: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs, marginTop: 2 },
  settingsValue: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[4],
  },
  actionLabel: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.base },
  chevron: { fontSize: 20, color: '#A89890' },
  themeRow: {
    flexDirection: 'row',
    gap: SPACING[2],
    padding: SPACING[4],
  },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING[3],
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
  },
  themeBtnText: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.xs },
  signOutBtn: { marginBottom: SPACING[3] },
  deleteBtn: { alignItems: 'center', paddingVertical: SPACING[3], marginBottom: SPACING[5] },
  deleteBtnText: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.sm },
  privacyFooter: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: SPACING[4],
  },
});
