import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  AllocationRing,
  AmountText,
  AppHeader,
  Button,
  GlassCard,
  LineChart,
  MetricCard,
  PrivacyBadge,
  ProgressBar,
  Screen,
  SectionHeader,
  Segmented,
  Sparkline,
  Text,
  TrendBadge,
} from '@/components';
import { formatMinor, formatPercent, relativeChange } from '@/domain/money';
import { APP_NAME } from '@/config/app';
import { t } from '@/i18n';
import { categoryColors, useTheme } from '@/theme';
import {
  selectAllocation,
  selectBudgetTotals,
  selectCashFlow,
  selectNetWorth,
  selectPerformance,
  selectPortfolioSummary,
  selectPreviousCashFlow,
  selectPriorityAlerts,
  selectSeries,
  useAppStore,
} from '@/store';
import type { RangeKey } from '@/utils/date';

const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: '1A', label: '1A' },
  { value: 'ALL', label: 'Tout' },
];

export function CockpitScreen() {
  const theme = useTheme();
  const router = useRouter();
  const data = useAppStore((s) => s.data);
  const loadDemo = useAppStore((s) => s.loadDemo);
  const [range, setRange] = useState<RangeKey>('6M');

  const base = data.preferences.baseCurrency;

  const nw = useMemo(() => selectNetWorth(data), [data]);
  const series = useMemo(() => selectSeries(data, range), [data, range]);
  const perf = useMemo(() => selectPerformance(data, range), [data, range]);
  const allocation = useMemo(() => selectAllocation(data), [data]);
  const cashFlow = useMemo(() => selectCashFlow(data), [data]);
  const prevCashFlow = useMemo(() => selectPreviousCashFlow(data), [data]);
  const portfolio = useMemo(() => selectPortfolioSummary(data), [data]);
  const budgetTotals = useMemo(() => selectBudgetTotals(data), [data]);
  const alerts = useMemo(() => selectPriorityAlerts(data), [data]);
  const sparkValues = useMemo(() => data.snapshots.map((s) => s.netWorthMinor), [data.snapshots]);

  const cashFlowTrend = relativeChange(cashFlow.netMinor, prevCashFlow.netMinor);
  const isEmpty = data.accounts.length === 0 && data.positions.length === 0;

  if (isEmpty) {
    return (
      <Screen bottomInset={110}>
        <AppHeader title={APP_NAME} subtitle={t.cockpit.subtitle} showLogo />
        <GlassCard padding="lg" style={styles.emptyCard}>
          <Text variant="sectionTitle" center>
            Bienvenue
          </Text>
          <Text variant="meta" tone="secondary" center style={{ marginTop: 8 }}>
            Ajoutez un compte avec le bouton +, ou explorez l’application avec un jeu de données de démonstration.
          </Text>
          <View style={{ marginTop: 20, alignSelf: 'stretch' }}>
            <Button label={t.onboarding.startWithDemo} onPress={loadDemo} />
          </View>
        </GlassCard>
      </Screen>
    );
  }

  return (
    <Screen bottomInset={110}>
      <AppHeader
        title={APP_NAME}
        subtitle={t.cockpit.subtitle}
        showLogo
        actions={[
          { icon: 'assistant', label: t.assistant.title, onPress: () => router.push('/assistant') },
          { icon: 'settings', label: t.settings.title, onPress: () => router.push('/settings') },
        ]}
      />

      {/* Net worth hero */}
      <GlassCard strong radius="panel" padding="lg" style={styles.hero}>
        <View style={styles.heroTop}>
          <Text variant="micro" tone="muted">
            {t.metrics.netWorth}
          </Text>
          <PrivacyBadge label="Sur cet appareil" tone="info" />
        </View>
        <AmountText minor={nw.netWorthMinor} currency={base} variant="display" style={{ marginTop: 6 }} />
        <View style={styles.heroTrend}>
          <TrendBadge ratio={perf.ratio} />
          <Text variant="meta" tone="secondary">
            {formatMinor(perf.absoluteMinor, base, { signed: true })} · {rangeLabel(range)}
          </Text>
        </View>

        <View style={[styles.statRow, { borderTopColor: theme.colors.border }]}>
          <MiniStat label={t.metrics.assets} value={formatMinor(nw.assetsMinor, base, { compact: true })} />
          <MiniStat label={t.metrics.liabilities} value={formatMinor(nw.liabilitiesMinor, base, { compact: true })} />
          <MiniStat label={t.metrics.liquidity} value={formatMinor(nw.liquidityMinor, base, { compact: true })} />
        </View>
      </GlassCard>

      {/* History */}
      <GlassCard style={styles.block}>
        <View style={styles.historyHeader}>
          <Text variant="sectionTitle">{t.cockpit.history}</Text>
          <TrendBadge ratio={perf.ratio} size="sm" />
        </View>
        <View style={{ marginVertical: theme.spacing.md }}>
          <Segmented options={RANGE_OPTIONS} value={range} onChange={setRange} />
        </View>
        <LineChart points={series} currency={base} />
      </GlassCard>

      {/* Metric grid */}
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <MetricCard
            label={t.metrics.investments}
            value={<AmountText minor={nw.investmentsMinor} currency={base} variant="cardValue" />}
            caption={sparkValues.length > 1 ? undefined : t.common.toVerify}
            trend={sparkValues.length > 1 ? <Sparkline values={sparkValues} width={90} height={28} /> : undefined}
          />
        </View>
        <View style={styles.gridItem}>
          <MetricCard
            label={t.metrics.performance}
            value={
              <Text
                variant="cardValue"
                tone={portfolio.totalGainRatio == null ? 'muted' : portfolio.totalGainRatio >= 0 ? 'positive' : 'negative'}
                tabular
              >
                {portfolio.totalGainRatio == null ? '—' : formatPercent(portfolio.totalGainRatio)}
              </Text>
            }
            caption={formatMinor(portfolio.totalGainMinor, base, { signed: true, compact: true })}
          />
        </View>
        <View style={styles.gridItem}>
          <MetricCard
            label={t.metrics.monthlyCashFlow}
            value={<AmountText minor={cashFlow.netMinor} currency={base} variant="cardValue" colorBySign />}
            trend={<TrendBadge ratio={cashFlowTrend} size="sm" />}
            caption={t.budget.vsPrevious}
          />
        </View>
        <View style={styles.gridItem}>
          <MetricCard
            label={t.metrics.budgetRemaining}
            value={<AmountText minor={budgetTotals.remainingMinor} currency={base} variant="cardValue" />}
            caption={
              budgetTotals.limitMinor > 0 ? (
                <View style={{ width: '100%', marginTop: 2 }}>
                  <ProgressBar ratio={budgetTotals.ratio} over={budgetTotals.ratio > 1} />
                </View>
              ) : (
                t.budget.empty
              )
            }
          />
        </View>
      </View>

      {/* Allocation */}
      {allocation.length > 0 && (
        <GlassCard style={styles.block}>
          <SectionHeader title={t.cockpit.allocationTitle} actionLabel={t.common.seeAll} onAction={() => router.push('/(tabs)/portfolio')} />
          <View style={styles.allocationRow}>
            <AllocationRing
              slices={allocation.map((a) => ({ key: a.key, label: a.label, ratio: a.ratio }))}
              centerValue={formatMinor(nw.assetsMinor, base, { compact: true, showCurrency: false })}
              centerLabel={base}
            />
            <View style={styles.legend}>
              {allocation.slice(0, 5).map((slice, i) => (
                <View key={slice.key} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: categoryColors[i % categoryColors.length] }]} />
                  <Text variant="meta" style={{ flex: 1 }} numberOfLines={1}>
                    {slice.label}
                  </Text>
                  <Text variant="meta" tone="secondary" tabular>
                    {formatPercent(slice.ratio, 0)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </GlassCard>
      )}

      {/* Priority actions */}
      <GlassCard style={styles.block}>
        <SectionHeader title={t.cockpit.priorityActions} />
        {alerts.length === 0 ? (
          <View style={styles.okRow}>
            <View style={[styles.okDot, { backgroundColor: theme.colors.positive }]} />
            <Text variant="meta" tone="secondary">
              {t.cockpit.nothingUrgent}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {alerts.map((alert) => (
              <View key={alert.id} style={styles.alertRow}>
                <View
                  style={[
                    styles.alertBar,
                    {
                      backgroundColor:
                        alert.tone === 'warning'
                          ? theme.colors.warning
                          : alert.tone === 'positive'
                            ? theme.colors.positive
                            : theme.colors.info,
                    },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="cardTitle">{alert.title}</Text>
                  <Text variant="meta" tone="secondary" style={{ marginTop: 1 }}>
                    {alert.body}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </GlassCard>

      {/* Weekly brief */}
      <GlassCard style={styles.block}>
        <SectionHeader title={t.cockpit.weeklyBrief} />
        <Text variant="body" tone="secondary" style={{ lineHeight: 22 }}>
          {buildBrief(nw.netWorthMinor, perf.ratio, cashFlow.netMinor, base)}
        </Text>
      </GlassCard>
    </Screen>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      <Text variant="micro" tone="muted">
        {label}
      </Text>
      <Text variant="cardTitle" tabular style={{ marginTop: 3 }}>
        {value}
      </Text>
    </View>
  );
}

function rangeLabel(range: RangeKey): string {
  return RANGE_OPTIONS.find((r) => r.value === range)?.label ?? '';
}

function buildBrief(netWorthMinor: number, perfRatio: number | null, cashNet: number, base: string): string {
  const dir = perfRatio == null ? 'stable' : perfRatio >= 0 ? 'en progression' : 'en léger repli';
  const cash = cashNet >= 0 ? 'positif' : 'négatif';
  return (
    `Votre patrimoine net s’établit à ${formatMinor(netWorthMinor, base)} et ressort ${dir} sur la période. ` +
    `Votre cash-flow du mois est ${cash}. ${t.assistant.disclaimer}`
  );
}

const styles = StyleSheet.create({
  emptyCard: { alignItems: 'center' },
  hero: { marginBottom: 16 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroTrend: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' },
  statRow: { flexDirection: 'row', marginTop: 18, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth },
  miniStat: { flex: 1 },
  block: { marginBottom: 16 },
  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 4 },
  gridItem: { width: '48.5%', marginBottom: 12 },
  allocationRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  legend: { flex: 1, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  okRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  okDot: { width: 8, height: 8, borderRadius: 4 },
  alertRow: { flexDirection: 'row', gap: 12 },
  alertBar: { width: 3, borderRadius: 3 },
});
