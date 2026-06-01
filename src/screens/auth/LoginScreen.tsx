import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AuthStackParamList } from '../../types';
import { Button, Input } from '../../components/common/UIComponents';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../constants/theme';
import Svg, { Path, Circle } from 'react-native-svg';

type NavProp = NativeStackNavigationProp<AuthStackParamList>;

function IconMoon({ size = 48, color = '#C084A0' }: { size?: number; color?: string }) {
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

function IconEye({ size = 20, color = '#A89890' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" fill="none" />
    </Svg>
  );
}

function IconEyeOff({ size = 20, color = '#A89890' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Path d="M1 1l22 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function IconShield({ size = 14, color = '#A89890' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6L12 2z"
        fill={color} opacity="0.3" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  );
}

export default function LoginScreen() {
  const navigation = useNavigation<NavProp>();
  const { signIn, isLoading } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (e: any) {
      Alert.alert('Sign in failed', e.message || 'Please check your credentials.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#FFF5F7', '#FDF9F7']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.moonWrapper}>
              <LinearGradient
                colors={[COLORS.primary[200], COLORS.primary[400]]}
                style={styles.moonGradient}
              >
                <IconMoon size={48} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.appName}>luna</Text>
            <Text style={[styles.tagline, { color: colors.text.secondary }]}>
              your cycle, understood
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="your@email.com"
              error={errors.email}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="Your password"
              error={errors.password}
              rightIcon={
                <Pressable onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                  {showPassword
                    ? <IconEyeOff size={20} color={colors.text.tertiary} />
                    : <IconEye size={20} color={colors.text.tertiary} />
                  }
                </Pressable>
              }
            />

            <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotBtn}>
              <Text style={[styles.forgotText, { color: COLORS.primary[500] }]}>Forgot password?</Text>
            </Pressable>

            <Button label="Sign in" onPress={handleLogin} isLoading={isLoading} size="lg" />
          </View>

          <View style={styles.privacyRow}>
            <IconShield size={14} color={colors.text.tertiary} />
            <Text style={[styles.privacyText, { color: colors.text.tertiary }]}>
              Your health data is encrypted and private. We never share or sell your information.
            </Text>
          </View>

          <View style={styles.registerRow}>
            <Text style={[{ fontFamily: FONTS.body.regular, color: colors.text.secondary }]}>
              New to Luna?{' '}
            </Text>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={{ fontFamily: FONTS.body.bold, color: COLORS.primary[500] }}>Create account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: SPACING[6], paddingTop: SPACING[16], paddingBottom: SPACING[8] },
  header: { alignItems: 'center', marginBottom: SPACING[10] },
  moonWrapper: { marginBottom: SPACING[4] },
  moonGradient: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  appName: { fontFamily: FONTS.display.regular, fontSize: FONT_SIZES['4xl'], color: COLORS.primary[600], letterSpacing: 6, marginBottom: 4 },
  tagline: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm, letterSpacing: 0.5 },
  form: { gap: SPACING[4], marginBottom: SPACING[4] },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -SPACING[2] },
  forgotText: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.sm },
  privacyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: SPACING[6], paddingHorizontal: SPACING[2] },
  privacyText: { flex: 1, fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs, lineHeight: 18 },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
});