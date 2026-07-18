import React, { createContext, useContext, useMemo, useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, QuickAction } from '@/components';
import { t } from '@/i18n';
import { AccountForm } from './AccountForm';
import { BudgetForm } from './BudgetForm';
import { LiabilityForm } from './LiabilityForm';
import { PositionForm } from './PositionForm';
import { TransactionForm } from './TransactionForm';

type FormKey = 'menu' | 'account' | 'position' | 'income' | 'expense' | 'liability' | 'budget';

type QuickAddContextValue = {
  /** Open the quick-add menu, or jump straight to a specific form. */
  open: (key?: FormKey) => void;
};

const QuickAddContext = createContext<QuickAddContextValue>({ open: () => {} });

export function useQuickAdd() {
  return useContext(QuickAddContext);
}

export function QuickAddProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<FormKey | null>(null);

  const value = useMemo<QuickAddContextValue>(
    () => ({ open: (key = 'menu') => setActive(key) }),
    [],
  );

  const close = () => setActive(null);

  return (
    <QuickAddContext.Provider value={value}>
      {children}

      <BottomSheet visible={active === 'menu'} onClose={close} title={t.quickAdd.title} scroll={false}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <QuickAction icon="wealth" label={t.quickAdd.account} onPress={() => setActive('account')} />
          <QuickAction icon="portfolio" label={t.quickAdd.position} onPress={() => setActive('position')} />
          <QuickAction icon="arrowDown" label={t.quickAdd.expense} onPress={() => setActive('expense')} />
          <QuickAction icon="arrowUp" label={t.quickAdd.income} onPress={() => setActive('income')} />
          <QuickAction icon="budget" label={t.budget.addBudget} onPress={() => setActive('budget')} />
          <QuickAction icon="shield" label={t.quickAdd.liability} onPress={() => setActive('liability')} />
        </View>
      </BottomSheet>

      <AccountForm visible={active === 'account'} onClose={close} />
      <PositionForm visible={active === 'position'} onClose={close} />
      <TransactionForm visible={active === 'income'} onClose={close} initialKind="income" />
      <TransactionForm visible={active === 'expense'} onClose={close} initialKind="expense" />
      <LiabilityForm visible={active === 'liability'} onClose={close} />
      <BudgetForm visible={active === 'budget'} onClose={close} />
    </QuickAddContext.Provider>
  );
}
