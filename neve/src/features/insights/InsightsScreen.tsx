import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AmountText,
  AnimatedEntrance,
  Avatar,
  BackHeader,
  Button,
  GlassCard,
  ProgressBar,
  RowDivider,
  Screen,
  SectionHeader,
  Text,
} from '@/components';
import { monthlyAmountMinor } from '@/domain';
import { formatMinor, formatPercent } from '@/domain/money';
import type { Insight, InsightTone } from '@/domain';
import { selectInsights, useAppStore } from '@/store';
import { useTheme } from '@/theme';
import type { SavingsGoal } from '@/types';
import { categoryEmoji } from '@/utils/emoji';
import { ContributeSheet } from '@/features/forms/ContributeSheet';
import { SavingsGoalForm } from '@/features/forms/SavingsGoalForm';

function goalEmoji(name: string): string {
  if (/urgence|fonds|secours/i.test(name)) return '🛟';
  if (/voyage|vacance|trip/i.test(name)) return '✈️';
  if (/maison|appart|immo/i.test(name)) return '🏠';
  if (/voiture|auto/i.test(name)) return '🚗';
  if (/retraite|pension/i.test(name)) return '🏖️';
  return '🎯';
}

export function InsightsScreen() {
  const theme = useTheme();
  const data = useAppStore((s) => s.data);
  const base = data.preferences.baseCurrency;
  const analysis = useMemo(() => selectInsights(data), [data]);

  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);
  const [addGoalOpen, setAddGoalOpen] = useState(false);

  const totalExpense = analysis.topExpenses.reduce((s, c) => s + c.spentMinor, 0);
  const recurringIncome = data.recurring.filter((r) => r.isActive && r.type === 'income');
  const recurringExpense = data.recurring.filter((r) => r.isActive && r.type === 'expense');

  const toneColor = (tone: InsightTone): string =>
    tone === 'warning'
      ? theme.colors.negative
      : tone === 'positive'
        ? theme.colors.positive
        : tone === 'tip'
          ? theme.colors.accent
          : theme.colors.info;

  return (
    <Screen bottomInset={24}>
      <BackHeader title="Analyse" />

      {/* Health summary */}
      <AnimatedEntrance>
        <GlassCard strong radius="panel" padding="lg" glow="#31D17C" style={styles.block}>
          <Text variant="micro" tone="muted">
            📊 SANTÉ FINANCIÈRE · CE MOIS
          </Text>
          <View style={[styles.healthRow, { borderTopColor: theme.colors.border }]}>
            <Health
              label="Épargne"
              value={analysis.health.savingsRate == null ? '—' : formatPercent(analysis.health.savingsRate, 0, false)}
              tone={analysis.health.savingsRate != null && analysis.health.savingsRate >= 0.1 ? 'positive' : 'warning'}
            />
            <Health
              label="Charges fixes"
              value={analysis.health.fixedCostRatio == null ? '—' : formatPercent(analysis.health.fixedCostRatio, 0, false)}
              tone={analysis.health.fixedCostRatio != null && analysis.health.fixedCostRatio <= 0.6 ? 'positive' : 'warning'}
            />
            <Health
              label="Réserve"
              value={analysis.health.emergencyMonths == null ? '—' : `${analysis.health.emergencyMonths.toFixed(1)} mois`}
              tone={analysis.health.emergencyMonths != null && analysis.health.emergencyMonths >= 3 ? 'positive' : 'warning'}
            />
          </View>
        </GlassCard>
      </AnimatedEntrance>

      {/* Insights */}
      <SectionHeader title="💡 Conseils" />
      <AnimatedEntrance delay={60}>
        <View style={{ gap: 10, marginBottom: 16 }}>
          {analysis.insights.length === 0 ? (
            <GlassCard>
              <Text variant="meta" tone="secondary">
                Ajoutez vos revenus et dépenses pour recevoir des conseils personnalisés.
              </Text>
            </GlassCard>
          ) : (
            analysis.insights.map((ins: Insight) => (
              <GlassCard key={ins.id} padding="md">
                <View style={styles.insightRow}>
                  <View style={[styles.insightBar, { backgroundColor: toneColor(ins.tone) }]} />
                  <Text style={{ fontSize: 22 }}>{ins.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text variant="cardTitle">{ins.title}</Text>
                    <Text variant="meta" tone="secondary" style={{ marginTop: 2, lineHeight: 19 }}>
                      {ins.body}
                    </Text>
                  </View>
                </View>
              </GlassCard>
            ))
          )}
        </View>
      </AnimatedEntrance>

      {/* Where money goes */}
      {analysis.topExpenses.length > 0 && (
        <>
          <SectionHeader title="🧾 Où part mon argent" />
          <GlassCard style={styles.block}>
            {analysis.topExpenses.slice(0, 6).map((cat, i) => {
              const ratio = totalExpense === 0 ? 0 : cat.spentMinor / totalExpense;
              return (
                <View key={cat.id} style={{ marginBottom: i === Math.min(5, analysis.topExpenses.length - 1) ? 0 : 14 }}>
                  <View style={styles.spendRow}>
                    <View style={styles.spendLabel}>
                      <Avatar emoji={categoryEmoji(cat.name, 'expense')} colorIndex={i} size={32} />
                      <Text variant="body" weight="medium" numberOfLines={1} style={{ flexShrink: 1 }}>
                        {cat.name}
                      </Text>
                    </View>
                    <AmountText minor={cat.spentMinor} currency={base} variant="cardTitle" />
                  </View>
                  <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <ProgressBar ratio={ratio} colorIndex={i} />
                    </View>
                    <Text variant="micro" tone="muted" tabular>
                      {formatPercent(ratio, 0, false)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </GlassCard>
        </>
      )}

      {/* Recurring income & fixed bills */}
      {(recurringIncome.length > 0 || recurringExpense.length > 0) && (
        <>
          <SectionHeader title="🔁 Revenus & charges fixes" />
          <GlassCard style={styles.block} padding="sm">
            {[...recurringIncome, ...recurringExpense].map((r, i) => (
              <View key={r.id}>
                {i > 0 && <RowDivider />}
                <View style={styles.fixedRow}>
                  <Avatar
                    emoji={r.type === 'income' ? '💰' : categoryEmoji(r.label, 'expense')}
                    color={r.type === 'income' ? theme.colors.positive : theme.colors.accent}
                    size={36}
                  />
                  <View style={{ flex: 1 }}>
                    <Text variant="body" weight="medium" numberOfLines={1}>
                      {r.label}
                    </Text>
                    <Text variant="micro" tone="muted">
                      {r.type === 'income' ? 'Revenu' : 'Charge'} · {FREQ[r.frequency]}
                    </Text>
                  </View>
                  <AmountText
                    minor={r.type === 'income' ? monthlyAmountMinor(r) : -monthlyAmountMinor(r)}
                    currency={r.currency}
                    variant="cardTitle"
                    colorBySign
                  />
                </View>
              </View>
            ))}
            <RowDivider />
            <View style={styles.fixedTotal}>
              <Text variant="meta" tone="secondary">
                Charges fixes / mois
              </Text>
              <AmountText minor={-analysis.fixedCostsMinor} currency={base} variant="cardTitle" tone="negative" />
            </View>
          </GlassCard>
        </>
      )}

      {/* Savings goals */}
      <SectionHeader title="🐷 Objectifs d’épargne" actionLabel="Ajouter" onAction={() => setAddGoalOpen(true)} />
      {data.goals.length === 0 ? (
        <GlassCard padding="lg" style={styles.block}>
          <Text variant="meta" tone="secondary" center>
            Créez un objectif (voyage, fonds d’urgence…) et mettez de l’argent de côté.
          </Text>
          <View style={{ marginTop: 14 }}>
            <Button label="Nouvel objectif d’épargne" onPress={() => setAddGoalOpen(true)} />
          </View>
        </GlassCard>
      ) : (
        <GlassCard style={styles.block}>
          {data.goals.map((g, i) => {
            const ratio = g.targetMinor === 0 ? 0 : g.currentMinor / g.targetMinor;
            const done = ratio >= 1;
            return (
              <View key={g.id}>
                {i > 0 && <RowDivider />}
                <Pressable
                  onPress={() => setContributeGoal(g)}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.goalRow, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <Avatar emoji={done ? '✅' : goalEmoji(g.name)} colorIndex={i + 2} size={40} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.spendRow}>
                      <Text variant="body" weight="medium" numberOfLines={1} style={{ flexShrink: 1 }}>
                        {g.name}
                      </Text>
                      <Text variant="meta" tone={done ? 'positive' : 'secondary'} tabular>
                        {formatPercent(ratio, 0, false)}
                      </Text>
                    </View>
                    <View style={{ marginTop: 6 }}>
                      <ProgressBar ratio={ratio} colorIndex={i + 2} color={done ? theme.colors.positive : undefined} />
                    </View>
                    <Text variant="micro" tone="muted" style={{ marginTop: 4 }}>
                      {formatMinor(g.currentMinor, g.currency, { compact: true })} /{' '}
                      {formatMinor(g.targetMinor, g.currency, { compact: true })} · appuyez pour ajouter
                    </Text>
                  </View>
                </Pressable>
              </View>
            );
          })}
        </GlassCard>
      )}

      {contributeGoal ? (
        <ContributeSheet
          visible={!!contributeGoal}
          goal={data.goals.find((g) => g.id === contributeGoal.id) ?? contributeGoal}
          onClose={() => setContributeGoal(null)}
        />
      ) : null}
      <SavingsGoalForm visible={addGoalOpen} onClose={() => setAddGoalOpen(false)} />
    </Screen>
  );
}

const FREQ: Record<string, string> = {
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  yearly: 'Annuel',
};

function Health({ label, value, tone }: { label: string; value: string; tone: 'positive' | 'warning' }) {
  return (
    <View style={{ flex: 1 }}>
      <Text variant="micro" tone="muted">
        {label}
      </Text>
      <Text variant="cardValue" tone={tone === 'positive' ? 'positive' : 'warning'} tabular style={{ marginTop: 3, fontSize: 20 }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginBottom: 16 },
  healthRow: { flexDirection: 'row', gap: 12, marginTop: 14, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  insightBar: { width: 3, alignSelf: 'stretch', borderRadius: 3 },
  spendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  spendLabel: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  fixedRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  fixedTotal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
});
