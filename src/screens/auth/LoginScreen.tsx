import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AuthStackParamList } from '../../types';
import { Button, Input } from '../../components/common/UIComponents';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../constants/theme';

type NavProp = NativeStackNavigationProp<AuthStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavProp>();
  const { signIn, isLoading } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (e: any) {
      Alert.alert('Sign in failed', e.message || 'Please check your credentials and try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#FFF5F7', '#FDF9F7']} style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.moonEmoji}>🌙</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              Your cycle data is waiting for you
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="your@email.com"
              error={errors.email}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              placeholder="••••••••"
              error={errors.password}
              rightIcon={
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁'}</Text>
                </Pressable>
              }
            />

            <Pressable
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotLink}
            >
              <Text style={[styles.forgotText, { color: COLORS.primary[500] }]}>
                Forgot password?
              </Text>
            </Pressable>

            <Button
              label="Sign in"
              onPress={handleSignIn}
              isLoading={isLoading}
              size="lg"
              style={styles.submitButton}
            />
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.text.tertiary }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={[styles.registerText, { color: colors.text.secondary }]}>
              New to Luna?{' '}
            </Text>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.registerLink, { color: COLORS.primary[500] }]}>
                Create account
              </Text>
            </Pressable>
          </View>

          {/* Privacy note */}
          <Text style={[styles.privacyNote, { color: colors.text.tertiary }]}>
            🔒 Your health data is encrypted and private. We never share or sell your information.
          </Text>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING[6],
    paddingTop: SPACING[16],
    paddingBottom: SPACING[8],
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING[10],
  },
  moonEmoji: {
    fontSize: 52,
    marginBottom: SPACING[4],
  },
  title: {
    fontFamily: FONTS.display.semiBold,
    fontSize: FONT_SIZES['4xl'],
    color: COLORS.primary[700],
    marginBottom: SPACING[2],
  },
  subtitle: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.base,
    textAlign: 'center',
  },
  form: {
    gap: SPACING[4],
    marginBottom: SPACING[6],
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  forgotText: {
    fontFamily: FONTS.body.medium,
    fontSize: FONT_SIZES.sm,
  },
  submitButton: {
    marginTop: SPACING[2],
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING[5],
    gap: SPACING[3],
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.sm,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING[8],
  },
  registerText: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.base,
  },
  registerLink: {
    fontFamily: FONTS.body.bold,
    fontSize: FONT_SIZES.base,
  },
  privacyNote: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: SPACING[4],
  },
});
