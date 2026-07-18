import type { Asset, FxRate, MarketQuote, Position } from '@/types';
import {
  allocationByClass,
  currencyExposure,
  rankContributors,
  summarizePortfolio,
  valuePosition,
  valuePositions,
  type PortfolioContext,
} from '../portfolio';

const assets: Asset[] = [
  { id: 'eq', name: 'Equity', assetClass: 'equity', quoteCurrency: 'CHF', pricingMode: 'market' },
  { id: 'etf', name: 'ETF', assetClass: 'etf', quoteCurrency: 'USD', pricingMode: 'market' },
  { id: 'cash', name: 'Cash', assetClass: 'cash', quoteCurrency: 'CHF', pricingMode: 'manual' },
];

const quotes: MarketQuote[] = [
  { assetId: 'eq', priceMinor: 12000, currency: 'CHF', source: 't', asOf: '', fetchedAt: '2025-01-02', isStale: false },
  { assetId: 'etf', priceMinor: 11000, currency: 'USD', source: 't', asOf: '', fetchedAt: '2025-01-02', isStale: true },
];

const fxRates: FxRate[] = [{ base: 'USD', quote: 'CHF', rateDecimal: '0.90', source: 't', asOf: '' }];

const positions: Position[] = [
  { id: 'p1', accountId: 'a1', assetId: 'eq', quantityDecimal: '10', averageCostMinor: 10000, averageCostCurrency: 'CHF', isArchived: false },
  { id: 'p2', accountId: 'a1', assetId: 'etf', quantityDecimal: '5', averageCostMinor: 10000, averageCostCurrency: 'USD', isArchived: false },
  { id: 'p3', accountId: 'a2', assetId: 'cash', quantityDecimal: '1', manualValueMinor: 500000, manualValueCurrency: 'CHF', isArchived: false },
];

const ctx: PortfolioContext = { assets, quotes, fxRates, baseCurrency: 'CHF' };

describe('portfolio valuation', () => {
  test('market position value and gain', () => {
    const v = valuePosition(positions[0], ctx);
    expect(v.valueMinor).toBe(120000); // 10 * 120.00
    expect(v.costMinor).toBe(100000);
    expect(v.gainMinor).toBe(20000);
    expect(v.gainRatio).toBeCloseTo(0.2);
    expect(v.origin).toBe('market');
  });

  test('foreign-currency position converts value and cost to base', () => {
    const v = valuePosition(positions[1], ctx);
    expect(v.valueMinor).toBe(49500); // 5*110 USD = 550 -> *0.9 = 495 CHF
    expect(v.costMinor).toBe(45000); // 500 USD -> 450 CHF
    expect(v.gainMinor).toBe(4500);
    expect(v.isStale).toBe(true);
  });

  test('manual position has value but no cost/gain', () => {
    const v = valuePosition(positions[2], ctx);
    expect(v.valueMinor).toBe(500000);
    expect(v.costMinor).toBeNull();
    expect(v.gainMinor).toBeNull();
    expect(v.origin).toBe('manual');
  });

  test('summary aggregates value, cost, gain', () => {
    const s = summarizePortfolio(valuePositions(positions, ctx), 'CHF');
    expect(s.totalValueMinor).toBe(669500);
    expect(s.totalCostMinor).toBe(145000);
    expect(s.totalGainMinor).toBe(24500);
    expect(s.totalGainRatio).toBeCloseTo(24500 / 145000);
    expect(s.hasStale).toBe(true);
  });

  test('allocation by class sums correctly and sorts by value', () => {
    const alloc = allocationByClass(valuePositions(positions, ctx), assets);
    const cash = alloc.find((a) => a.key === 'cash');
    expect(cash?.valueMinor).toBe(500000);
    expect(alloc[0].key).toBe('cash'); // largest first
    const totalRatio = alloc.reduce((s, a) => s + a.ratio, 0);
    expect(totalRatio).toBeCloseTo(1);
  });

  test('contributors ranked by gain, best first', () => {
    const c = rankContributors(valuePositions(positions, ctx), assets);
    expect(c[0].assetId).toBe('eq'); // +200 beats +45
    expect(c[c.length - 1].gainMinor).toBeLessThanOrEqual(c[0].gainMinor);
  });

  test('currency exposure groups by asset quote currency', () => {
    const exp = currencyExposure(positions, ctx);
    const usd = exp.find((e) => e.key === 'USD');
    expect(usd?.valueMinor).toBe(49500);
    const chf = exp.find((e) => e.key === 'CHF');
    expect(chf?.valueMinor).toBe(620000); // 120000 + 500000
  });
});
