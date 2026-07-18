# Data Model

Adapter les noms à la stack existante, mais préserver les concepts.

## Money

```ts
type CurrencyCode = "CHF" | "EUR" | "USD" | string;

type Money = {
  minor: number;      // centimes, jamais un float d’affichage
  currency: CurrencyCode;
};
```

Pour les cryptoactifs nécessitant davantage de précision, stocker séparément les quantités dans un format décimal exact ou en chaîne validée.

## Account

```ts
type Account = {
  id: string;
  name: string;
  kind: "cash" | "bank" | "brokerage" | "crypto" | "pension" | "real_estate" | "other";
  institution?: string;
  currency: CurrencyCode;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};
```

## Asset

```ts
type Asset = {
  id: string;
  symbol?: string;
  name: string;
  assetClass:
    | "cash"
    | "equity"
    | "etf"
    | "fund"
    | "bond"
    | "crypto"
    | "pension"
    | "real_estate"
    | "commodity"
    | "other";
  quoteCurrency: CurrencyCode;
  pricingMode: "market" | "manual";
  priceSource?: string;
};
```

## Position

```ts
type Position = {
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
```

## Liability

```ts
type Liability = {
  id: string;
  name: string;
  kind: "mortgage" | "loan" | "credit_card" | "tax" | "other";
  principalMinor: number;
  currency: CurrencyCode;
  interestRateBps?: number;
  linkedAssetId?: string;
  dueDate?: string;
  isArchived: boolean;
};
```

## Transaction

```ts
type Transaction = {
  id: string;
  accountId: string;
  type:
    | "buy"
    | "sell"
    | "deposit"
    | "withdrawal"
    | "dividend"
    | "interest"
    | "fee"
    | "transfer"
    | "income"
    | "expense"
    | "adjustment";
  assetId?: string;
  quantityDecimal?: string;
  amountMinor: number;
  currency: CurrencyCode;
  categoryId?: string;
  occurredAt: string;
  note?: string;
  linkedTransactionId?: string;
};
```

## MarketQuote

```ts
type MarketQuote = {
  assetId: string;
  priceMinor: number;
  currency: CurrencyCode;
  source: string;
  asOf: string;
  fetchedAt: string;
  isStale: boolean;
};
```

## FxRate

```ts
type FxRate = {
  base: CurrencyCode;
  quote: CurrencyCode;
  rateDecimal: string;
  source: string;
  asOf: string;
};
```

## ValuationSnapshot

```ts
type ValuationSnapshot = {
  id: string;
  capturedAt: string;
  baseCurrency: CurrencyCode;
  assetsMinor: number;
  liabilitiesMinor: number;
  netWorthMinor: number;
  breakdown: Record<string, number>;
};
```

## Budget

```ts
type Budget = {
  id: string;
  month: string; // YYYY-MM
  categoryId: string;
  limitMinor: number;
  currency: CurrencyCode;
};
```

## RecurringEntry

```ts
type RecurringEntry = {
  id: string;
  type: "income" | "expense";
  amountMinor: number;
  currency: CurrencyCode;
  categoryId?: string;
  frequency: "weekly" | "monthly" | "quarterly" | "yearly";
  nextDate: string;
  isActive: boolean;
};
```

## UserPreferences

```ts
type UserPreferences = {
  baseCurrency: CurrencyCode;
  locale: string;
  demoMode: boolean;
  remoteAssistantEnabled: boolean;
  analyticsEnabled: boolean;
  reducedTransparency: boolean;
};
```

## Invariants

- Une position appartient à un compte.
- Les transactions sont immuables autant que possible ; corriger par ajustement.
- Un taux de change a une date et une source.
- Un snapshot ne doit pas être recalculé silencieusement après coup.
- Les montants d’affichage sont dérivés, jamais la source de vérité.
- Les suppressions sensibles peuvent être logiques avant purge définitive.
- Chaque migration est idempotente et testée.
