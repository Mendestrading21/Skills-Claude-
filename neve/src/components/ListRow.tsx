import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { categoryColors, useTheme } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';

export type ListRowProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  colorIndex?: number;
  leading?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
};

/** Generic content row used in lists (positions, transactions, budgets…). */
export function ListRow({
  title,
  subtitle,
  right,
  colorIndex,
  leading,
  onPress,
  showChevron,
}: ListRowProps) {
  const theme = useTheme();

  const content = (
    <View style={[styles.row, { paddingVertical: theme.spacing.md }]}>
      {leading ??
        (colorIndex != null ? (
          <View
            style={[
              styles.dot,
              { backgroundColor: categoryColors[colorIndex % categoryColors.length] },
            ]}
          />
        ) : null)}
      <View style={styles.textCol}>
        <Text variant="body" weight="medium" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="meta" tone="muted" numberOfLines={1} style={{ marginTop: 1 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>
        {right}
        {showChevron ? <Icon name="chevronRight" size={18} color={theme.colors.textMuted} /> : null}
      </View>
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      {content}
    </Pressable>
  );
}

export function RowDivider() {
  const theme = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border }} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  textCol: { flex: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
