import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type QuickActionProps = {
  label: string;
  icon: IconName;
  onPress: () => void;
};

/** Square glassy shortcut used in the quick-add sheet. */
export function QuickAction({ label, icon, onPress }: QuickActionProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceStrong }]}>
        <Icon name={icon} size={22} color={theme.colors.accent} />
      </View>
      <Text variant="meta" weight="medium" center>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexBasis: '30%',
    flexGrow: 1,
    minWidth: 96,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
