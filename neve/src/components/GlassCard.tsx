import React from 'react';
import { Platform, StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

import { useTheme } from '@/theme';

export type GlassCardProps = ViewProps & {
  /** Stronger surface for emphasised panels. */
  strong?: boolean;
  /** Padding preset. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Corner radius preset. */
  radius?: 'card' | 'panel' | 'control';
  intensity?: number;
};

/**
 * The core glass surface: a measured blur with a hairline luminous border and
 * a subtle shadow. Falls back to an opaque surface when transparency is
 * reduced or blur is unavailable.
 */
export function GlassCard({
  strong,
  padding = 'md',
  radius = 'card',
  intensity = 24,
  style,
  children,
  ...rest
}: GlassCardProps) {
  const theme = useTheme();

  const paddingValue: Record<NonNullable<GlassCardProps['padding']>, number> = {
    none: 0,
    sm: theme.spacing.md,
    md: theme.spacing.base,
    lg: theme.spacing.lg,
  };

  const base: ViewStyle = {
    borderRadius: theme.radii[radius],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: strong ? theme.colors.borderStrong : theme.colors.border,
    padding: paddingValue[padding],
    overflow: 'hidden',
  };

  const surfaceColor = strong ? theme.colors.surfaceStrong : theme.colors.surface;

  if (!theme.glassEnabled || Platform.OS === 'android') {
    // Opaque fallback keeps contrast without depending on backdrop blur.
    return (
      <View
        {...rest}
        style={[base, { backgroundColor: surfaceColor }, theme.shadow.card, style]}
      >
        {children}
      </View>
    );
  }

  return (
    <View {...rest} style={[base, theme.shadow.card, style]}>
      <BlurView
        intensity={intensity}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: surfaceColor }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { position: 'relative' },
});
