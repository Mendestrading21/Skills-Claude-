import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, palette } from '@/theme';
import { useAppStore } from '@/store';

export default function RootLayout() {
  const init = useAppStore((s) => s.init);
  const reducedTransparency = useAppStore((s) => s.data.preferences.reducedTransparency);
  const hideAmounts = useAppStore((s) => s.data.preferences.hideAmounts ?? false);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.background }}>
      <SafeAreaProvider>
        <ThemeProvider reducedTransparency={reducedTransparency} hideAmounts={hideAmounts}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: palette.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="settings" options={{ presentation: 'card' }} />
            <Stack.Screen name="assistant" options={{ presentation: 'card' }} />
            <Stack.Screen name="insights" options={{ presentation: 'card' }} />
            <Stack.Screen name="setup" options={{ presentation: 'card' }} />
            <Stack.Screen name="position/[id]" />
            <Stack.Screen name="account/[id]" />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
