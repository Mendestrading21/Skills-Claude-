import React, { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, CurrencyAmountInput, Text } from '@/components';
import { fromMinor, parseAmountToMinor } from '@/domain/money';
import { haptics } from '@/services/haptics';
import { useAppStore } from '@/store';
import type { CurrencyCode } from '@/types';

/** Set (or clear) the optional net-worth objective. */
export function GoalForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const prefs = useAppStore((s) => s.data.preferences);
  const setPreferences = useAppStore((s) => s.setPreferences);

  const [amount, setAmount] = useState(
    prefs.netWorthTargetMinor ? fromMinor(prefs.netWorthTargetMinor).toFixed(0) : '',
  );
  const [currency, setCurrency] = useState<CurrencyCode>(prefs.baseCurrency);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const minor = parseAmountToMinor(amount);
    if (minor == null || minor <= 0) return setError('Montant invalide.');
    setPreferences({ netWorthTargetMinor: minor });
    haptics.success();
    onClose();
  };

  const handleClear = () => {
    setPreferences({ netWorthTargetMinor: 0 });
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Objectif de patrimoine">
      <View style={{ gap: 16 }}>
        <Text variant="meta" tone="secondary">
          Fixez un objectif de patrimoine net à atteindre. Vous verrez votre progression sur le cockpit.
        </Text>
        <CurrencyAmountInput
          label="Objectif"
          amount={amount}
          onAmountChange={setAmount}
          currency={currency}
          onCurrencyChange={setCurrency}
          error={error}
        />
        <Button label="Définir l’objectif" onPress={handleSave} />
        {prefs.netWorthTargetMinor ? (
          <Button label="Retirer l’objectif" variant="ghost" onPress={handleClear} />
        ) : null}
      </View>
    </BottomSheet>
  );
}
