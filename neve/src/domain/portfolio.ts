import type {
  Asset,
  AssetClass,
  CurrencyCode,
  FxRate,
  MarketQuote,
  Position,
} from '@/types';
import { convertMinorSafe } from './fx';
import { parseQuantity } from './money';

export type PriceOrigin = 'manual' | 'market' | 'cost' | 'none';

export type PositionValuation = {
  positionId: string;
  assetId: string;
  accountId: string;
  quantity: number;
  /** Current value expressed in the base currency (best effort). */
  valueMinor: number;
  valueCurrency: CurrencyCode;
  /** Cost basis in the base currency, or null when unknown. */
  costMinor: number | null;
  /** Value − cost in base currency, or null when cost unknown. */
  gainMinor: number | null;
  /** gain / cost, or null. */
  gainRatio: number | null;
  origin: PriceOrigin;
  isStale: boolean;
  priceMinor: number | null;
  priceCurrency: CurrencyCode | null;
  priceSource: string | null;
  fxComplete: boolean;
};

export type PortfolioContext = {
  assets: Asset[];
  quotes: MarketQuote[];
  fxRates: FxRate[];
  baseCurrency: CurrencyCode;
};

function findAsset(assets: Asset[], id: string): Asset | undefined {
  return assets.find((a) => a.id === id);
}

function latestQuote(quotes: MarketQuote[], assetId: string): MarketQuote | undefined {
  return quotes
    .filter((q) => q.assetId === assetId)
    .sort((a, b) => b.fetchedAt.localeCompare(a.fetchedAt))[0];
}

/** Value a single position, resolving pricing source and converting to base. */
export function valuePosition(
  position: Position,
  ctx: PortfolioContext,
): PositionValuation {
  const asset = findAsset(ctx.assets, position.assetId);
  const quantity = parseQuantity(position.quantityDecimal) ?? 0;
  const base = ctx.baseCurrency;

  let rawValueMinor = 0;
  let valueCurrency: CurrencyCode = asset?.quoteCurrency ?? base;
  let origin: PriceOrigin = 'none';
  let isStale = false;
  let priceMinor: number | null = null;
  let priceCurrency: CurrencyCode | null = null;
  let priceSource: string | null = null;

  if (position.manualValueMinor != null) {
    rawValueMinor = position.manualValueMinor;
    valueCurrency = position.manualValueCurrency ?? valueCurrency;
    origin = 'manual';
  } else if (asset && asset.pricingMode === 'market') {
    const quote = latestQuote(ctx.quotes, asset.id);
    if (quote) {
      rawValueMinor = Math.round(quantity * quote.priceMinor);
      valueCurrency = quote.currency;
      origin = 'market';
      isStale = quote.isStale;
      priceMinor = quote.priceMinor;
      priceCurrency = quote.currency;
      priceSource = quote.source;
    } else if (position.averageCostMinor != null) {
      rawValueMinor = Math.round(quantity * position.averageCostMinor);
      valueCurrency = position.averageCostCurrency ?? valueCurrency;
      origin = 'cost';
    }
  } else if (position.averageCostMinor != null) {
    rawValueMinor = Math.round(quantity * position.averageCostMinor);
    valueCurrency = position.averageCostCurrency ?? valueCurrency;
    origin = 'cost';
  }

  const valueInBase = convertMinorSafe(rawValueMinor, valueCurrency, base, ctx.fxRates, base);

  let costMinor: number | null = null;
  let costComplete = true;
  if (position.averageCostMinor != null) {
    const rawCost = Math.round(quantity * position.averageCostMinor);
    const costCurrency = position.averageCostCurrency ?? valueCurrency;
    const cc = convertMinorSafe(rawCost, costCurrency, base, ctx.fxRates, base);
    costMinor = cc.minor;
    costComplete = cc.converted;
  }

  const gainMinor = costMinor == null ? null : valueInBase.minor - costMinor;
  const gainRatio =
    costMinor == null || costMinor === 0 ? null : (gainMinor as number) / costMinor;

  return {
    positionId: position.id,
    assetId: position.assetId,
    accountId: position.accountId,
    quantity,
    valueMinor: valueInBase.minor,
    valueCurrency: base,
    costMinor,
    gainMinor,
    gainRatio,
    origin,
    isStale,
    priceMinor,
    priceCurrency,
    priceSource,
    fxComplete: valueInBase.converted && costComplete,
  };
}

export function valuePositions(
  positions: Position[],
  ctx: PortfolioContext,
): PositionValuation[] {
  return positions
    .filter((p) => !p.isArchived)
    .map((p) => valuePosition(p, ctx));
}

export type PortfolioSummary = {
  totalValueMinor: number;
  totalCostMinor: number;
  totalGainMinor: number;
  totalGainRatio: number | null;
  hasStale: boolean;
  hasIncompleteFx: boolean;
  baseCurrency: CurrencyCode;
};

export function summarizePortfolio(
  valuations: PositionValuation[],
  baseCurrency: CurrencyCode,
): PortfolioSummary {
  const totalValueMinor = valuations.reduce((s, v) => s + v.valueMinor, 0);
  const withCost = valuations.filter((v) => v.costMinor != null);
  const totalCostMinor = withCost.reduce((s, v) => s + (v.costMinor as number), 0);
  const totalGainMinor = withCost.reduce((s, v) => s + (v.gainMinor as number), 0);
  const totalGainRatio = totalCostMinor === 0 ? null : totalGainMinor / totalCostMinor;

  return {
    totalValueMinor,
    totalCostMinor,
    totalGainMinor,
    totalGainRatio,
    hasStale: valuations.some((v) => v.isStale),
    hasIncompleteFx: valuations.some((v) => !v.fxComplete),
    baseCurrency,
  };
}

export type AllocationSlice = {
  key: string;
  label: string;
  valueMinor: number;
  ratio: number;
};

const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  cash: 'Liquidités',
  equity: 'Actions',
  etf: 'ETF',
  fund: 'Fonds',
  bond: 'Obligations',
  crypto: 'Crypto',
  pension: 'Prévoyance',
  real_estate: 'Immobilier',
  commodity: 'Matières premières',
  other: 'Autres',
};

/** Allocation by asset class from position valuations. */
export function allocationByClass(
  valuations: PositionValuation[],
  assets: Asset[],
): AllocationSlice[] {
  const total = valuations.reduce((s, v) => s + v.valueMinor, 0);
  const byClass = new Map<AssetClass, number>();
  for (const v of valuations) {
    const asset = assets.find((a) => a.id === v.assetId);
    const cls: AssetClass = asset?.assetClass ?? 'other';
    byClass.set(cls, (byClass.get(cls) ?? 0) + v.valueMinor);
  }
  return Array.from(byClass.entries())
    .map(([cls, valueMinor]) => ({
      key: cls,
      label: ASSET_CLASS_LABELS[cls],
      valueMinor,
      ratio: total === 0 ? 0 : valueMinor / total,
    }))
    .filter((slice) => slice.valueMinor > 0)
    .sort((a, b) => b.valueMinor - a.valueMinor);
}

export type Contributor = {
  assetId: string;
  label: string;
  gainMinor: number;
  gainRatio: number | null;
};

/** Positions ranked by absolute gain; best first. */
export function rankContributors(
  valuations: PositionValuation[],
  assets: Asset[],
): Contributor[] {
  return valuations
    .filter((v) => v.gainMinor != null)
    .map((v) => ({
      assetId: v.assetId,
      label: assets.find((a) => a.id === v.assetId)?.name ?? v.assetId,
      gainMinor: v.gainMinor as number,
      gainRatio: v.gainRatio,
    }))
    .sort((a, b) => b.gainMinor - a.gainMinor);
}

/** Exposure by the *quote* currency of the underlying asset (pre-conversion). */
export function currencyExposure(
  positions: Position[],
  ctx: PortfolioContext,
): AllocationSlice[] {
  const byCurrency = new Map<CurrencyCode, number>();
  for (const p of positions.filter((x) => !x.isArchived)) {
    const asset = ctx.assets.find((a) => a.id === p.assetId);
    const valuation = valuePosition(p, ctx);
    const currency = asset?.quoteCurrency ?? ctx.baseCurrency;
    byCurrency.set(currency, (byCurrency.get(currency) ?? 0) + valuation.valueMinor);
  }
  const total = Array.from(byCurrency.values()).reduce((s, v) => s + v, 0);
  return Array.from(byCurrency.entries())
    .map(([currency, valueMinor]) => ({
      key: currency,
      label: currency,
      valueMinor,
      ratio: total === 0 ? 0 : valueMinor / total,
    }))
    .filter((s) => s.valueMinor > 0)
    .sort((a, b) => b.valueMinor - a.valueMinor);
}
