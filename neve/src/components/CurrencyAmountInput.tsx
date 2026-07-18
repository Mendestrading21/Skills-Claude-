import React from 'react';
import { StyleSheet, View } from 'react-native';

import { SUPPORTED_CURRENCIES } from '@/config/app';
import type { CurrencyCode } from '@/types';
import { Field } from './Field';
import { Segmented } from './Segmented';

export type CurrencyAmountInputProps = {
  label: string;
  amount: string;
  onAmountChange: (v: string) => void;
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  error?: string | null;
  currencies?: readonly string[];
};

/** Amount text field paired with a compact currency selector. */
export function CurrencyAmountInput({
  label,
  amount,
  onAmountChange,
  currency,
  onCurrencyChange,
  error,
  currencies = SUPPORTED_CURRENCIES,
}: CurrencyAmountInputProps) {
  return (
    <View style={styles.wrap}>
      <Field
        label={label}
        value={amount}
        onChangeText={onAmountChange}
        keyboardType="decimal-pad"
        placeholder="0.00"
        error={error}
      />
      <Segmented
        options={currencies.map((c) => ({ value: c, label: c }))}
        value={currency}
        onChange={(c) => onCurrencyChange(c as CurrencyCode)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
});
