import { DEFAULT_BASE_CURRENCY, SCHEMA_VERSION } from '@/config/app';
import type { AppData, Category } from '@/types';

/** Default expense/income categories for a fresh, non-demo profile. */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-salary', name: 'Salaire', colorIndex: 5, kind: 'income' },
  { id: 'cat-housing', name: 'Logement', colorIndex: 0, kind: 'expense' },
  { id: 'cat-food', name: 'Alimentation', colorIndex: 1, kind: 'expense' },
  { id: 'cat-transport', name: 'Transport', colorIndex: 2, kind: 'expense' },
  { id: 'cat-leisure', name: 'Loisirs', colorIndex: 3, kind: 'expense' },
  { id: 'cat-other', name: 'Autres', colorIndex: 7, kind: 'expense' },
];

export function createEmptyState(baseCurrency = DEFAULT_BASE_CURRENCY): AppData {
  return {
    schemaVersion: SCHEMA_VERSION,
    preferences: {
      baseCurrency,
      locale: 'fr',
      demoMode: false,
      remoteAssistantEnabled: false,
      analyticsEnabled: false,
      reducedTransparency: false,
      appLockEnabled: false,
      onboarded: false,
    },
    accounts: [],
    assets: [],
    positions: [],
    liabilities: [],
    transactions: [],
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
    budgets: [],
    recurring: [],
    goals: [],
    snapshots: [],
    quotes: [],
    fxRates: [
      { base: 'USD', quote: 'CHF', rateDecimal: '0.89', source: 'Manuel', asOf: new Date().toISOString() },
      { base: 'EUR', quote: 'CHF', rateDecimal: '0.96', source: 'Manuel', asOf: new Date().toISOString() },
    ],
  };
}
