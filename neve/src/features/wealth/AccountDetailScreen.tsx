import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  AmountText,
  Avatar,
  BackHeader,
  Button,
  ConfirmSheet,
  EmptyState,
  GlassCard,
  ListRow,
  RowDivider,
  Screen,
  SectionHeader,
  Text,
  TrendBadge,
} from '@/components';
import { convertMinorSafe, valuePosition } from '@/domain';
import { portfolioContext, useAppStore } from '@/store';
import { accountEmoji, assetClassEmoji } from '@/utils/emoji';
import { EditAccountForm } from '@/features/forms/EditAccountForm';

const KIND_LABEL: Record<string, string> = {
  bank: 'Banque',
  cash: 'Espèces',
  brokerage: 'Compte titres',
  crypto: 'Crypto',
  pension: 'Prévoyance',
  real_estate: 'Immobilier',
  other: 'Autre',
};

export function AccountDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const data = useAppStore((s) => s.data);
  const archiveAccount = useAppStore((s) => s.archiveAccount);

  const [editing, setEditing] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);

  const account = data.accounts.find((a) => a.id === id);
  const base = data.preferences.baseCurrency;
  const ctx = useMemo(() => portfolioContext(data), [data]);

  const positions = useMemo(
    () => data.positions.filter((p) => p.accountId === id && !p.isArchived).map((p) => ({ p, v: valuePosition(p, ctx) })),
    [data.positions, id, ctx],
  );

  const totalMinor = positions.reduce((s, { v }) => s + v.valueMinor, 0);

  if (!account) {
    return (
      <Screen bottomInset={20}>
        <BackHeader title="Compte" />
        <EmptyState title="Compte introuvable" actionLabel="Retour" onAction={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen bottomInset={20}>
      <BackHeader title={account.name} />

      <GlassCard strong radius="panel" padding="lg" glow="#FF8A1F" style={styles.block}>
        <View style={styles.head}>
          <Avatar emoji={accountEmoji(account.name, account.kind)} size={48} />
          <View style={{ flex: 1 }}>
            <Text variant="cardTitle">{account.name}</Text>
            <Text variant="meta" tone="muted">
              {[KIND_LABEL[account.kind], account.institution, account.currency].filter(Boolean).join(' · ')}
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 16 }}>
          <Text variant="micro" tone="muted">
            Valeur totale
          </Text>
          <AmountText minor={totalMinor} currency={base} variant="screenTitle" style={{ marginTop: 2 }} />
        </View>
      </GlassCard>

      <SectionHeader title="Contenu du compte" />
      <GlassCard style={styles.block} padding="sm">
        {positions.length === 0 ? (
          <Text variant="meta" tone="muted" style={{ padding: 8 }}>
            Aucune position dans ce compte.
          </Text>
        ) : (
          positions.map(({ p, v }, i) => {
            const asset = data.assets.find((a) => a.id === p.assetId);
            const raw = p.manualValueMinor != null ? p.manualValueMinor : v.valueMinor;
            const rawCur = p.manualValueMinor != null ? p.manualValueCurrency ?? base : base;
            const converted = convertMinorSafe(raw, rawCur, base, data.fxRates, base);
            return (
              <View key={p.id}>
                {i > 0 && <RowDivider />}
                <ListRow
                  title={asset?.name ?? 'Position'}
                  subtitle={asset?.symbol ?? undefined}
                  leading={<Avatar emoji={assetClassEmoji(asset?.assetClass ?? 'other')} colorIndex={i} size={38} />}
                  showChevron
                  onPress={() => router.push(`/position/${p.id}`)}
                  right={
                    <View style={{ alignItems: 'flex-end' }}>
                      <AmountText minor={converted.minor} currency={base} variant="cardTitle" />
                      {v.gainRatio != null ? <TrendBadge ratio={v.gainRatio} size="sm" /> : null}
                    </View>
                  }
                />
              </View>
            );
          })
        )}
      </GlassCard>

      <View style={{ gap: 10 }}>
        <Button label="✏️ Modifier le compte" onPress={() => setEditing(true)} />
        <Button label="Archiver le compte" variant="secondary" onPress={() => setConfirmArchive(true)} />
      </View>

      <EditAccountForm visible={editing} account={account} onClose={() => setEditing(false)} />
      <ConfirmSheet
        visible={confirmArchive}
        title="Archiver le compte"
        message="Le compte sera masqué du patrimoine. Ses positions restent enregistrées."
        confirmLabel="Archiver"
        onConfirm={() => {
          archiveAccount(account.id);
          router.back();
        }}
        onClose={() => setConfirmArchive(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { marginBottom: 16 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
