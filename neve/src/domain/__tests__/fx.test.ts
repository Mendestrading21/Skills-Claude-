import type { FxRate } from '@/types';
import { convertMinor, convertMinorSafe, resolveRate } from '../fx';

const rates: FxRate[] = [
  { base: 'USD', quote: 'CHF', rateDecimal: '0.90', source: 'test', asOf: '2025-01-01' },
  { base: 'EUR', quote: 'CHF', rateDecimal: '0.96', source: 'test', asOf: '2025-01-01' },
];

describe('fx', () => {
  test('identity rate', () => {
    expect(resolveRate('CHF', 'CHF', rates)).toBe(1);
  });

  test('direct rate', () => {
    expect(resolveRate('USD', 'CHF', rates)).toBe(0.9);
  });

  test('inverse rate', () => {
    expect(resolveRate('CHF', 'USD', rates)).toBeCloseTo(1 / 0.9);
  });

  test('triangulation through pivot', () => {
    // USD -> EUR via CHF: 0.90 * (1/0.96)
    expect(resolveRate('USD', 'EUR', rates)).toBeCloseTo(0.9 / 0.96);
  });

  test('unknown currency returns null', () => {
    expect(resolveRate('JPY', 'CHF', rates)).toBeNull();
    expect(convertMinor(1000, 'JPY', 'CHF', rates)).toBeNull();
  });

  test('convertMinor rounds to integer minor', () => {
    expect(convertMinor(10000, 'USD', 'CHF', rates)).toBe(9000);
  });

  test('convertMinorSafe flags missing rate but keeps amount', () => {
    expect(convertMinorSafe(10000, 'USD', 'CHF', rates)).toEqual({ minor: 9000, converted: true });
    expect(convertMinorSafe(10000, 'JPY', 'CHF', rates)).toEqual({ minor: 10000, converted: false });
    expect(convertMinorSafe(10000, 'CHF', 'CHF', rates)).toEqual({ minor: 10000, converted: true });
  });
});
