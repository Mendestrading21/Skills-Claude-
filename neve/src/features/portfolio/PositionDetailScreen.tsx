import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  AmountText,
  BackHeader,
  Button,
  ConfirmSheet,
  EmptyState,
  GlassCard,
  PrivacyBadge,
  RowDivider,
  Screen,
  SectionHeader,
  Text,
  TrendBadge,
} from '@/components';
import { EditPositionForm } from '@/features/forms/EditPositionForm';
import { valuePosition } from '@/domain';
import { formatMinor } from '@/domain/money';
import { DISCLAIMERS } from '@/config/app';
import { t } from '@/i18n';
import { formatDateFr } from '@/utils/date';
import { portfolioContext, useAppStore } from '@/store';

const ORIGIN_LABEL: Record<string, string> = {
  manual: 'Valeur manuelle',
  market: 'Prix de marché',
  cost: 'Basé sur le coût',
  none: 'Non valorisé',
};

export function PositionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const data = useAppStore((s) => s.data);
  const archivePosition = useAppStore((s) => s.archivePosition);
  const removePosition = useAppStore((s) => s.removePosition);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);

  const position = data.positions.find((p) => p.id === id);
  const asset = position ? data.assets.find((a) => a.id === position.assetId) : undefined;
  const account = position ? data.accounts.find((a) => a.id === position.accountId) : undefined;

  const valuation = useMemo(
    () => (position ? valuePosition(position, portfolioContext(data)) : null),
    [position, data],
  );

  if (!position || !valuation) {
    return (
      <Screen bottomInset={20}>
        <BackHeader title="Position" />
        <EmptyState title="Position introuvable" body="Cette position n’existe plus." actionLabel="Retour" onAction={() => router.back()} />
      </Screen>
    );
  }

  const base = data.preferences.baseCurrency;

  return (
    <Screen bottomInset={20}>
      <BackHeader title={asset?.name ?? 'Position'} />

      <GlassCard strong radius="panel" padding="lg" style={styles.block}>
        <View style={styles.top}>
          <Text variant="micro" tone="muted">
            {t.metrics.currentValue}
          </Text>
          <PrivacyBadge label={ORIGIN_LABEL[valuation.origin]} tone={valuation.origin === 'manual' ? 'accent' : 'muted'} />
        </View>
        <AmountText minor={valuation.valueMinor} currency={base} variant="display" style={{ marginTop: 4 }} />
        {valuation.gainMinor != null ? (
          <View style={styles.trend}>
            <TrendBadge ratio={valuation.gainRatio} />
            <Text variant="meta" tone="secondary">
              {formatMinor(valuation.gainMinor, base, { signed: true })} · {t.metrics.unrealizedGain}
            </Text>
          </View>
        ) : (
          <Text variant="meta" tone="muted" style={{ marginTop: 8 }}>
            {t.common.toVerify} · coût de revient non renseigné
          </Text>
        )}
      </GlassCard>

      <GlassCard style={styles.block}>
        <DetailRow label="Compte" value={account?.name ?? '—'} />
        <RowDivider />
        <DetailRow label="Classe d’actif" value={ASSET_CLASS_LABEL[asset?.assetClass ?? 'other']} />
        {asset?.symbol ? (
          <>
            <RowDivider />
            <DetailRow label="Symbole" value={asset.symbol} />
          </>
        ) : null}
        <RowDivider />
        <DetailRow label="Quantité" value={String(valuation.quantity)} />
        {position.averageCostMinor != null ? (
          <>
            <RowDivider />
            <DetailRow
              label={t.metrics.costBasis}
              value={formatMinor(position.averageCostMinor, position.averageCostCurrency ?? base)}
            />
          </>
        ) : null}
        {valuation.priceMinor != null ? (
          <>
            <RowDivider />
            <DetailRow
              label="Prix unitaire"
              value={formatMinor(valuation.priceMinor, valuation.priceCurrency ?? base)}
            />
          </>
        ) : null}
      </GlassCard>

      {/* Price source / freshness */}
      {valuation.origin === 'market' && (
        <GlassCard style={styles.block}>
          <View style={styles.sourceRow}>
            <Text variant="meta" tone="secondary">
              {t.common.priceSource}
            </Text>
            <Text variant="meta">{valuation.priceSource ?? 'Manuel'}</Text>
          </View>
          {valuation.isStale ? (
            <Text variant="micro" tone="warning" style={{ marginTop: 8 }}>
              Donnée possiblement périmée. {DISCLAIMERS.price}
            </Text>
          ) : (
            <Text variant="micro" tone="muted" style={{ marginTop: 8 }}>
              {DISCLAIMERS.price}
            </Text>
          )}
        </GlassCard>
      )}

      {position.notes ? (
        <>
          <SectionHeader title="Notes" />
          <GlassCard style={styles.block}>
            <Text variant="body" tone="secondary">
              {position.notes}
            </Text>
          </GlassCard>
        </>
      ) : null}

      {position.openedAt ? (
        <Text variant="micro" tone="muted" style={{ marginBottom: 16 }}>
          Ouverte le {formatDateFr(position.openedAt)}
        </Text>
      ) : null}

      <View style={{ gap: 10 }}>
        <Button label={`✏️ ${t.common.edit}`} onPress={() => setEditing(true)} />
        <Button
          label={t.common.archive}
          variant="secondary"
          onPress={() => {
            archivePosition(position.id);
            router.back();
          }}
        />
        <Button label={t.common.delete} variant="destructive" onPress={() => setConfirmDelete(true)} />
      </View>

      <EditPositionForm visible={editing} position={position} onClose={() => setEditing(false)} />

      <ConfirmSheet
        visible={confirmDelete}
        title={t.common.delete}
        message="Cette position sera définitivement supprimée."
        confirmLabel={t.common.delete}
        destructive
        onConfirm={() => {
          removePosition(position.id);
          router.back();
        }}
        onClose={() => setConfirmDelete(false)}
      />
    </Screen>
  );
}

const ASSET_CLASS_LABEL: Record<string, string> = {
  cash: 'Liquidités',
  equity: 'Actions',
  etf: 'ETF',
  fund: 'Fonds',
  bond: 'Obligations',
  crypto: 'Crypto',
  pension: 'Prévoyance',
  real_estate: 'Immobilier',
  commodity: 'Matières premières',
  other: 'Autres',
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text variant="body" tone="secondary">
        {label}
      </Text>
      <Text variant="body" weight="medium" tabular>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginBottom: 16 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trend: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
