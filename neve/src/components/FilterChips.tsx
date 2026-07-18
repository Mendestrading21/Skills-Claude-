import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { haptics } from '@/services/haptics';
import { useTheme } from '@/theme';
import { Text } from './Text';

export type Chip<T extends string> = { value: T; label: string };

export type FilterChipsProps<T extends string> = {
  chips: Chip<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Horizontally scrollable single-select filter chips. */
export function FilterChips<T extends string>({ chips, value, onChange }: FilterChipsProps<T>) {
  const theme = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {chips.map((chip) => {
        const active = chip.value === value;
        return (
          <Pressable
            key={chip.value}
            onPress={() => {
              haptics.select();
              onChange(chip.value);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              styles.chip,
              {
                backgroundColor: active ? theme.colors.accent : theme.colors.surface,
                borderColor: active ? theme.colors.accent : theme.colors.border,
              },
            ]}
          >
            <Text variant="meta" weight="semibold" tone={active ? 'onAccent' : 'secondary'}>
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingRight: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
