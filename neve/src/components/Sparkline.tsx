import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/theme';

export type SparklineProps = {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
};

/** Minimal area sparkline for at-a-glance trend inside cards. */
export function Sparkline({ values, width = 96, height = 32, color, fill = true }: SparklineProps) {
  const theme = useTheme();
  const stroke = color ?? theme.colors.accent;
  if (values.length < 2) return <Svg width={width} height={height} />;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = width / (values.length - 1);
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / span) * (height - 2) - 1;
    return { x, y };
  });

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={stroke} stopOpacity={0.28} />
          <Stop offset="1" stopColor={stroke} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {fill && <Path d={area} fill="url(#spark)" />}
      <Path d={line} stroke={stroke} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}
