import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { haptics } from '@/services/haptics';
import { useTheme } from '@/theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: object;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
  fullWidth = true,
  style,
}: ButtonProps) {
  const theme = useTheme();

  const handlePress = () => {
    if (disabled || loading) return;
    haptics.light();
    onPress?.();
  };

  const palettes: Record<Variant, { bg: string; border: string; tone: 'onAccent' | 'default' | 'negative' }> = {
    primary: { bg: theme.colors.accent, border: theme.colors.accent, tone: 'onAccent' },
    secondary: { bg: theme.colors.surfaceStrong, border: theme.colors.borderStrong, tone: 'default' },
    destructive: { bg: 'rgba(255,100,100,0.14)', border: theme.colors.negative, tone: 'negative' },
    ghost: { bg: 'transparent', border: 'transparent', tone: 'default' },
  };
  const p = palettes[variant];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: p.bg,
          borderColor: p.border,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? theme.colors.onAccent : theme.colors.text} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text weight="semibold" tone={p.tone}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
