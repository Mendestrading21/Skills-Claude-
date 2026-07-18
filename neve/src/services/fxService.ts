import type { CurrencyCode, FxRate } from '@/types';

export interface FxService {
  readonly name: string;
  readonly isRemote: boolean;
  fetchRates(base: CurrencyCode, quotes: CurrencyCode[]): Promise<FxRate[]>;
}

/** Local FX service returns nothing remote; the app relies on stored rates. */
export class LocalFxService implements FxService {
  readonly name = 'Local';
  readonly isRemote = false;
  async fetchRates(): Promise<FxRate[]> {
    return [];
  }
}

export const fxService: FxService = new LocalFxService();
