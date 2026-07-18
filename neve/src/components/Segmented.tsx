import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { haptics } from '@/services/haptics';
import { useTheme } from '@/theme';
import { Text } from './Text';

export type SegmentedOption<T extends string> = { value: T; label: string };

export type SegmentedProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  scroll?: boolean;
};

/** Compact segmented control used for chart ranges and small filters. */
export function Segmented<T extends string>({ options, value, onChange, scroll }: SegmentedProps<T>) {
  const theme = useTheme();

  const items = (
    <View style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              haptics.select();
              onChange(opt.value);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              styles.item,
              active && { backgroundColor: theme.colors.surfacePressed },
            ]}
          >
            <Text variant="meta" weight="semibold" tone={active ? 'default' : 'muted'}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  if (scroll) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {items}
      </ScrollView>
    );
  }
  return items;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 3,
    gap: 2,
  },
  item: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
});
