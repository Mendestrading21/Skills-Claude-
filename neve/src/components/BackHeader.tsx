import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';

/** Header for pushed stack screens: back button + title. */
export function BackHeader({ title, onClose }: { title: string; onClose?: () => void }) {
  const theme = useTheme();
  const router = useRouter();
  const handleBack = () => {
    if (onClose) return onClose();
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };
  return (
    <View style={[styles.row, { marginBottom: theme.spacing.lg }]}>
      <Pressable
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Retour"
        hitSlop={10}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Icon name="chevronLeft" size={22} color={theme.colors.text} />
      </Pressable>
      <Text variant="screenTitle">{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
