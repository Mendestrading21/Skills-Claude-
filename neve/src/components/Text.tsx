import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';

import { useTheme } from '@/theme';

export type TextVariant =
  | 'display'
  | 'screenTitle'
  | 'sectionTitle'
  | 'cardTitle'
  | 'cardValue'
  | 'body'
  | 'meta'
  | 'micro';

type Tone =
  | 'default'
  | 'secondary'
  | 'muted'
  | 'accent'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'onAccent';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: Tone;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  tabular?: boolean;
  center?: boolean;
};

export function Text({
  variant = 'body',
  tone = 'default',
  weight,
  tabular,
  center,
  style,
  ...rest
}: TextProps) {
  const theme = useTheme();

  const sizeMap: Record<TextVariant, { fontSize: number; weight: TextProps['weight'] }> = {
    display: { fontSize: theme.fontSize.display, weight: 'bold' },
    screenTitle: { fontSize: theme.fontSize.screenTitle, weight: 'bold' },
    sectionTitle: { fontSize: theme.fontSize.sectionTitle, weight: 'semibold' },
    cardTitle: { fontSize: theme.fontSize.cardTitle, weight: 'semibold' },
    cardValue: { fontSize: theme.fontSize.cardValue, weight: 'bold' },
    body: { fontSize: theme.fontSize.body, weight: 'regular' },
    meta: { fontSize: theme.fontSize.meta, weight: 'medium' },
    micro: { fontSize: theme.fontSize.micro, weight: 'semibold' },
  };

  const toneColor: Record<Tone, string> = {
    default: theme.colors.text,
    secondary: theme.colors.textSecondary,
    muted: theme.colors.textMuted,
    accent: theme.colors.accent,
    positive: theme.colors.positive,
    negative: theme.colors.negative,
    warning: theme.colors.warning,
    onAccent: theme.colors.onAccent,
  };

  const spec = sizeMap[variant];

  return (
    <RNText
      {...rest}
      style={[
        {
          fontSize: spec.fontSize,
          color: toneColor[tone],
          fontWeight: theme.fontWeight[weight ?? spec.weight ?? 'regular'] as '400',
        },
        variant === 'micro' && styles.micro,
        tabular && styles.tabular,
        center && styles.center,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  micro: { letterSpacing: 0.6, textTransform: 'uppercase' },
  tabular: { fontVariant: ['tabular-nums'] },
  center: { textAlign: 'center' },
});
