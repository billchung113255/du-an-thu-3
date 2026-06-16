import React, { useCallback } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, type Theme } from '@react-navigation/native';
import {
  useFonts,
  Spectral_500Medium,
  Spectral_600SemiBold,
  Spectral_700Bold,
  Spectral_500Medium_Italic,
} from '@expo-google-fonts/spectral';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from '@expo-google-fonts/hanken-grotesk';

import { AuthProvider } from './src/app/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { brand } from './src/theme/brand';

void SplashScreen.preventAutoHideAsync();

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: brand.paper,
    card: brand.white,
    text: brand.ink,
    primary: brand.gold,
    border: brand.line,
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Spectral_500Medium,
    Spectral_600SemiBold,
    Spectral_700Bold,
    Spectral_500Medium_Italic,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
  });

  const onReady = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: brand.paper }} onLayout={onReady}>
        <StatusBar style="dark" />
        <AuthProvider>
          <NavigationContainer theme={navTheme}>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
}
