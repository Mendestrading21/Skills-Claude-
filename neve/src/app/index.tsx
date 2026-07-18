import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';

import { APP_NAME, APP_TAGLINE } from '@/config/app';
import { Logo, ScreenBackground, Text } from '@/components';
import { palette } from '@/theme';
import { useAppStore } from '@/store';

/** Boot gate: shows a branded splash until the store hydrates, then routes. */
export default function Index() {
  const hydrated = useAppStore((s) => s.hydrated);
  const onboarded = useAppStore((s) => s.data.preferences.onboarded);

  if (!hydrated) {
    return (
      <View style={styles.root}>
        <ScreenBackground />
        <View style={styles.center}>
          <Logo size={64} />
          <Text variant="screenTitle" style={{ marginTop: 20 }}>
            {APP_NAME}
          </Text>
          <Text variant="meta" tone="secondary" style={{ marginTop: 6 }}>
            {APP_TAGLINE}
          </Text>
          <ActivityIndicator color={palette.accent} style={{ marginTop: 28 }} />
        </View>
      </View>
    );
  }

  return <Redirect href={onboarded ? '/(tabs)' : '/onboarding'} />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
