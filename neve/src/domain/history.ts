import type { RangeKey } from '@/utils/date';
import { RANGE_DAYS } from '@/utils/date';
import type { ValuationSnapshot } from '@/types';

export type SeriesPoint = { x: number; y: number; label: string };

/** Build a chart series from snapshots, filtered to a range. */
export function netWorthSeries(
  snapshots: ValuationSnapshot[],
  range: RangeKey,
): SeriesPoint[] {
  const sorted = [...snapshots].sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
  const days = RANGE_DAYS[range];
  let filtered = sorted;
  if (days != null && sorted.length > 0) {
    const cutoff = Date.now() - days * 24 * 3600 * 1000;
    filtered = sorted.filter((s) => new Date(s.capturedAt).getTime() >= cutoff);
    if (filtered.length < 2) filtered = sorted.slice(-Math.max(2, days / 30));
  }
  return filtered.map((s) => ({
    x: new Date(s.capturedAt).getTime(),
    y: s.netWorthMinor,
    label: s.capturedAt.slice(0, 10),
  }));
}

/** Performance over a series: absolute and relative change first→last. */
export function seriesPerformance(points: SeriesPoint[]): {
  absoluteMinor: number;
  ratio: number | null;
} {
  if (points.length < 2) return { absoluteMinor: 0, ratio: null };
  const first = points[0].y;
  const last = points[points.length - 1].y;
  return {
    absoluteMinor: last - first,
    ratio: first === 0 ? null : (last - first) / Math.abs(first),
  };
}
