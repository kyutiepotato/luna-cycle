import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TrackStackParamList, OnboardingStackParamList } from '../types';

// Track Navigator
const TrackStack = createNativeStackNavigator<TrackStackParamList>();

import TrackHomeScreen from '../screens/main/TrackHomeScreen';
import SymptomTrackerScreen from '../screens/main/SymptomTrackerScreen';
import MoodTrackerScreen from '../screens/main/MoodTrackerScreen';
import FlowTrackerScreen from '../screens/main/FlowTrackerScreen';
import WellnessTrackerScreen from '../screens/main/WellnessTrackerScreen';
import JournalScreen from '../screens/main/JournalScreen';
import JournalEntryScreen from '../screens/main/JournalEntryScreen';

export function TrackNavigator() {
  return (
    <TrackStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
        contentStyle: { backgroundColor: '#FDF9F7' },
      }}
    >
      <TrackStack.Screen name="TrackHome" component={TrackHomeScreen} />
      <TrackStack.Screen name="SymptomTracker" component={SymptomTrackerScreen} />
      <TrackStack.Screen name="MoodTracker" component={MoodTrackerScreen} />
      <TrackStack.Screen name="FlowTracker" component={FlowTrackerScreen} />
      <TrackStack.Screen name="WellnessTracker" component={WellnessTrackerScreen} />
      <TrackStack.Screen name="Journal" component={JournalScreen} />
      <TrackStack.Screen name="JournalEntry" component={JournalEntryScreen} />
    </TrackStack.Navigator>
  );
}

export default TrackNavigator;

// Onboarding Navigator
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();

import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import CycleInfoScreen from '../screens/onboarding/CycleInfoScreen';
import GoalSetupScreen from '../screens/onboarding/GoalSetupScreen';
import NotificationSetupScreen from '../screens/onboarding/NotificationSetupScreen';
import OnboardingCompleteScreen from '../screens/onboarding/OnboardingCompleteScreen';

export function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#FDF9F7' },
      }}
    >
      <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} />
      <OnboardingStack.Screen name="CycleInfo" component={CycleInfoScreen} />
      <OnboardingStack.Screen name="GoalSetup" component={GoalSetupScreen} />
      <OnboardingStack.Screen name="NotificationSetup" component={NotificationSetupScreen} />
      <OnboardingStack.Screen name="Complete" component={OnboardingCompleteScreen} />
    </OnboardingStack.Navigator>
  );
}
