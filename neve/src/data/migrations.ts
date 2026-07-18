import { SCHEMA_VERSION } from '@/config/app';
import type { AppData } from '@/types';
import { createEmptyState } from './emptyState';

type Migration = (data: Record<string, unknown>) => Record<string, unknown>;

/**
 * Idempotent, ordered migrations keyed by the version they upgrade *to*.
 * Each migration receives the raw object and returns the next-version shape.
 */
const migrations: Record<number, Migration> = {
  // Example forward migration scaffold. When schema v2 lands, add:
  // 2: (data) => ({ ...data, newField: [] }),
};

/**
 * Bring any persisted blob up to the current schema version, filling missing
 * collections defensively. Never throws on partial data; returns a valid
 * AppData or null when the input is unusable.
 */
export function migrate(raw: unknown): AppData | null {
  if (!raw || typeof raw !== 'object') return null;
  let data = raw as Record<string, unknown>;

  let version = typeof data.schemaVersion === 'number' ? data.schemaVersion : 1;
  while (version < SCHEMA_VERSION) {
    const next = version + 1;
    const migration = migrations[next];
    if (!migration) break;
    data = migration(data);
    version = next;
  }

  const base = createEmptyState(
    (data.preferences as AppData['preferences'] | undefined)?.baseCurrency,
  );

  // Merge defensively so a truncated blob still yields a valid document.
  const merged: AppData = {
    ...base,
    ...(data as Partial<AppData>),
    schemaVersion: SCHEMA_VERSION,
    preferences: { ...base.preferences, ...(data.preferences as object) },
    accounts: asArray(data.accounts, base.accounts),
    assets: asArray(data.assets, base.assets),
    positions: asArray(data.positions, base.positions),
    liabilities: asArray(data.liabilities, base.liabilities),
    transactions: asArray(data.transactions, base.transactions),
    categories: asArray(data.categories, base.categories),
    budgets: asArray(data.budgets, base.budgets),
    recurring: asArray(data.recurring, base.recurring),
    goals: asArray(data.goals, base.goals),
    snapshots: asArray(data.snapshots, base.snapshots),
    quotes: asArray(data.quotes, base.quotes),
    fxRates: asArray(data.fxRates, base.fxRates),
  };
  return merged;
}

function asArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}
