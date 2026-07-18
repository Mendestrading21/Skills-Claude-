import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenBackground } from './ScreenBackground';
import { useTheme } from '@/theme';

const MAX_CONTENT_WIDTH = 760;

export type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Extra bottom padding to clear the floating tab bar / FAB. */
  bottomInset?: number;
  contentStyle?: object;
};

/**
 * Standard screen scaffold: dark-glass backdrop, safe areas, capped content
 * width for tablets, and responsive horizontal margins.
 */
export function Screen({
  children,
  scroll = true,
  refreshing,
  onRefresh,
  bottomInset = 0,
  contentStyle,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const horizontal = width >= 700 ? theme.spacing.xxl : width >= 380 ? theme.spacing.lg : theme.spacing.base;

  const inner = (
    <View
      style={[
        styles.inner,
        { maxWidth: MAX_CONTENT_WIDTH, paddingHorizontal: horizontal },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={styles.root}>
      <ScreenBackground />
      {scroll ? (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + theme.spacing.sm, paddingBottom: insets.bottom + bottomInset + theme.spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={!!refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.textSecondary}
              />
            ) : undefined
          }
        >
          {inner}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.scrollContent,
            styles.flex,
            { paddingTop: insets.top + theme.spacing.sm, paddingBottom: insets.bottom + bottomInset },
          ]}
        >
          {inner}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { alignItems: 'center' },
  inner: { width: '100%' },
});
