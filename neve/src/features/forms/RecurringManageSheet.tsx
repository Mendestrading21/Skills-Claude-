import React from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, Text } from '@/components';
import { formatMinor } from '@/domain/money';
import { haptics } from '@/services/haptics';
import { useAppStore } from '@/store';
import type { RecurringEntry } from '@/types';

const FREQ: Record<string, string> = {
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  yearly: 'Annuel',
};

export function RecurringManageSheet({
  visible,
  entry,
  onClose,
}: {
  visible: boolean;
  entry: RecurringEntry;
  onClose: () => void;
}) {
  const toggleRecurring = useAppStore((s) => s.toggleRecurring);
  const removeRecurring = useAppStore((s) => s.removeRecurring);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={entry.label} scroll={false}>
      <View style={{ gap: 16 }}>
        <Text variant="body" tone="secondary">
          {entry.type === 'income' ? 'Revenu' : 'Dépense'} · {FREQ[entry.frequency]} ·{' '}
          {formatMinor(entry.amountMinor, entry.currency)}
        </Text>
        <View style={{ gap: 10 }}>
          <Button
            label={entry.isActive ? 'Désactiver' : 'Activer'}
            variant="secondary"
            onPress={() => {
              haptics.light();
              toggleRecurring(entry.id);
              onClose();
            }}
          />
          <Button
            label="Supprimer"
            variant="destructive"
            onPress={() => {
              removeRecurring(entry.id);
              onClose();
            }}
          />
        </View>
      </View>
    </BottomSheet>
  );
}
