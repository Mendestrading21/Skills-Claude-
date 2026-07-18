import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { Text } from './Text';

export type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: object;
};

export function SectionHeader({ title, actionLabel, onAction, style }: SectionHeaderProps) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { marginBottom: theme.spacing.md }, style]}>
      <Text variant="sectionTitle">{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <Text variant="meta" tone="accent" weight="semibold">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
