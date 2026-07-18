import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/** Haptics are a no-op on web and when the module is unavailable. */
export const haptics = {
  light() {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  success() {
    if (Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  select() {
    if (Platform.OS === 'web') return;
    Haptics.selectionAsync().catch(() => {});
  },
};
