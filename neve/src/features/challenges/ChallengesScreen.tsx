import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
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
import { formatMinor, formatPercent } from '@/domain/money';
import { selectGamification, useAppStore } from '@/store';
import { useTheme } from '@/theme';
import type { SavingsGoal } from '@/types';
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

export function ChallengesScreen() {
  const theme = useTheme();
  const data = useAppStore((s) => s.data);
  const base = data.preferences.baseCurrency;
  const game = useMemo(() => selectGamification(data), [data]);

  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const unlocked = game.badges.filter((b) => b.unlocked).length;

  return (
    <Screen bottomInset={24}>
      <BackHeader title="Défis & épargne" />

      {/* Level */}
      <AnimatedEntrance>
        <GlassCard strong radius="panel" padding="lg" glow="#FF8A1F" style={styles.block}>
          <View style={styles.levelHead}>
            <View>
              <Text variant="micro" tone="muted">
                🎮 NIVEAU {game.level.level}
              </Text>
              <Text variant="screenTitle" style={{ marginTop: 2 }}>
                {game.level.title}
              </Text>
            </View>
            <View style={[styles.levelBadge, { borderColor: theme.colors.accent }]}>
              <Text variant="cardValue" tone="accent" tabular>
                {game.level.level}
              </Text>
            </View>
          </View>
          <View style={{ marginTop: 14 }}>
            <ProgressBar ratio={game.level.ratioToNext} height={12} />
          </View>
          <Text variant="meta" tone="secondary" style={{ marginTop: 8 }}>
            {formatMinor(game.level.currentMinor, base, { compact: true })} — prochain niveau à{' '}
            {formatMinor(game.level.nextThresholdMinor, base, { compact: true })}
          </Text>
        </GlassCard>
      </AnimatedEntrance>

      {/* Streak + monthly challenge */}
      <AnimatedEntrance delay={80}>
        <View style={styles.grid}>
          <GlassCard padding="md" style={styles.gridCard}>
            <Text variant="micro" tone="muted">
              🔥 SÉRIE
            </Text>
            <Text variant="display" style={{ fontSize: 34, marginTop: 4 }}>
              {game.streak}
            </Text>
            <Text variant="meta" tone="secondary">
              {game.streak > 1 ? 'mois de hausse' : 'mois de hausse'}
            </Text>
          </GlassCard>
          <GlassCard padding="md" style={styles.gridCard} glow={game.challenge.done ? '#31D17C' : undefined}>
            <Text variant="micro" tone="muted">
              🏁 DÉFI DU MOIS
            </Text>
            <Text variant="cardValue" tone={game.challenge.done ? 'positive' : 'default'} tabular style={{ marginTop: 4 }}>
              {formatPercent(Math.min(1, game.challenge.ratio), 0)}
            </Text>
            <View style={{ marginTop: 8 }}>
              <ProgressBar
                ratio={game.challenge.ratio}
                color={game.challenge.done ? theme.colors.positive : theme.colors.accent}
              />
            </View>
            <Text variant="micro" tone="muted" style={{ marginTop: 6 }}>
              Objectif : mettre de côté {formatMinor(game.challenge.targetMinor, base, { compact: true })}
            </Text>
          </GlassCard>
        </View>
      </AnimatedEntrance>

      {/* Savings goals */}
      <SectionHeader title="🐷 Objectifs d’épargne" actionLabel="Ajouter" onAction={() => setAddOpen(true)} />
      {data.goals.length === 0 ? (
        <GlassCard padding="lg" style={styles.block}>
          <Text variant="cardTitle" center>
            Créez votre premier objectif
          </Text>
          <Text variant="meta" tone="secondary" center style={{ marginTop: 6 }}>
            Un voyage, un fonds d’urgence… mettez de l’argent de côté et suivez votre progression.
          </Text>
          <View style={{ marginTop: 16 }}>
            <Button label="Nouvel objectif d’épargne" onPress={() => setAddOpen(true)} />
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
                    <View style={styles.goalTop}>
                      <Text variant="body" weight="medium" numberOfLines={1} style={{ flexShrink: 1 }}>
                        {g.name}
                      </Text>
                      <Text variant="meta" tone={done ? 'positive' : 'secondary'} tabular>
                        {formatPercent(ratio, 0)}
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

      {/* Badges */}
      <SectionHeader title={`🏅 Badges · ${unlocked}/${game.badges.length}`} />
      <GlassCard style={styles.block}>
        <View style={styles.badges}>
          {game.badges.map((b) => (
            <View
              key={b.id}
              style={[
                styles.badge,
                {
                  backgroundColor: b.unlocked ? theme.colors.surfaceStrong : theme.colors.surface,
                  borderColor: b.unlocked ? theme.colors.accent : theme.colors.border,
                  opacity: b.unlocked ? 1 : 0.5,
                },
              ]}
            >
              <Text style={{ fontSize: 26 }}>{b.unlocked ? b.emoji : '🔒'}</Text>
              <Text variant="micro" weight="semibold" center numberOfLines={2} style={{ marginTop: 4 }}>
                {b.label}
              </Text>
            </View>
          ))}
        </View>
      </GlassCard>

      {contributeGoal ? (
        <ContributeSheet
          visible={!!contributeGoal}
          goal={data.goals.find((g) => g.id === contributeGoal.id) ?? contributeGoal}
          onClose={() => setContributeGoal(null)}
        />
      ) : null}
      <SavingsGoalForm visible={addOpen} onClose={() => setAddOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { marginBottom: 16 },
  levelHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  levelBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  gridCard: { flex: 1 },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  goalTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  badge: {
    width: '30%',
    minWidth: 90,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
