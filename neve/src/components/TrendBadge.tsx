import React from 'react';
import { StyleSheet, View } from 'react-native';

import { formatPercent } from '@/domain/money';
import { useTheme } from '@/theme';
import { Text } from './Text';

export type TrendBadgeProps = {
  /** Ratio, e.g. 0.081 -> "+8.10 %". Null renders a neutral placeholder. */
  ratio: number | null;
  /** Optional explicit direction when ratio is null but sign is known. */
  size?: 'sm' | 'md';
};

/** Small pill showing a signed percentage with an arrow glyph (not colour-only). */
export function TrendBadge({ ratio, size = 'md' }: TrendBadgeProps) {
  const theme = useTheme();
  const positive = (ratio ?? 0) >= 0;
  const color = ratio == null ? theme.colors.textMuted : positive ? theme.colors.positive : theme.colors.negative;
  const bg = ratio == null
    ? theme.colors.surface
    : positive
      ? 'rgba(49,209,124,0.14)'
      : 'rgba(255,100,100,0.14)';
  const arrow = ratio == null ? '·' : positive ? '▲' : '▼';

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: bg, paddingVertical: size === 'sm' ? 2 : 4, borderColor: color },
      ]}
    >
      <Text variant="meta" weight="semibold" style={{ color }}>
        {arrow} {ratio == null ? '—' : formatPercent(ratio)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-start',
  },
});
