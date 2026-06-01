import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Switch, Alert, Platform,
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
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';

// ─── Safe haptics helper ──────────────────────────────────────────────────────
const triggerHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconMoon({ size = 42, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M36 25.5A14 14 0 0 1 18 9a14 14 0 1 0 18 16.5z"
        fill={color} stroke={color} strokeWidth="1.5" strokeLinejoin="round"
      />
      <Circle cx="37" cy="12" r="2" fill="white" opacity="0.4" />
      <Circle cx="32" cy="8" r="1.2" fill="white" opacity="0.3" />
    </Svg>
  );
}

function IconDrop({ size = 16, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C12 2 5 10 5 15a7 7 0 0 0 14 0C19 10 12 2 12 2z" fill={color} />
    </Svg>
  );
}

function IconBell({ size = 16, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function IconShieldLock({ size = 16, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6L12 2z"
        fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <Circle cx="12" cy="11" r="2" fill={color} />
      <Rect x="11" y="12.5" width="2" height="3" rx="0.5" fill={color} />
    </Svg>
  );
}

function IconPalette({ size = 16, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10 1.1 0 2-.9 2-2 0-.53-.2-1-.53-1.37-.32-.35-.52-.83-.52-1.33 0-1.1.9-2 2-2h2.36C19.74 15.3 22 13.8 22 12c0-5.52-4.48-10-10-10z"
        stroke={color} strokeWidth="1.5" fill="none" />
      <Circle cx="8.5" cy="10.5" r="1.5" fill={color} />
      <Circle cx="12" cy="7.5" r="1.5" fill={color} />
      <Circle cx="15.5" cy="10.5" r="1.5" fill={color} />
    </Svg>
  );
}

function IconUser({ size = 16, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function IconSun({ size = 16, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.5" fill="none" />
      <Line x1="12" y1="2" x2="12" y2="5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="12" y1="19" x2="12" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="2" y1="12" x2="5" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="19" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="19.78" y1="4.22" x2="17.66" y2="6.34" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="6.34" y1="17.66" x2="4.22" y2="19.78" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function IconMoonSm({ size = 16, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={color} />
    </Svg>
  );
}

function IconGear({ size = 16, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke={color} strokeWidth="1.5" fill="none" />
    </Svg>
  );
}

function IconCheck({ size = 14, color = '#4ADE80' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="20,6 9,17 4,12" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconChevronRight({ size = 20, color = '#A89890' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Section icon map ─────────────────────────────────────────────────────────
function SectionIcon({ id, size = 16 }: { id: string; size?: number }) {
  const color = '#C084A0';
  switch (id) {
    case 'cycle':   return <IconDrop size={size} color={color} />;
    case 'notif':   return <IconBell size={size} color={color} />;
    case 'privacy': return <IconShieldLock size={size} color={color} />;
    case 'appear':  return <IconPalette size={size} color={color} />;
    case 'account': return <IconUser size={size} color={color} />;
    case 'about':   return <IconMoonSm size={size} color={color} />;
    default:        return null;
  }
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { cycles, stats, prediction } = useCycle();
  const { colors, mode, setMode } = useTheme();
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
        {
          text: 'Delete permanently', style: 'destructive',
          onPress: () => Alert.alert('Contact support', 'Please email support@luna.app to delete your account.'),
        },
      ]
    );
  };

  const toggleNotifications = async (val: boolean) => {
    triggerHaptic();
    await updateProfile({ notifications_enabled: val });
  };

  const togglePrivacyMode = async (val: boolean) => {
    triggerHaptic();
    await updateProfile({ privacy_mode: val });
  };

  return (
    <Screen scroll padding={false} style={{ backgroundColor: colors.background }}>
      {/* Profile Header */}
      <LinearGradient
        colors={[phaseConfig.gradient[0] + '50', colors.background]}
        style={styles.headerGradient}
      >
        <View style={styles.avatarCircle}>
          <LinearGradient
            colors={[phaseConfig.gradient[0], phaseConfig.gradient[1]]}
            style={styles.avatarGradient}
          >
            <IconMoon size={42} color="white" />
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

      {/* Cycle Stats */}
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
        {/* Cycle Settings */}
        <SettingsSection title="Cycle settings" iconId="cycle">
          <SettingsRow label="Average cycle length" value={`${profile?.average_cycle_length || 28} days`} />
          <SettingsRow label="Average period length" value={`${profile?.average_period_length || 5} days`} />
          <SettingsRow label="Trying to conceive" value={profile?.trying_to_conceive ? 'Yes' : 'No'} />
          <SettingsRow
            label="Last period started"
            value={cycles[0] ? format(new Date(cycles[0].start_date), 'MMM d, yyyy') : 'Not logged'}
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications" iconId="notif">
          <SettingsToggleRow
            label="Period reminders"
            hint="Get notified before your period"
            value={profile?.notifications_enabled ?? true}
            onChange={toggleNotifications}
          />
          <SettingsRow label="Reminder days before" value="2 days" />
          <SettingsRow label="Daily log reminder" value="8:00 PM" />
        </SettingsSection>

        {/* Privacy & Security */}
        <SettingsSection title="Privacy & security" iconId="privacy">
          <SettingsToggleRow
            label="Privacy mode"
            hint="Hide sensitive details on home screen"
            value={profile?.privacy_mode ?? false}
            onChange={togglePrivacyMode}
          />
          <BiometricRow />
          <SettingsRowWithIcon
            label="Data encryption"
            value="Enabled"
            icon={<IconCheck size={14} color="#4ADE80" />}
            valueColor="#4ADE80"
          />
          <SettingsRow label="Cloud sync" value="Supabase secure" />
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection title="Appearance" iconId="appear">
          <View style={styles.themeRow}>
            {(['light', 'dark', 'system'] as const).map(m => {
              const isActive = mode === m;
              const iconColor = isActive ? '#FFFFFF' : '#C084A0';
              return (
                <Pressable
                  key={m}
                  onPress={() => { triggerHaptic(); setMode(m); }}
                  style={[
                    styles.themeBtn,
                    {
                      backgroundColor: isActive ? COLORS.primary[500] : colors.surfaceTertiary,
                      borderColor: isActive ? COLORS.primary[500] : colors.border,
                    },
                  ]}
                >
                  {m === 'light'
                    ? <IconSun size={16} color={iconColor} />
                    : m === 'dark'
                    ? <IconMoonSm size={16} color={iconColor} />
                    : <IconGear size={16} color={iconColor} />
                  }
                  <Text style={[styles.themeBtnText, { color: isActive ? '#FFFFFF' : colors.text.secondary }]}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SettingsSection>

        {/* Account */}
        <SettingsSection title="Account" iconId="account">
          <SettingsRow label="Account type" value="Personal" />
          <SettingsRow
            label="Member since"
            value={profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : '-'}
          />
          <Pressable
            style={styles.actionRow}
            onPress={() => Alert.alert('Export data', 'Your data export will be sent to your email within 24 hours.')}
          >
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>Export my data</Text>
            <IconChevronRight size={20} color="#A89890" />
          </Pressable>
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About Luna" iconId="about">
          <SettingsRow label="Version" value="1.0.0" />
          <SettingsRow label="Build" value="Production" />
          <Pressable
            style={styles.actionRow}
            onPress={() => Alert.alert('Privacy Policy', 'Visit luna.app/privacy for our full privacy policy.')}
          >
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>Privacy policy</Text>
            <IconChevronRight size={20} color="#A89890" />
          </Pressable>
          <Pressable
            style={styles.actionRow}
            onPress={() => Alert.alert('Terms of Service', 'Visit luna.app/terms for our full terms of service.')}
          >
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>Terms of service</Text>
            <IconChevronRight size={20} color="#A89890" />
          </Pressable>
        </SettingsSection>

        {/* Sign Out */}
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

        <View style={styles.privacyFooterRow}>
          <IconShieldLock size={13} color="#A89890" />
          <Text style={[styles.privacyFooter, { color: colors.text.tertiary }]}>
            Your health data is encrypted and stored securely. Luna never sells or shares your personal information.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SettingsSection({ title, iconId, children }: { title: string; iconId: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <SectionIcon id={iconId} size={16} />
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

function SettingsRowWithIcon({ label, value, icon, valueColor }: { label: string; value: string; icon: React.ReactNode; valueColor?: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.settingsLabel, { color: colors.text.primary }]}>{label}</Text>
      <View style={styles.settingsValueRow}>
        {icon}
        <Text style={[styles.settingsValue, { color: valueColor || colors.text.secondary }]}>{value}</Text>
      </View>
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
        onValueChange={() => Alert.alert(biometricType, 'Coming soon - biometric login will be enabled in the next update.')}
        trackColor={{ false: '#DDD6FE', true: COLORS.primary[400] }}
        thumbColor="#FFFFFF"
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
  headerGradient: { paddingTop: 60, paddingHorizontal: SPACING[5], paddingBottom: SPACING[6], alignItems: 'center' },
  avatarCircle: { width: 88, height: 88, borderRadius: 44, marginBottom: SPACING[4], ...SHADOWS.md },
  avatarGradient: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  profileName: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES['2xl'], marginBottom: 4 },
  profileEmail: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm, marginBottom: 4 },
  profileSince: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs },
  statsRow: { flexDirection: 'row', marginHorizontal: SPACING[5], borderRadius: RADIUS['2xl'], borderWidth: 1, marginBottom: SPACING[5], overflow: 'hidden' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: SPACING[4] },
  statDivider: { width: 1 },
  statValue: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES.xl, marginBottom: 2 },
  statLabel: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs },
  sections: { paddingHorizontal: SPACING[5], paddingBottom: SPACING[10] },
  section: { marginBottom: SPACING[5] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING[2], marginBottom: SPACING[2], paddingLeft: SPACING[1] },
  sectionTitle: { fontFamily: FONTS.body.bold, fontSize: FONT_SIZES.base },
  sectionCard: { borderRadius: RADIUS['2xl'], borderWidth: 1, overflow: 'hidden' },
  settingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING[4], paddingVertical: SPACING[4], borderBottomWidth: 1 },
  settingsValueRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  settingsLabelGroup: { flex: 1, marginRight: SPACING[3] },
  settingsLabel: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.base },
  settingsHint: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs, marginTop: 2 },
  settingsValue: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING[4], paddingVertical: SPACING[4] },
  actionLabel: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.base },
  themeRow: { flexDirection: 'row', gap: SPACING[2], padding: SPACING[4] },
  themeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: SPACING[3], borderRadius: RADIUS.lg, borderWidth: 1.5 },
  themeBtnText: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.xs },
  signOutBtn: { marginBottom: SPACING[3] },
  deleteBtn: { alignItems: 'center', paddingVertical: SPACING[3], marginBottom: SPACING[5] },
  deleteBtnText: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.sm },
  privacyFooterRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, paddingHorizontal: SPACING[4] },
  privacyFooter: { flex: 1, fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs, lineHeight: 18 },
});