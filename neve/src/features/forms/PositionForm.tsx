import React, { useState } from 'react';
import { View } from 'react-native';

import {
  BottomSheet,
  Button,
  CurrencyAmountInput,
  Field,
  OptionGroup,
  Text,
} from '@/components';
import { parseAmountToMinor, parseQuantity } from '@/domain/money';
import { haptics } from '@/services/haptics';
import { useAppStore } from '@/store';
import type { AssetClass, CurrencyCode } from '@/types';

const CLASSES: { value: AssetClass; label: string }[] = [
  { value: 'equity', label: 'Action' },
  { value: 'etf', label: 'ETF' },
  { value: 'fund', label: 'Fonds' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'bond', label: 'Obligation' },
  { value: 'cash', label: 'Liquidités' },
  { value: 'pension', label: 'Prévoyance' },
  { value: 'real_estate', label: 'Immobilier' },
  { value: 'commodity', label: 'Matière première' },
  { value: 'other', label: 'Autre' },
];

export function PositionForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const data = useAppStore((s) => s.data);
  const addAsset = useAppStore((s) => s.addAsset);
  const addPosition = useAppStore((s) => s.addPosition);
  const addAccount = useAppStore((s) => s.addAccount);
  const upsertQuote = useAppStore((s) => s.upsertQuote);

  const accounts = data.accounts.filter((a) => !a.isArchived);
  const [accountId, setAccountId] = useState<string | undefined>(accounts[0]?.id);
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [assetClass, setAssetClass] = useState<AssetClass>('equity');
  const [mode, setMode] = useState<'manual' | 'holding'>('manual');
  const [currency, setCurrency] = useState<CurrencyCode>(data.preferences.baseCurrency);
  const [manualValue, setManualValue] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgCost, setAvgCost] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setSymbol('');
    setAssetClass('equity');
    setMode('manual');
    setManualValue('');
    setQuantity('');
    setAvgCost('');
    setCurrentPrice('');
    setError(null);
  };
  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    if (!name.trim()) return setError('Nom requis.');

    let account = accountId ?? accounts[0]?.id;
    if (!account) {
      account = addAccount({ name: 'Portefeuille', kind: 'brokerage', currency: data.preferences.baseCurrency }).id;
    }

    if (mode === 'manual') {
      const minor = parseAmountToMinor(manualValue);
      if (minor == null || minor <= 0) return setError('Valeur invalide.');
      const asset = addAsset({ name: name.trim(), symbol: symbol.trim() || undefined, assetClass, quoteCurrency: currency, pricingMode: 'manual' });
      addPosition({
        accountId: account,
        assetId: asset.id,
        quantityDecimal: '1',
        manualValueMinor: minor,
        manualValueCurrency: currency,
      });
    } else {
      const qty = parseQuantity(quantity);
      const cost = parseAmountToMinor(avgCost);
      if (qty == null || qty <= 0) return setError('Quantité invalide.');
      if (cost == null || cost <= 0) return setError('Coût moyen invalide.');
      const asset = addAsset({
        name: name.trim(),
        symbol: symbol.trim() || undefined,
        assetClass,
        quoteCurrency: currency,
        pricingMode: 'market',
        priceSource: 'Manuel',
      });
      addPosition({
        accountId: account,
        assetId: asset.id,
        quantityDecimal: quantity.replace(',', '.'),
        averageCostMinor: cost,
        averageCostCurrency: currency,
      });
      const price = parseAmountToMinor(currentPrice);
      if (price != null && price > 0) upsertQuote(asset.id, price, currency);
    }

    haptics.success();
    handleClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Nouvelle position">
      <View style={{ gap: 16 }}>
        <Field label="Nom" value={name} onChangeText={setName} placeholder="Ex. Actions Nestlé" error={error && !name ? error : null} />
        <Field label="Symbole (facultatif)" value={symbol} onChangeText={setSymbol} autoCapitalize="characters" placeholder="Ex. NESN" />
        <OptionGroup label="Classe d’actif" options={CLASSES} value={assetClass} onChange={setAssetClass} />

        {accounts.length > 0 && (
          <OptionGroup
            label="Compte"
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
            value={accountId ?? accounts[0].id}
            onChange={setAccountId}
          />
        )}

        <OptionGroup
          label="Valorisation"
          options={[
            { value: 'manual', label: 'Valeur manuelle' },
            { value: 'holding', label: 'Quantité + coût' },
          ]}
          value={mode}
          onChange={setMode}
        />

        {mode === 'manual' ? (
          <CurrencyAmountInput
            label="Valeur actuelle"
            amount={manualValue}
            onAmountChange={setManualValue}
            currency={currency}
            onCurrencyChange={setCurrency}
            error={error && mode === 'manual' ? error : null}
          />
        ) : (
          <View style={{ gap: 16 }}>
            <Field label="Quantité" value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" placeholder="Ex. 12" />
            <CurrencyAmountInput
              label="Coût moyen (par unité)"
              amount={avgCost}
              onAmountChange={setAvgCost}
              currency={currency}
              onCurrencyChange={setCurrency}
            />
            <Field
              label="Prix actuel par unité (facultatif)"
              value={currentPrice}
              onChangeText={setCurrentPrice}
              keyboardType="decimal-pad"
              placeholder="Sinon, le coût moyen est utilisé"
            />
            {error && mode === 'holding' ? (
              <Text variant="micro" tone="negative">
                {error}
              </Text>
            ) : null}
          </View>
        )}

        <Button label="Ajouter la position" onPress={handleSave} />
      </View>
    </BottomSheet>
  );
}
