import React, { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, CurrencyAmountInput, OptionGroup, Text } from '@/components';
import { parseAmountToMinor } from '@/domain/money';
import { haptics } from '@/services/haptics';
import { useAppStore } from '@/store';
import type { CurrencyCode } from '@/types';

export function BudgetForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const data = useAppStore((s) => s.data);
  const upsertBudget = useAppStore((s) => s.upsertBudget);

  const expenseCategories = data.categories.filter((c) => c.kind === 'expense');
  const [categoryId, setCategoryId] = useState<string | undefined>(expenseCategories[0]?.id);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(data.preferences.baseCurrency);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setAmount('');
    setError(null);
    onClose();
  };

  const handleSave = () => {
    const minor = parseAmountToMinor(amount);
    if (!categoryId) return setError('Choisissez une catégorie.');
    if (minor == null || minor <= 0) return setError('Montant invalide.');
    upsertBudget(categoryId, minor);
    haptics.success();
    handleClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Budget mensuel">
      <View style={{ gap: 16 }}>
        {expenseCategories.length > 0 ? (
          <OptionGroup
            label="Catégorie"
            options={expenseCategories.map((c) => ({ value: c.id, label: c.name }))}
            value={categoryId ?? ''}
            onChange={setCategoryId}
          />
        ) : (
          <Text variant="meta" tone="muted">
            Ajoutez d’abord une catégorie de dépense.
          </Text>
        )}
        <CurrencyAmountInput
          label="Limite mensuelle"
          amount={amount}
          onAmountChange={setAmount}
          currency={currency}
          onCurrencyChange={setCurrency}
          error={error}
        />
        <Button label="Définir le budget" onPress={handleSave} />
      </View>
    </BottomSheet>
  );
}
