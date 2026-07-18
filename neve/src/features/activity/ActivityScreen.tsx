import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AmountText,
  AppHeader,
  EmptyState,
  FilterChips,
  GlassCard,
  ListRow,
  RowDivider,
  Screen,
  Segmented,
  Text,
} from '@/components';
import { t } from '@/i18n';
import { formatDateFr } from '@/utils/date';
import { selectActivity, useAppStore } from '@/store';

type TypeFilter = 'all' | 'income' | 'expense' | 'dividend' | 'buy' | 'sell';
type PeriodFilter = 'all' | '30' | '90';

const TYPE_CHIPS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: t.common.all },
  { value: 'income', label: 'Revenus' },
  { value: 'expense', label: 'Dépenses' },
  { value: 'dividend', label: 'Dividendes' },
  { value: 'buy', label: 'Achats' },
  { value: 'sell', label: 'Ventes' },
];

export function ActivityScreen() {
  const data = useAppStore((s) => s.data);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [period, setPeriod] = useState<PeriodFilter>('all');
  // Cutoff timestamp computed in the change handler so render stays pure.
  const [cutoff, setCutoff] = useState<number | null>(null);

  const changePeriod = (value: PeriodFilter) => {
    setPeriod(value);
    setCutoff(value === 'all' ? null : Date.now() - Number(value) * 24 * 3600 * 1000);
  };

  const items = useMemo(() => selectActivity(data), [data]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== 'all' && item.transactionType !== typeFilter) return false;
      if (cutoff != null && new Date(item.occurredAt).getTime() < cutoff) return false;
      return true;
    });
  }, [items, typeFilter, cutoff]);

  return (
    <Screen bottomInset={110}>
      <AppHeader title={t.activity.title} subtitle={t.activity.subtitle} />

      <View style={{ marginBottom: 12 }}>
        <FilterChips chips={TYPE_CHIPS} value={typeFilter} onChange={setTypeFilter} />
      </View>
      <View style={{ marginBottom: 16 }}>
        <Segmented
          options={[
            { value: 'all', label: 'Tout' },
            { value: '30', label: '30 j' },
            { value: '90', label: '90 j' },
          ]}
          value={period}
          onChange={changePeriod}
        />
      </View>

      {filtered.length === 0 ? (
        <EmptyState title={t.activity.empty} body={t.activity.emptyHint} />
      ) : (
        <GlassCard style={styles.block} padding="sm">
          {filtered.map((item, i) => (
            <View key={item.id}>
              {i > 0 && <RowDivider />}
              <ListRow
                title={item.title}
                subtitle={item.subtitle}
                leading={<View style={[styles.dot, { backgroundColor: dotColor(item.direction) }]} />}
                right={
                  <View style={{ alignItems: 'flex-end' }}>
                    {item.amountMinor != null && item.currency ? (
                      <AmountText
                        minor={item.direction === -1 ? -item.amountMinor : item.amountMinor}
                        currency={item.currency}
                        variant="cardTitle"
                        colorBySign={item.direction !== 0}
                        signed={item.direction !== 0}
                      />
                    ) : null}
                    <Text variant="micro" tone="muted">
                      {formatDateFr(item.occurredAt)}
                    </Text>
                  </View>
                }
              />
            </View>
          ))}
        </GlassCard>
      )}
    </Screen>
  );
}

function dotColor(direction: 1 | -1 | 0): string {
  if (direction === 1) return '#31D17C';
  if (direction === -1) return '#FF8A1F';
  return '#737B89';
}

const styles = StyleSheet.create({
  block: { marginBottom: 16 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
