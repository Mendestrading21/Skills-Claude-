import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  AllocationRing,
  AmountText,
  AnimatedEntrance,
  AppHeader,
  Avatar,
  EmptyState,
  GlassCard,
  GradientAmount,
  ListRow,
  MetricCard,
  PrivacyBadge,
  ProgressBar,
  RowDivider,
  Screen,
  SectionHeader,
  Segmented,
  Text,
  TrendBadge,
} from '@/components';
import { assetClassEmoji } from '@/utils/emoji';
import {
  allocationByClass,
  currencyExposure,
  rankContributors,
  summarizePortfolio,
  type PositionValuation,
} from '@/domain';
import { formatMinor, formatPercent } from '@/domain/money';
import { DISCLAIMERS } from '@/config/app';
import { t } from '@/i18n';
import { categoryColors } from '@/theme';
import { portfolioContext, selectValuations, useAppStore } from '@/store';
import { useQuickAdd } from '@/features/forms/QuickAddProvider';
import type { AssetClass } from '@/types';

const INVESTMENT_CLASSES: AssetClass[] = ['equity', 'etf', 'fund', 'bond', 'crypto', 'commodity'];

type ContribMode = 'best' | 'worst';

export function PortfolioScreen() {
  const router = useRouter();
  const data = useAppStore((s) => s.data);
  const { open: openQuickAdd } = useQuickAdd();
  const [contribMode, setContribMode] = useState<ContribMode>('best');

  const base = data.preferences.baseCurrency;
  const allValuations = useMemo(() => selectValuations(data), [data]);

  const investmentAssetIds = useMemo(
    () => new Set(data.assets.filter((a) => INVESTMENT_CLASSES.includes(a.assetClass)).map((a) => a.id)),
    [data.assets],
  );
  const valuations = useMemo(
    () => allValuations.filter((v) => investmentAssetIds.has(v.assetId)),
    [allValuations, investmentAssetIds],
  );

  const summary = useMemo(() => summarizePortfolio(valuations, base), [valuations, base]);
  const allocation = useMemo(() => allocationByClass(valuations, data.assets), [valuations, data.assets]);
  const contributors = useMemo(() => rankContributors(valuations, data.assets), [valuations, data.assets]);
  const exposure = useMemo(
    () => currencyExposure(data.positions.filter((p) => investmentAssetIds.has(p.assetId)), portfolioContext(data)),
    [data, investmentAssetIds],
  );

  if (valuations.length === 0) {
    return (
      <Screen bottomInset={110}>
        <AppHeader title={t.portfolio.title} subtitle={t.portfolio.subtitle} />
        <EmptyState
          title={t.portfolio.empty}
          body={t.portfolio.emptyHint}
          actionLabel={t.portfolio.addPosition}
          onAction={() => openQuickAdd('position')}
        />
      </Screen>
    );
  }

  const shownContributors = (contribMode === 'best' ? contributors : [...contributors].reverse()).slice(0, 3);

  return (
    <Screen bottomInset={110}>
      <AppHeader title={t.portfolio.title} subtitle={t.portfolio.subtitle} />

      <AnimatedEntrance>
        <GlassCard strong radius="panel" padding="lg" glow="#FF8A1F" style={styles.summary}>
          <View style={styles.summaryTop}>
            <Text variant="micro" tone="muted">
              📊 {t.metrics.currentValue}
            </Text>
            {summary.hasStale ? <PrivacyBadge label="Prix indicatif" tone="muted" /> : null}
          </View>
          <GradientAmount minor={summary.totalValueMinor} currency={base} fontSize={40} />
          <View style={styles.summaryTrend}>
            <TrendBadge ratio={summary.totalGainRatio} />
            <Text variant="meta" tone="secondary">
              {formatMinor(summary.totalGainMinor, base, { signed: true })} · {t.metrics.unrealizedGain}
            </Text>
          </View>
        </GlassCard>
      </AnimatedEntrance>

      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <MetricCard
            label={t.metrics.costBasis}
            value={<AmountText minor={summary.totalCostMinor} currency={base} variant="cardValue" />}
          />
        </View>
        <View style={styles.gridItem}>
          <MetricCard
            label={t.metrics.unrealizedGain}
            value={<AmountText minor={summary.totalGainMinor} currency={base} variant="cardValue" colorBySign />}
            caption={summary.totalGainRatio == null ? '—' : formatPercent(summary.totalGainRatio)}
          />
        </View>
      </View>

      {allocation.length > 0 && (
        <GlassCard style={styles.block}>
          <SectionHeader title={t.metrics.allocation} />
          <View style={styles.allocationRow}>
            <AllocationRing
              slices={allocation.map((a) => ({ key: a.key, label: a.label, ratio: a.ratio }))}
              size={150}
              centerValue={formatMinor(summary.totalValueMinor, base, { compact: true, showCurrency: false })}
              centerLabel={base}
            />
            <View style={styles.legend}>
              {allocation.slice(0, 6).map((slice, i) => (
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

      {/* Contributors */}
      {contributors.length > 0 && (
        <GlassCard style={styles.block}>
          <View style={styles.historyHeader}>
            <Text variant="sectionTitle">
              {contribMode === 'best' ? t.portfolio.topContributors : t.portfolio.worstContributors}
            </Text>
            <Segmented
              options={[
                { value: 'best', label: '↑' },
                { value: 'worst', label: '↓' },
              ]}
              value={contribMode}
              onChange={setContribMode}
            />
          </View>
          <View style={{ marginTop: 12 }}>
            {shownContributors.map((c, i) => {
              const asset = data.assets.find((a) => a.id === c.assetId);
              return (
              <View key={c.assetId}>
                {i > 0 && <RowDivider />}
                <ListRow
                  title={c.label}
                  subtitle={c.gainRatio == null ? t.common.toVerify : formatPercent(c.gainRatio)}
                  leading={<Avatar emoji={assetClassEmoji(asset?.assetClass ?? 'other')} colorIndex={i} size={38} />}
                  right={<AmountText minor={c.gainMinor} currency={base} variant="cardTitle" colorBySign signed />}
                />
              </View>
              );
            })}
          </View>
        </GlassCard>
      )}

      {/* Currency exposure */}
      {exposure.length > 0 && (
        <GlassCard style={styles.block}>
          <SectionHeader title={t.portfolio.currencyExposure} />
          {exposure.map((e, i) => (
            <View key={e.key} style={{ marginBottom: i === exposure.length - 1 ? 0 : 12 }}>
              <View style={styles.groupRow}>
                <Text variant="body" weight="medium">
                  {e.label}
                </Text>
                <Text variant="meta" tone="secondary" tabular>
                  {formatPercent(e.ratio, 0)}
                </Text>
              </View>
              <View style={{ marginTop: 6 }}>
                <ProgressBar ratio={e.ratio} colorIndex={i} />
              </View>
            </View>
          ))}
        </GlassCard>
      )}

      {/* Positions */}
      <SectionHeader title={t.portfolio.positions} />
      <GlassCard style={styles.block} padding="sm">
        {valuations.map((v: PositionValuation, i) => {
          const asset = data.assets.find((a) => a.id === v.assetId);
          return (
            <View key={v.positionId}>
              {i > 0 && <RowDivider />}
              <ListRow
                title={asset?.name ?? v.assetId}
                subtitle={[asset?.symbol, v.priceSource ?? undefined].filter(Boolean).join(' · ') || undefined}
                leading={<Avatar emoji={assetClassEmoji(asset?.assetClass ?? 'other')} colorIndex={i} size={38} />}
                showChevron
                onPress={() => router.push(`/position/${v.positionId}`)}
                right={
                  <View style={{ alignItems: 'flex-end' }}>
                    <AmountText minor={v.valueMinor} currency={base} variant="cardTitle" />
                    {v.gainRatio != null ? <TrendBadge ratio={v.gainRatio} size="sm" /> : null}
                  </View>
                }
              />
            </View>
          );
        })}
      </GlassCard>

      <Text variant="micro" tone="muted" style={{ marginTop: 4 }}>
        {DISCLAIMERS.price}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { marginBottom: 16 },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryTrend: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 4 },
  gridItem: { width: '48.5%', marginBottom: 12 },
  block: { marginBottom: 16 },
  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  allocationRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  legend: { flex: 1, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  groupRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
