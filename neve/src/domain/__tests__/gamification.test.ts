import type { SavingsGoal, ValuationSnapshot } from '@/types';
import {
  computeBadges,
  computeLevel,
  goalsSummary,
  LEVEL_STEP_MINOR,
  monthlyChallenge,
  savingsStreak,
} from '../gamification';

function snap(month: string, netWorthMinor: number): ValuationSnapshot {
  return {
    id: month,
    capturedAt: `${month}-01T00:00:00.000Z`,
    baseCurrency: 'CHF',
    assetsMinor: netWorthMinor,
    liabilitiesMinor: 0,
    netWorthMinor,
    breakdown: {},
  };
}

describe('gamification', () => {
  test('level steps every 25k and reports progress', () => {
    const l0 = computeLevel(0);
    expect(l0.level).toBe(1);
    const l1 = computeLevel(LEVEL_STEP_MINOR); // exactly 25k -> level 2
    expect(l1.level).toBe(2);
    const half = computeLevel(LEVEL_STEP_MINOR + LEVEL_STEP_MINOR / 2);
    expect(half.level).toBe(2);
    expect(half.ratioToNext).toBeCloseTo(0.5);
    expect(computeLevel(-100).level).toBe(1);
  });

  test('savings streak counts trailing months of growth', () => {
    const rising = [snap('2025-01', 100), snap('2025-02', 120), snap('2025-03', 140)];
    expect(savingsStreak(rising)).toBe(2);
    const dip = [snap('2025-01', 100), snap('2025-02', 90), snap('2025-03', 140)];
    expect(savingsStreak(dip)).toBe(1);
    expect(savingsStreak([snap('2025-01', 100)])).toBe(0);
  });

  test('badges unlock on thresholds', () => {
    const goals: SavingsGoal[] = [{ id: 'g', name: 'x', targetMinor: 1000, currentMinor: 1000, currency: 'CHF' }];
    const badges = computeBadges({
      netWorthMinor: 12_000_000, // 120k
      streak: 4,
      goals,
      budgetsCount: 3,
      budgetsOverCount: 0,
      currenciesCount: 2,
      hasPension: true,
      monthsTracked: 8,
    });
    const by = (id: string) => badges.find((b) => b.id === id)?.unlocked;
    expect(by('start')).toBe(true);
    expect(by('k100')).toBe(true);
    expect(by('k250')).toBe(false);
    expect(by('streak3')).toBe(true);
    expect(by('goal')).toBe(true);
    expect(by('pension')).toBe(true);
    expect(by('budget')).toBe(true);
    expect(by('fx')).toBe(true);
    expect(by('assiduous')).toBe(true);
  });

  test('monthly challenge targets 10% of income with fallback', () => {
    const c = monthlyChallenge(500_000, 60_000); // income 5000 -> target 500
    expect(c.targetMinor).toBe(50_000);
    expect(c.done).toBe(true);
    const fallback = monthlyChallenge(0, 0);
    expect(fallback.targetMinor).toBe(50_000);
    expect(fallback.done).toBe(false);
  });

  test('goals summary aggregates and counts completed', () => {
    const goals: SavingsGoal[] = [
      { id: 'a', name: 'A', targetMinor: 1000, currentMinor: 1000, currency: 'CHF' },
      { id: 'b', name: 'B', targetMinor: 2000, currentMinor: 500, currency: 'CHF' },
    ];
    const s = goalsSummary(goals);
    expect(s.savedMinor).toBe(1500);
    expect(s.targetMinor).toBe(3000);
    expect(s.completed).toBe(1);
    expect(s.ratio).toBeCloseTo(0.5);
  });
});
