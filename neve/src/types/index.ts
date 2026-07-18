/**
 * Domain types. Amounts are stored in minor units (integer cents) to avoid
 * float display drift. Quantities that need high precision are decimal strings.
 */

export type CurrencyCode = 'CHF' | 'EUR' | 'USD' | (string & {});

export type Money = {
  minor: number;
  currency: CurrencyCode;
};

export type AccountKind =
  | 'cash'
  | 'bank'
  | 'brokerage'
  | 'crypto'
  | 'pension'
  | 'real_estate'
  | 'other';

export type Account = {
  id: string;
  name: string;
  kind: AccountKind;
  institution?: string;
  currency: CurrencyCode;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AssetClass =
  | 'cash'
  | 'equity'
  | 'etf'
  | 'fund'
  | 'bond'
  | 'crypto'
  | 'pension'
  | 'real_estate'
  | 'commodity'
  | 'other';

export type PricingMode = 'market' | 'manual';

export type Asset = {
  id: string;
  symbol?: string;
  name: string;
  assetClass: AssetClass;
  quoteCurrency: CurrencyCode;
  pricingMode: PricingMode;
  priceSource?: string;
};

export type Position = {
  id: string;
  accountId: string;
  assetId: string;
  quantityDecimal: string;
  averageCostMinor?: number;
  averageCostCurrency?: CurrencyCode;
  manualValueMinor?: number;
  manualValueCurrency?: CurrencyCode;
  notes?: string;
  openedAt?: string;
  isArchived: boolean;
};

export type LiabilityKind = 'mortgage' | 'loan' | 'credit_card' | 'tax' | 'other';

export type Liability = {
  id: string;
  name: string;
  kind: LiabilityKind;
  principalMinor: number;
  currency: CurrencyCode;
  interestRateBps?: number;
  linkedAssetId?: string;
  dueDate?: string;
  isArchived: boolean;
};

export type TransactionType =
  | 'buy'
  | 'sell'
  | 'deposit'
  | 'withdrawal'
  | 'dividend'
  | 'interest'
  | 'fee'
  | 'transfer'
  | 'income'
  | 'expense'
  | 'adjustment';

export type Transaction = {
  id: string;
  accountId: string;
  type: TransactionType;
  assetId?: string;
  quantityDecimal?: string;
  amountMinor: number;
  currency: CurrencyCode;
  categoryId?: string;
  occurredAt: string;
  note?: string;
  linkedTransactionId?: string;
};

export type MarketQuote = {
  assetId: string;
  priceMinor: number;
  currency: CurrencyCode;
  source: string;
  asOf: string;
  fetchedAt: string;
  isStale: boolean;
};

export type FxRate = {
  base: CurrencyCode;
  quote: CurrencyCode;
  rateDecimal: string;
  source: string;
  asOf: string;
};

export type ValuationSnapshot = {
  id: string;
  capturedAt: string;
  baseCurrency: CurrencyCode;
  assetsMinor: number;
  liabilitiesMinor: number;
  netWorthMinor: number;
  breakdown: Record<string, number>;
};

export type Category = {
  id: string;
  name: string;
  colorIndex: number;
  kind: 'income' | 'expense';
};

export type Budget = {
  id: string;
  month: string; // YYYY-MM
  categoryId: string;
  limitMinor: number;
  currency: CurrencyCode;
};

export type RecurringEntry = {
  id: string;
  label: string;
  type: 'income' | 'expense';
  amountMinor: number;
  currency: CurrencyCode;
  categoryId?: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextDate: string;
  isActive: boolean;
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetMinor: number;
  currentMinor: number;
  currency: CurrencyCode;
  dueDate?: string;
};

export type UserPreferences = {
  baseCurrency: CurrencyCode;
  locale: string;
  demoMode: boolean;
  remoteAssistantEnabled: boolean;
  analyticsEnabled: boolean;
  reducedTransparency: boolean;
  appLockEnabled: boolean;
  onboarded: boolean;
};

/** The full persisted document. */
export type AppData = {
  schemaVersion: number;
  preferences: UserPreferences;
  accounts: Account[];
  assets: Asset[];
  positions: Position[];
  liabilities: Liability[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  recurring: RecurringEntry[];
  goals: SavingsGoal[];
  snapshots: ValuationSnapshot[];
  quotes: MarketQuote[];
  fxRates: FxRate[];
};
