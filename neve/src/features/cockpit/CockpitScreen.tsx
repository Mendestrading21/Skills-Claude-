import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  AllocationRing,
  AmountText,
  AnimatedEntrance,
  AppHeader,
  Button,
  GlassCard,
  GradientAmount,
  Icon,
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
import { assetClassEmoji, greeting } from '@/utils/emoji';
import {
  selectAllocation,
  selectBudgetTotals,
  selectCashFlow,
  selectGamification,
  selectNetWorth,
  selectNetWorthGoal,
  selectPerformance,
  selectPortfolioSummary,
  selectPreviousCashFlow,
  selectPriorityAlerts,
  selectSavingsRate,
  selectSeries,
  useAppStore,
} from '@/store';
import { useQuickAdd } from '@/features/forms/QuickAddProvider';
import type { RangeKey } from '@/utils/date';
import type { AssetClass } from '@/types';

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
  const setPreferences = useAppStore((s) => s.setPreferences);
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
  const goal = useMemo(() => selectNetWorthGoal(data), [data]);
  const game = useMemo(() => selectGamification(data), [data]);
  const savingsRate = useMemo(() => selectSavingsRate(data), [data]);
  const monthChange = useMemo(() => selectPerformance(data, '1M'), [data]);
  const sparkValues = useMemo(() => data.snapshots.map((s) => s.netWorthMinor), [data.snapshots]);

  const { open: openQuickAdd } = useQuickAdd();
  const cashFlowTrend = relativeChange(cashFlow.netMinor, prevCashFlow.netMinor);
  const isEmpty = data.accounts.length === 0 && data.positions.length === 0;
  const hello = greeting();

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
        subtitle={`${hello.emoji} ${hello.text}`}
        showLogo
        actions={[
          {
            icon: data.preferences.hideAmounts ? 'eyeOff' : 'eye',
            label: data.preferences.hideAmounts ? 'Afficher les montants' : 'Masquer les montants',
            onPress: () => setPreferences({ hideAmounts: !data.preferences.hideAmounts }),
          },
          { icon: 'assistant', label: t.assistant.title, onPress: () => router.push('/assistant') },
          { icon: 'settings', label: t.settings.title, onPress: () => router.push('/settings') },
        ]}
      />

      {/* Net worth hero */}
      <AnimatedEntrance>
        <GlassCard strong radius="panel" padding="lg" glow="#FF8A1F" style={styles.hero}>
          <View style={styles.heroTop}>
            <Text variant="micro" tone="muted">
              💎 {t.metrics.netWorth}
            </Text>
            <PrivacyBadge label="Sur cet appareil" tone="info" />
          </View>
          <GradientAmount minor={nw.netWorthMinor} currency={base} fontSize={40} />
          <View style={styles.heroTrend}>
            <TrendBadge ratio={perf.ratio} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <AmountText minor={perf.absoluteMinor} currency={base} variant="meta" tone="secondary" signed />
              <Text variant="meta" tone="secondary">
                · {rangeLabel(range)}
              </Text>
            </View>
          </View>

          <View style={[styles.statRow, { borderTopColor: theme.colors.border }]}>
            <MiniStat label={`💰 ${t.metrics.assets}`} minor={nw.assetsMinor} currency={base} />
            <MiniStat label={`💳 ${t.metrics.liabilities}`} minor={nw.liabilitiesMinor} currency={base} />
            <MiniStat label={`💧 ${t.metrics.liquidity}`} minor={nw.liquidityMinor} currency={base} />
          </View>
        </GlassCard>
      </AnimatedEntrance>

      {/* Update balances CTA */}
      <AnimatedEntrance delay={50}>
        <Pressable
          onPress={() => openQuickAdd('balances')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.85 : 1 }]}
        >
          <GlassCard strong padding="md" radius="control" style={styles.ctaCard}>
            <View style={styles.ctaLeft}>
              <Icon name="refresh" size={20} color={theme.colors.accent} />
              <Text variant="body" weight="semibold">
                Mettre à jour mes soldes
              </Text>
            </View>
            <Icon name="chevronRight" size={18} color={theme.colors.textMuted} />
          </GlassCard>
        </Pressable>
      </AnimatedEntrance>

      {/* Net worth goal */}
      <AnimatedEntrance delay={65}>
        <Pressable
          onPress={() => openQuickAdd('goal')}
          accessibilityRole="button"
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          <GlassCard style={styles.block} glow={goal ? '#31D17C' : undefined}>
            {goal ? (
              <>
                <View style={styles.goalHead}>
                  <Text variant="cardTitle">🎯 Objectif de patrimoine</Text>
                  <Text variant="meta" tone="accent" weight="semibold" tabular>
                    {formatPercent(goal.ratio, 0)}
                  </Text>
                </View>
                <View style={{ marginTop: 10 }}>
                  <ProgressBar ratio={goal.ratio} color={theme.colors.positive} height={10} />
                </View>
                <View style={styles.goalFoot}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <AmountText minor={goal.currentMinor} currency={base} variant="meta" tone="secondary" compact />
                    <Text variant="meta" tone="muted">/</Text>
                    <AmountText minor={goal.targetMinor} currency={base} variant="meta" tone="secondary" compact />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text variant="meta" tone="muted">Reste</Text>
                    <AmountText minor={goal.remainingMinor} currency={base} variant="meta" tone="muted" compact />
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.goalEmpty}>
                <Text variant="cardTitle">🎯 Définir un objectif</Text>
                <Text variant="meta" tone="secondary" style={{ marginTop: 4 }}>
                  Fixez un patrimoine net à atteindre et suivez votre progression.
                </Text>
              </View>
            )}
          </GlassCard>
        </Pressable>
      </AnimatedEntrance>

      {/* Progression / saving game */}
      <AnimatedEntrance delay={72}>
        <Pressable
          onPress={() => router.push('/challenges')}
          accessibilityRole="button"
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          <GlassCard style={styles.block} glow="#A979FF">
            <View style={styles.progressRow}>
              <View style={[styles.levelChip, { borderColor: theme.colors.accent }]}>
                <Text variant="cardValue" tone="accent" tabular>
                  {game.level.level}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="cardTitle">🎮 {game.level.title}</Text>
                <Text variant="meta" tone="secondary" style={{ marginTop: 1 }}>
                  🔥 {game.streak} mois · 🏅 {game.badges.filter((b) => b.unlocked).length}/{game.badges.length} badges
                </Text>
              </View>
              <Icon name="chevronRight" size={18} color={theme.colors.textMuted} />
            </View>
            <View style={{ marginTop: 12 }}>
              <ProgressBar ratio={game.level.ratioToNext} />
            </View>
          </GlassCard>
        </Pressable>
      </AnimatedEntrance>

      {/* History */}
      <AnimatedEntrance delay={80}>
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
      </AnimatedEntrance>

      {/* Metric grid */}
      <AnimatedEntrance delay={140}>
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <MetricCard
            label={`📈 ${t.metrics.investments}`}
            value={<AmountText minor={nw.investmentsMinor} currency={base} variant="cardValue" />}
            caption={sparkValues.length > 1 ? undefined : t.common.toVerify}
            trend={sparkValues.length > 1 ? <Sparkline values={sparkValues} width={90} height={28} /> : undefined}
            onPress={() => router.push('/(tabs)/portfolio')}
          />
        </View>
        <View style={styles.gridItem}>
          <MetricCard
            label={`🚀 ${t.metrics.performance}`}
            value={
              <Text
                variant="cardValue"
                tone={portfolio.totalGainRatio == null ? 'muted' : portfolio.totalGainRatio >= 0 ? 'positive' : 'negative'}
                tabular
              >
                {portfolio.totalGainRatio == null ? '—' : formatPercent(portfolio.totalGainRatio)}
              </Text>
            }
            caption={<AmountText minor={portfolio.totalGainMinor} currency={base} variant="meta" tone="secondary" signed compact />}
            onPress={() => router.push('/(tabs)/portfolio')}
          />
        </View>
        <View style={styles.gridItem}>
          <MetricCard
            label={`💸 ${t.metrics.monthlyCashFlow}`}
            value={<AmountText minor={cashFlow.netMinor} currency={base} variant="cardValue" colorBySign />}
            trend={<TrendBadge ratio={cashFlowTrend} size="sm" />}
            caption={t.budget.vsPrevious}
            onPress={() => router.push('/(tabs)/budget')}
          />
        </View>
        <View style={styles.gridItem}>
          <MetricCard
            label={`🎯 ${t.metrics.budgetRemaining}`}
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
            onPress={() => router.push('/(tabs)/budget')}
          />
        </View>
        <View style={styles.gridItem}>
          <MetricCard
            label="💰 Taux d’épargne"
            value={
              <Text variant="cardValue" tone={savingsRate == null ? 'muted' : savingsRate >= 0 ? 'positive' : 'negative'} tabular>
                {savingsRate == null ? '—' : formatPercent(savingsRate, 0)}
              </Text>
            }
            caption="ce mois"
            onPress={() => router.push('/challenges')}
          />
        </View>
        <View style={styles.gridItem}>
          <MetricCard
            label="📅 Ce mois"
            value={<AmountText minor={monthChange.absoluteMinor} currency={base} variant="cardValue" colorBySign signed compact />}
            trend={<TrendBadge ratio={monthChange.ratio} size="sm" />}
            caption="patrimoine net"
            onPress={() => router.push('/(tabs)/wealth')}
          />
        </View>
      </View>
      </AnimatedEntrance>

      {/* Allocation */}
      {allocation.length > 0 && (
        <AnimatedEntrance delay={200}>
        <GlassCard style={styles.block}>
          <SectionHeader title={`🧭 ${t.cockpit.allocationTitle}`} actionLabel={t.common.seeAll} onAction={() => router.push('/(tabs)/portfolio')} />
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
                    {assetClassEmoji(slice.key as AssetClass)} {slice.label}
                  </Text>
                  <Text variant="meta" tone="secondary" tabular>
                    {formatPercent(slice.ratio, 0)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </GlassCard>
        </AnimatedEntrance>
      )}

      {/* Priority actions */}
      <AnimatedEntrance delay={260}>
      <GlassCard style={styles.block}>
        <SectionHeader title={`🔔 ${t.cockpit.priorityActions}`} />
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
      </AnimatedEntrance>

      {/* Weekly brief */}
      <AnimatedEntrance delay={320}>
      <GlassCard style={styles.block} glow="#58A6FF">
        <SectionHeader title={`📊 ${t.cockpit.weeklyBrief}`} />
        <Text variant="body" tone="secondary" style={{ lineHeight: 22 }}>
          {buildBrief(nw.netWorthMinor, perf.ratio, cashFlow.netMinor, base)}
        </Text>
      </GlassCard>
      </AnimatedEntrance>
    </Screen>
  );
}

function MiniStat({ label, minor, currency }: { label: string; minor: number; currency: string }) {
  return (
    <View style={styles.miniStat}>
      <Text variant="micro" tone="muted">
        {label}
      </Text>
      <AmountText minor={minor} currency={currency} variant="cardTitle" compact style={{ marginTop: 3 }} />
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
  cta: { marginBottom: 16 },
  ctaCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelChip: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  goalFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  goalEmpty: {},
});
