import React from 'react';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { useTheme } from '@/theme';
import { Button } from './Button';
import { GlassCard } from './GlassCard';
import { Text } from './Text';

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <GlassCard padding="lg" style={styles.center}>
      {icon}
      <Text variant="cardTitle" center style={{ marginTop: icon ? theme.spacing.sm : 0 }}>
        {title}
      </Text>
      {body ? (
        <Text variant="meta" tone="secondary" center style={{ marginTop: 6 }}>
          {body}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: theme.spacing.base, alignSelf: 'stretch' }}>
          <Button label={actionLabel} variant="secondary" onPress={onAction} />
        </View>
      ) : null}
    </GlassCard>
  );
}

export function ErrorState({
  title = t.states.errorTitle,
  body = t.states.errorBody,
  onRetry,
}: {
  title?: string;
  body?: string;
  onRetry?: () => void;
}) {
  return (
    <GlassCard padding="lg" style={styles.center}>
      <Text variant="cardTitle" tone="negative" center>
        {title}
      </Text>
      <Text variant="meta" tone="secondary" center style={{ marginTop: 6 }}>
        {body}
      </Text>
      {onRetry ? (
        <View style={{ marginTop: 16, alignSelf: 'stretch' }}>
          <Button label={t.common.retry} variant="secondary" onPress={onRetry} />
        </View>
      ) : null}
    </GlassCard>
  );
}

export function SkeletonCard({ height = 96 }: { height?: number }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.skeleton,
        { height, backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  skeleton: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    width: '100%',
    opacity: 0.6,
  },
});
