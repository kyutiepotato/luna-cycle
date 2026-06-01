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
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';

type NavProp = NativeStackNavigationProp<AuthStackParamList>;

function IconFlower({ size = 52, color = '#E84B7A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="2.5" fill={color} />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const r = deg * (Math.PI / 180);
        const cx = 12 + 5 * Math.cos(r);
        const cy = 12 + 5 * Math.sin(r);
        return <Ellipse key={i} cx={cx} cy={cy} rx="2.5" ry="1.5"
          transform={`rotate(${deg} ${cx} ${cy})`} fill={color} opacity="0.7" />;
      })}
    </Svg>
  );
}

function IconArrowLeft({ size = 24, color = '#E84B7A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12l7-7M5 12l7 7"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function RegisterScreen() {
  const navigation = useNavigation<NavProp>();
  const { signUp, isLoading } = useAuth();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await signUp(email.trim().toLowerCase(), password, name.trim());
    } catch (e: any) {
      Alert.alert('Registration failed', e.message || 'Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#FFF5F7', '#FDF9F7']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <IconArrowLeft size={24} color={COLORS.primary[500]} />
          </Pressable>

          <View style={styles.header}>
            <IconFlower size={52} color={COLORS.primary[400]} />
            <Text style={styles.title}>Start your journey</Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              Create your private, secure account
            </Text>
          </View>

          <View style={styles.form}>
            <Input label="Your name" value={name} onChangeText={setName}
              placeholder="How should we call you?" error={errors.name} autoCapitalize="words" />
            <Input label="Email" value={email} onChangeText={setEmail}
              keyboardType="email-address" autoCapitalize="none"
              placeholder="your@email.com" error={errors.email} />
            <Input label="Password" value={password} onChangeText={setPassword}
              secureTextEntry placeholder="8+ characters" error={errors.password} />
            <Input label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword}
              secureTextEntry placeholder="Repeat your password" error={errors.confirmPassword} />
            <Button label="Create account" onPress={handleRegister}
              isLoading={isLoading} size="lg" style={{ marginTop: SPACING[2] }} />
          </View>

          <Text style={[styles.terms, { color: colors.text.tertiary }]}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
            Your data is encrypted and never shared.
          </Text>

          <View style={styles.loginRow}>
            <Text style={[{ fontFamily: FONTS.body.regular, color: colors.text.secondary }]}>
              Already have an account?{' '}
            </Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text style={{ fontFamily: FONTS.body.bold, color: COLORS.primary[500] }}>Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: SPACING[6], paddingTop: SPACING[12], paddingBottom: SPACING[8] },
  backButton: { marginBottom: SPACING[4] },
  header: { alignItems: 'center', marginBottom: SPACING[8], gap: SPACING[3] },
  title: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES['3xl'], color: COLORS.primary[700] },
  subtitle: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.base, textAlign: 'center' },
  form: { gap: SPACING[4], marginBottom: SPACING[6] },
  terms: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs, textAlign: 'center', lineHeight: 18, marginBottom: SPACING[5], paddingHorizontal: SPACING[4] },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
});