import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet, Button, CurrencyAmountInput, ProgressBar, Text } from '@/components';
import { formatMinor, formatPercent, parseAmountToMinor } from '@/domain/money';
import { haptics } from '@/services/haptics';
import { useTheme } from '@/theme';
import { useAppStore } from '@/store';
import type { CurrencyCode, SavingsGoal } from '@/types';

const QUICK = [2000, 5000, 10000, 20000]; // minor: 20, 50, 100, 200

/** Add money to a savings goal — the "put aside" action of the saving game. */
export function ContributeSheet({
  visible,
  goal,
  onClose,
}: {
  visible: boolean;
  goal: SavingsGoal;
  onClose: () => void;
}) {
  const theme = useTheme();
  const contributeToGoal = useAppStore((s) => s.contributeToGoal);
  const removeGoal = useAppStore((s) => s.removeGoal);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(goal.currency);
  const [added, setAdded] = useState(0);

  const projected = Math.max(0, goal.currentMinor + added);
  const ratio = goal.targetMinor === 0 ? 0 : projected / goal.targetMinor;

  const handleQuick = (minor: number) => {
    haptics.light();
    setAdded((a) => a + minor);
    contributeToGoal(goal.id, minor);
  };

  const handleCustom = () => {
    const minor = parseAmountToMinor(amount);
    if (minor == null || minor === 0) return;
    setAdded((a) => a + minor);
    contributeToGoal(goal.id, minor);
    setAmount('');
    haptics.success();
  };

  const handleClose = () => {
    setAdded(0);
    setAmount('');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title={goal.name}>
      <View style={{ gap: 16 }}>
        <View>
          <View style={styles.row}>
            <Text variant="cardValue" tabular>
              {formatMinor(projected, goal.currency, { compact: true })}
            </Text>
            <Text variant="meta" tone="secondary" tabular>
              / {formatMinor(goal.targetMinor, goal.currency, { compact: true })} · {formatPercent(ratio, 0)}
            </Text>
          </View>
          <View style={{ marginTop: 10 }}>
            <ProgressBar
              ratio={ratio}
              color={ratio >= 1 ? theme.colors.positive : theme.colors.accent}
              height={12}
            />
          </View>
          {ratio >= 1 ? (
            <Text variant="meta" tone="positive" style={{ marginTop: 8 }}>
              🎉 Objectif atteint, bravo !
            </Text>
          ) : null}
        </View>

        <Text variant="micro" tone="muted">
          Ajouter rapidement
        </Text>
        <View style={styles.quickRow}>
          {QUICK.map((q) => (
            <Pressable
              key={q}
              onPress={() => handleQuick(q)}
              style={[styles.quick, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
            >
              <Text variant="meta" weight="semibold" tone="accent">
                +{formatMinor(q, goal.currency, { showCurrency: false, decimals: 0 })}
              </Text>
            </Pressable>
          ))}
        </View>

        <CurrencyAmountInput
          label="Autre montant"
          amount={amount}
          onAmountChange={setAmount}
          currency={currency}
          onCurrencyChange={setCurrency}
        />
        <Button label="Ajouter au pot" onPress={handleCustom} />
        <Button label="Supprimer l’objectif" variant="ghost" onPress={() => { removeGoal(goal.id); handleClose(); }} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  quickRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  quick: {
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
