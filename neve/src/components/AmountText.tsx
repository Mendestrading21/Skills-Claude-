import React from 'react';

import { formatMinor } from '@/domain/money';
import type { CurrencyCode } from '@/types';
import { useTheme } from '@/theme';
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
  const theme = useTheme();
  const resolvedTone = colorBySign ? (minor >= 0 ? 'positive' : 'negative') : tone;
  const content = theme.hideAmounts
    ? `••••${showCurrency ? ` ${currency}` : ''}`
    : formatMinor(minor, currency, { showCurrency, signed, compact, decimals });
  return (
    <Text tabular tone={theme.hideAmounts ? tone : resolvedTone} {...rest}>
      {content}
    </Text>
  );
}
