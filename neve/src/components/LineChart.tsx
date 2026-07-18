import React, { useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import type { SeriesPoint } from '@/domain';
import { formatMinor } from '@/domain/money';
import type { CurrencyCode } from '@/types';
import { formatDateFr } from '@/utils/date';
import { useTheme } from '@/theme';
import { Text } from './Text';

export type LineChartProps = {
  points: SeriesPoint[];
  currency: CurrencyCode;
  height?: number;
  color?: string;
};

/**
 * Touchable net-worth area chart. Drag across it to inspect a point; the value
 * and date are surfaced textually (accessible beyond colour).
 */
export function LineChart({ points, currency, height = 180, color }: LineChartProps) {
  const theme = useTheme();
  const stroke = color ?? theme.colors.accent;
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const geometry = useMemo(() => {
    if (points.length < 2 || width === 0) return null;
    const values = points.map((p) => p.y);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const padY = 12;
    const stepX = width / (points.length - 1);
    const coords = points.map((p, i) => ({
      x: i * stepX,
      y: padY + (1 - (p.y - min) / span) * (height - padY * 2),
    }));
    const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(' ');
    const area = `${line} L${width},${height} L0,${height} Z`;
    return { coords, line, area, stepX };
  }, [points, width, height]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => updateSelection(e.nativeEvent.locationX),
        onPanResponderMove: (e) => updateSelection(e.nativeEvent.locationX),
        onPanResponderRelease: () => setSelected(null),
        onPanResponderTerminate: () => setSelected(null),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [geometry],
  );

  function updateSelection(x: number) {
    if (!geometry) return;
    const idx = Math.max(0, Math.min(points.length - 1, Math.round(x / geometry.stepX)));
    setSelected(idx);
  }

  if (points.length < 2) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text variant="meta" tone="muted">
          Pas assez de données pour tracer l’historique.
        </Text>
      </View>
    );
  }

  const marker = selected != null && geometry ? geometry.coords[selected] : null;
  const selectedPoint = selected != null ? points[selected] : null;

  return (
    <View onLayout={onLayout} style={{ height }}>
      {width > 0 && geometry && (
        <>
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={stroke} stopOpacity={0.30} />
                <Stop offset="1" stopColor={stroke} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Path d={geometry.area} fill="url(#areaFill)" />
            <Path
              d={geometry.line}
              stroke={stroke}
              strokeWidth={2.5}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {marker && (
              <>
                <Line
                  x1={marker.x}
                  y1={0}
                  x2={marker.x}
                  y2={height}
                  stroke={theme.colors.borderStrong}
                  strokeWidth={1}
                  strokeDasharray="3 4"
                />
                <Circle cx={marker.x} cy={marker.y} r={5} fill={stroke} stroke={theme.colors.background} strokeWidth={2} />
              </>
            )}
          </Svg>
          <View
            style={StyleSheet.absoluteFill}
            {...panResponder.panHandlers}
            accessibilityLabel="Historique du patrimoine, glissez pour explorer les valeurs"
          />
          {selectedPoint && marker && (
            <View
              pointerEvents="none"
              style={[
                styles.tooltip,
                {
                  left: Math.max(0, Math.min(width - 130, marker.x - 65)),
                  backgroundColor: theme.colors.surfaceStrong,
                  borderColor: theme.colors.borderStrong,
                },
              ]}
            >
              <Text variant="micro" tone="muted">
                {formatDateFr(selectedPoint.label)}
              </Text>
              <Text variant="cardTitle" tabular>
                {formatMinor(selectedPoint.y, currency)}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center' },
  tooltip: {
    position: 'absolute',
    top: 0,
    width: 130,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 2,
  },
});
