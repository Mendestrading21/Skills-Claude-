import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { GlassCard } from './GlassCard';
import { Text } from './Text';

export type MetricCardProps = {
  label: string;
  value: React.ReactNode;
  caption?: React.ReactNode;
  trend?: React.ReactNode;
  icon?: React.ReactNode;
  onPress?: () => void;
  strong?: boolean;
  style?: object;
};

/** Compact metric surface: micro-label, value, and one optional trend/caption. */
export function MetricCard({
  label,
  value,
  caption,
  trend,
  icon,
  onPress,
  strong,
  style,
}: MetricCardProps) {
  const theme = useTheme();

  const body = (
    <GlassCard strong={strong} padding="md" style={[styles.card, style]}>
      <View style={styles.header}>
        <Text variant="micro" tone="muted">
          {label}
        </Text>
        {icon}
      </View>
      <View style={{ marginTop: theme.spacing.sm }}>
        {typeof value === 'string' ? (
          <Text variant="cardValue" tabular>
            {value}
          </Text>
        ) : (
          value
        )}
      </View>
      {(caption || trend) && (
        <View style={[styles.footer, { marginTop: theme.spacing.sm }]}>
          {trend}
          {typeof caption === 'string' ? (
            <Text variant="meta" tone="secondary">
              {caption}
            </Text>
          ) : (
            caption
          )}
        </View>
      )}
    </GlassCard>
  );

  if (!onPress) return body;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }, styles.pressable]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { flex: 1 },
  card: { flex: 1, minHeight: 104, justifyContent: 'space-between' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
});
