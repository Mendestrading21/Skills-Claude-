import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar, BottomSheet, Button, Field, Text } from '@/components';
import { fromMinor, parseAmountToMinor, parseQuantity } from '@/domain/money';
import { valuePosition, type PortfolioContext } from '@/domain';
import { haptics } from '@/services/haptics';
import { useAppStore } from '@/store';
import type { CurrencyCode, Position } from '@/types';
import { accountEmoji, assetClassEmoji } from '@/utils/emoji';

type Row = {
  position: Position;
  label: string;
  accountLabel: string;
  emoji: string;
  currency: CurrencyCode;
  quantity: number;
  currentMajor: number;
  isManual: boolean;
};

/**
 * The core wealth-tracking loop: update every balance in one place, then
 * store a dated net-worth snapshot so the history curve reflects reality.
 */
export function UpdateBalancesForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const data = useAppStore((s) => s.data);
  const updatePosition = useAppStore((s) => s.updatePosition);
  const upsertQuote = useAppStore((s) => s.upsertQuote);
  const recordSnapshot = useAppStore((s) => s.recordSnapshot);

  const ctx: PortfolioContext = useMemo(
    () => ({ assets: data.assets, quotes: data.quotes, fxRates: data.fxRates, baseCurrency: data.preferences.baseCurrency }),
    [data],
  );

  const rows: Row[] = useMemo(() => {
    return data.positions
      .filter((p) => !p.isArchived)
      .map((p) => {
        const asset = data.assets.find((a) => a.id === p.assetId);
        const account = data.accounts.find((a) => a.id === p.accountId);
        const valuation = valuePosition(p, ctx);
        const isManual = p.manualValueMinor != null;
        const currency: CurrencyCode = isManual
          ? p.manualValueCurrency ?? asset?.quoteCurrency ?? ctx.baseCurrency
          : asset?.quoteCurrency ?? ctx.baseCurrency;
        // Show the raw (pre-FX) value in the position's own currency.
        const currentMinor = isManual
          ? (p.manualValueMinor as number)
          : Math.round((parseQuantity(p.quantityDecimal) ?? 0) * (valuation.priceMinor ?? p.averageCostMinor ?? 0));
        return {
          position: p,
          label: asset?.name ?? 'Position',
          accountLabel: account?.name ?? '',
          emoji: account ? accountEmoji(account.name, account.kind) : assetClassEmoji(asset?.assetClass ?? 'other'),
          currency,
          quantity: parseQuantity(p.quantityDecimal) ?? 1,
          currentMajor: fromMinor(currentMinor),
          isManual,
        };
      });
  }, [data, ctx]);

  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const displayValue = (r: Row) =>
    values[r.position.id] ?? (r.currentMajor ? r.currentMajor.toFixed(2) : '');

  const handleClose = () => {
    setValues({});
    setSaved(false);
    onClose();
  };

  const handleSave = () => {
    let changed = false;
    for (const r of rows) {
      const raw = values[r.position.id];
      if (raw == null) continue;
      const minor = parseAmountToMinor(raw);
      if (minor == null || minor < 0) continue;
      if (r.isManual) {
        updatePosition(r.position.id, { manualValueMinor: minor, manualValueCurrency: r.currency });
      } else {
        const qty = r.quantity || 1;
        upsertQuote(r.position.assetId, Math.round(minor / qty), r.currency);
      }
      changed = true;
    }
    recordSnapshot();
    if (changed) haptics.success();
    setSaved(true);
    setTimeout(handleClose, 650);
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Mettre à jour mes soldes">
      <View style={{ gap: 14 }}>
        <Text variant="meta" tone="secondary">
          Ajustez la valeur de vos comptes. Un point d’historique est enregistré pour suivre l’évolution.
        </Text>

        {rows.length === 0 ? (
          <Text variant="meta" tone="muted">
            Aucun compte à mettre à jour pour l’instant.
          </Text>
        ) : (
          rows.map((r) => (
            <View key={r.position.id} style={styles.row}>
              <Avatar emoji={r.emoji} size={40} />
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="medium" numberOfLines={1}>
                  {r.label}
                </Text>
                {r.accountLabel ? (
                  <Text variant="micro" tone="muted" numberOfLines={1}>
                    {r.accountLabel}
                  </Text>
                ) : null}
              </View>
              <View style={styles.inputCol}>
                <Field
                  label=""
                  value={displayValue(r)}
                  onChangeText={(v) => setValues((prev) => ({ ...prev, [r.position.id]: v }))}
                  keyboardType="decimal-pad"
                  right={
                    <Text variant="meta" tone="muted">
                      {r.currency}
                    </Text>
                  }
                />
              </View>
            </View>
          ))
        )}

        {saved ? (
          <Text variant="meta" tone="positive">
            Soldes mis à jour ✓
          </Text>
        ) : null}

        <Button label="Enregistrer les soldes" onPress={handleSave} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  inputCol: { width: 150 },
});
