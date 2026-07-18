import React, { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, Field, OptionGroup, Segmented } from '@/components';
import { SUPPORTED_CURRENCIES } from '@/config/app';
import { haptics } from '@/services/haptics';
import { useAppStore } from '@/store';
import type { Account, AccountKind, CurrencyCode } from '@/types';

const KINDS: { value: AccountKind; label: string }[] = [
  { value: 'bank', label: 'Banque' },
  { value: 'cash', label: 'Espèces' },
  { value: 'brokerage', label: 'Titres' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'pension', label: 'Prévoyance' },
  { value: 'real_estate', label: 'Immobilier' },
  { value: 'other', label: 'Autre' },
];

export function EditAccountForm({
  visible,
  account,
  onClose,
}: {
  visible: boolean;
  account: Account;
  onClose: () => void;
}) {
  const updateAccount = useAppStore((s) => s.updateAccount);

  const [name, setName] = useState(account.name);
  const [kind, setKind] = useState<AccountKind>(account.kind);
  const [currency, setCurrency] = useState<CurrencyCode>(account.currency);
  const [institution, setInstitution] = useState(account.institution ?? '');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!name.trim()) return setError('Nom requis.');
    updateAccount(account.id, {
      name: name.trim(),
      kind,
      currency,
      institution: institution.trim() || undefined,
    });
    haptics.success();
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Modifier le compte">
      <View style={{ gap: 16 }}>
        <Field label="Nom" value={name} onChangeText={setName} error={error} />
        <OptionGroup label="Type" options={KINDS} value={kind} onChange={setKind} />
        <Segmented
          options={SUPPORTED_CURRENCIES.map((c) => ({ value: c, label: c }))}
          value={currency}
          onChange={(c) => setCurrency(c as CurrencyCode)}
        />
        <Field
          label="Institution (facultatif)"
          value={institution}
          onChangeText={setInstitution}
          placeholder="Ex. Banque cantonale"
        />
        <Button label="Enregistrer" onPress={handleSave} />
      </View>
    </BottomSheet>
  );
}
