import React, { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, CurrencyAmountInput, Field, OptionGroup } from '@/components';
import { parseAmountToMinor } from '@/domain/money';
import { haptics } from '@/services/haptics';
import { useAppStore } from '@/store';
import type { CurrencyCode, LiabilityKind } from '@/types';

const KINDS: { value: LiabilityKind; label: string }[] = [
  { value: 'mortgage', label: 'Hypothèque' },
  { value: 'loan', label: 'Prêt' },
  { value: 'credit_card', label: 'Carte' },
  { value: 'tax', label: 'Impôts' },
  { value: 'other', label: 'Autre' },
];

export function LiabilityForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const baseCurrency = useAppStore((s) => s.data.preferences.baseCurrency);
  const addLiability = useAppStore((s) => s.addLiability);

  const [name, setName] = useState('');
  const [kind, setKind] = useState<LiabilityKind>('loan');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(baseCurrency);
  const [rate, setRate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setKind('loan');
    setAmount('');
    setCurrency(baseCurrency);
    setRate('');
    setError(null);
  };
  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    const minor = parseAmountToMinor(amount);
    if (!name.trim()) return setError('Nom requis.');
    if (minor == null || minor <= 0) return setError('Montant invalide.');
    const rateValue = rate.trim() ? Number(rate.replace(',', '.')) : undefined;
    addLiability({
      name: name.trim(),
      kind,
      principalMinor: minor,
      currency,
      interestRateBps: rateValue != null && Number.isFinite(rateValue) ? Math.round(rateValue * 100) : undefined,
    });
    haptics.success();
    handleClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Nouvelle dette">
      <View style={{ gap: 16 }}>
        <Field label="Nom" value={name} onChangeText={setName} placeholder="Ex. Hypothèque" error={error && !name ? error : null} />
        <OptionGroup label="Type" options={KINDS} value={kind} onChange={setKind} />
        <CurrencyAmountInput
          label="Montant dû"
          amount={amount}
          onAmountChange={setAmount}
          currency={currency}
          onCurrencyChange={setCurrency}
          error={error && amount === '' ? error : null}
        />
        <Field
          label="Taux d’intérêt % (facultatif)"
          value={rate}
          onChangeText={setRate}
          keyboardType="decimal-pad"
          placeholder="Ex. 1.45"
        />
        <Button label="Enregistrer la dette" onPress={handleSave} />
      </View>
    </BottomSheet>
  );
}
