import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { haptics } from '@/services/haptics';
import { useTheme } from '@/theme';
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
      style={({ pressed }) => [
        styles.fab,
        theme.shadow.floating,
        { backgroundColor: theme.colors.accent, bottom, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <Icon name="plus" size={26} color={theme.colors.onAccent} strokeWidth={2.6} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
