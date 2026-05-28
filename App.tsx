import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { CycleProvider } from './src/context/CycleContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { NotificationProvider } from './src/context/NotificationContext';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationTheme } from './src/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          'Fraunces-Light': require('./src/assets/fonts/Fraunces-Light.ttf'),
          'Fraunces-Regular': require('./src/assets/fonts/Fraunces-Regular.ttf'),
          'Fraunces-SemiBold': require('./src/assets/fonts/Fraunces-SemiBold.ttf'),
          'DM-Sans-Regular': require('./src/assets/fonts/DMSans-Regular.ttf'),
          'DM-Sans-Medium': require('./src/assets/fonts/DMSans-Medium.ttf'),
          'DM-Sans-Bold': require('./src/assets/fonts/DMSans-Bold.ttf'),
        });
      } catch (e) {
        console.warn('Font loading failed, using system fonts:', e);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!appReady) return null;

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
