import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { haptics } from '@/services/haptics';
import { useTheme } from '@/theme';
import { Text } from './Text';

export type Option<T extends string> = { value: T; label: string };

export type OptionGroupProps<T extends string> = {
  label?: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Wrapping chip group used to pick an enum value inside forms. */
export function OptionGroup<T extends string>({ label, options, value, onChange }: OptionGroupProps<T>) {
  const theme = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text variant="micro" tone="muted">
          {label}
        </Text>
      ) : null}
      <View style={styles.wrap}>
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
                styles.chip,
                {
                  backgroundColor: active ? theme.colors.accent : theme.colors.surface,
                  borderColor: active ? theme.colors.accent : theme.colors.border,
                },
              ]}
            >
              <Text variant="meta" weight="medium" tone={active ? 'onAccent' : 'secondary'}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
