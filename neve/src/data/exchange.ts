import type { AppData } from '@/types';
import { appDataSchema } from './schema';
import { migrate } from './migrations';
import { formatMinor } from '@/domain/money';

/** Hard cap to avoid loading pathologically large import files (~5 MB). */
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

export type ImportResult =
  | { ok: true; data: AppData }
  | { ok: false; error: string };

/** Serialise the full document to pretty JSON. */
export function exportJson(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** Export transactions as a spreadsheet-friendly CSV. */
export function exportTransactionsCsv(data: AppData): string {
  const header = ['date', 'type', 'compte', 'catégorie', 'montant', 'devise', 'note'];
  const rows = data.transactions
    .slice()
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .map((tx) => {
      const account = data.accounts.find((a) => a.id === tx.accountId)?.name ?? tx.accountId;
      const category = data.categories.find((c) => c.id === tx.categoryId)?.name ?? '';
      return [
        tx.occurredAt.slice(0, 10),
        tx.type,
        account,
        category,
        formatMinor(tx.amountMinor, tx.currency, { showCurrency: false }),
        tx.currency,
        tx.note ?? '',
      ]
        .map((c) => csvEscape(String(c)))
        .join(',');
    });
  return [header.join(','), ...rows].join('\n');
}

/**
 * Validate and normalise an imported JSON string. Runs size checks, JSON
 * parsing, schema validation and migration. Never trusts the input shape.
 */
export function importJson(raw: string): ImportResult {
  if (raw.length > MAX_IMPORT_BYTES) {
    return { ok: false, error: 'Fichier trop volumineux.' };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'JSON invalide.' };
  }

  // Migrate first so older exports validate against the current schema.
  const migrated = migrate(parsed);
  if (!migrated) return { ok: false, error: 'Structure de données non reconnue.' };

  const result = appDataSchema.safeParse(migrated);
  if (!result.success) {
    const first = result.error.issues[0];
    const path = first?.path.join('.') || 'racine';
    return { ok: false, error: `Donnée invalide (${path}).` };
  }
  return { ok: true, data: result.data as AppData };
}
