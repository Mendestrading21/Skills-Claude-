import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { Text } from './Text';

/** Small reassuring badge indicating data stays on device / is indicative. */
export function PrivacyBadge({ label = 'Local', tone = 'info' }: { label?: string; tone?: 'info' | 'muted' | 'accent' }) {
  const theme = useTheme();
  const color =
    tone === 'accent' ? theme.colors.accent : tone === 'muted' ? theme.colors.textMuted : theme.colors.info;
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="micro" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
