import React, { useId } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

import { formatMinor } from '@/domain/money';
import { gradients, useTheme } from '@/theme';
import type { CurrencyCode } from '@/types';
import { AmountText } from './AmountText';

export type GradientAmountProps = {
  minor: number;
  currency: CurrencyCode;
  fontSize?: number;
  colors?: readonly string[];
  compact?: boolean;
};

/**
 * The headline amount rendered with a warm gradient for an optimistic feel.
 * Falls back to a plain masked amount when amounts are hidden.
 */
export function GradientAmount({
  minor,
  currency,
  fontSize = 40,
  colors = gradients.sunrise,
  compact,
}: GradientAmountProps) {
  const theme = useTheme();
  const id = useId().replace(/:/g, '');

  if (theme.hideAmounts) {
    return <AmountText minor={minor} currency={currency} variant="display" style={{ marginTop: 6 }} />;
  }

  const value = formatMinor(minor, currency, { compact });
  const height = Math.round(fontSize * 1.28);
  const baseline = Math.round(fontSize * 0.98);

  return (
    <View style={{ height, marginTop: 6 }}>
      <Svg width="100%" height={height}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0.5">
            {colors.map((c, i) => (
              <Stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={c} />
            ))}
          </LinearGradient>
        </Defs>
        <SvgText
          x="0"
          y={baseline}
          fontSize={fontSize}
          fontWeight="700"
          fill={`url(#${id})`}
        >
          {value}
        </SvgText>
      </Svg>
    </View>
  );
}
