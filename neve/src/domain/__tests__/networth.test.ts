import type { Asset, FxRate, Liability, MarketQuote, Position } from '@/types';
import { valuePositions, type PortfolioContext } from '../portfolio';
import { computeNetWorth, totalLiabilitiesMinor } from '../networth';

const assets: Asset[] = [
  { id: 'eq', name: 'Equity', assetClass: 'equity', quoteCurrency: 'CHF', pricingMode: 'market' },
  { id: 'cash', name: 'Cash', assetClass: 'cash', quoteCurrency: 'CHF', pricingMode: 'manual' },
];
const quotes: MarketQuote[] = [
  { assetId: 'eq', priceMinor: 12000, currency: 'CHF', source: 't', asOf: '', fetchedAt: '', isStale: false },
];
const fxRates: FxRate[] = [{ base: 'EUR', quote: 'CHF', rateDecimal: '0.96', source: 't', asOf: '' }];
const positions: Position[] = [
  { id: 'p1', accountId: 'a1', assetId: 'eq', quantityDecimal: '10', averageCostMinor: 10000, averageCostCurrency: 'CHF', isArchived: false },
  { id: 'p2', accountId: 'a2', assetId: 'cash', quantityDecimal: '1', manualValueMinor: 500000, manualValueCurrency: 'CHF', isArchived: false },
];
const liabilities: Liability[] = [
  { id: 'l1', name: 'Prêt', kind: 'loan', principalMinor: 200000, currency: 'CHF', isArchived: false },
  { id: 'l2', name: 'Archivé', kind: 'loan', principalMinor: 999999, currency: 'CHF', isArchived: true },
];

const ctx: PortfolioContext = { assets, quotes, fxRates, baseCurrency: 'CHF' };

describe('net worth', () => {
  test('liabilities exclude archived and convert', () => {
    const r = totalLiabilitiesMinor(liabilities, 'CHF', fxRates);
    expect(r.minor).toBe(200000);
    expect(r.complete).toBe(true);
  });

  test('net worth = assets - liabilities with breakdown', () => {
    const valuations = valuePositions(positions, ctx);
    const nw = computeNetWorth(valuations, assets, liabilities, 'CHF', fxRates);
    expect(nw.assetsMinor).toBe(620000); // 120000 + 500000
    expect(nw.liabilitiesMinor).toBe(200000);
    expect(nw.netWorthMinor).toBe(420000);
    expect(nw.liquidityMinor).toBe(500000);
    expect(nw.investmentsMinor).toBe(120000);
    expect(nw.breakdown.length).toBe(2);
  });

  test('flags incomplete FX when a rate is missing', () => {
    const jpyLiab: Liability[] = [
      { id: 'l3', name: 'Yen', kind: 'loan', principalMinor: 100000, currency: 'JPY', isArchived: false },
    ];
    const nw = computeNetWorth(valuePositions(positions, ctx), assets, jpyLiab, 'CHF', fxRates);
    expect(nw.fxComplete).toBe(false);
  });
});
