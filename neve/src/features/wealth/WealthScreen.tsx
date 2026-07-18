import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  AmountText,
  AppHeader,
  EmptyState,
  GlassCard,
  ListRow,
  ProgressBar,
  RowDivider,
  Screen,
  SectionHeader,
  Segmented,
  Text,
  TrendBadge,
} from '@/components';
import { allocationByClass, currencyExposure } from '@/domain';
import { formatPercent } from '@/domain/money';
import { t } from '@/i18n';
import { categoryColors } from '@/theme';
import { portfolioContext, selectNetWorth, selectValuations, useAppStore } from '@/store';
import { useQuickAdd } from '@/features/forms/QuickAddProvider';

type GroupMode = 'accounts' | 'class' | 'currency';

export function WealthScreen() {
  const router = useRouter();
  const data = useAppStore((s) => s.data);
  const { open: openQuickAdd } = useQuickAdd();
  const [mode, setMode] = useState<GroupMode>('class');

  const base = data.preferences.baseCurrency;
  const nw = useMemo(() => selectNetWorth(data), [data]);
  const valuations = useMemo(() => selectValuations(data), [data]);

  const groups = useMemo(() => {
    if (mode === 'class') {
      return allocationByClass(valuations, data.assets).map((s) => ({
        key: s.key,
        label: s.label,
        valueMinor: s.valueMinor,
        ratio: s.ratio,
      }));
    }
    if (mode === 'currency') {
      return currencyExposure(data.positions, portfolioContext(data)).map((s) => ({
        key: s.key,
        label: s.label,
        valueMinor: s.valueMinor,
        ratio: s.ratio,
      }));
    }
    // accounts
    const total = valuations.reduce((sum, v) => sum + v.valueMinor, 0);
    const byAccount = new Map<string, number>();
    for (const v of valuations) byAccount.set(v.accountId, (byAccount.get(v.accountId) ?? 0) + v.valueMinor);
    return Array.from(byAccount.entries())
      .map(([accountId, valueMinor]) => ({
        key: accountId,
        label: data.accounts.find((a) => a.id === accountId)?.name ?? accountId,
        valueMinor,
        ratio: total === 0 ? 0 : valueMinor / total,
      }))
      .sort((a, b) => b.valueMinor - a.valueMinor);
  }, [mode, valuations, data]);

  const activeLiabilities = data.liabilities.filter((l) => !l.isArchived);

  if (data.positions.length === 0 && activeLiabilities.length === 0) {
    return (
      <Screen bottomInset={110}>
        <AppHeader title={t.wealth.title} subtitle={t.wealth.subtitle} />
        <EmptyState
          title={t.wealth.empty}
          body={t.wealth.emptyHint}
          actionLabel={t.wealth.addAsset}
          onAction={() => openQuickAdd('position')}
        />
      </Screen>
    );
  }

  return (
    <Screen bottomInset={110}>
      <AppHeader title={t.wealth.title} subtitle={t.wealth.subtitle} />

      <GlassCard strong radius="panel" padding="lg" style={styles.summary}>
        <View style={styles.summaryRow}>
          <Stat label={t.metrics.assets} minor={nw.assetsMinor} currency={base} />
          <Stat label={t.metrics.liabilities} minor={nw.liabilitiesMinor} currency={base} />
        </View>
        <RowDivider />
        <View style={{ marginTop: 12 }}>
          <Text variant="micro" tone="muted">
            {t.metrics.netWorth}
          </Text>
          <AmountText minor={nw.netWorthMinor} currency={base} variant="screenTitle" style={{ marginTop: 2 }} />
        </View>
      </GlassCard>

      <View style={{ marginBottom: 12 }}>
        <Segmented
          options={[
            { value: 'class', label: t.wealth.byClass },
            { value: 'accounts', label: t.wealth.accounts },
            { value: 'currency', label: t.wealth.byCurrency },
          ]}
          value={mode}
          onChange={setMode}
        />
      </View>

      <GlassCard style={styles.block}>
        {groups.map((g, i) => (
          <View key={g.key} style={{ marginBottom: i === groups.length - 1 ? 0 : 14 }}>
            <View style={styles.groupRow}>
              <Text variant="body" weight="medium">
                {g.label}
              </Text>
              <AmountText minor={g.valueMinor} currency={base} variant="cardTitle" />
            </View>
            <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <ProgressBar ratio={g.ratio} colorIndex={i} />
              </View>
              <Text variant="micro" tone="muted" tabular>
                {formatPercent(g.ratio, 0)}
              </Text>
            </View>
          </View>
        ))}
      </GlassCard>

      {/* Individual positions */}
      <SectionHeader title={t.portfolio.positions} />
      <GlassCard style={styles.block} padding="sm">
        {valuations.length === 0 ? (
          <Text variant="meta" tone="muted" style={{ padding: 8 }}>
            {t.wealth.empty}
          </Text>
        ) : (
          valuations.map((v, i) => {
            const asset = data.assets.find((a) => a.id === v.assetId);
            const account = data.accounts.find((a) => a.id === v.accountId);
            return (
              <View key={v.positionId}>
                {i > 0 && <RowDivider />}
                <ListRow
                  title={asset?.name ?? v.assetId}
                  subtitle={[account?.name, asset?.symbol].filter(Boolean).join(' · ')}
                  colorIndex={i}
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
          })
        )}
      </GlassCard>

      {/* Liabilities */}
      {activeLiabilities.length > 0 && (
        <>
          <SectionHeader title={t.wealth.liabilities} />
          <GlassCard style={styles.block} padding="sm">
            {activeLiabilities.map((l, i) => (
              <View key={l.id}>
                {i > 0 && <RowDivider />}
                <ListRow
                  title={l.name}
                  subtitle={LIABILITY_LABEL[l.kind]}
                  leading={<View style={[styles.liaDot, { backgroundColor: categoryColors[1] }]} />}
                  right={<AmountText minor={-l.principalMinor} currency={l.currency} variant="cardTitle" tone="negative" />}
                />
              </View>
            ))}
          </GlassCard>
        </>
      )}
    </Screen>
  );
}

const LIABILITY_LABEL: Record<string, string> = {
  mortgage: 'Hypothèque',
  loan: 'Prêt',
  credit_card: 'Carte de crédit',
  tax: 'Impôts',
  other: 'Autre',
};

function Stat({ label, minor, currency }: { label: string; minor: number; currency: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text variant="micro" tone="muted">
        {label}
      </Text>
      <AmountText minor={minor} currency={currency} variant="cardValue" style={{ marginTop: 3 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { marginBottom: 16 },
  summaryRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  block: { marginBottom: 16 },
  groupRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  liaDot: { width: 10, height: 10, borderRadius: 5 },
});
