import type {
  CurrencyCode,
  FxRate,
  Transaction,
  TransactionType,
} from '@/types';
import { convertMinorSafe } from './fx';
import { isInMonth } from '@/utils/date';

/**
 * `amountMinor` is stored as a positive magnitude; direction is derived from
 * the transaction type. This keeps entry simple and math explicit.
 */
const INFLOW: TransactionType[] = ['income', 'dividend', 'interest', 'deposit', 'sell'];
const OUTFLOW: TransactionType[] = ['expense', 'fee', 'withdrawal', 'buy'];

/** Cash-flow types that count toward budgeted income/expense (excludes trades). */
const CASHFLOW_INCOME: TransactionType[] = ['income', 'dividend', 'interest'];
const CASHFLOW_EXPENSE: TransactionType[] = ['expense', 'fee'];

export function directionOf(type: TransactionType): 1 | -1 | 0 {
  if (INFLOW.includes(type)) return 1;
  if (OUTFLOW.includes(type)) return -1;
  return 0;
}

export type CashFlow = {
  incomeMinor: number;
  expenseMinor: number;
  netMinor: number;
  baseCurrency: CurrencyCode;
  fxComplete: boolean;
};

function convertOrFlag(
  tx: Transaction,
  base: CurrencyCode,
  fxRates: FxRate[],
  flag: { complete: boolean },
): number {
  const c = convertMinorSafe(tx.amountMinor, tx.currency, base, fxRates, base);
  if (!c.converted) flag.complete = false;
  return c.minor;
}

/** Income / expense / net cash-flow for one YYYY-MM month. */
export function monthlyCashFlow(
  transactions: Transaction[],
  monthKey: string,
  base: CurrencyCode,
  fxRates: FxRate[],
): CashFlow {
  const flag = { complete: true };
  let incomeMinor = 0;
  let expenseMinor = 0;

  for (const tx of transactions) {
    if (!isInMonth(tx.occurredAt, monthKey)) continue;
    const abs = Math.abs(tx.amountMinor);
    if (CASHFLOW_INCOME.includes(tx.type)) {
      incomeMinor += convertOrFlag({ ...tx, amountMinor: abs }, base, fxRates, flag);
    } else if (CASHFLOW_EXPENSE.includes(tx.type)) {
      expenseMinor += convertOrFlag({ ...tx, amountMinor: abs }, base, fxRates, flag);
    }
  }

  return {
    incomeMinor,
    expenseMinor,
    netMinor: incomeMinor - expenseMinor,
    baseCurrency: base,
    fxComplete: flag.complete,
  };
}

/** Expense total per category for a month (in base currency). */
export function expenseByCategory(
  transactions: Transaction[],
  monthKey: string,
  base: CurrencyCode,
  fxRates: FxRate[],
): Map<string, number> {
  const byCat = new Map<string, number>();
  for (const tx of transactions) {
    if (!isInMonth(tx.occurredAt, monthKey)) continue;
    if (!CASHFLOW_EXPENSE.includes(tx.type)) continue;
    const cat = tx.categoryId ?? 'uncategorized';
    const c = convertMinorSafe(Math.abs(tx.amountMinor), tx.currency, base, fxRates, base);
    byCat.set(cat, (byCat.get(cat) ?? 0) + c.minor);
  }
  return byCat;
}
