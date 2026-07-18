import type { RecurringEntry } from '@/types';
import {
  buildInsights,
  computeHealth,
  monthlyAmountMinor,
  monthlyFixedCosts,
  type InsightInput,
} from '../insights';

function rec(partial: Partial<RecurringEntry> & Pick<RecurringEntry, 'type' | 'amountMinor' | 'frequency'>): RecurringEntry {
  return {
    id: Math.random().toString(),
    label: 'x',
    currency: 'CHF',
    nextDate: '2025-01-01',
    isActive: true,
    ...partial,
  };
}

const baseInput: InsightInput = {
  currency: 'CHF',
  incomeMinor: 700000, // 7000
  expenseMinor: 400000, // 4000
  netMinor: 300000, // 3000
  fixedCostsMinor: 300000, // 3000
  liquidityMinor: 2000000, // 20000 -> 5 months
  topCategories: [],
  prevByCategory: new Map(),
  overBudget: [],
  discretionaryMinor: 0,
  discretionaryLabel: 'vos dépenses variables',
  goal: null,
};

describe('insights — recurring normalisation', () => {
  test('monthlyAmountMinor by frequency', () => {
    expect(monthlyAmountMinor(rec({ type: 'expense', amountMinor: 12000, frequency: 'yearly' }))).toBe(1000);
    expect(monthlyAmountMinor(rec({ type: 'expense', amountMinor: 300, frequency: 'quarterly' }))).toBe(100);
    expect(monthlyAmountMinor(rec({ type: 'expense', amountMinor: 1000, frequency: 'monthly' }))).toBe(1000);
  });

  test('monthlyFixedCosts sums active expenses only', () => {
    const list = [
      rec({ type: 'expense', amountMinor: 195000, frequency: 'monthly' }),
      rec({ type: 'income', amountMinor: 720000, frequency: 'monthly' }),
      rec({ type: 'expense', amountMinor: 9999, frequency: 'monthly', isActive: false }),
    ];
    expect(monthlyFixedCosts(list)).toBe(195000);
  });
});

describe('insights — health', () => {
  test('computes rates and reserve', () => {
    const h = computeHealth(baseInput);
    expect(h.savingsRate).toBeCloseTo(300000 / 700000);
    expect(h.fixedCostRatio).toBeCloseTo(300000 / 700000);
    expect(h.emergencyMonths).toBeCloseTo(5);
  });

  test('null rates without income/expense', () => {
    const h = computeHealth({ incomeMinor: 0, expenseMinor: 0, netMinor: 0, fixedCostsMinor: 0, liquidityMinor: 0 });
    expect(h.savingsRate).toBeNull();
    expect(h.emergencyMonths).toBeNull();
  });
});

describe('insights — advice', () => {
  test('healthy month surfaces positive savings insight', () => {
    const ins = buildInsights(baseInput);
    expect(ins.some((i) => i.id.startsWith('save'))).toBe(true);
    expect(ins.length).toBeGreaterThan(0);
  });

  test('deficit month warns first', () => {
    const ins = buildInsights({ ...baseInput, netMinor: -50000, expenseMinor: 750000 });
    expect(ins[0].tone).toBe('warning');
    expect(ins.some((i) => i.id === 'deficit')).toBe(true);
  });

  test('over-budget produces a warning', () => {
    const ins = buildInsights({ ...baseInput, overBudget: [{ name: 'Restaurants', overMinor: 5000 }] });
    expect(ins.some((i) => i.id === 'over-Restaurants')).toBe(true);
  });

  test('discretionary spending suggests a saving', () => {
    const ins = buildInsights({ ...baseInput, discretionaryMinor: 40000, discretionaryLabel: 'restaurants' });
    const tip = ins.find((i) => i.id === 'discretionary');
    expect(tip).toBeTruthy();
    expect(tip!.body).toContain('épargneriez');
  });

  test('goal projection when saving positively', () => {
    const ins = buildInsights({ ...baseInput, goal: { targetMinor: 30000000, currentMinor: 22500000 } });
    expect(ins.some((i) => i.id === 'projection')).toBe(true);
  });

  test('warnings rank before tips and positives', () => {
    const ins = buildInsights({ ...baseInput, netMinor: -1000, overBudget: [{ name: 'Loisirs', overMinor: 2000 }] });
    const tones = ins.map((i) => i.tone);
    expect(tones.indexOf('warning')).toBeLessThanOrEqual(tones.lastIndexOf('warning'));
    expect(tones[0]).toBe('warning');
  });
});
