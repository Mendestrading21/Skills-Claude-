import type { CurrencyCode, RecurringEntry } from '@/types';
import { formatMinor, formatPercent } from './money';

export type InsightTone = 'positive' | 'warning' | 'tip' | 'info';

export type Insight = {
  id: string;
  tone: InsightTone;
  emoji: string;
  title: string;
  body: string;
};

export type FinancialHealth = {
  savingsRate: number | null; // net / income
  fixedCostRatio: number | null; // fixed costs / income
  emergencyMonths: number | null; // liquidity / avg monthly expense
  monthlyNetMinor: number;
  fixedCostsMinor: number;
};

/** Normalise a recurring entry to a monthly amount (minor units). */
export function monthlyAmountMinor(entry: RecurringEntry): number {
  switch (entry.frequency) {
    case 'weekly':
      return Math.round(entry.amountMinor * 4.333);
    case 'monthly':
      return entry.amountMinor;
    case 'quarterly':
      return Math.round(entry.amountMinor / 3);
    case 'yearly':
      return Math.round(entry.amountMinor / 12);
    default:
      return entry.amountMinor;
  }
}

/** Sum of active recurring expenses, normalised to a monthly figure. */
export function monthlyFixedCosts(recurring: RecurringEntry[]): number {
  return recurring
    .filter((r) => r.isActive && r.type === 'expense')
    .reduce((s, r) => s + monthlyAmountMinor(r), 0);
}

export function computeHealth(input: {
  incomeMinor: number;
  expenseMinor: number;
  netMinor: number;
  fixedCostsMinor: number;
  liquidityMinor: number;
}): FinancialHealth {
  const savingsRate = input.incomeMinor > 0 ? input.netMinor / input.incomeMinor : null;
  const fixedCostRatio = input.incomeMinor > 0 ? input.fixedCostsMinor / input.incomeMinor : null;
  const emergencyMonths = input.expenseMinor > 0 ? input.liquidityMinor / input.expenseMinor : null;
  return {
    savingsRate,
    fixedCostRatio,
    emergencyMonths,
    monthlyNetMinor: input.netMinor,
    fixedCostsMinor: input.fixedCostsMinor,
  };
}

export type CategorySpend = { id: string; name: string; spentMinor: number };

export type InsightInput = {
  currency: CurrencyCode;
  incomeMinor: number;
  expenseMinor: number;
  netMinor: number;
  fixedCostsMinor: number;
  liquidityMinor: number;
  /** This month, sorted desc by spend. */
  topCategories: CategorySpend[];
  /** categoryId -> spent last month. */
  prevByCategory: Map<string, number>;
  /** Categories currently over budget. */
  overBudget: { name: string; overMinor: number }[];
  /** Discretionary categories (restaurants, loisirs…) spend this month. */
  discretionaryMinor: number;
  discretionaryLabel: string;
  /** Net-worth objective, if any. */
  goal: { targetMinor: number; currentMinor: number } | null;
};

const TONE_ORDER: Record<InsightTone, number> = { warning: 0, tip: 1, positive: 2, info: 3 };

/** Build a ranked list of practical, non-gamified financial insights. */
export function buildInsights(input: InsightInput): Insight[] {
  const c = input.currency;
  const out: Insight[] = [];
  const money = (m: number) => formatMinor(m, c);
  const health = computeHealth(input);

  // Savings rate
  if (health.savingsRate == null) {
    out.push(tip('income', '💡', 'Ajoutez vos revenus', 'Renseignez votre salaire pour mesurer votre taux d’épargne.'));
  } else if (health.savingsRate < 0) {
    out.push(
      warn('deficit', '⚠️', 'Mois déficitaire', `Vos dépenses dépassent vos revenus de ${money(-health.monthlyNetMinor)}. Regardons où réduire.`),
    );
  } else if (health.savingsRate < 0.1) {
    out.push(
      tip('save-low', '🎯', 'Épargne à renforcer', `Vous épargnez ${formatPercent(health.savingsRate, 0, false)} ce mois. Un bon repère est 20 %.`),
    );
  } else if (health.savingsRate >= 0.2) {
    out.push(
      good('save-good', '🌟', 'Excellent taux d’épargne', `Vous mettez ${formatPercent(health.savingsRate, 0, false)} de côté ce mois. Continuez ainsi !`),
    );
  } else {
    out.push(
      good('save-ok', '👍', 'Bonne épargne', `Vous épargnez ${formatPercent(health.savingsRate, 0, false)} ce mois. Objectif suivant : 20 %.`),
    );
  }

  // Over budget
  for (const o of input.overBudget.slice(0, 2)) {
    out.push(warn(`over-${o.name}`, '📊', `Budget ${o.name} dépassé`, `Vous avez dépassé de ${money(o.overMinor)} ce mois.`));
  }

  // Category growth vs last month
  const grown = input.topCategories
    .map((cat) => {
      const prev = input.prevByCategory.get(cat.id) ?? 0;
      const delta = prev > 0 ? (cat.spentMinor - prev) / prev : cat.spentMinor > 0 ? 1 : 0;
      return { cat, prev, delta };
    })
    .filter((x) => x.prev > 0 && x.delta >= 0.25 && x.cat.spentMinor - x.prev >= 3000)
    .sort((a, b) => b.delta - a.delta)[0];
  if (grown) {
    out.push(
      tip('growth', '📈', `${grown.cat.name} en hausse`, `Vos dépenses en ${grown.cat.name} ont augmenté de ${formatPercent(grown.delta, 0, false)} vs le mois dernier.`),
    );
  }

  // Discretionary savings potential
  if (input.discretionaryMinor >= 5000) {
    const potential = Math.round(input.discretionaryMinor * 0.2);
    out.push(
      tip('discretionary', '✂️', 'Potentiel d’économie', `En réduisant ${input.discretionaryLabel} de 20 %, vous épargneriez ~${money(potential)} par mois.`),
    );
  }

  // Fixed cost ratio
  if (health.fixedCostRatio != null) {
    if (health.fixedCostRatio > 0.6) {
      out.push(
        warn('fixed-high', '🏠', 'Charges fixes élevées', `Vos charges fixes représentent ${formatPercent(health.fixedCostRatio, 0, false)} de vos revenus.`),
      );
    } else {
      out.push(
        good('fixed-ok', '✅', 'Charges fixes maîtrisées', `Vos charges fixes pèsent ${formatPercent(health.fixedCostRatio, 0, false)} de vos revenus.`),
      );
    }
  }

  // Emergency fund
  if (health.emergencyMonths != null) {
    if (health.emergencyMonths < 3) {
      out.push(
        tip('emergency', '🛟', 'Réserve de sécurité', `Vous avez ${health.emergencyMonths.toFixed(1)} mois de dépenses en liquidités. Visez 3 à 6 mois.`),
      );
    } else {
      out.push(
        good('emergency-ok', '🛡️', 'Réserve confortable', `Vous couvrez ${health.emergencyMonths.toFixed(1)} mois de dépenses avec vos liquidités.`),
      );
    }
  }

  // Goal projection
  if (input.goal && input.goal.targetMinor > input.goal.currentMinor && health.monthlyNetMinor > 0) {
    const remaining = input.goal.targetMinor - input.goal.currentMinor;
    const months = Math.ceil(remaining / health.monthlyNetMinor);
    out.push(
      info('projection', '🧭', 'Projection', `À votre rythme d’épargne actuel, vous atteindriez votre objectif de patrimoine dans ~${months} mois.`),
    );
  }

  return out.sort((a, b) => TONE_ORDER[a.tone] - TONE_ORDER[b.tone]).slice(0, 6);
}

function warn(id: string, emoji: string, title: string, body: string): Insight {
  return { id, tone: 'warning', emoji, title, body };
}
function tip(id: string, emoji: string, title: string, body: string): Insight {
  return { id, tone: 'tip', emoji, title, body };
}
function good(id: string, emoji: string, title: string, body: string): Insight {
  return { id, tone: 'positive', emoji, title, body };
}
function info(id: string, emoji: string, title: string, body: string): Insight {
  return { id, tone: 'info', emoji, title, body };
}
