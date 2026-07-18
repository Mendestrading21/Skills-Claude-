import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, CurrencyAmountInput, Field } from '@/components';
import { fromMinor, parseAmountToMinor, parseQuantity } from '@/domain/money';
import { haptics } from '@/services/haptics';
import { useAppStore } from '@/store';
import type { CurrencyCode, Position } from '@/types';

export function EditPositionForm({
  visible,
  position,
  onClose,
}: {
  visible: boolean;
  position: Position;
  onClose: () => void;
}) {
  const data = useAppStore((s) => s.data);
  const updatePosition = useAppStore((s) => s.updatePosition);
  const upsertQuote = useAppStore((s) => s.upsertQuote);
  const recordSnapshot = useAppStore((s) => s.recordSnapshot);

  const asset = data.assets.find((a) => a.id === position.assetId);
  const isManual = position.manualValueMinor != null;
  const currency: CurrencyCode = isManual
    ? position.manualValueCurrency ?? asset?.quoteCurrency ?? data.preferences.baseCurrency
    : asset?.quoteCurrency ?? data.preferences.baseCurrency;

  const quote = useMemo(
    () => data.quotes.filter((q) => q.assetId === position.assetId).sort((a, b) => b.fetchedAt.localeCompare(a.fetchedAt))[0],
    [data.quotes, position.assetId],
  );

  const [name, setName] = useState(asset?.name ?? '');
  const [value, setValue] = useState(
    isManual ? fromMinor(position.manualValueMinor as number).toFixed(2) : '',
  );
  const [cur, setCur] = useState<CurrencyCode>(currency);
  const [quantity, setQuantity] = useState(position.quantityDecimal);
  const [price, setPrice] = useState(quote ? fromMinor(quote.priceMinor).toFixed(2) : '');
  const [notes, setNotes] = useState(position.notes ?? '');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!name.trim()) return setError('Nom requis.');

    if (asset && name.trim() !== asset.name) {
      // Update the shared asset name via the store's asset list.
      useAppStore.setState((s) => ({
        data: { ...s.data, assets: s.data.assets.map((a) => (a.id === asset.id ? { ...a, name: name.trim() } : a)) },
      }));
    }

    if (isManual) {
      const minor = parseAmountToMinor(value);
      if (minor == null || minor < 0) return setError('Valeur invalide.');
      updatePosition(position.id, { manualValueMinor: minor, manualValueCurrency: cur, notes: notes.trim() || undefined });
    } else {
      const qty = parseQuantity(quantity);
      if (qty == null || qty <= 0) return setError('Quantité invalide.');
      updatePosition(position.id, { quantityDecimal: quantity.replace(',', '.'), notes: notes.trim() || undefined });
      const priceMinor = parseAmountToMinor(price);
      if (priceMinor != null && priceMinor > 0) upsertQuote(position.assetId, priceMinor, cur);
    }

    recordSnapshot();
    haptics.success();
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Modifier la position">
      <View style={{ gap: 16 }}>
        <Field label="Nom" value={name} onChangeText={setName} error={error && !name ? error : null} />

        {isManual ? (
          <CurrencyAmountInput
            label="Valeur actuelle"
            amount={value}
            onAmountChange={setValue}
            currency={cur}
            onCurrencyChange={setCur}
            error={error && isManual ? error : null}
          />
        ) : (
          <View style={{ gap: 16 }}>
            <Field label="Quantité" value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" />
            <CurrencyAmountInput
              label="Prix actuel par unité"
              amount={price}
              onAmountChange={setPrice}
              currency={cur}
              onCurrencyChange={setCur}
            />
          </View>
        )}

        <Field label="Notes (facultatif)" value={notes} onChangeText={setNotes} placeholder="Ex. compte joint" />

        <Button label="Enregistrer" onPress={handleSave} />
      </View>
    </BottomSheet>
  );
}
