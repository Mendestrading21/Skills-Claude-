import React, { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { useTheme } from '@/theme';
import { Text } from './Text';

export type BarDatum = { label: string; value: number; color?: string };

export type BarChartProps = {
  data: BarDatum[];
  height?: number;
};

/** Simple vertical bar chart (e.g. cash-flow by month), with labels below. */
export function BarChart({ data, height = 140 }: BarChartProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const max = Math.max(1, ...data.map((d) => Math.abs(d.value)));
  const barsCount = data.length || 1;
  const gap = 10;
  const barWidth = width > 0 ? Math.max(6, (width - gap * (barsCount - 1)) / barsCount) : 0;
  const chartHeight = height - 22;

  return (
    <View onLayout={onLayout}>
      {width > 0 && (
        <Svg width={width} height={chartHeight}>
          {data.map((d, i) => {
            const h = (Math.abs(d.value) / max) * (chartHeight - 4);
            const x = i * (barWidth + gap);
            const y = chartHeight - h;
            return (
              <Rect
                key={d.label + i}
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx={5}
                fill={d.color ?? theme.colors.accent}
                opacity={0.9}
              />
            );
          })}
        </Svg>
      )}
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        {data.map((d, i) => (
          <View key={d.label + i} style={{ width: barWidth + gap, alignItems: 'flex-start' }}>
            <Text variant="micro" tone="muted" numberOfLines={1}>
              {d.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
