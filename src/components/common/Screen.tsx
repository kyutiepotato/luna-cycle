import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  StatusBar,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { SPACING } from '../../constants/theme';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  padding?: boolean;
  onRefresh?: () => Promise<void>;
  keyboardAvoiding?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function Screen({
  children,
  scroll = false,
  style,
  contentStyle,
  padding = true,
  onRefresh,
  keyboardAvoiding = false,
  edges = ['top', 'left', 'right'],
}: ScreenProps) {
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const base = (
    <SafeAreaView
      edges={edges}
      style={[styles.safe, { backgroundColor: colors.background }, style]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            padding && styles.paddedContent,
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.text.accent}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, padding && styles.paddedContent, contentStyle]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );

  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {base}
      </KeyboardAvoidingView>
    );
  }

  return base;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  paddedContent: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[2],
    paddingBottom: SPACING[6],
  },
});
