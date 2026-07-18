import type { Asset, MarketQuote } from '@/types';

export type PriceServiceStatus = 'ok' | 'offline' | 'error' | 'unavailable';

export type PriceFetchResult = {
  status: PriceServiceStatus;
  quotes: MarketQuote[];
  message?: string;
};

/**
 * Market price provider interface. A remote implementation can be added later
 * without touching consumers. Prices are always indicative.
 */
export interface MarketPriceService {
  readonly name: string;
  readonly isRemote: boolean;
  fetchQuotes(assets: Asset[]): Promise<PriceFetchResult>;
}

/**
 * Local provider: no network. It reports "unavailable" so the UI shows a clean
 * manual-value fallback instead of pretending to have live prices.
 */
export class LocalMarketPriceService implements MarketPriceService {
  readonly name = 'Local';
  readonly isRemote = false;

  async fetchQuotes(): Promise<PriceFetchResult> {
    return {
      status: 'unavailable',
      quotes: [],
      message:
        'Aucune source de prix distante n’est configurée. Utilisez des valeurs manuelles.',
    };
  }
}

export const marketPriceService: MarketPriceService = new LocalMarketPriceService();
