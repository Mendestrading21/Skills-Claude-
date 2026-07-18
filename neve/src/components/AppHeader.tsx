import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Logo } from './Logo';
import { Text } from './Text';

export type HeaderAction = { icon: IconName; label: string; onPress: () => void };

export type AppHeaderProps = {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  actions?: HeaderAction[];
};

/** Screen header with optional brand mark and icon actions. */
export function AppHeader({ title, subtitle, showLogo, actions = [] }: AppHeaderProps) {
  const theme = useTheme();
  return (
    <View style={[styles.wrap, { marginBottom: theme.spacing.lg }]}>
      <View style={styles.left}>
        {showLogo ? <Logo size={34} /> : null}
        <View>
          <Text variant="screenTitle">{title}</Text>
          {subtitle ? (
            <Text variant="meta" tone="secondary" style={{ marginTop: 2 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {actions.length > 0 ? (
        <View style={styles.actions}>
          {actions.map((action) => (
            <Pressable
              key={action.icon}
              onPress={action.onPress}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              hitSlop={8}
              style={({ pressed }) => [
                styles.iconBtn,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Icon name={action.icon} size={20} color={theme.colors.textSecondary} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
