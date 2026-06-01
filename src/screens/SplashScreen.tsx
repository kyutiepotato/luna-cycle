import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, FONT_SIZES } from '../constants/theme';
import Svg, { Path, Circle } from 'react-native-svg';

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

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: false }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#FFF5F7', '#FDF9F7', '#F7F0EC']} style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconWrapper}>
          <LinearGradient
            colors={[COLORS.primary[200], COLORS.primary[400]]}
            style={styles.iconGradient}
          >
            <IconMoon size={48} color="white" />
          </LinearGradient>
        </View>
        <Text style={styles.appName}>luna</Text>
        <Text style={styles.tagline}>your cycle, understood</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', gap: 16 },
  iconWrapper: { marginBottom: 8 },
  iconGradient: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  appName: { fontFamily: FONTS.display.regular, fontSize: FONT_SIZES['4xl'], color: COLORS.primary[600], letterSpacing: 6 },
  tagline: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm, color: COLORS.neutral[500], letterSpacing: 1 },
});