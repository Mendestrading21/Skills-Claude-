import type { CurrencyCode, Money } from '@/types';

/** Fiat currencies use 2 minor digits. */
export const MINOR_UNITS = 100;

export function money(minor: number, currency: CurrencyCode): Money {
  return { minor: Math.round(minor), currency };
}

export function fromMinor(minor: number): number {
  return minor / MINOR_UNITS;
}

export function toMinor(major: number): number {
  return Math.round(major * MINOR_UNITS);
}

export function addMinor(...values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

/**
 * Parse free-form user input ("1 234,56", "1234.5", "1'234") to minor units.
 * Returns null when the input is not a valid number.
 */
export function parseAmountToMinor(input: string): number | null {
  if (input == null) return null;
  const cleaned = input
    .trim()
    .replace(/[\s'  ]/g, '')
    .replace(',', '.');
  if (cleaned === '' || cleaned === '.' || cleaned === '-') return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;
  return toMinor(value);
}

/** Parse a decimal quantity string into a finite number, else null. */
export function parseQuantity(input: string): number | null {
  const cleaned = input.trim().replace(/[\s'  ]/g, '').replace(',', '.');
  if (cleaned === '') return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

type FormatOptions = {
  /** Show currency code suffix. Default true. */
  showCurrency?: boolean;
  /** Force sign, e.g. "+1 200.00". Default false. */
  signed?: boolean;
  /** Number of decimals. Default 2. */
  decimals?: number;
  /** Compact large numbers (1.2k / 1.2M). Default false. */
  compact?: boolean;
};

function groupThousands(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Format a minor-unit amount using a stable, locale-independent style. */
export function formatMinor(
  minor: number,
  currency: CurrencyCode,
  options: FormatOptions = {},
): string {
  const {
    showCurrency = true,
    signed = false,
    decimals = 2,
    compact = false,
  } = options;
  const major = fromMinor(minor);
  const sign = major < 0 ? '-' : signed ? '+' : '';
  const abs = Math.abs(major);

  let body: string;
  if (compact && abs >= 1000) {
    body = formatCompact(abs);
  } else {
    const fixed = abs.toFixed(decimals);
    const [intPart, decPart] = fixed.split('.');
    body = decimals > 0 ? `${groupThousands(intPart)}.${decPart}` : groupThousands(intPart);
  }
  return showCurrency ? `${sign}${body} ${currency}` : `${sign}${body}`;
}

function formatCompact(abs: number): string {
  if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(abs / 1_000).toFixed(1)}k`;
  return abs.toFixed(0);
}

/** Format a signed percentage from a ratio (0.081 -> "+8.10 %"). */
export function formatPercent(ratio: number, decimals = 2): string {
  if (!Number.isFinite(ratio)) return '—';
  const value = ratio * 100;
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)} %`;
}

/** Safe relative change; returns null when the base is zero. */
export function relativeChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return (current - previous) / Math.abs(previous);
}
