import React from 'react';

import { formatMinor } from '@/domain/money';
import type { CurrencyCode } from '@/types';
import { Text, type TextProps } from './Text';

export type AmountTextProps = Omit<TextProps, 'children'> & {
  minor: number;
  currency: CurrencyCode;
  showCurrency?: boolean;
  signed?: boolean;
  compact?: boolean;
  decimals?: number;
  /** Colour by sign (green/red). Otherwise inherits `tone`. */
  colorBySign?: boolean;
};

export function AmountText({
  minor,
  currency,
  showCurrency = true,
  signed = false,
  compact = false,
  decimals,
  colorBySign = false,
  tone,
  ...rest
}: AmountTextProps) {
  const resolvedTone = colorBySign ? (minor >= 0 ? 'positive' : 'negative') : tone;
  return (
    <Text tabular tone={resolvedTone} {...rest}>
      {formatMinor(minor, currency, { showCurrency, signed, compact, decimals })}
    </Text>
  );
}
