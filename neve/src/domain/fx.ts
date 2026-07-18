import type { CurrencyCode, FxRate } from '@/types';

/**
 * Resolve the multiplier to convert 1 unit of `from` into `to`.
 * Supports direct rates, their inverse, and triangulation through a pivot
 * (typically the app base currency). Returns null when no path exists.
 */
/** Direct or inverse rate only — no triangulation, so it always terminates. */
function directRate(from: CurrencyCode, to: CurrencyCode, rates: FxRate[]): number | null {
  if (from === to) return 1;
  for (const r of rates) {
    if (r.base === from && r.quote === to) return Number(r.rateDecimal);
    if (r.base === to && r.quote === from) {
      const v = Number(r.rateDecimal);
      return v === 0 ? null : 1 / v;
    }
  }
  return null;
}

export function resolveRate(
  from: CurrencyCode,
  to: CurrencyCode,
  rates: FxRate[],
  pivot?: CurrencyCode,
): number | null {
  const direct = directRate(from, to, rates);
  if (direct != null) return direct;

  // Triangulate through a pivot, using only direct legs to avoid recursion.
  const pivots = pivot ? [pivot] : Array.from(new Set(rates.flatMap((r) => [r.base, r.quote])));
  for (const p of pivots) {
    if (p === from || p === to) continue;
    const a = directRate(from, p, rates);
    const b = directRate(p, to, rates);
    if (a != null && b != null) return a * b;
  }
  return null;
}

/**
 * Convert a minor-unit amount between currencies. Minor units are assumed to
 * share the same scale (100). Returns null when the rate is unknown.
 */
export function convertMinor(
  minor: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: FxRate[],
  pivot?: CurrencyCode,
): number | null {
  const rate = resolveRate(from, to, rates, pivot);
  if (rate == null) return null;
  return Math.round(minor * rate);
}

/**
 * Convert to `to`, falling back to the original amount when the rate is
 * missing (so the UI degrades gracefully). The `converted` flag tells callers
 * whether the number is trustworthy.
 */
export function convertMinorSafe(
  minor: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: FxRate[],
  pivot?: CurrencyCode,
): { minor: number; converted: boolean } {
  if (from === to) return { minor, converted: true };
  const converted = convertMinor(minor, from, to, rates, pivot);
  return converted == null
    ? { minor, converted: false }
    : { minor: converted, converted: true };
}
