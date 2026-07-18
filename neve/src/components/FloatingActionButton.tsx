import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { haptics } from '@/services/haptics';
import { gradients, useTheme } from '@/theme';
import { Icon } from './Icon';

/** Primary floating add button. Positioned above the tab bar by callers. */
export function FloatingActionButton({ onPress, bottom = 96 }: { onPress: () => void; bottom?: number }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptics.light();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel="Ajout rapide"
      style={({ pressed }) => [styles.fab, theme.shadow.floating, { bottom, opacity: pressed ? 0.92 : 1 }]}
    >
      <LinearGradient
        colors={[...gradients.sunrise]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Icon name="plus" size={26} color={theme.colors.onAccent} strokeWidth={2.6} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
