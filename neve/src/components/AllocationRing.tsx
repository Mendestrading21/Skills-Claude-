import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { categoryColors, useTheme } from '@/theme';
import { Text } from './Text';

export type RingSlice = { key: string; label: string; ratio: number; color?: string };

export type AllocationRingProps = {
  slices: RingSlice[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
};

/** Donut allocation chart. Colours never carry meaning alone — a legend pairs it. */
export function AllocationRing({
  slices,
  size = 160,
  strokeWidth = 18,
  centerLabel,
  centerValue,
}: AllocationRingProps) {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = slices.reduce((s, x) => s + x.ratio, 0);
  const normalised = total > 0 ? slices.map((s) => ({ ...s, ratio: s.ratio / total })) : slices;

  const lengths = normalised.map((s) => s.ratio * circumference);
  // Cumulative start offset for each segment, computed without mutation.
  const offsets = lengths.map((_, i) => lengths.slice(0, i).reduce((a, b) => a + b, 0));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation={-90} originX={size / 2} originY={size / 2}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.colors.surfaceStrong}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {normalised.map((slice, i) => {
            const length = lengths[i];
            const color = slice.color ?? categoryColors[i % categoryColors.length];
            return (
              <Circle
                key={slice.key}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offsets[i]}
                strokeLinecap="butt"
                fill="none"
              />
            );
          })}
        </G>
      </Svg>
      {(centerLabel || centerValue) && (
        <View style={styles.center} pointerEvents="none">
          {centerValue ? (
            <Text variant="cardValue" tabular>
              {centerValue}
            </Text>
          ) : null}
          {centerLabel ? (
            <Text variant="micro" tone="muted">
              {centerLabel}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
});
