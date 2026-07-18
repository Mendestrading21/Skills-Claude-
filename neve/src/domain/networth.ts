import type { Asset, AssetClass, CurrencyCode, FxRate, Liability } from '@/types';
import { convertMinorSafe } from './fx';
import { allocationByClass, type AllocationSlice, type PositionValuation } from './portfolio';

const CASH_CLASSES: AssetClass[] = ['cash'];
const INVESTMENT_CLASSES: AssetClass[] = [
  'equity',
  'etf',
  'fund',
  'bond',
  'crypto',
  'commodity',
];

export type NetWorth = {
  assetsMinor: number;
  liabilitiesMinor: number;
  netWorthMinor: number;
  liquidityMinor: number;
  investmentsMinor: number;
  baseCurrency: CurrencyCode;
  breakdown: AllocationSlice[];
  fxComplete: boolean;
};

function classOf(assets: Asset[], assetId: string): AssetClass {
  return assets.find((a) => a.id === assetId)?.assetClass ?? 'other';
}

export function totalLiabilitiesMinor(
  liabilities: Liability[],
  base: CurrencyCode,
  fxRates: FxRate[],
): { minor: number; complete: boolean } {
  let minor = 0;
  let complete = true;
  for (const l of liabilities.filter((x) => !x.isArchived)) {
    const c = convertMinorSafe(l.principalMinor, l.currency, base, fxRates, base);
    minor += c.minor;
    if (!c.converted) complete = false;
  }
  return { minor, complete };
}

export function computeNetWorth(
  valuations: PositionValuation[],
  assets: Asset[],
  liabilities: Liability[],
  base: CurrencyCode,
  fxRates: FxRate[],
): NetWorth {
  const assetsMinor = valuations.reduce((s, v) => s + v.valueMinor, 0);
  const liquidityMinor = valuations
    .filter((v) => CASH_CLASSES.includes(classOf(assets, v.assetId)))
    .reduce((s, v) => s + v.valueMinor, 0);
  const investmentsMinor = valuations
    .filter((v) => INVESTMENT_CLASSES.includes(classOf(assets, v.assetId)))
    .reduce((s, v) => s + v.valueMinor, 0);

  const liabilities_ = totalLiabilitiesMinor(liabilities, base, fxRates);
  const positionsFxComplete = valuations.every((v) => v.fxComplete);

  return {
    assetsMinor,
    liabilitiesMinor: liabilities_.minor,
    netWorthMinor: assetsMinor - liabilities_.minor,
    liquidityMinor,
    investmentsMinor,
    baseCurrency: base,
    breakdown: allocationByClass(valuations, assets),
    fxComplete: positionsFxComplete && liabilities_.complete,
  };
}
