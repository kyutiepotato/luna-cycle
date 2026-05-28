import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { MainTabParamList } from '../types';
import { useTheme } from '../context/ThemeContext';
import { COLORS, FONTS, FONT_SIZES } from '../constants/theme';
import HomeScreen from '../screens/main/HomeScreen';
import CalendarScreen from '../screens/main/CalendarScreen';
import TrackNavigator from './TrackNavigator';
import AnalyticsScreen from '../screens/main/AnalyticsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom tab bar icon component
function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const icons: Record<string, { active: string; inactive: string }> = {
    Home: { active: '🏠', inactive: '🏠' },
    Calendar: { active: '📅', inactive: '📅' },
    Track: { active: '✦', inactive: '✦' },
    Analytics: { active: '📊', inactive: '📊' },
    Profile: { active: '👤', inactive: '👤' },
  };

  const svgIcons: Record<string, JSX.Element> = {};

  if (name === 'Track') {
    return (
      <View style={[styles.trackButton, { backgroundColor: focused ? COLORS.primary[500] : COLORS.primary[100] }]}>
        <Text style={{ fontSize: 22 }}>✦</Text>
      </View>
    );
  }

  const emojiIcons: Record<string, string> = {
    Home: '⌂',
    Calendar: '◯',
    Analytics: '≋',
    Profile: '◎',
  };

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Text style={[styles.iconText, { color, fontSize: focused ? 22 : 20 }]}>
        {emojiIcons[name] || '•'}
      </Text>
    </View>
  );
}

export default function MainNavigator() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar.background,
          borderTopColor: colors.tabBar.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          ...Platform.select({
            ios: {
              shadowColor: '#E84B7A',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarActiveTintColor: colors.tabBar.active,
        tabBarInactiveTintColor: colors.tabBar.inactive,
        tabBarLabelStyle: {
          fontFamily: FONTS.body.medium,
          fontSize: 10,
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name} focused={focused} color={color} />
        ),
        tabBarButton: (props) => (
          <Pressable
            {...props}
            onPress={(e) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              props.onPress?.(e);
            }}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ tabBarLabel: 'Cycle' }} />
      <Tab.Screen name="Track" component={TrackNavigator} options={{ tabBarLabel: 'Track' }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ tabBarLabel: 'Insights' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'You' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  iconContainerActive: {
    backgroundColor: COLORS.primary[50],
  },
  iconText: {
    lineHeight: 24,
  },
  trackButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
