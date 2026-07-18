import React, { useEffect, useMemo } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Sheet content is scrollable by default; disable for short sheets. */
  scroll?: boolean;
};

/** Glass bottom sheet used for all quick-add and edit forms. */
export function BottomSheet({ visible, onClose, title, children, scroll = true }: BottomSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useMemo(() => new Animated.Value(60), []);
  const opacity = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, damping: 18, stiffness: 160, useNativeDriver: true }),
      ]).start();
    } else {
      opacity.setValue(0);
      translateY.setValue(60);
    }
  }, [visible, opacity, translateY]);

  const inner = (
    <View style={{ gap: theme.spacing.base }}>
      <View style={styles.header}>
        <View style={[styles.grip, { backgroundColor: theme.colors.borderStrong }]} />
      </View>
      <View style={styles.titleRow}>
        {title ? <Text variant="sectionTitle">{title}</Text> : <View />}
        <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Fermer">
          <Icon name="close" size={22} color={theme.colors.textSecondary} />
        </Pressable>
      </View>
      {children}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <Animated.View style={[styles.backdrop, { opacity }]}>
          <Pressable style={styles.flex} onPress={onClose} accessibilityLabel="Fermer" />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY }],
              opacity,
              backgroundColor: theme.colors.backgroundElevated,
              borderColor: theme.colors.borderStrong,
              paddingBottom: insets.bottom + theme.spacing.lg,
            },
          ]}
        >
          {scroll ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: theme.spacing.lg }}
            >
              {inner}
            </ScrollView>
          ) : (
            <View style={{ padding: theme.spacing.lg }}>{inner}</View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '88%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
  },
  header: { alignItems: 'center' },
  grip: { width: 40, height: 5, borderRadius: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
