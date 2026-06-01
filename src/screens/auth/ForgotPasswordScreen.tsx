import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button, Input } from '../../components/common/UIComponents';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS } from '../../constants/theme';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

function IconArrowLeft({ size = 24, color = '#E84B7A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12l7-7M5 12l7 7"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconMailSent({ size = 52, color = '#E84B7A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="4" width="20" height="16" rx="3"
        stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M2 7l10 7 10-7" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Line x1="16" y1="17" x2="20" y2="17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M18 15l2 2-2 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function IconKey({ size = 52, color = '#E84B7A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="8" cy="10" r="5" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M13 10h8M18 10v3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="8" cy="10" r="2" fill={color} opacity="0.4" />
    </Svg>
  );
}

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { forgotPassword } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) { Alert.alert('Enter email', 'Please enter your email address.'); return; }
    setIsLoading(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#FFF5F7', '#FDF9F7']} style={{ flex: 1, paddingHorizontal: SPACING[6], paddingTop: 60 }}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <IconArrowLeft size={24} color={COLORS.primary[500]} />
        </Pressable>

        <View style={styles.header}>
          {sent ? <IconMailSent size={52} color={COLORS.primary[400]} /> : <IconKey size={52} color={COLORS.primary[400]} />}
          <Text style={[styles.title, { color: COLORS.primary[700] }]}>
            {sent ? 'Check your email' : 'Reset password'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {sent
              ? `We sent a reset link to ${email}`
              : 'Enter your email and we will send you a reset link'}
          </Text>
        </View>

        {!sent && (
          <>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="your@email.com"
            />
            <Button
              label="Send reset link"
              onPress={handleSend}
              isLoading={isLoading}
              size="lg"
              style={{ marginTop: SPACING[4] }}
            />
          </>
        )}

        {sent && (
          <Button
            label="Back to sign in"
            onPress={() => navigation.goBack()}
            variant="secondary"
            size="lg"
            style={{ marginTop: SPACING[4] }}
          />
        )}
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backButton: { marginBottom: SPACING[6] },
  header: { alignItems: 'center', marginBottom: SPACING[8], gap: SPACING[3] },
  title: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES['3xl'] },
  subtitle: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.base, textAlign: 'center', lineHeight: 22 },
});