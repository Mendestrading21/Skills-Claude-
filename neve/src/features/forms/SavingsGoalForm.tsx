import React, { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, CurrencyAmountInput, Field } from '@/components';
import { parseAmountToMinor } from '@/domain/money';
import { haptics } from '@/services/haptics';
import { useAppStore } from '@/store';
import type { CurrencyCode } from '@/types';

/** Create a savings goal / pot (e.g. Voyage, Fonds d'urgence). */
export function SavingsGoalForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const baseCurrency = useAppStore((s) => s.data.preferences.baseCurrency);
  const addGoal = useAppStore((s) => s.addGoal);

  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [start, setStart] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(baseCurrency);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setTarget('');
    setStart('');
    setError(null);
  };
  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    const targetMinor = parseAmountToMinor(target);
    if (!name.trim()) return setError('Nom requis.');
    if (targetMinor == null || targetMinor <= 0) return setError('Objectif invalide.');
    const startMinor = parseAmountToMinor(start) ?? 0;
    addGoal({
      name: name.trim(),
      targetMinor,
      currentMinor: Math.max(0, startMinor),
      currency,
    });
    haptics.success();
    handleClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Objectif d’épargne">
      <View style={{ gap: 16 }}>
        <Field
          label="Nom"
          value={name}
          onChangeText={setName}
          placeholder="Ex. Voyage, Fonds d’urgence"
          error={error && !name ? error : null}
        />
        <CurrencyAmountInput
          label="Montant à atteindre"
          amount={target}
          onAmountChange={setTarget}
          currency={currency}
          onCurrencyChange={setCurrency}
          error={error && target === '' ? error : null}
        />
        <Field
          label="Déjà épargné (facultatif)"
          value={start}
          onChangeText={setStart}
          keyboardType="decimal-pad"
          placeholder="0"
        />
        <Button label="Créer l’objectif" onPress={handleSave} />
      </View>
    </BottomSheet>
  );
}
