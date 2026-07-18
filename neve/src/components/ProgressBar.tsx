import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { categoryColors, gradients, useTheme } from '@/theme';

export type ProgressBarProps = {
  /** 0..1 (values above 1 are clamped visually but flagged by `over`). */
  ratio: number;
  color?: string;
  colorIndex?: number;
  height?: number;
  over?: boolean;
  /** Explicit two-stop gradient; overrides the automatic choice. */
  gradient?: readonly string[];
};

export function ProgressBar({ ratio, color, colorIndex, height = 8, over, gradient }: ProgressBarProps) {
  const theme = useTheme();
  const width = `${Math.max(0, Math.min(1, ratio)) * 100}%` as const;

  // Resolve the fill: over → flat red; category colour → flat; otherwise a warm
  // (or mint, for positive) gradient for a brighter, optimistic feel.
  const categoryColor = colorIndex != null ? categoryColors[colorIndex % categoryColors.length] : undefined;
  let fillColor: string | undefined;
  let fillGradient: readonly string[] | undefined;

  if (over) {
    fillColor = theme.colors.negative;
  } else if (gradient) {
    fillGradient = gradient;
  } else if (color === theme.colors.positive) {
    fillGradient = gradients.mint;
  } else if (color) {
    fillColor = color;
  } else if (categoryColor) {
    fillColor = categoryColor;
  } else {
    fillGradient = gradients.warm;
  }

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(Math.min(1, ratio) * 100), min: 0, max: 100 }}
      style={[styles.track, { height, borderRadius: height, backgroundColor: theme.colors.surfaceStrong }]}
    >
      <View style={[styles.fill, { width, borderRadius: height, overflow: 'hidden' }]}>
        {fillGradient ? (
          <LinearGradient
            colors={[...fillGradient] as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: fillColor }]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});
