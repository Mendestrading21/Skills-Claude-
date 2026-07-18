import { buildDemoData } from '../demo';
import { createEmptyState } from '../emptyState';
import { exportJson, exportTransactionsCsv, importJson, MAX_IMPORT_BYTES } from '../exchange';

describe('exchange import/export', () => {
  test('rejects invalid JSON', () => {
    const r = importJson('{ not json');
    expect(r.ok).toBe(false);
  });

  test('rejects oversized payload', () => {
    const big = 'x'.repeat(MAX_IMPORT_BYTES + 1);
    const r = importJson(big);
    expect(r.ok).toBe(false);
  });

  test('rejects structurally wrong data', () => {
    const r = importJson(JSON.stringify({ schemaVersion: 1, accounts: 'not-an-array' }));
    // migrate coerces non-arrays back to defaults, so this actually validates;
    // ensure a truly invalid inner shape fails instead:
    const bad = importJson(
      JSON.stringify({
        schemaVersion: 1,
        preferences: { baseCurrency: 'CHF' },
        accounts: [{ id: 1 }], // id must be string, kind missing
      }),
    );
    expect(bad.ok).toBe(false);
    expect(r.ok).toBe(true); // coerced, valid
  });

  test('round-trips a full export', () => {
    const data = buildDemoData();
    const json = exportJson(data);
    const r = importJson(json);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.accounts.length).toBe(data.accounts.length);
      expect(r.data.positions.length).toBe(data.positions.length);
    }
  });

  test('empty state round-trips', () => {
    const r = importJson(exportJson(createEmptyState()));
    expect(r.ok).toBe(true);
  });

  test('CSV export has a header and one row per transaction', () => {
    const data = buildDemoData();
    const csv = exportTransactionsCsv(data);
    const lines = csv.split('\n');
    expect(lines[0]).toContain('date');
    expect(lines.length).toBe(data.transactions.length + 1);
  });
});
