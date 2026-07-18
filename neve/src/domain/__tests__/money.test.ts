import {
  formatMinor,
  formatPercent,
  parseAmountToMinor,
  parseQuantity,
  relativeChange,
  toMinor,
  fromMinor,
} from '../money';

describe('money', () => {
  test('toMinor / fromMinor round-trip', () => {
    expect(toMinor(1234.56)).toBe(123456);
    expect(fromMinor(123456)).toBeCloseTo(1234.56);
    expect(toMinor(0.1 + 0.2)).toBe(30); // no float drift into minor
  });

  test('parseAmountToMinor handles separators and locales', () => {
    expect(parseAmountToMinor('1234.56')).toBe(123456);
    expect(parseAmountToMinor('1 234,56')).toBe(123456);
    expect(parseAmountToMinor("1'234.50")).toBe(123450);
    expect(parseAmountToMinor('')).toBeNull();
    expect(parseAmountToMinor('abc')).toBeNull();
    expect(parseAmountToMinor('-')).toBeNull();
  });

  test('parseQuantity accepts fractional crypto amounts', () => {
    expect(parseQuantity('0.2534')).toBeCloseTo(0.2534);
    expect(parseQuantity('bad')).toBeNull();
  });

  test('formatMinor groups thousands and appends currency', () => {
    expect(formatMinor(12731018, 'CHF')).toBe('127 310.18 CHF');
    expect(formatMinor(-500000, 'EUR')).toBe('-5 000.00 EUR');
    expect(formatMinor(320000, 'USD', { signed: true })).toBe('+3 200.00 USD');
    expect(formatMinor(123456, 'CHF', { showCurrency: false })).toBe('1 234.56');
  });

  test('formatMinor compact', () => {
    expect(formatMinor(3056077, 'CHF', { compact: true })).toBe('30.6k CHF');
    expect(formatMinor(150000000, 'CHF', { compact: true })).toBe('1.5M CHF');
  });

  test('formatPercent signs and guards', () => {
    expect(formatPercent(0.081)).toBe('+8.10 %');
    expect(formatPercent(-0.02)).toBe('-2.00 %');
    expect(formatPercent(NaN)).toBe('—');
  });

  test('relativeChange guards zero base', () => {
    expect(relativeChange(110, 100)).toBeCloseTo(0.1);
    expect(relativeChange(100, 0)).toBeNull();
  });
});
