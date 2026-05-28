import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, FONT_SIZES } from '../constants/theme';

export default function SplashScreen() {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#FFF5F7', '#FDF9F7', '#F7F0EC']}
      style={styles.container}
    >
      <Animated.View
        style={[styles.logoContainer, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles.moonContainer}>
          <Text style={styles.moonEmoji}>🌙</Text>
        </View>
        <Text style={styles.logoText}>luna</Text>
        <Text style={styles.tagline}>your cycle, understood</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    gap: 8,
  },
  moonContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#E84B7A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  moonEmoji: {
    fontSize: 40,
  },
  logoText: {
    fontFamily: FONTS.display.light,
    fontSize: FONT_SIZES['5xl'],
    color: COLORS.primary[600],
    letterSpacing: 8,
  },
  tagline: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.neutral[500],
    letterSpacing: 1.5,
  },
});
