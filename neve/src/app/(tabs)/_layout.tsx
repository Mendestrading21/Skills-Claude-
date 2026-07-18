import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingActionButton, TabBar } from '@/components';
import { QuickAddProvider, useQuickAdd } from '@/features/forms/QuickAddProvider';

function FabLayer() {
  const { open } = useQuickAdd();
  const insets = useSafeAreaInsets();
  return <FloatingActionButton onPress={() => open('menu')} bottom={insets.bottom + 88} />;
}

export default function TabsLayout() {
  return (
    <QuickAddProvider>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="wealth" />
        <Tabs.Screen name="portfolio" />
        <Tabs.Screen name="budget" />
        <Tabs.Screen name="activity" />
      </Tabs>
      <FabLayer />
    </QuickAddProvider>
  );
}
