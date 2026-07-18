import { DISCLAIMERS } from '@/config/app';
import { formatMinor, formatPercent } from '@/domain/money';
import type { AllocationSlice, BudgetProgress } from '@/domain';
import type { CurrencyCode } from '@/types';

/** Snapshot of computed figures the local assistant reasons over. */
export type AssistantContext = {
  baseCurrency: CurrencyCode;
  netWorthMinor: number;
  assetsMinor: number;
  liabilitiesMinor: number;
  liquidityMinor: number;
  monthlyNetMinor: number;
  monthlyIncomeMinor: number;
  monthlyExpenseMinor: number;
  allocation: AllocationSlice[];
  budgets: BudgetProgress[];
  portfolioGainRatio: number | null;
};

export type AssistantReply = {
  text: string;
  source: 'local';
};

export type SuggestedQuestion = { id: string; label: string };

export const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  { id: 'networth', label: 'Quel est mon patrimoine net ?' },
  { id: 'allocation', label: 'Comment est répartie mon allocation ?' },
  { id: 'month', label: 'Résume mon mois' },
  { id: 'concentration', label: 'Y a-t-il une concentration ?' },
  { id: 'budget', label: 'Ai-je dépassé un budget ?' },
];

const fmt = (minor: number, c: CurrencyCode) => formatMinor(minor, c);

/**
 * Deterministic, rule-based assistant. It only summarises local figures and
 * never gives guaranteed advice or executes anything.
 */
export function answerLocally(question: string, ctx: AssistantContext): AssistantReply {
  const q = question.toLowerCase();
  const c = ctx.baseCurrency;

  if (match(q, ['patrimoine', 'net worth', 'fortune', 'vaut'])) {
    return reply(
      `Votre patrimoine net est de ${fmt(ctx.netWorthMinor, c)} : ` +
        `${fmt(ctx.assetsMinor, c)} d’actifs moins ${fmt(ctx.liabilitiesMinor, c)} de passifs. ` +
        `Vos liquidités disponibles s’élèvent à ${fmt(ctx.liquidityMinor, c)}.`,
    );
  }

  if (match(q, ['alloc', 'répart', 'classe'])) {
    if (ctx.allocation.length === 0) return reply('Aucune allocation à afficher pour l’instant.');
    const top = ctx.allocation
      .slice(0, 4)
      .map((s) => `${s.label} ${formatPercent(s.ratio, 0)}`)
      .join(', ');
    return reply(`Votre allocation actuelle : ${top}.`);
  }

  if (match(q, ['mois', 'résum', 'resume', 'cash'])) {
    const trend = ctx.monthlyNetMinor >= 0 ? 'positif' : 'négatif';
    return reply(
      `Ce mois-ci : ${fmt(ctx.monthlyIncomeMinor, c)} de revenus, ` +
        `${fmt(ctx.monthlyExpenseMinor, c)} de dépenses, soit un cash-flow ${trend} de ` +
        `${fmt(ctx.monthlyNetMinor, c)}.`,
    );
  }

  if (match(q, ['concentr', 'risque', 'diversif'])) {
    const top = ctx.allocation[0];
    if (!top) return reply('Pas assez de données pour évaluer une concentration.');
    if (top.ratio >= 0.4) {
      return reply(
        `À vérifier : ${top.label} représente ${formatPercent(top.ratio, 0)} de votre portefeuille. ` +
          `C’est une part importante. Souhaitez-vous mieux répartir ?`,
      );
    }
    return reply(
      `Votre plus grande position est ${top.label} à ${formatPercent(top.ratio, 0)}. ` +
        `Aucune concentration extrême ne ressort.`,
    );
  }

  if (match(q, ['budget', 'dépass', 'depass'])) {
    const over = ctx.budgets.filter((b) => b.isOver);
    if (over.length === 0) return reply('Aucun budget dépassé ce mois-ci. Continuez comme ça.');
    const list = over.map((b) => `${b.categoryName} (${fmt(b.spentMinor, b.currency)})`).join(', ');
    return reply(`Budgets dépassés : ${list}.`);
  }

  if (match(q, ['performance', 'gain', 'perte', 'rendement'])) {
    if (ctx.portfolioGainRatio == null) return reply('Pas de coût de revient renseigné pour calculer la performance.');
    return reply(`La performance latente de votre portefeuille est de ${formatPercent(ctx.portfolioGainRatio)}.`);
  }

  return reply(
    `Je peux résumer votre patrimoine, votre allocation, votre mois ou vos budgets à partir de vos données locales. ` +
      `Essayez par exemple « Résume mon mois ». ${DISCLAIMERS.assistant}`,
  );
}

function reply(text: string): AssistantReply {
  return { text, source: 'local' };
}

function match(q: string, keywords: string[]): boolean {
  return keywords.some((k) => q.includes(k));
}
