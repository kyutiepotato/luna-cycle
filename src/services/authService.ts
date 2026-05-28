import { supabase } from '../lib/supabase';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

const PIN_STORAGE_KEY = 'luna_pin_hash';
const SESSION_KEY = 'luna_session';

// ─── Auth Operations ──────────────────────────────────────────────────────────
export const authService = {
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;

    // Create user profile
    if (data.user) {
      await supabase.from('user_profiles').insert({
        user_id: data.user.id,
        name,
        average_cycle_length: 28,
        average_period_length: 5,
      });
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync(PIN_STORAGE_KEY);
  },

  async forgotPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'luna://reset-password',
    });
    if (error) throw error;
  },

  async resetPassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // ─── Biometric Auth ────────────────────────────────────────────────────────
  async isBiometricAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  },

  async authenticateWithBiometric(): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify your identity',
      cancelLabel: 'Use PIN instead',
      fallbackLabel: 'Use PIN',
      disableDeviceFallback: false,
    });
    return result.success;
  },

  async getBiometricType(): Promise<string> {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch ID';
    }
    return 'Biometric';
  },

  // ─── PIN Auth ──────────────────────────────────────────────────────────────
  async setupPin(pin: string): Promise<void> {
    // Simple hash for demo - use bcrypt in production
    const hash = await simpleHash(pin);
    await SecureStore.setItemAsync(PIN_STORAGE_KEY, hash);
  },

  async verifyPin(pin: string): Promise<boolean> {
    const storedHash = await SecureStore.getItemAsync(PIN_STORAGE_KEY);
    if (!storedHash) return false;
    const hash = await simpleHash(pin);
    return hash === storedHash;
  },

  async hasPin(): Promise<boolean> {
    const pin = await SecureStore.getItemAsync(PIN_STORAGE_KEY);
    return !!pin;
  },

  async clearPin(): Promise<void> {
    await SecureStore.deleteItemAsync(PIN_STORAGE_KEY);
  },
};

// Simple hash utility (use a proper crypto library in production)
async function simpleHash(str: string): Promise<string> {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
