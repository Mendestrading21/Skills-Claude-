import React from 'react';
import { Platform, StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/theme';

export type GlassCardProps = ViewProps & {
  /** Stronger surface for emphasised panels. */
  strong?: boolean;
  /** Padding preset. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Corner radius preset. */
  radius?: 'card' | 'panel' | 'control';
  intensity?: number;
  /** Optional warm glow colour bled from the top edge (e.g. accent). */
  glow?: string;
  /** Disable the top sheen highlight. */
  flat?: boolean;
};

/**
 * The core glass surface: a measured blur with a hairline luminous border, a
 * soft top sheen and a subtle shadow. Falls back to an opaque surface when
 * transparency is reduced or blur is unavailable.
 */
export function GlassCard({
  strong,
  padding = 'md',
  radius = 'card',
  intensity = 24,
  glow,
  flat,
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

  const sheen = !flat ? (
    <LinearGradient
      colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.02)', 'rgba(255,255,255,0)']}
      locations={[0, 0.35, 1]}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  ) : null;

  const glowLayer = glow ? (
    <LinearGradient
      colors={[hexA(glow, 0.22), hexA(glow, 0.05), 'rgba(0,0,0,0)']}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.9, y: 0.8 }}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  ) : null;

  if (!theme.glassEnabled || Platform.OS === 'android') {
    return (
      <View {...rest} style={[base, { backgroundColor: surfaceColor }, theme.shadow.card, style]}>
        {glowLayer}
        {sheen}
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  return (
    <View {...rest} style={[base, theme.shadow.card, style]}>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: surfaceColor }]} />
      {glowLayer}
      {sheen}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

function hexA(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return color;
}

const styles = StyleSheet.create({
  content: { position: 'relative' },
});
