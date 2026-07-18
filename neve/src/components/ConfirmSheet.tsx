import React from 'react';
import { View } from 'react-native';

import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Text } from './Text';

export type ConfirmSheetProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/** Cross-platform confirmation sheet (used for destructive actions). */
export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel,
  destructive,
  onConfirm,
  onClose,
}: ConfirmSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} scroll={false}>
      <View style={{ gap: 20 }}>
        <Text variant="body" tone="secondary" style={{ lineHeight: 22 }}>
          {message}
        </Text>
        <View style={{ gap: 10 }}>
          <Button
            label={confirmLabel}
            variant={destructive ? 'destructive' : 'primary'}
            onPress={() => {
              onConfirm();
              onClose();
            }}
          />
          <Button label="Annuler" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </BottomSheet>
  );
}
