import React from 'react';
import { StyleSheet, Text as RNText, View } from 'react-native';

import { categoryColors, useTheme } from '@/theme';

export type AvatarProps = {
  emoji: string;
  /** Tint index into the category palette (background halo). */
  colorIndex?: number;
  color?: string;
  size?: number;
};

/** A soft glass tile holding an emoji — used as a leading element in rows. */
export function Avatar({ emoji, colorIndex, color, size = 40 }: AvatarProps) {
  const theme = useTheme();
  const tint = color ?? (colorIndex != null ? categoryColors[colorIndex % categoryColors.length] : theme.colors.accent);
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size * 0.32,
          backgroundColor: hexWithAlpha(tint, 0.16),
          borderColor: hexWithAlpha(tint, 0.32),
        },
      ]}
    >
      <RNText style={{ fontSize: size * 0.5 }}>{emoji}</RNText>
    </View>
  );
}

/** Accepts #rrggbb or rgba() and returns an rgba string at the given alpha. */
function hexWithAlpha(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return color;
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
