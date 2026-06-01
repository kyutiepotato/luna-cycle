import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Rect, Line, Ellipse, Polyline } from 'react-native-svg';
import { MainTabParamList } from '../types';
import { useTheme } from '../context/ThemeContext';
import { COLORS, FONTS, FONT_SIZES } from '../constants/theme';
import HomeScreen from '../screens/main/HomeScreen';
import CalendarScreen from '../screens/main/CalendarScreen';
import TrackNavigator from './TrackNavigator';
import AnalyticsScreen from '../screens/main/AnalyticsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// ─── Safe haptics helper (no-op on web) ──────────────────────────────────────
const triggerHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

// ─── SVG Tab Icons ────────────────────────────────────────────────────────────

function IconHome({ size = 22, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round"
      />
      <Path
        d="M9 21V12h6v9"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
    </Svg>
  );
}

function IconCalendar({ size = 22, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="3" stroke={color} strokeWidth="1.5" fill="none" />
      <Line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="8" cy="14" r="1" fill={color} />
      <Circle cx="12" cy="14" r="1" fill={color} />
      <Circle cx="16" cy="14" r="1" fill={color} />
    </Svg>
  );
}

function IconSparkle({ size = 22, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2 L13.5 9 L20 12 L13.5 15 L12 22 L10.5 15 L4 12 L10.5 9 Z" fill={color} />
      <Circle cx="19" cy="5" r="1.5" fill={color} opacity="0.7" />
      <Circle cx="5" cy="19" r="1" fill={color} opacity="0.5" />
    </Svg>
  );
}

function IconBarChart({ size = 22, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="12" width="4" height="9" rx="1" fill={color} opacity="0.6" />
      <Rect x="10" y="7" width="4" height="14" rx="1" fill={color} />
      <Rect x="17" y="3" width="4" height="18" rx="1" fill={color} opacity="0.8" />
    </Svg>
  );
}

function IconUser({ size = 22, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.5" fill="none" />
      <Path
        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"
      />
    </Svg>
  );
}

// ─── Tab Icon Component ───────────────────────────────────────────────────────

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  if (name === 'Track') {
    return (
      <View style={[
        styles.trackButton,
        { backgroundColor: focused ? COLORS.primary[500] : COLORS.primary[100] },
      ]}>
        <IconSparkle size={22} color={focused ? '#FFFFFF' : COLORS.primary[400]} />
      </View>
    );
  }

  const size = focused ? 22 : 20;

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      {name === 'Home'      && <IconHome      size={size} color={color} />}
      {name === 'Calendar'  && <IconCalendar  size={size} color={color} />}
      {name === 'Analytics' && <IconBarChart  size={size} color={color} />}
      {name === 'Profile'   && <IconUser      size={size} color={color} />}
    </View>
  );
}

// ─── Main Navigator ───────────────────────────────────────────────────────────

export default function MainNavigator() {
  const { colors } = useTheme();
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
              triggerHaptic();
              props.onPress?.(e);
            }}
          />
        ),
      })}
    >
      <Tab.Screen name="Home"      component={HomeScreen}      options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Calendar"  component={CalendarScreen}  options={{ tabBarLabel: 'Cycle' }} />
      <Tab.Screen name="Track"     component={TrackNavigator}  options={{ tabBarLabel: 'Track' }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ tabBarLabel: 'Insights' }} />
      <Tab.Screen name="Profile"   component={ProfileScreen}   options={{ tabBarLabel: 'You' }} />
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