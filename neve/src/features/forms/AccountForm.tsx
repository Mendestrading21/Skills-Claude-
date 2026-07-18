import React, { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, Field, OptionGroup, Segmented } from '@/components';
import { SUPPORTED_CURRENCIES } from '@/config/app';
import { haptics } from '@/services/haptics';
import { useAppStore } from '@/store';
import type { AccountKind, CurrencyCode } from '@/types';

const KINDS: { value: AccountKind; label: string }[] = [
  { value: 'bank', label: 'Banque' },
  { value: 'cash', label: 'Espèces' },
  { value: 'brokerage', label: 'Titres' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'pension', label: 'Prévoyance' },
  { value: 'real_estate', label: 'Immobilier' },
  { value: 'other', label: 'Autre' },
];

export function AccountForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const baseCurrency = useAppStore((s) => s.data.preferences.baseCurrency);
  const addAccount = useAppStore((s) => s.addAccount);

  const [name, setName] = useState('');
  const [kind, setKind] = useState<AccountKind>('bank');
  const [currency, setCurrency] = useState<CurrencyCode>(baseCurrency);
  const [institution, setInstitution] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setKind('bank');
    setCurrency(baseCurrency);
    setInstitution('');
    setError(null);
  };
  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError('Nom requis.');
      return;
    }
    addAccount({
      name: name.trim(),
      kind,
      currency,
      institution: institution.trim() || undefined,
    });
    haptics.success();
    handleClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Nouveau compte">
      <View style={{ gap: 16 }}>
        <Field label="Nom" value={name} onChangeText={setName} placeholder="Ex. Compte courant" error={error} />
        <OptionGroup label="Type" options={KINDS} value={kind} onChange={setKind} />
        <View style={{ gap: 6 }}>
          <Segmented
            options={SUPPORTED_CURRENCIES.map((c) => ({ value: c, label: c }))}
            value={currency}
            onChange={(c) => setCurrency(c as CurrencyCode)}
          />
        </View>
        <Field
          label="Institution (facultatif)"
          value={institution}
          onChangeText={setInstitution}
          placeholder="Ex. Banque cantonale"
        />
        <Button label="Créer le compte" onPress={handleSave} />
      </View>
    </BottomSheet>
  );
}
