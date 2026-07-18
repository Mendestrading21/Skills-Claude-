import { SCHEMA_VERSION } from '@/config/app';
import { migrate } from '../migrations';

describe('migrations', () => {
  test('null / non-object input yields null', () => {
    expect(migrate(null)).toBeNull();
    expect(migrate(42)).toBeNull();
    expect(migrate('x')).toBeNull();
  });

  test('fills missing collections defensively', () => {
    const result = migrate({ schemaVersion: 1, preferences: { baseCurrency: 'EUR' } });
    expect(result).not.toBeNull();
    expect(result!.accounts).toEqual([]);
    expect(result!.fxRates.length).toBeGreaterThan(0); // from empty-state defaults
    expect(result!.preferences.baseCurrency).toBe('EUR');
    expect(result!.schemaVersion).toBe(SCHEMA_VERSION);
  });

  test('coerces non-array collections to defaults', () => {
    const result = migrate({ schemaVersion: 1, accounts: 'oops', transactions: null });
    expect(Array.isArray(result!.accounts)).toBe(true);
    expect(Array.isArray(result!.transactions)).toBe(true);
  });

  test('is idempotent', () => {
    const once = migrate({ schemaVersion: 1, accounts: [] });
    const twice = migrate(once);
    expect(twice).toEqual(once);
  });
});
