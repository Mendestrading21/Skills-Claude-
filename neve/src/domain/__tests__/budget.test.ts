import type { Budget, Category, FxRate, Transaction } from '@/types';
import { budgetProgress, budgetTotals } from '../budget';

const fxRates: FxRate[] = [];
const categories: Category[] = [
  { id: 'food', name: 'Alimentation', colorIndex: 1, kind: 'expense' },
  { id: 'transport', name: 'Transport', colorIndex: 2, kind: 'expense' },
];
const budgets: Budget[] = [
  { id: 'b1', month: '2025-03', categoryId: 'food', limitMinor: 40000, currency: 'CHF' },
  { id: 'b2', month: '2025-03', categoryId: 'transport', limitMinor: 10000, currency: 'CHF' },
  { id: 'b3', month: '2025-02', categoryId: 'food', limitMinor: 99999, currency: 'CHF' }, // other month
];
const txs: Transaction[] = [
  { id: 't1', accountId: 'a', type: 'expense', amountMinor: 30000, currency: 'CHF', categoryId: 'food', occurredAt: '2025-03-05T00:00:00Z' },
  { id: 't2', accountId: 'a', type: 'expense', amountMinor: 15000, currency: 'CHF', categoryId: 'transport', occurredAt: '2025-03-06T00:00:00Z' },
];

describe('budget progress', () => {
  test('computes spent, remaining, ratio and over flag', () => {
    const progress = budgetProgress(budgets, txs, categories, '2025-03', 'CHF', fxRates);
    expect(progress.length).toBe(2);

    const transport = progress.find((p) => p.categoryId === 'transport')!;
    expect(transport.spentMinor).toBe(15000);
    expect(transport.remainingMinor).toBe(-5000);
    expect(transport.isOver).toBe(true);
    expect(transport.ratio).toBeCloseTo(1.5);

    const food = progress.find((p) => p.categoryId === 'food')!;
    expect(food.spentMinor).toBe(30000);
    expect(food.isOver).toBe(false);
  });

  test('sorted by ratio descending (most consumed first)', () => {
    const progress = budgetProgress(budgets, txs, categories, '2025-03', 'CHF', fxRates);
    expect(progress[0].categoryId).toBe('transport');
  });

  test('totals aggregate across budgets', () => {
    const progress = budgetProgress(budgets, txs, categories, '2025-03', 'CHF', fxRates);
    const totals = budgetTotals(progress);
    expect(totals.limitMinor).toBe(50000);
    expect(totals.spentMinor).toBe(45000);
    expect(totals.remainingMinor).toBe(5000);
    expect(totals.ratio).toBeCloseTo(0.9);
  });
});
