import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { haptics } from '@/services/haptics';
import { useTheme } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

const TAB_META: Record<string, { icon: IconName; label: string }> = {
  index: { icon: 'cockpit', label: 'Cockpit' },
  wealth: { icon: 'wealth', label: 'Patrimoine' },
  portfolio: { icon: 'portfolio', label: 'Portefeuille' },
  budget: { icon: 'budget', label: 'Budget' },
  activity: { icon: 'activity', label: 'Activité' },
};

type TabRoute = { key: string; name: string };

/** Structural subset of the props Expo Router passes to a custom `tabBar`. */
export type TabBarProps = {
  state: { index: number; routes: TabRoute[] };
  navigation: {
    emit: (event: { type: 'tabPress'; target?: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string) => void;
  };
};

/** Custom floating glass tab bar. */
export function TabBar({ state, navigation }: TabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom || theme.spacing.md }]} pointerEvents="box-none">
      <View style={[styles.bar, { borderColor: theme.colors.border }]}>
        {theme.glassEnabled && Platform.OS !== 'android' ? (
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.backgroundElevated }]} />
        )}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.surface }]} />
        <View style={styles.row}>
          {state.routes
            .filter((route) => TAB_META[route.name])
            .map((route) => {
              const routeIndex = state.routes.findIndex((r) => r.key === route.key);
              const focused = state.index === routeIndex;
              const meta = TAB_META[route.name];
              const color = focused ? theme.colors.accent : theme.colors.textMuted;

              const onPress = () => {
                haptics.select();
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
              };

              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  accessibilityRole="button"
                  accessibilityState={{ selected: focused }}
                  accessibilityLabel={meta.label}
                  style={styles.tab}
                >
                  <View
                    style={[
                      styles.iconPill,
                      focused && { backgroundColor: 'rgba(255,138,31,0.14)', borderColor: 'rgba(255,138,31,0.30)' },
                    ]}
                  >
                    <Icon name={meta.icon} size={21} color={color} strokeWidth={focused ? 2.4 : 2} />
                  </View>
                  <Text variant="micro" style={{ color, textTransform: 'none', letterSpacing: 0 }}>
                    {meta.label}
                  </Text>
                </Pressable>
              );
            })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  bar: {
    width: '100%',
    maxWidth: 620,
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', paddingVertical: 8 },
  tab: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  iconPill: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
});
