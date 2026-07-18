import { z } from 'zod';

/** Zod schemas used to validate imported data at the trust boundary. */

const currency = z.string().min(1).max(8);
const iso = z.string().min(1);

const money = z.object({
  minor: z.number().int(),
  currency,
});

const account = z.object({
  id: z.string(),
  name: z.string().max(120),
  kind: z.enum(['cash', 'bank', 'brokerage', 'crypto', 'pension', 'real_estate', 'other']),
  institution: z.string().max(120).optional(),
  currency,
  isArchived: z.boolean(),
  createdAt: iso,
  updatedAt: iso,
});

const asset = z.object({
  id: z.string(),
  symbol: z.string().max(32).optional(),
  name: z.string().max(120),
  assetClass: z.enum([
    'cash',
    'equity',
    'etf',
    'fund',
    'bond',
    'crypto',
    'pension',
    'real_estate',
    'commodity',
    'other',
  ]),
  quoteCurrency: currency,
  pricingMode: z.enum(['market', 'manual']),
  priceSource: z.string().max(120).optional(),
});

const position = z.object({
  id: z.string(),
  accountId: z.string(),
  assetId: z.string(),
  quantityDecimal: z.string(),
  averageCostMinor: z.number().int().optional(),
  averageCostCurrency: currency.optional(),
  manualValueMinor: z.number().int().optional(),
  manualValueCurrency: currency.optional(),
  notes: z.string().max(2000).optional(),
  openedAt: iso.optional(),
  isArchived: z.boolean(),
});

const liability = z.object({
  id: z.string(),
  name: z.string().max(120),
  kind: z.enum(['mortgage', 'loan', 'credit_card', 'tax', 'other']),
  principalMinor: z.number().int(),
  currency,
  interestRateBps: z.number().optional(),
  linkedAssetId: z.string().optional(),
  dueDate: iso.optional(),
  isArchived: z.boolean(),
});

const transaction = z.object({
  id: z.string(),
  accountId: z.string(),
  type: z.enum([
    'buy',
    'sell',
    'deposit',
    'withdrawal',
    'dividend',
    'interest',
    'fee',
    'transfer',
    'income',
    'expense',
    'adjustment',
  ]),
  assetId: z.string().optional(),
  quantityDecimal: z.string().optional(),
  amountMinor: z.number().int(),
  currency,
  categoryId: z.string().optional(),
  occurredAt: iso,
  note: z.string().max(2000).optional(),
  linkedTransactionId: z.string().optional(),
});

const category = z.object({
  id: z.string(),
  name: z.string().max(80),
  colorIndex: z.number().int(),
  kind: z.enum(['income', 'expense']),
});

const budget = z.object({
  id: z.string(),
  month: z.string(),
  categoryId: z.string(),
  limitMinor: z.number().int(),
  currency,
});

const recurring = z.object({
  id: z.string(),
  label: z.string().max(120),
  type: z.enum(['income', 'expense']),
  amountMinor: z.number().int(),
  currency,
  categoryId: z.string().optional(),
  frequency: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']),
  nextDate: iso,
  isActive: z.boolean(),
});

const goal = z.object({
  id: z.string(),
  name: z.string().max(120),
  targetMinor: z.number().int(),
  currentMinor: z.number().int(),
  currency,
  dueDate: iso.optional(),
});

const snapshot = z.object({
  id: z.string(),
  capturedAt: iso,
  baseCurrency: currency,
  assetsMinor: z.number().int(),
  liabilitiesMinor: z.number().int(),
  netWorthMinor: z.number().int(),
  breakdown: z.record(z.string(), z.number()),
});

const quote = z.object({
  assetId: z.string(),
  priceMinor: z.number().int(),
  currency,
  source: z.string(),
  asOf: iso,
  fetchedAt: iso,
  isStale: z.boolean(),
});

const fxRate = z.object({
  base: currency,
  quote: currency,
  rateDecimal: z.string(),
  source: z.string(),
  asOf: iso,
});

const preferences = z.object({
  baseCurrency: currency,
  locale: z.string(),
  demoMode: z.boolean(),
  remoteAssistantEnabled: z.boolean(),
  analyticsEnabled: z.boolean(),
  reducedTransparency: z.boolean(),
  appLockEnabled: z.boolean(),
  onboarded: z.boolean(),
});

export const appDataSchema = z.object({
  schemaVersion: z.number().int(),
  preferences,
  accounts: z.array(account),
  assets: z.array(asset),
  positions: z.array(position),
  liabilities: z.array(liability),
  transactions: z.array(transaction),
  categories: z.array(category),
  budgets: z.array(budget),
  recurring: z.array(recurring),
  goals: z.array(goal),
  snapshots: z.array(snapshot),
  quotes: z.array(quote),
  fxRates: z.array(fxRate),
});

export { money };
