import { buildDemoData } from '@/data/demo';
import { createEmptyState } from '@/data/emptyState';
import {
  selectAllocation,
  selectBudgetProgress,
  selectCashFlow,
  selectNetWorth,
  selectSeries,
} from '../selectors';

describe('selectors — empty state', () => {
  const empty = createEmptyState();

  test('net worth is zero and safe', () => {
    const nw = selectNetWorth(empty);
    expect(nw.assetsMinor).toBe(0);
    expect(nw.liabilitiesMinor).toBe(0);
    expect(nw.netWorthMinor).toBe(0);
    expect(nw.breakdown).toEqual([]);
  });

  test('allocation, cash flow and budgets are empty without throwing', () => {
    expect(selectAllocation(empty)).toEqual([]);
    expect(selectCashFlow(empty).netMinor).toBe(0);
    expect(selectBudgetProgress(empty)).toEqual([]);
  });
});

describe('selectors — demo data', () => {
  const demo = buildDemoData();

  test('net worth is positive and internally consistent', () => {
    const nw = selectNetWorth(demo);
    expect(nw.netWorthMinor).toBeGreaterThan(0);
    expect(nw.netWorthMinor).toBe(nw.assetsMinor - nw.liabilitiesMinor);
  });

  test('history series ends at the current net worth', () => {
    const nw = selectNetWorth(demo);
    const series = selectSeries(demo, 'ALL');
    expect(series.length).toBeGreaterThan(1);
    expect(series[series.length - 1].y).toBe(nw.netWorthMinor);
  });

  test('allocation ratios sum to ~1', () => {
    const alloc = selectAllocation(demo);
    const total = alloc.reduce((s, a) => s + a.ratio, 0);
    expect(total).toBeCloseTo(1);
  });
});
