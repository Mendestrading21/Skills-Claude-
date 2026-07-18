import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AmountText,
  AppHeader,
  Button,
  EmptyState,
  GlassCard,
  ListRow,
  ProgressBar,
  RowDivider,
  Screen,
  SectionHeader,
  Text,
  TrendBadge,
} from '@/components';
import { formatMinor, formatPercent, relativeChange } from '@/domain/money';
import { t } from '@/i18n';
import { formatDateFr } from '@/utils/date';
import {
  selectBudgetProgress,
  selectBudgetTotals,
  selectCashFlow,
  selectPreviousCashFlow,
  useAppStore,
} from '@/store';
import { useQuickAdd } from '@/features/forms/QuickAddProvider';

export function BudgetScreen() {
  const data = useAppStore((s) => s.data);
  const { open: openQuickAdd } = useQuickAdd();

  const base = data.preferences.baseCurrency;
  const cash = useMemo(() => selectCashFlow(data), [data]);
  const prev = useMemo(() => selectPreviousCashFlow(data), [data]);
  const budgets = useMemo(() => selectBudgetProgress(data), [data]);
  const totals = useMemo(() => selectBudgetTotals(data), [data]);
  const netTrend = relativeChange(cash.netMinor, prev.netMinor);

  const upcoming = data.recurring.filter((r) => r.isActive).sort((a, b) => a.nextDate.localeCompare(b.nextDate));

  return (
    <Screen bottomInset={110}>
      <AppHeader title={t.budget.title} subtitle={t.budget.subtitle} />

      {/* Cash-flow */}
      <GlassCard strong radius="panel" padding="lg" style={styles.summary}>
        <View style={styles.cashRow}>
          <Cash label={t.budget.income} minor={cash.incomeMinor} currency={base} tone="positive" />
          <Cash label={t.budget.expenses} minor={cash.expenseMinor} currency={base} tone="negative" />
        </View>
        <RowDivider />
        <View style={styles.netRow}>
          <View>
            <Text variant="micro" tone="muted">
              {t.budget.net}
            </Text>
            <AmountText minor={cash.netMinor} currency={base} variant="screenTitle" colorBySign style={{ marginTop: 2 }} />
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <TrendBadge ratio={netTrend} />
            <Text variant="micro" tone="muted">
              {t.budget.vsPrevious}
            </Text>
          </View>
        </View>
      </GlassCard>

      {/* Budgets */}
      <SectionHeader
        title={t.budget.monthlyBudgets}
        actionLabel={t.common.add}
        onAction={() => openQuickAdd('budget')}
      />
      {budgets.length === 0 ? (
        <EmptyState
          title={t.budget.empty}
          body={t.budget.emptyHint}
          actionLabel={t.budget.addBudget}
          onAction={() => openQuickAdd('budget')}
        />
      ) : (
        <GlassCard style={styles.block}>
          <View style={styles.totalsRow}>
            <Text variant="meta" tone="secondary">
              {formatMinor(totals.spentMinor, base)} / {formatMinor(totals.limitMinor, base)}
            </Text>
            <Text variant="meta" tone={totals.ratio > 1 ? 'negative' : 'secondary'} tabular>
              {formatPercent(totals.ratio, 0)}
            </Text>
          </View>
          <View style={{ marginTop: 6, marginBottom: 16 }}>
            <ProgressBar ratio={totals.ratio} over={totals.ratio > 1} height={10} />
          </View>
          {budgets.map((b, i) => (
            <View key={b.budgetId} style={{ marginBottom: i === budgets.length - 1 ? 0 : 14 }}>
              <View style={styles.budgetRow}>
                <Text variant="body" weight="medium">
                  {b.categoryName}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <AmountText minor={b.spentMinor} currency={b.currency} variant="meta" tone={b.isOver ? 'negative' : 'secondary'} />
                  <Text variant="meta" tone="muted">
                    / {formatMinor(b.limitMinor, b.currency, { showCurrency: false })}
                  </Text>
                  {b.isOver ? <TrendBadge ratio={null} size="sm" /> : null}
                </View>
              </View>
              <View style={{ marginTop: 6 }}>
                <ProgressBar ratio={b.ratio} colorIndex={b.colorIndex} over={b.isOver} />
              </View>
            </View>
          ))}
        </GlassCard>
      )}

      {/* Upcoming recurring */}
      {upcoming.length > 0 && (
        <>
          <SectionHeader title={t.budget.upcoming} />
          <GlassCard style={styles.block} padding="sm">
            {upcoming.map((r, i) => (
              <View key={r.id}>
                {i > 0 && <RowDivider />}
                <ListRow
                  title={r.label}
                  subtitle={`${FREQ_LABEL[r.frequency]} · ${formatDateFr(r.nextDate)}`}
                  leading={<View style={[styles.dot, { backgroundColor: r.type === 'income' ? '#31D17C' : '#FF8A1F' }]} />}
                  right={
                    <AmountText
                      minor={r.type === 'income' ? r.amountMinor : -r.amountMinor}
                      currency={r.currency}
                      variant="cardTitle"
                      colorBySign
                    />
                  }
                />
              </View>
            ))}
          </GlassCard>
        </>
      )}

      {/* Goals */}
      {data.goals.length > 0 && (
        <>
          <SectionHeader title={t.budget.goals} />
          <GlassCard style={styles.block}>
            {data.goals.map((g, i) => {
              const ratio = g.targetMinor === 0 ? 0 : g.currentMinor / g.targetMinor;
              return (
                <View key={g.id} style={{ marginBottom: i === data.goals.length - 1 ? 0 : 16 }}>
                  <View style={styles.budgetRow}>
                    <Text variant="body" weight="medium">
                      {g.name}
                    </Text>
                    <Text variant="meta" tone="secondary" tabular>
                      {formatMinor(g.currentMinor, g.currency, { compact: true })} / {formatMinor(g.targetMinor, g.currency, { compact: true })}
                    </Text>
                  </View>
                  <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <ProgressBar ratio={ratio} colorIndex={i + 2} />
                    </View>
                    <Text variant="micro" tone="muted" tabular>
                      {formatPercent(ratio, 0)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </GlassCard>
        </>
      )}

      <View style={{ marginTop: 4 }}>
        <Button label={t.budget.addBudget} variant="secondary" onPress={() => openQuickAdd('budget')} />
      </View>
    </Screen>
  );
}

const FREQ_LABEL: Record<string, string> = {
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  yearly: 'Annuel',
};

function Cash({ label, minor, currency, tone }: { label: string; minor: number; currency: string; tone: 'positive' | 'negative' }) {
  return (
    <View style={{ flex: 1 }}>
      <Text variant="micro" tone="muted">
        {label}
      </Text>
      <AmountText minor={minor} currency={currency} variant="cardValue" tone={tone} style={{ marginTop: 3 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { marginBottom: 16 },
  cashRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  netRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  block: { marginBottom: 16 },
  totalsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  budgetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
