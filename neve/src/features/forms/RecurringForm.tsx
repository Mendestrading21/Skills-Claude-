import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, CurrencyAmountInput, Field, OptionGroup, Text } from '@/components';
import { parseAmountToMinor } from '@/domain/money';
import { haptics } from '@/services/haptics';
import { useAppStore } from '@/store';
import type { CurrencyCode, RecurringEntry } from '@/types';
import { nowIso } from '@/utils/date';

const FREQUENCIES: { value: RecurringEntry['frequency']; label: string }[] = [
  { value: 'weekly', label: 'Hebdo' },
  { value: 'monthly', label: 'Mensuel' },
  { value: 'quarterly', label: 'Trimestriel' },
  { value: 'yearly', label: 'Annuel' },
];

/** Add a recurring income or expense (e.g. loyer, abonnements, salaire). */
export function RecurringForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const data = useAppStore((s) => s.data);
  const addRecurring = useAppStore((s) => s.addRecurring);

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(data.preferences.baseCurrency);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [frequency, setFrequency] = useState<RecurringEntry['frequency']>('monthly');
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(() => data.categories.filter((c) => c.kind === type), [data.categories, type]);

  const reset = () => {
    setType('expense');
    setLabel('');
    setAmount('');
    setCategoryId(undefined);
    setFrequency('monthly');
    setError(null);
  };
  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    const minor = parseAmountToMinor(amount);
    if (!label.trim()) return setError('Nom requis.');
    if (minor == null || minor <= 0) return setError('Montant invalide.');
    addRecurring({
      label: label.trim(),
      type,
      amountMinor: minor,
      currency,
      categoryId,
      frequency,
      nextDate: nowIso(),
      isActive: true,
    });
    haptics.success();
    handleClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Récurrent">
      <View style={{ gap: 16 }}>
        <OptionGroup
          options={[
            { value: 'expense', label: 'Dépense' },
            { value: 'income', label: 'Revenu' },
          ]}
          value={type}
          onChange={(v) => {
            setType(v);
            setCategoryId(undefined);
          }}
        />
        <Field
          label="Nom"
          value={label}
          onChangeText={setLabel}
          placeholder="Ex. Loyer, Abonnement, Salaire"
          error={error && !label ? error : null}
        />
        <CurrencyAmountInput
          label="Montant"
          amount={amount}
          onAmountChange={setAmount}
          currency={currency}
          onCurrencyChange={setCurrency}
          error={error && amount === '' ? error : null}
        />
        <OptionGroup label="Fréquence" options={FREQUENCIES} value={frequency} onChange={setFrequency} />
        {categories.length > 0 && (
          <OptionGroup
            label="Catégorie"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            value={categoryId ?? ''}
            onChange={setCategoryId}
          />
        )}
        <Text variant="micro" tone="muted">
          Apparaîtra dans « À venir » du budget. Vous pourrez le désactiver à tout moment.
        </Text>
        <Button label="Ajouter la récurrence" onPress={handleSave} />
      </View>
    </BottomSheet>
  );
}
