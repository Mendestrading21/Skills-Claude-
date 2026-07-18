import React from 'react';
import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { useTheme } from '@/theme';
import { Text } from './Text';

export type FieldProps = TextInputProps & {
  label: string;
  error?: string | null;
  hint?: string;
  right?: React.ReactNode;
};

/** Labelled text input with glass styling and inline validation. */
export function Field({ label, error, hint, right, style, ...rest }: FieldProps) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="micro" tone="muted">
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.negative : theme.colors.border,
          },
        ]}
      >
        <TextInput
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, { color: theme.colors.text }, style]}
          {...rest}
        />
        {right}
      </View>
      {error ? (
        <Text variant="micro" tone="negative">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="micro" tone="muted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 12 },
});
