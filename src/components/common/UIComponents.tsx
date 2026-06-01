import React from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

// ─── Safe haptics helper (no-op on web) ──────────────────────────────────────
const triggerHaptic = (style: 'light' | 'medium' = 'light') => {
  if (Platform.OS === 'web') return;
  if (style === 'medium') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } else {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  icon,
  style,
}: ButtonProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    if (!disabled && !isLoading) {
      triggerHaptic('medium');
      onPress();
    }
  };

  const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: RADIUS.lg },
    md: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: RADIUS.xl },
    lg: { paddingVertical: 18, paddingHorizontal: 32, borderRadius: RADIUS['2xl'] },
  };

  const fontSize = { sm: FONT_SIZES.sm, md: FONT_SIZES.base, lg: FONT_SIZES.md }[size];

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || isLoading}
        style={({ pressed }) => [style, { opacity: pressed ? 0.85 : 1 }]}
      >
        <LinearGradient
          colors={disabled ? ['#DDD6FE', '#C4B5FD'] : [COLORS.primary[400], COLORS.primary[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.button, sizeStyles[size], SHADOWS.md]}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.buttonContent}>
              {icon}
              <Text style={[styles.buttonText, { fontSize, color: '#FFFFFF' }]}>{label}</Text>
            </View>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  const variantStyles: Record<string, any> = {
    secondary: {
      bg: colors.surfaceSecondary,
      border: colors.border,
      text: colors.text.primary,
    },
    ghost: {
      bg: 'transparent',
      border: 'transparent',
      text: COLORS.primary[500],
    },
    danger: {
      bg: '#FEF2F2',
      border: '#FECACA',
      text: '#EF4444',
    },
  };

  const vs = variantStyles[variant];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.button,
        sizeStyles[size],
        {
          backgroundColor: vs.bg,
          borderColor: vs.border,
          borderWidth: variant === 'secondary' ? 1 : 0,
          opacity: pressed ? 0.7 : disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <View style={styles.buttonContent}>
        {isLoading ? (
          <ActivityIndicator color={vs.text} size="small" />
        ) : (
          <>
            {icon}
            <Text style={[styles.buttonText, { fontSize, color: vs.text }]}>{label}</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  gradient?: [string, string];
  padding?: number;
}

export function Card({ children, style, onPress, gradient, padding = SPACING[4] }: CardProps) {
  const { colors } = useTheme();

  const inner = (
    <View style={[{ padding }]}>
      {children}
    </View>
  );

  const cardBase = [
    styles.card,
    { backgroundColor: colors.surface, borderColor: colors.border },
    SHADOWS.sm,
    style,
  ];

  if (gradient) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed && onPress ? 0.9 : 1 }]}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, SHADOWS.md, style]}
        >
          {inner}
        </LinearGradient>
      </Pressable>
    );
  }

  if (onPress) {
    return (
      <Pressable
        onPress={() => {
          triggerHaptic('light');
          onPress();
        }}
        style={({ pressed }) => [cardBase, { opacity: pressed ? 0.9 : 1 }]}
      >
        {inner}
      </Pressable>
    );
  }

  return <View style={cardBase}>{inner}</View>;
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, leftIcon, rightIcon, containerStyle, style, ...props }: InputProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label && (
        <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
          {label}
        </Text>
      )}
      <View style={[
        styles.inputWrapper,
        {
          backgroundColor: colors.surfaceTertiary,
          borderColor: error ? COLORS.error : colors.border,
        },
      ]}>
        {leftIcon && <View style={styles.inputIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text.primary,
              fontFamily: FONTS.body.regular,
              paddingLeft: leftIcon ? 0 : SPACING[4],
            },
            style,
          ]}
          placeholderTextColor={colors.text.tertiary}
          {...props}
        />
        {rightIcon && <View style={styles.inputIcon}>{rightIcon}</View>}
      </View>
      {error && (
        <Text style={styles.inputError}>{error}</Text>
      )}
    </View>
  );
}

// ─── Chip / Tag ───────────────────────────────────────────────────────────────
interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
  size?: 'sm' | 'md';
}

export function Chip({ label, selected, onPress, color = COLORS.primary[500], size = 'md' }: ChipProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => {
        if (onPress) {
          triggerHaptic('light');
          onPress();
        }
      }}
      style={[
        styles.chip,
        size === 'sm' ? styles.chipSm : styles.chipMd,
        {
          backgroundColor: selected ? color + '20' : colors.surfaceTertiary,
          borderColor: selected ? color : colors.border,
          borderWidth: 1.5,
        },
      ]}
    >
      <Text style={[
        styles.chipText,
        {
          color: selected ? color : colors.text.secondary,
          fontSize: size === 'sm' ? FONT_SIZES.xs : FONT_SIZES.sm,
          fontFamily: selected ? FONTS.body.medium : FONTS.body.regular,
        },
      ]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{title}</Text>
      {action && (
        <Pressable onPress={onAction}>
          <Text style={[styles.sectionAction, { color: COLORS.primary[500] }]}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({
  emoji,
  title,
  body,
  action,
  onAction,
}: {
  emoji?: string;
  icon?: React.ReactNode;
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.emptyState}>
      {emoji && <Text style={styles.emptyEmoji}>{emoji}</Text>}
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>{title}</Text>
      <Text style={[styles.emptyBody, { color: colors.text.secondary }]}>{body}</Text>
      {action && onAction && (
        <Button label={action} onPress={onAction} size="sm" style={{ marginTop: SPACING[4] }} />
      )}
    </View>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ style }: { style?: ViewStyle }) {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border }, style]} />;
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontFamily: FONTS.body.medium,
    letterSpacing: 0.3,
  },
  card: {
    borderRadius: RADIUS['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
  },
  inputContainer: {
    gap: SPACING[1],
  },
  inputLabel: {
    fontFamily: FONTS.body.medium,
    fontSize: FONT_SIZES.sm,
    marginBottom: 2,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    minHeight: 52,
  },
  inputIcon: {
    paddingHorizontal: SPACING[3],
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    paddingVertical: 14,
    paddingRight: SPACING[4],
  },
  inputError: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginLeft: 2,
  },
  chip: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
  },
  chipSm: { paddingVertical: 6 },
  chipMd: { paddingVertical: 8 },
  chipText: {
    letterSpacing: 0.2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  sectionTitle: {
    fontFamily: FONTS.display.semiBold,
    fontSize: FONT_SIZES.lg,
  },
  sectionAction: {
    fontFamily: FONTS.body.medium,
    fontSize: FONT_SIZES.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING[10],
    paddingHorizontal: SPACING[8],
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: SPACING[4],
  },
  emptyTitle: {
    fontFamily: FONTS.display.semiBold,
    fontSize: FONT_SIZES.xl,
    textAlign: 'center',
    marginBottom: SPACING[2],
  },
  emptyBody: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    marginVertical: SPACING[4],
  },
});