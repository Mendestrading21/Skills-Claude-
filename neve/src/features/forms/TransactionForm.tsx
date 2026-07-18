import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import {
  BottomSheet,
  Button,
  CurrencyAmountInput,
  Field,
  OptionGroup,
  Text,
} from '@/components';
import { parseAmountToMinor } from '@/domain/money';
import { haptics } from '@/services/haptics';
import { useAppStore } from '@/store';
import type { CurrencyCode } from '@/types';
import { nowIso } from '@/utils/date';

export type TransactionFormProps = {
  visible: boolean;
  onClose: () => void;
  initialKind?: 'income' | 'expense';
};

/** Add an income or expense transaction. Auto-provisions a cash account. */
export function TransactionForm({ visible, onClose, initialKind = 'expense' }: TransactionFormProps) {
  const data = useAppStore((s) => s.data);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const addAccount = useAppStore((s) => s.addAccount);

  const [kind, setKind] = useState<'income' | 'expense'>(initialKind);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(data.preferences.baseCurrency);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [accountId, setAccountId] = useState<string | undefined>(data.accounts[0]?.id);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(
    () => data.categories.filter((c) => c.kind === kind),
    [data.categories, kind],
  );
  const accounts = data.accounts.filter((a) => !a.isArchived);

  const reset = () => {
    setKind(initialKind);
    setAmount('');
    setCurrency(data.preferences.baseCurrency);
    setCategoryId(undefined);
    setNote('');
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    const minor = parseAmountToMinor(amount);
    if (minor == null || minor <= 0) {
      setError('Montant invalide.');
      return;
    }
    let account = accountId ?? accounts[0]?.id;
    if (!account) {
      account = addAccount({
        name: 'Compte courant',
        kind: 'bank',
        currency: data.preferences.baseCurrency,
      }).id;
    }
    addTransaction({
      accountId: account,
      type: kind,
      amountMinor: minor,
      currency,
      categoryId,
      occurredAt: nowIso(),
      note: note.trim() || undefined,
    });
    haptics.success();
    handleClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title={kind === 'income' ? 'Nouveau revenu' : 'Nouvelle dépense'}>
      <View style={{ gap: 16 }}>
        <OptionGroup
          options={[
            { value: 'expense', label: 'Dépense' },
            { value: 'income', label: 'Revenu' },
          ]}
          value={kind}
          onChange={(v) => {
            setKind(v);
            setCategoryId(undefined);
          }}
        />

        <CurrencyAmountInput
          label="Montant"
          amount={amount}
          onAmountChange={(v) => {
            setAmount(v);
            setError(null);
          }}
          currency={currency}
          onCurrencyChange={setCurrency}
          error={error}
        />

        {categories.length > 0 && (
          <OptionGroup
            label="Catégorie"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            value={categoryId ?? ''}
            onChange={setCategoryId}
          />
        )}

        {accounts.length > 0 && (
          <OptionGroup
            label="Compte"
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
            value={accountId ?? accounts[0].id}
            onChange={setAccountId}
          />
        )}

        <Field label="Note (facultatif)" value={note} onChangeText={setNote} placeholder="Ex. Courses" />

        <Text variant="micro" tone="muted">
          Enregistré aujourd’hui. Vous pourrez le modifier dans l’activité.
        </Text>

        <Button label="Enregistrer" onPress={handleSave} />
      </View>
    </BottomSheet>
  );
}
