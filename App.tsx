import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { CycleProvider } from './src/context/CycleContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { NotificationProvider } from './src/context/NotificationContext';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationTheme } from './src/constants/theme';
import {
  useFonts,
  Fraunces_300Light,
  Fraunces_400Regular,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Fraunces-Light':    Fraunces_300Light,
    'Fraunces-Regular':  Fraunces_400Regular,
    'Fraunces-SemiBold': Fraunces_600SemiBold,
    'DM-Sans-Regular':   DMSans_400Regular,
    'DM-Sans-Medium':    DMSans_500Medium,
    'DM-Sans-Bold':      DMSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <CycleProvider>
              <NotificationProvider>
                <NavigationContainer theme={navigationTheme}>
                  <RootNavigator />
                  <StatusBar style="auto" />
                </NavigationContainer>
              </NotificationProvider>
            </CycleProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}