import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, CYCLE_PHASES, FONTS, FONT_SIZES, SHADOWS } from '../../constants/theme';
import { CyclePhase, CyclePrediction } from '../../types';

interface CycleRingProps {
  phase: CyclePhase;
  daysUntilPeriod: number;
  cycleDay?: number;
  cycleLength?: number;
  confidence?: number;
  onPress?: () => void;
  size?: number;
}

export function CycleRing({
  phase,
  daysUntilPeriod,
  cycleDay = 1,
  cycleLength = 28,
  confidence = 75,
  onPress,
  size = 240,
}: CycleRingProps) {
  const phaseConfig = CYCLE_PHASES[phase] || CYCLE_PHASES.follicular;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const strokeWidth = 10;
  const radius = (size / 2) - strokeWidth - 4;
  const circumference = 2 * Math.PI * radius;
  const progress = (cycleDay / cycleLength) * circumference;
  const center = size / 2;

  const ringMessage = (): { label: string; sub: string } => {
    if (phase === 'menstrual') return { label: 'Day ' + cycleDay, sub: 'of your period' };
    if (daysUntilPeriod === 0) return { label: 'Today', sub: 'period may start' };
    if (daysUntilPeriod <= 7) return { label: daysUntilPeriod + 'd', sub: 'until period' };
    return { label: 'Day ' + cycleDay, sub: phaseConfig.label + ' phase' };
  };

  const { label, sub } = ringMessage();

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Pressable onPress={onPress}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          {/* Outer glow */}
          <View style={[styles.glowRing, {
            width: size + 20,
            height: size + 20,
            borderRadius: (size + 20) / 2,
            backgroundColor: phaseConfig.color + '15',
            position: 'absolute',
            top: -10,
            left: -10,
          }]} />

          <Svg width={size} height={size}>
            <Defs>
              <SvgGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={phaseConfig.gradient[0]} stopOpacity="1" />
                <Stop offset="1" stopColor={phaseConfig.gradient[1]} stopOpacity="1" />
              </SvgGradient>
            </Defs>

            {/* Background track */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={phaseConfig.color + '20'}
              strokeWidth={strokeWidth}
            />

            {/* Progress arc */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="url(#ringGrad)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
            />
          </Svg>

          {/* Center content */}
          <View style={[styles.centerContent, { width: size, height: size }]}>
            <LinearGradient
              colors={[phaseConfig.gradient[0] + '40', phaseConfig.gradient[1] + '20']}
              style={[styles.innerCircle, {
                width: size - strokeWidth * 4,
                height: size - strokeWidth * 4,
                borderRadius: (size - strokeWidth * 4) / 2,
              }]}
            >
              <Text style={styles.phaseEmoji}>{phaseConfig.icon}</Text>
              <Text style={[styles.dayLabel, { color: phaseConfig.gradient[1] }]}>{label}</Text>
              <Text style={styles.daySubLabel}>{sub}</Text>
              {confidence < 85 && (
                <View style={[styles.confidenceBadge, { backgroundColor: phaseConfig.color + '25' }]}>
                  <Text style={[styles.confidenceText, { color: phaseConfig.gradient[1] }]}>
                    {confidence}% confident
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Compact Phase Badge ──────────────────────────────────────────────────────
export function PhaseBadge({ phase, label }: { phase: CyclePhase; label?: string }) {
  const config = CYCLE_PHASES[phase];
  return (
    <View style={[styles.phaseBadge, { backgroundColor: config.color + '20', borderColor: config.color + '40' }]}>
      <Text style={{ fontSize: 14 }}>{config.icon}</Text>
      <Text style={[styles.phaseBadgeText, { color: config.gradient[1] }]}>
        {label || config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 20,
  },
  phaseEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  dayLabel: {
    fontFamily: FONTS.display.semiBold,
    fontSize: FONT_SIZES['3xl'],
    lineHeight: 38,
  },
  daySubLabel: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.sm,
    color: '#8B7B72',
    textAlign: 'center',
  },
  confidenceBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  confidenceText: {
    fontFamily: FONTS.body.medium,
    fontSize: FONT_SIZES.xs,
  },
  phaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  phaseBadgeText: {
    fontFamily: FONTS.body.medium,
    fontSize: FONT_SIZES.sm,
  },
});
