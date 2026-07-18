/** Date helpers working on ISO strings, independent of locale libraries. */

export function nowIso(): string {
  return new Date().toISOString();
}

/** Month key YYYY-MM for a given date or ISO string. */
export function monthKey(date: string | Date = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const y = d.getUTCFullYear();
  const m = `${d.getUTCMonth() + 1}`.padStart(2, '0');
  return `${y}-${m}`;
}

export function currentMonthKey(): string {
  return monthKey(new Date());
}

/** Previous month key relative to a YYYY-MM key. */
export function previousMonthKey(key: string): string {
  const [y, m] = key.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, 1));
  date.setUTCMonth(date.getUTCMonth() - 1);
  return monthKey(date);
}

export function isInMonth(iso: string, key: string): boolean {
  return monthKey(iso) === key;
}

export function daysAgoIso(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

const FR_MONTHS = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
];

/** Human date like "12 mars" or "12 mars 2025" if not current year. */
export function formatDateFr(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const base = `${d.getUTCDate()} ${FR_MONTHS[d.getUTCMonth()]}`;
  return d.getUTCFullYear() === now.getUTCFullYear()
    ? base
    : `${base} ${d.getUTCFullYear()}`;
}

export function formatMonthKeyFr(key: string): string {
  const [y, m] = key.split('-').map(Number);
  const label = FR_MONTHS[m - 1].replace('.', '');
  return `${label.charAt(0).toUpperCase()}${label.slice(1)} ${y}`;
}

export type RangeKey = '1M' | '3M' | '6M' | '1A' | 'ALL';

export const RANGE_DAYS: Record<RangeKey, number | null> = {
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1A': 365,
  ALL: null,
};
