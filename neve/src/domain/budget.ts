import type { Budget, Category, CurrencyCode, FxRate, Transaction } from '@/types';
import { expenseByCategory } from './cashflow';

export type BudgetProgress = {
  budgetId: string;
  categoryId: string;
  categoryName: string;
  colorIndex: number;
  limitMinor: number;
  spentMinor: number;
  remainingMinor: number;
  ratio: number;
  isOver: boolean;
  currency: CurrencyCode;
};

/** Progress for each budget in a month, using base-currency expense totals. */
export function budgetProgress(
  budgets: Budget[],
  transactions: Transaction[],
  categories: Category[],
  monthKey: string,
  base: CurrencyCode,
  fxRates: FxRate[],
): BudgetProgress[] {
  const spentByCat = expenseByCategory(transactions, monthKey, base, fxRates);

  return budgets
    .filter((b) => b.month === monthKey)
    .map((b) => {
      const cat = categories.find((c) => c.id === b.categoryId);
      const spentMinor = spentByCat.get(b.categoryId) ?? 0;
      const ratio = b.limitMinor === 0 ? 0 : spentMinor / b.limitMinor;
      return {
        budgetId: b.id,
        categoryId: b.categoryId,
        categoryName: cat?.name ?? 'Non catégorisé',
        colorIndex: cat?.colorIndex ?? 0,
        limitMinor: b.limitMinor,
        spentMinor,
        remainingMinor: b.limitMinor - spentMinor,
        ratio,
        isOver: spentMinor > b.limitMinor,
        currency: b.currency,
      };
    })
    .sort((a, b) => b.ratio - a.ratio);
}

export type BudgetTotals = {
  limitMinor: number;
  spentMinor: number;
  remainingMinor: number;
  ratio: number;
};

export function budgetTotals(progress: BudgetProgress[]): BudgetTotals {
  const limitMinor = progress.reduce((s, p) => s + p.limitMinor, 0);
  const spentMinor = progress.reduce((s, p) => s + p.spentMinor, 0);
  return {
    limitMinor,
    spentMinor,
    remainingMinor: limitMinor - spentMinor,
    ratio: limitMinor === 0 ? 0 : spentMinor / limitMinor,
  };
}
