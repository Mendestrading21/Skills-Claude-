import type { FxRate, Transaction } from '@/types';
import { directionOf, expenseByCategory, monthlyCashFlow } from '../cashflow';

const fxRates: FxRate[] = [{ base: 'USD', quote: 'CHF', rateDecimal: '0.90', source: 't', asOf: '' }];

function tx(partial: Partial<Transaction> & Pick<Transaction, 'type' | 'amountMinor'>): Transaction {
  return {
    id: Math.random().toString(),
    accountId: 'a1',
    currency: 'CHF',
    occurredAt: '2025-03-10T09:00:00.000Z',
    ...partial,
  };
}

describe('cash flow', () => {
  test('direction mapping', () => {
    expect(directionOf('income')).toBe(1);
    expect(directionOf('expense')).toBe(-1);
    expect(directionOf('transfer')).toBe(0);
  });

  test('monthly income/expense/net within the month only', () => {
    const txs: Transaction[] = [
      tx({ type: 'income', amountMinor: 100000 }),
      tx({ type: 'dividend', amountMinor: 5000 }),
      tx({ type: 'expense', amountMinor: 30000 }),
      tx({ type: 'fee', amountMinor: 1000 }),
      tx({ type: 'expense', amountMinor: 99999, occurredAt: '2025-02-01T00:00:00.000Z' }), // other month
    ];
    const cf = monthlyCashFlow(txs, '2025-03', 'CHF', fxRates);
    expect(cf.incomeMinor).toBe(105000);
    expect(cf.expenseMinor).toBe(31000);
    expect(cf.netMinor).toBe(74000);
  });

  test('converts foreign transactions and flags missing fx', () => {
    const txs: Transaction[] = [tx({ type: 'income', amountMinor: 10000, currency: 'USD' })];
    const cf = monthlyCashFlow(txs, '2025-03', 'CHF', fxRates);
    expect(cf.incomeMinor).toBe(9000);
    expect(cf.fxComplete).toBe(true);

    const jpy: Transaction[] = [tx({ type: 'income', amountMinor: 10000, currency: 'JPY' })];
    expect(monthlyCashFlow(jpy, '2025-03', 'CHF', fxRates).fxComplete).toBe(false);
  });

  test('expense by category aggregates', () => {
    const txs: Transaction[] = [
      tx({ type: 'expense', amountMinor: 20000, categoryId: 'food' }),
      tx({ type: 'expense', amountMinor: 10000, categoryId: 'food' }),
      tx({ type: 'expense', amountMinor: 5000, categoryId: 'transport' }),
      tx({ type: 'income', amountMinor: 100000, categoryId: 'salary' }),
    ];
    const byCat = expenseByCategory(txs, '2025-03', 'CHF', fxRates);
    expect(byCat.get('food')).toBe(30000);
    expect(byCat.get('transport')).toBe(5000);
    expect(byCat.has('salary')).toBe(false);
  });
});
