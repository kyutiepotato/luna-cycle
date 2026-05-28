import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button, Input } from '../../components/common/UIComponents';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../constants/theme';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { forgotPassword } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#FFF5F7', '#FDF9F7']} style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backArrow}>←</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.emoji}>{sent ? '📬' : '🔑'}</Text>
        <Text style={[styles.title, { color: COLORS.primary[700] }]}>
          {sent ? 'Check your email' : 'Reset password'}
        </Text>
        <Text style={[styles.body, { color: colors.text.secondary }]}>
          {sent
            ? `We've sent a reset link to ${email}. Check your inbox and follow the instructions.`
            : "Enter your email address and we'll send you a secure link to reset your password."}
        </Text>

        {!sent ? (
          <>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="your@email.com"
              containerStyle={{ marginBottom: SPACING[6] }}
            />
            <Button label="Send reset link" onPress={handleSend} isLoading={loading} size="lg" />
          </>
        ) : (
          <Button label="Back to sign in" onPress={() => navigation.goBack()} variant="secondary" size="lg" />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: SPACING[6] },
  backButton: { marginTop: 60, marginBottom: SPACING[8] },
  backArrow: { fontSize: 24, color: COLORS.primary[500] },
  content: { alignItems: 'center' },
  emoji: { fontSize: 60, marginBottom: SPACING[4] },
  title: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES['3xl'], marginBottom: SPACING[3], textAlign: 'center' },
  body: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.base, textAlign: 'center', lineHeight: 24, marginBottom: SPACING[8] },
});
