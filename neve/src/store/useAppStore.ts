import { create } from 'zustand';

import { createEmptyState } from '@/data/emptyState';
import { buildDemoData } from '@/data/demo';
import { persistence } from '@/data/persistence';
import type {
  Account,
  AppData,
  Asset,
  Budget,
  Category,
  Liability,
  Position,
  RecurringEntry,
  SavingsGoal,
  Transaction,
  UserPreferences,
  ValuationSnapshot,
} from '@/types';
import { createId } from '@/utils/id';
import { currentMonthKey, nowIso } from '@/utils/date';
import { selectNetWorth } from './selectors';

type NewAccount = Omit<Account, 'id' | 'isArchived' | 'createdAt' | 'updatedAt'>;
type NewAsset = Omit<Asset, 'id'>;
type NewPosition = Omit<Position, 'id' | 'isArchived'>;
type NewLiability = Omit<Liability, 'id' | 'isArchived'>;
type NewTransaction = Omit<Transaction, 'id'>;
type NewGoal = Omit<SavingsGoal, 'id'>;
type NewRecurring = Omit<RecurringEntry, 'id'>;

export type AppState = {
  data: AppData;
  hydrated: boolean;

  init: () => Promise<void>;
  loadDemo: () => void;
  resetAll: () => Promise<void>;
  replaceAll: (data: AppData) => void;

  setPreferences: (patch: Partial<UserPreferences>) => void;
  completeOnboarding: (patch: Partial<UserPreferences>) => void;

  addAccount: (input: NewAccount) => Account;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  archiveAccount: (id: string) => void;

  addAsset: (input: NewAsset) => Asset;
  addPosition: (input: NewPosition) => Position;
  updatePosition: (id: string, patch: Partial<Position>) => void;
  archivePosition: (id: string) => void;
  removePosition: (id: string) => void;

  addLiability: (input: NewLiability) => Liability;
  updateLiability: (id: string, patch: Partial<Liability>) => void;
  archiveLiability: (id: string) => void;

  addTransaction: (input: NewTransaction) => Transaction;
  removeTransaction: (id: string) => void;

  addCategory: (name: string, kind: Category['kind'], colorIndex: number) => Category;
  upsertBudget: (categoryId: string, limitMinor: number, month?: string) => void;
  removeBudget: (id: string) => void;

  addRecurring: (input: NewRecurring) => RecurringEntry;
  toggleRecurring: (id: string) => void;

  addGoal: (input: NewGoal) => SavingsGoal;
  updateGoal: (id: string, patch: Partial<SavingsGoal>) => void;

  captureSnapshot: (snapshot: Omit<ValuationSnapshot, 'id'>) => void;
  upsertQuote: (assetId: string, priceMinor: number, currency: string, source?: string) => void;
  /** Record today's net worth as a history point (one per day, deduped). */
  recordSnapshot: () => void;
};

/** Persist current data without blocking the UI. */
function persist(data: AppData) {
  persistence.save(data).catch(() => {
    // Swallow persistence errors; the in-memory state remains authoritative.
  });
}

export const useAppStore = create<AppState>((set, get) => {
  /** Apply a pure transform to `data`, persist, and update state. */
  const mutate = (fn: (data: AppData) => AppData) => {
    const next = fn(get().data);
    persist(next);
    set({ data: next });
  };

  return {
    data: createEmptyState(),
    hydrated: false,

    async init() {
      const loaded = await persistence.load();
      set({ data: loaded ?? createEmptyState(), hydrated: true });
    },

    loadDemo() {
      const demo = buildDemoData();
      persist(demo);
      set({ data: demo });
    },

    async resetAll() {
      await persistence.clear();
      set({ data: createEmptyState() });
    },

    replaceAll(data) {
      persist(data);
      set({ data });
    },

    setPreferences(patch) {
      mutate((d) => ({ ...d, preferences: { ...d.preferences, ...patch } }));
    },

    completeOnboarding(patch) {
      mutate((d) => ({
        ...d,
        preferences: { ...d.preferences, ...patch, onboarded: true },
      }));
    },

    addAccount(input) {
      const account: Account = {
        ...input,
        id: createId('acc'),
        isArchived: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      mutate((d) => ({ ...d, accounts: [...d.accounts, account] }));
      return account;
    },

    updateAccount(id, patch) {
      mutate((d) => ({
        ...d,
        accounts: d.accounts.map((a) =>
          a.id === id ? { ...a, ...patch, updatedAt: nowIso() } : a,
        ),
      }));
    },

    archiveAccount(id) {
      mutate((d) => ({
        ...d,
        accounts: d.accounts.map((a) => (a.id === id ? { ...a, isArchived: true } : a)),
      }));
    },

    addAsset(input) {
      const asset: Asset = { ...input, id: createId('ast') };
      mutate((d) => ({ ...d, assets: [...d.assets, asset] }));
      return asset;
    },

    addPosition(input) {
      const position: Position = { ...input, id: createId('pos'), isArchived: false };
      mutate((d) => ({ ...d, positions: [...d.positions, position] }));
      return position;
    },

    updatePosition(id, patch) {
      mutate((d) => ({
        ...d,
        positions: d.positions.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }));
    },

    archivePosition(id) {
      mutate((d) => ({
        ...d,
        positions: d.positions.map((p) => (p.id === id ? { ...p, isArchived: true } : p)),
      }));
    },

    removePosition(id) {
      mutate((d) => ({ ...d, positions: d.positions.filter((p) => p.id !== id) }));
    },

    addLiability(input) {
      const liability: Liability = { ...input, id: createId('lia'), isArchived: false };
      mutate((d) => ({ ...d, liabilities: [...d.liabilities, liability] }));
      return liability;
    },

    updateLiability(id, patch) {
      mutate((d) => ({
        ...d,
        liabilities: d.liabilities.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      }));
    },

    archiveLiability(id) {
      mutate((d) => ({
        ...d,
        liabilities: d.liabilities.map((l) => (l.id === id ? { ...l, isArchived: true } : l)),
      }));
    },

    addTransaction(input) {
      const tx: Transaction = { ...input, id: createId('tx') };
      mutate((d) => ({ ...d, transactions: [...d.transactions, tx] }));
      return tx;
    },

    removeTransaction(id) {
      mutate((d) => ({ ...d, transactions: d.transactions.filter((t) => t.id !== id) }));
    },

    addCategory(name, kind, colorIndex) {
      const category: Category = { id: createId('cat'), name, kind, colorIndex };
      mutate((d) => ({ ...d, categories: [...d.categories, category] }));
      return category;
    },

    upsertBudget(categoryId, limitMinor, month = currentMonthKey()) {
      mutate((d) => {
        const existing = d.budgets.find((b) => b.month === month && b.categoryId === categoryId);
        if (existing) {
          return {
            ...d,
            budgets: d.budgets.map((b) =>
              b.id === existing.id ? { ...b, limitMinor } : b,
            ),
          };
        }
        const budget: Budget = {
          id: createId('bud'),
          month,
          categoryId,
          limitMinor,
          currency: d.preferences.baseCurrency,
        };
        return { ...d, budgets: [...d.budgets, budget] };
      });
    },

    removeBudget(id) {
      mutate((d) => ({ ...d, budgets: d.budgets.filter((b) => b.id !== id) }));
    },

    addRecurring(input) {
      const entry: RecurringEntry = { ...input, id: createId('rec') };
      mutate((d) => ({ ...d, recurring: [...d.recurring, entry] }));
      return entry;
    },

    toggleRecurring(id) {
      mutate((d) => ({
        ...d,
        recurring: d.recurring.map((r) =>
          r.id === id ? { ...r, isActive: !r.isActive } : r,
        ),
      }));
    },

    addGoal(input) {
      const goal: SavingsGoal = { ...input, id: createId('goal') };
      mutate((d) => ({ ...d, goals: [...d.goals, goal] }));
      return goal;
    },

    updateGoal(id, patch) {
      mutate((d) => ({
        ...d,
        goals: d.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
      }));
    },

    captureSnapshot(snapshot) {
      const full: ValuationSnapshot = { ...snapshot, id: createId('snap') };
      mutate((d) => ({ ...d, snapshots: [...d.snapshots, full] }));
    },

    upsertQuote(assetId, priceMinor, currency, source = 'Manuel') {
      const ts = nowIso();
      mutate((d) => ({
        ...d,
        quotes: [
          ...d.quotes.filter((q) => q.assetId !== assetId),
          { assetId, priceMinor, currency, source, asOf: ts, fetchedAt: ts, isStale: false },
        ],
      }));
    },

    recordSnapshot() {
      mutate((d) => {
        const nw = selectNetWorth(d);
        const iso = nowIso();
        const today = iso.slice(0, 10);
        const snapshot: ValuationSnapshot = {
          id: createId('snap'),
          capturedAt: iso,
          baseCurrency: d.preferences.baseCurrency,
          assetsMinor: nw.assetsMinor,
          liabilitiesMinor: nw.liabilitiesMinor,
          netWorthMinor: nw.netWorthMinor,
          breakdown: Object.fromEntries(nw.breakdown.map((b) => [b.key, b.valueMinor])),
        };
        const withoutToday = d.snapshots.filter((s) => s.capturedAt.slice(0, 10) !== today);
        return { ...d, snapshots: [...withoutToday, snapshot] };
      });
    },
  };
});
