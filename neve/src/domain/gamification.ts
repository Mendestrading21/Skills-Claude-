import type { SavingsGoal, ValuationSnapshot } from '@/types';
import { monthKey } from '@/utils/date';

/** One level per 25'000 in base currency. */
export const LEVEL_STEP_MINOR = 2_500_000;

const LEVEL_TITLES = [
  'Débutant',
  'Épargnant',
  'Bâtisseur',
  'Investisseur',
  'Stratège',
  'Capitaine',
  'Expert',
  'Virtuose',
  'Maître',
  'Légende',
];

export type SaverLevel = {
  level: number;
  title: string;
  currentMinor: number;
  prevThresholdMinor: number;
  nextThresholdMinor: number;
  ratioToNext: number;
};

export function computeLevel(netWorthMinor: number): SaverLevel {
  const nw = Math.max(0, netWorthMinor);
  const level = Math.floor(nw / LEVEL_STEP_MINOR) + 1;
  const prev = (level - 1) * LEVEL_STEP_MINOR;
  const next = level * LEVEL_STEP_MINOR;
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
  return {
    level,
    title,
    currentMinor: nw,
    prevThresholdMinor: prev,
    nextThresholdMinor: next,
    ratioToNext: next === prev ? 0 : (nw - prev) / (next - prev),
  };
}

/** Consecutive most-recent months where net worth rose vs the prior month. */
export function savingsStreak(snapshots: ValuationSnapshot[]): number {
  if (snapshots.length < 2) return 0;
  // Keep the last snapshot of each month, ordered ascending.
  const byMonth = new Map<string, ValuationSnapshot>();
  for (const s of [...snapshots].sort((a, b) => a.capturedAt.localeCompare(b.capturedAt))) {
    byMonth.set(monthKey(s.capturedAt), s);
  }
  const series = Array.from(byMonth.values());
  let streak = 0;
  for (let i = series.length - 1; i > 0; i--) {
    if (series[i].netWorthMinor > series[i - 1].netWorthMinor) streak++;
    else break;
  }
  return streak;
}

export type Badge = {
  id: string;
  emoji: string;
  label: string;
  hint: string;
  unlocked: boolean;
};

export type BadgeInput = {
  netWorthMinor: number;
  streak: number;
  goals: SavingsGoal[];
  budgetsCount: number;
  budgetsOverCount: number;
  currenciesCount: number;
  hasPension: boolean;
  monthsTracked: number;
};

export function computeBadges(input: BadgeInput): Badge[] {
  const anyGoalReached = input.goals.some((g) => g.targetMinor > 0 && g.currentMinor >= g.targetMinor);
  return [
    badge('start', '🌱', 'Premiers pas', 'Enregistrer un patrimoine positif', input.netWorthMinor > 0),
    badge('k10', '💵', 'Cap des 10k', 'Atteindre 10 000', input.netWorthMinor >= 1_000_000),
    badge('k50', '💰', 'Cap des 50k', 'Atteindre 50 000', input.netWorthMinor >= 5_000_000),
    badge('k100', '🏆', 'Cap des 100k', 'Atteindre 100 000', input.netWorthMinor >= 10_000_000),
    badge('k250', '💎', 'Cap des 250k', 'Atteindre 250 000', input.netWorthMinor >= 25_000_000),
    badge('streak3', '🔥', 'En série', '3 mois de hausse d’affilée', input.streak >= 3),
    badge('goal', '🎯', 'Objectif atteint', 'Compléter un objectif d’épargne', anyGoalReached),
    badge('pension', '🛡️', 'Prévoyant', 'Suivre un compte de prévoyance', input.hasPension),
    badge('budget', '📊', 'Budget maîtrisé', 'Aucun budget dépassé ce mois', input.budgetsCount > 0 && input.budgetsOverCount === 0),
    badge('fx', '🌍', 'Multi-devises', 'Suivre au moins 2 devises', input.currenciesCount >= 2),
    badge('assiduous', '📅', 'Assidu', '6 mois de suivi', input.monthsTracked >= 6),
  ];
}

function badge(id: string, emoji: string, label: string, hint: string, unlocked: boolean): Badge {
  return { id, emoji, label, hint, unlocked };
}

export type Challenge = {
  targetMinor: number;
  progressMinor: number;
  ratio: number;
  done: boolean;
};

/** Monthly savings challenge: put aside ~10% of income (fallback 500). */
export function monthlyChallenge(incomeMinor: number, netMinor: number): Challenge {
  const targetMinor = incomeMinor > 0 ? Math.round(incomeMinor * 0.1) : 50_000;
  const progressMinor = Math.max(0, netMinor);
  const ratio = targetMinor === 0 ? 0 : progressMinor / targetMinor;
  return { targetMinor, progressMinor, ratio, done: progressMinor >= targetMinor };
}

export type GoalsSummary = { savedMinor: number; targetMinor: number; ratio: number; completed: number };

export function goalsSummary(goals: SavingsGoal[]): GoalsSummary {
  const savedMinor = goals.reduce((s, g) => s + g.currentMinor, 0);
  const targetMinor = goals.reduce((s, g) => s + g.targetMinor, 0);
  const completed = goals.filter((g) => g.targetMinor > 0 && g.currentMinor >= g.targetMinor).length;
  return { savedMinor, targetMinor, ratio: targetMinor === 0 ? 0 : savedMinor / targetMinor, completed };
}
