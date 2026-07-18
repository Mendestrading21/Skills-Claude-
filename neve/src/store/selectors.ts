import {
  allocationByClass,
  budgetProgress,
  budgetTotals,
  buildInsights,
  computeHealth,
  computeNetWorth,
  currencyExposure,
  expenseByCategory,
  monthlyCashFlow,
  monthlyFixedCosts,
  netWorthSeries,
  rankContributors,
  seriesPerformance,
  summarizePortfolio,
  valuePositions,
  type AllocationSlice,
  type BudgetProgress,
  type BudgetTotals,
  type CashFlow,
  type CategorySpend,
  type Contributor,
  type FinancialHealth,
  type Insight,
  type NetWorth,
  type PortfolioContext,
  type PortfolioSummary,
  type PositionValuation,
  type SeriesPoint,
} from '@/domain';
import type { AppData, Transaction } from '@/types';
import { currentMonthKey, previousMonthKey, type RangeKey } from '@/utils/date';
import type { AssistantContext } from '@/services/assistant';

export function portfolioContext(data: AppData): PortfolioContext {
  return {
    assets: data.assets,
    quotes: data.quotes,
    fxRates: data.fxRates,
    baseCurrency: data.preferences.baseCurrency,
  };
}

export function selectValuations(data: AppData): PositionValuation[] {
  return valuePositions(data.positions, portfolioContext(data));
}

export function selectNetWorth(data: AppData): NetWorth {
  const valuations = selectValuations(data);
  return computeNetWorth(
    valuations,
    data.assets,
    data.liabilities,
    data.preferences.baseCurrency,
    data.fxRates,
  );
}

export function selectPortfolioSummary(data: AppData): PortfolioSummary {
  return summarizePortfolio(selectValuations(data), data.preferences.baseCurrency);
}

export function selectAllocation(data: AppData): AllocationSlice[] {
  return allocationByClass(selectValuations(data), data.assets);
}

export function selectContributors(data: AppData): Contributor[] {
  return rankContributors(selectValuations(data), data.assets);
}

export function selectCurrencyExposure(data: AppData): AllocationSlice[] {
  return currencyExposure(data.positions, portfolioContext(data));
}

export function selectCashFlow(data: AppData, month = currentMonthKey()): CashFlow {
  return monthlyCashFlow(
    data.transactions,
    month,
    data.preferences.baseCurrency,
    data.fxRates,
  );
}

export function selectPreviousCashFlow(data: AppData): CashFlow {
  return selectCashFlow(data, previousMonthKey(currentMonthKey()));
}

export function selectBudgetProgress(
  data: AppData,
  month = currentMonthKey(),
): BudgetProgress[] {
  return budgetProgress(
    data.budgets,
    data.transactions,
    data.categories,
    month,
    data.preferences.baseCurrency,
    data.fxRates,
  );
}

export function selectBudgetTotals(data: AppData): BudgetTotals {
  return budgetTotals(selectBudgetProgress(data));
}

export function selectSeries(data: AppData, range: RangeKey): SeriesPoint[] {
  return netWorthSeries(data.snapshots, range);
}

export function selectPerformance(data: AppData, range: RangeKey) {
  return seriesPerformance(selectSeries(data, range));
}

/** Savings rate = net cash-flow / income for the current month (null if no income). */
export function selectSavingsRate(data: AppData): number | null {
  const cf = selectCashFlow(data);
  return cf.incomeMinor === 0 ? null : cf.netMinor / cf.incomeMinor;
}

export type NetWorthGoal = {
  targetMinor: number;
  currentMinor: number;
  remainingMinor: number;
  ratio: number;
};

export type FinancialAnalysis = {
  health: FinancialHealth;
  insights: Insight[];
  topExpenses: CategorySpend[];
  fixedCostsMinor: number;
};

const DISCRETIONARY_MATCH = /loisir|resto|restaurant|sortie|shopping|vêtement|jeu|abonnement/i;

/** Practical financial analysis: health metrics + actionable insights. */
export function selectInsights(data: AppData): FinancialAnalysis {
  const base = data.preferences.baseCurrency;
  const nw = selectNetWorth(data);
  const cf = selectCashFlow(data);
  const budgets = selectBudgetProgress(data);
  const month = currentMonthKey();

  const spentThis = expenseByCategory(data.transactions, month, base, data.fxRates);
  const spentPrev = expenseByCategory(data.transactions, previousMonthKey(month), base, data.fxRates);

  const topExpenses: CategorySpend[] = Array.from(spentThis.entries())
    .map(([id, spentMinor]) => ({
      id,
      name: data.categories.find((c) => c.id === id)?.name ?? 'Non catégorisé',
      spentMinor,
    }))
    .sort((a, b) => b.spentMinor - a.spentMinor);

  const discretionary = topExpenses.filter((c) => DISCRETIONARY_MATCH.test(c.name));
  const discretionaryMinor = discretionary.reduce((s, c) => s + c.spentMinor, 0);
  const discretionaryLabel =
    discretionary.length > 0 ? discretionary.map((c) => c.name.toLowerCase()).slice(0, 2).join(' et ') : 'vos dépenses variables';

  const fixedCostsMinor = monthlyFixedCosts(data.recurring);
  const goal = selectNetWorthGoal(data);

  const insights = buildInsights({
    currency: base,
    incomeMinor: cf.incomeMinor,
    expenseMinor: cf.expenseMinor,
    netMinor: cf.netMinor,
    fixedCostsMinor,
    liquidityMinor: nw.liquidityMinor,
    topCategories: topExpenses,
    prevByCategory: spentPrev,
    overBudget: budgets.filter((b) => b.isOver).map((b) => ({ name: b.categoryName, overMinor: b.spentMinor - b.limitMinor })),
    discretionaryMinor,
    discretionaryLabel,
    goal: goal ? { targetMinor: goal.targetMinor, currentMinor: goal.currentMinor } : null,
  });

  const health = computeHealth({
    incomeMinor: cf.incomeMinor,
    expenseMinor: cf.expenseMinor,
    netMinor: cf.netMinor,
    fixedCostsMinor,
    liquidityMinor: nw.liquidityMinor,
  });

  return { health, insights, topExpenses, fixedCostsMinor };
}

/** Progress toward the optional net-worth objective, or null when unset. */
export function selectNetWorthGoal(data: AppData): NetWorthGoal | null {
  const target = data.preferences.netWorthTargetMinor ?? 0;
  if (target <= 0) return null;
  const current = selectNetWorth(data).netWorthMinor;
  return {
    targetMinor: target,
    currentMinor: current,
    remainingMinor: Math.max(0, target - current),
    ratio: target === 0 ? 0 : current / target,
  };
}

// --- Activity timeline ----------------------------------------------------

export type ActivityKind = 'transaction' | 'valuation' | 'note';

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  title: string;
  subtitle: string;
  amountMinor?: number;
  currency?: string;
  direction: 1 | -1 | 0;
  occurredAt: string;
  accountId?: string;
  categoryId?: string;
  transactionType?: Transaction['type'];
};

const TX_LABELS: Record<Transaction['type'], string> = {
  buy: 'Achat',
  sell: 'Vente',
  deposit: 'Dépôt',
  withdrawal: 'Retrait',
  dividend: 'Dividende',
  interest: 'Intérêts',
  fee: 'Frais',
  transfer: 'Transfert',
  income: 'Revenu',
  expense: 'Dépense',
  adjustment: 'Ajustement',
};

const INFLOW_TYPES: Transaction['type'][] = ['income', 'dividend', 'interest', 'deposit', 'sell'];
const OUTFLOW_TYPES: Transaction['type'][] = ['expense', 'fee', 'withdrawal', 'buy'];

export function selectActivity(data: AppData): ActivityItem[] {
  const items: ActivityItem[] = data.transactions.map((tx) => {
    const account = data.accounts.find((a) => a.id === tx.accountId);
    const category = data.categories.find((c) => c.id === tx.categoryId);
    const direction: 1 | -1 | 0 = INFLOW_TYPES.includes(tx.type)
      ? 1
      : OUTFLOW_TYPES.includes(tx.type)
        ? -1
        : 0;
    return {
      id: tx.id,
      kind: 'transaction',
      title: tx.note || TX_LABELS[tx.type],
      subtitle: [TX_LABELS[tx.type], category?.name, account?.name].filter(Boolean).join(' · '),
      amountMinor: tx.amountMinor,
      currency: tx.currency,
      direction,
      occurredAt: tx.occurredAt,
      accountId: tx.accountId,
      categoryId: tx.categoryId,
      transactionType: tx.type,
    };
  });

  return items.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

// --- Assistant ------------------------------------------------------------

export function selectAssistantContext(data: AppData): AssistantContext {
  const nw = selectNetWorth(data);
  const cash = selectCashFlow(data);
  const summary = selectPortfolioSummary(data);
  return {
    baseCurrency: data.preferences.baseCurrency,
    netWorthMinor: nw.netWorthMinor,
    assetsMinor: nw.assetsMinor,
    liabilitiesMinor: nw.liabilitiesMinor,
    liquidityMinor: nw.liquidityMinor,
    monthlyNetMinor: cash.netMinor,
    monthlyIncomeMinor: cash.incomeMinor,
    monthlyExpenseMinor: cash.expenseMinor,
    allocation: selectAllocation(data),
    budgets: selectBudgetProgress(data),
    portfolioGainRatio: summary.totalGainRatio,
  };
}

// --- Cockpit priority alerts ---------------------------------------------

export type PriorityAlert = {
  id: string;
  tone: 'positive' | 'warning' | 'info';
  title: string;
  body: string;
};

export function selectPriorityAlerts(data: AppData): PriorityAlert[] {
  const alerts: PriorityAlert[] = [];
  const budgets = selectBudgetProgress(data);
  const over = budgets.filter((b) => b.isOver);
  if (over.length > 0) {
    alerts.push({
      id: 'budget-over',
      tone: 'warning',
      title: `${over.length} budget${over.length > 1 ? 's' : ''} dépassé${over.length > 1 ? 's' : ''}`,
      body: over.map((b) => b.categoryName).join(', '),
    });
  }
  const allocation = selectAllocation(data);
  const top = allocation[0];
  if (top && top.ratio >= 0.4) {
    alerts.push({
      id: 'concentration',
      tone: 'info',
      title: 'Concentration à surveiller',
      body: `${top.label} représente une part importante de votre portefeuille.`,
    });
  }
  const cash = selectCashFlow(data);
  if (cash.netMinor < 0) {
    alerts.push({
      id: 'cashflow-negative',
      tone: 'warning',
      title: 'Cash-flow négatif ce mois',
      body: 'Vos dépenses dépassent vos revenus sur la période.',
    });
  }
  return alerts;
}
