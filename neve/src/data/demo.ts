import { SCHEMA_VERSION } from '@/config/app';
import {
  computeNetWorth,
  valuePositions,
  type PortfolioContext,
} from '@/domain';
import type {
  AppData,
  Asset,
  Position,
  Transaction,
  ValuationSnapshot,
} from '@/types';
import { createId } from '@/utils/id';
import { daysAgoIso, monthKey, nowIso } from '@/utils/date';

/**
 * Deterministic demo dataset in CHF. Positions and liabilities are defined
 * explicitly; the valuation history is *derived* from the computed net worth
 * so the headline number and the chart always agree.
 */
export function buildDemoData(): AppData {
  const now = nowIso();
  const base = 'CHF';

  const accounts: AppData['accounts'] = [
    account('acc-checking', 'Compte courant', 'bank', 'CHF', 'Banque cantonale'),
    account('acc-savings', 'Épargne', 'bank', 'CHF', 'Banque cantonale'),
    account('acc-broker', 'Portefeuille titres', 'brokerage', 'CHF', 'Courtier'),
    account('acc-crypto', 'Crypto', 'crypto', 'USD', 'Exchange'),
    account('acc-pension', '3e pilier', 'pension', 'CHF', 'Assurance'),
    account('acc-property', 'Immobilier', 'real_estate', 'CHF'),
  ];

  const assets: Asset[] = [
    manualAsset('ast-cash-chf', 'Liquidités CHF', 'cash', 'CHF'),
    manualAsset('ast-savings', 'Épargne CHF', 'cash', 'CHF'),
    marketAsset('ast-nesn', 'Nestlé', 'NESN', 'equity', 'CHF'),
    marketAsset('ast-vwrl', 'FTSE All-World ETF', 'VWRL', 'etf', 'USD'),
    marketAsset('ast-fund', 'Fonds obligataire CHF', 'FNDCHF', 'fund', 'CHF'),
    marketAsset('ast-btc', 'Bitcoin', 'BTC', 'crypto', 'USD'),
    marketAsset('ast-eth', 'Ethereum', 'ETH', 'crypto', 'USD'),
    manualAsset('ast-3p', '3e pilier — fonds', 'pension', 'CHF'),
    manualAsset('ast-flat', 'Appartement', 'real_estate', 'CHF'),
  ];

  const positions: Position[] = [
    manualPosition('acc-checking', 'ast-cash-chf', 8392.5),
    manualPosition('acc-savings', 'ast-savings', 24000),
    marketPosition('acc-broker', 'ast-nesn', '120', 95.0),
    marketPosition('acc-broker', 'ast-vwrl', '60', 105.0, 'USD'),
    marketPosition('acc-broker', 'ast-fund', '200', 40.0),
    marketPosition('acc-crypto', 'ast-btc', '0.25', 38000, 'USD'),
    marketPosition('acc-crypto', 'ast-eth', '2', 2200, 'USD'),
    manualPosition('acc-pension', 'ast-3p', 57500),
    manualPosition('acc-property', 'ast-flat', 182000),
  ];

  const liabilities: AppData['liabilities'] = [
    {
      id: 'lia-mortgage',
      name: 'Hypothèque',
      kind: 'mortgage',
      principalMinor: 12000000, // 120'000 CHF
      currency: 'CHF',
      interestRateBps: 145,
      linkedAssetId: 'ast-flat',
      isArchived: false,
    },
    {
      id: 'lia-card',
      name: 'Carte de crédit',
      kind: 'credit_card',
      principalMinor: 184000, // 1'840 CHF
      currency: 'CHF',
      isArchived: false,
    },
  ];

  const quotes: AppData['quotes'] = [
    quote('ast-nesn', 108.5, 'CHF'),
    quote('ast-vwrl', 118.2, 'USD'),
    quote('ast-fund', 44.5, 'CHF'),
    quote('ast-btc', 61000, 'USD'),
    quote('ast-eth', 3050, 'USD'),
  ];

  const fxRates: AppData['fxRates'] = [
    { base: 'USD', quote: 'CHF', rateDecimal: '0.89', source: 'Démo', asOf: now },
    { base: 'EUR', quote: 'CHF', rateDecimal: '0.96', source: 'Démo', asOf: now },
  ];

  const categories: AppData['categories'] = [
    { id: 'cat-salary', name: 'Salaire', colorIndex: 5, kind: 'income' },
    { id: 'cat-housing', name: 'Logement', colorIndex: 0, kind: 'expense' },
    { id: 'cat-food', name: 'Alimentation', colorIndex: 1, kind: 'expense' },
    { id: 'cat-transport', name: 'Transport', colorIndex: 2, kind: 'expense' },
    { id: 'cat-leisure', name: 'Loisirs', colorIndex: 3, kind: 'expense' },
    { id: 'cat-resto', name: 'Restaurants', colorIndex: 4, kind: 'expense' },
    { id: 'cat-health', name: 'Santé', colorIndex: 6, kind: 'expense' },
    { id: 'cat-subs', name: 'Abonnements', colorIndex: 7, kind: 'expense' },
  ];

  const transactions = buildTransactions();

  const budgets: AppData['budgets'] = [
    budget('cat-housing', 210000),
    budget('cat-food', 70000),
    budget('cat-transport', 25000),
    budget('cat-leisure', 30000),
    budget('cat-resto', 40000),
    budget('cat-subs', 12000),
  ];

  const recurring: AppData['recurring'] = [
    {
      id: 'rec-salary',
      label: 'Salaire',
      type: 'income',
      amountMinor: 720000,
      currency: 'CHF',
      categoryId: 'cat-salary',
      frequency: 'monthly',
      nextDate: daysAgoIso(-5),
      isActive: true,
    },
    {
      id: 'rec-rent',
      label: 'Loyer',
      type: 'expense',
      amountMinor: 195000,
      currency: 'CHF',
      categoryId: 'cat-housing',
      frequency: 'monthly',
      nextDate: daysAgoIso(-2),
      isActive: true,
    },
    {
      id: 'rec-subs',
      label: 'Abonnements',
      type: 'expense',
      amountMinor: 8900,
      currency: 'CHF',
      categoryId: 'cat-subs',
      frequency: 'monthly',
      nextDate: daysAgoIso(-8),
      isActive: true,
    },
  ];

  const goals: AppData['goals'] = [
    {
      id: 'goal-emergency',
      name: 'Fonds d’urgence',
      targetMinor: 3000000,
      currentMinor: 2400000,
      currency: 'CHF',
    },
    {
      id: 'goal-trip',
      name: 'Voyage',
      targetMinor: 600000,
      currentMinor: 215000,
      currency: 'CHF',
      dueDate: daysAgoIso(-240),
    },
  ];

  const ctx: PortfolioContext = { assets, quotes, fxRates, baseCurrency: base };
  const valuations = valuePositions(positions, ctx);
  const nw = computeNetWorth(valuations, assets, liabilities, base, fxRates);
  const snapshots = buildSnapshots(nw.netWorthMinor, nw.assetsMinor, nw.liabilitiesMinor, base);

  return {
    schemaVersion: SCHEMA_VERSION,
    preferences: {
      baseCurrency: base,
      locale: 'fr',
      demoMode: true,
      remoteAssistantEnabled: false,
      analyticsEnabled: false,
      reducedTransparency: false,
      appLockEnabled: false,
      onboarded: true,
    },
    accounts,
    assets,
    positions,
    liabilities,
    transactions,
    categories,
    budgets,
    recurring,
    goals,
    snapshots,
    quotes,
    fxRates,
  };
}

// --- builders -------------------------------------------------------------

function account(
  id: string,
  name: string,
  kind: AppData['accounts'][number]['kind'],
  currency: string,
  institution?: string,
): AppData['accounts'][number] {
  const ts = nowIso();
  return { id, name, kind, currency, institution, isArchived: false, createdAt: ts, updatedAt: ts };
}

function manualAsset(id: string, name: string, assetClass: Asset['assetClass'], currency: string): Asset {
  return { id, name, assetClass, quoteCurrency: currency, pricingMode: 'manual' };
}

function marketAsset(
  id: string,
  name: string,
  symbol: string,
  assetClass: Asset['assetClass'],
  currency: string,
): Asset {
  return {
    id,
    name,
    symbol,
    assetClass,
    quoteCurrency: currency,
    pricingMode: 'market',
    priceSource: 'Démo',
  };
}

function manualPosition(accountId: string, assetId: string, valueMajor: number): Position {
  return {
    id: createId('pos'),
    accountId,
    assetId,
    quantityDecimal: '1',
    manualValueMinor: Math.round(valueMajor * 100),
    manualValueCurrency: 'CHF',
    isArchived: false,
    openedAt: daysAgoIso(400),
  };
}

function marketPosition(
  accountId: string,
  assetId: string,
  quantity: string,
  avgCostMajor: number,
  currency = 'CHF',
): Position {
  return {
    id: createId('pos'),
    accountId,
    assetId,
    quantityDecimal: quantity,
    averageCostMinor: Math.round(avgCostMajor * 100),
    averageCostCurrency: currency,
    isArchived: false,
    openedAt: daysAgoIso(300),
  };
}

function quote(assetId: string, priceMajor: number, currency: string): AppData['quotes'][number] {
  const ts = nowIso();
  return {
    assetId,
    priceMinor: Math.round(priceMajor * 100),
    currency,
    source: 'Démo',
    asOf: ts,
    fetchedAt: ts,
    isStale: false,
  };
}

function budget(categoryId: string, limitMinor: number): AppData['budgets'][number] {
  return { id: createId('bud'), month: monthKey(), categoryId, limitMinor, currency: 'CHF' };
}

/** Three months of income + varied expenses. */
function buildTransactions(): Transaction[] {
  const txs: Transaction[] = [];
  const expensePlan: { cat: string; label: string; amount: number; day: number }[] = [
    { cat: 'cat-housing', label: 'Loyer', amount: 1950, day: 1 },
    { cat: 'cat-food', label: 'Courses', amount: 240, day: 4 },
    { cat: 'cat-food', label: 'Courses', amount: 180, day: 18 },
    { cat: 'cat-transport', label: 'Abonnement transport', amount: 85, day: 3 },
    { cat: 'cat-resto', label: 'Restaurant', amount: 62, day: 9 },
    { cat: 'cat-resto', label: 'Restaurant', amount: 48, day: 22 },
    { cat: 'cat-leisure', label: 'Cinéma', amount: 34, day: 14 },
    { cat: 'cat-subs', label: 'Streaming', amount: 29, day: 6 },
    { cat: 'cat-health', label: 'Pharmacie', amount: 41, day: 12 },
  ];

  for (let m = 0; m < 3; m++) {
    const salaryDay = 25;
    txs.push({
      id: createId('tx'),
      accountId: 'acc-checking',
      type: 'income',
      amountMinor: 720000,
      currency: 'CHF',
      categoryId: 'cat-salary',
      occurredAt: monthDayIso(m, salaryDay),
      note: 'Salaire',
    });
    for (const e of expensePlan) {
      const jitter = ((m * 7 + e.day) % 5) - 2; // deterministic small variation
      txs.push({
        id: createId('tx'),
        accountId: 'acc-checking',
        type: 'expense',
        amountMinor: Math.round((e.amount + jitter) * 100),
        currency: 'CHF',
        categoryId: e.cat,
        occurredAt: monthDayIso(m, e.day),
        note: e.label,
      });
    }
    // A dividend every other month.
    if (m % 2 === 0) {
      txs.push({
        id: createId('tx'),
        accountId: 'acc-broker',
        type: 'dividend',
        assetId: 'ast-nesn',
        amountMinor: 8400,
        currency: 'CHF',
        occurredAt: monthDayIso(m, 16),
        note: 'Dividende Nestlé',
      });
    }
  }
  return txs;
}

function monthDayIso(monthsAgo: number, day: number): string {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() - monthsAgo);
  d.setUTCDate(day);
  d.setUTCHours(9, 0, 0, 0);
  return d.toISOString();
}

/** Walk backwards from the current net worth to build 12 monthly snapshots. */
function buildSnapshots(
  netWorthMinor: number,
  assetsMinor: number,
  liabilitiesMinor: number,
  base: string,
): ValuationSnapshot[] {
  const months = 12;
  const snapshots: ValuationSnapshot[] = [];
  // Deterministic pseudo-noise so the curve looks organic but stable.
  const noise = [0, -320, 410, -180, 560, -90, 300, -420, 250, -140, 380, -260];
  const startFactor = 0.82; // 12 months ago ≈ 82% of today
  for (let i = 0; i < months; i++) {
    const t = i / (months - 1);
    const factor = startFactor + (1 - startFactor) * t;
    const nw = Math.round(netWorthMinor * factor) + noise[i] * 100;
    const assets = Math.round(assetsMinor * factor) + noise[i] * 100;
    const capturedAt = monthDayIso(months - 1 - i, 1);
    snapshots.push({
      id: createId('snap'),
      capturedAt,
      baseCurrency: base,
      assetsMinor: assets,
      liabilitiesMinor,
      netWorthMinor: i === months - 1 ? netWorthMinor : nw,
      breakdown: {},
    });
  }
  return snapshots;
}
