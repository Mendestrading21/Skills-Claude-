import React from 'react';
import { StyleSheet, View } from 'react-native';

import { categoryColors, useTheme } from '@/theme';

export type ProgressBarProps = {
  /** 0..1 (values above 1 are clamped visually but flagged by `over`). */
  ratio: number;
  color?: string;
  colorIndex?: number;
  height?: number;
  over?: boolean;
};

export function ProgressBar({ ratio, color, colorIndex, height = 8, over }: ProgressBarProps) {
  const theme = useTheme();
  const fillColor = over
    ? theme.colors.negative
    : color ?? (colorIndex != null ? categoryColors[colorIndex % categoryColors.length] : theme.colors.accent);
  const width = `${Math.max(0, Math.min(1, ratio)) * 100}%` as const;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(Math.min(1, ratio) * 100), min: 0, max: 100 }}
      style={[styles.track, { height, borderRadius: height, backgroundColor: theme.colors.surfaceStrong }]}
    >
      <View style={[styles.fill, { width, backgroundColor: fillColor, borderRadius: height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});
