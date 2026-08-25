import { create } from 'zustand';
import {
  FinanceCategory,
  FinanceTransaction,
  FinanceAccount,
  TransactionType,
  PaymentMethod,
  AccountType,
} from '../types';
import { financeRepo } from '../db/repositories/financeRepo';
import { accountsRepo } from '../db/repositories/accountsRepo';

interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  totalBudget: number;
  totalBudgetSpentPercentage: number;
  categoryBreakdown: {
    categoryId: string;
    name: string;
    icon: string;
    color: string;
    total: number;
    percentage: number;
    budgetLimit: number | null;
    budgetSpentPercentage: number | null;
    remainingBudget: number | null;
    isOverBudget: boolean;
  }[];
}

interface FinanceState {
  accounts: FinanceAccount[];
  selectedAccountId: string | null; // null = Todas las cuentas
  categories: FinanceCategory[];
  transactions: FinanceTransaction[];
  recurringPayments: FinanceTransaction[];
  selectedMonth: string; // YYYY-MM
  budgets: Record<string, number>; // categoryId -> amount_limit
  summary: FinanceSummary;
  totalNetWorth: number;
  isLoading: boolean;

  loadFinanceData: () => Promise<void>;
  loadAccounts: () => Promise<void>;
  setSelectedAccountId: (id: string | null) => void;
  setSelectedMonth: (yearMonth: string) => Promise<void>;
  prevMonth: () => Promise<void>;
  nextMonth: () => Promise<void>;

  setCategoryBudget: (categoryId: string, amountLimit: number) => Promise<void>;
  deleteCategoryBudget: (categoryId: string) => Promise<void>;

  addAccount: (acc: {
    name: string;
    type: AccountType;
    color: string;
    icon: string;
    initial_balance: number;
  }) => Promise<FinanceAccount>;

  updateAccount: (id: string, updates: Partial<FinanceAccount>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  addTransaction: (tx: {
    category_id: string;
    account_id?: string | null;
    type: TransactionType;
    amount: number;
    description: string;
    payment_method: PaymentMethod;
    transaction_date: string;
    installments?: number;
    installment_current?: number;
    is_recurring?: number;
    recurring_day?: number | null;
    next_due_date?: string | null;
    notes?: string | null;
  }) => Promise<FinanceTransaction>;

  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (cat: Omit<FinanceCategory, 'id'>) => Promise<FinanceCategory>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  accounts: [],
  selectedAccountId: null,
  categories: [],
  transactions: [],
  recurringPayments: [],
  selectedMonth: new Date().toISOString().substring(0, 7),
  budgets: {},
  summary: {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    savingsRate: 0,
    totalBudget: 0,
    totalBudgetSpentPercentage: 0,
    categoryBreakdown: [],
  },
  totalNetWorth: 0,
  isLoading: false,

  loadAccounts: async () => {
    try {
      const accounts = await accountsRepo.getAll();
      const totalNetWorth = accounts.reduce((acc, a) => acc + (a.current_balance || 0), 0);
      set({ accounts, totalNetWorth });
    } catch (e) {
      console.error('Error cargando cuentas:', e);
    }
  },

  setSelectedAccountId: (id) => {
    set({ selectedAccountId: id });
  },

  loadFinanceData: async () => {
    set({ isLoading: true });
    try {
      const month = get().selectedMonth;
      const [categories, transactions, summary, accounts, recurring, budgets] = await Promise.all([
        financeRepo.getCategories(),
        financeRepo.getTransactionsByMonth(month),
        financeRepo.getMonthlySummary(month),
        accountsRepo.getAll(),
        financeRepo.getRecurringPayments(),
        financeRepo.getBudgetsForMonth(month),
      ]);

      const totalNetWorth = accounts.reduce((acc, a) => acc + (a.current_balance || 0), 0);

      set({
        categories,
        transactions,
        summary,
        accounts,
        recurringPayments: recurring,
        budgets,
        totalNetWorth,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  setSelectedMonth: async (yearMonth: string) => {
    set({ selectedMonth: yearMonth, isLoading: true });
    try {
      const [transactions, summary, budgets] = await Promise.all([
        financeRepo.getTransactionsByMonth(yearMonth),
        financeRepo.getMonthlySummary(yearMonth),
        financeRepo.getBudgetsForMonth(yearMonth),
      ]);
      set({ transactions, summary, budgets, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setCategoryBudget: async (categoryId: string, amountLimit: number) => {
    const month = get().selectedMonth;
    await financeRepo.setCategoryBudget(categoryId, month, amountLimit);
    await get().loadFinanceData();
  },

  deleteCategoryBudget: async (categoryId: string) => {
    const month = get().selectedMonth;
    await financeRepo.deleteCategoryBudget(categoryId, month);
    await get().loadFinanceData();
  },

  prevMonth: async () => {
    const [year, month] = get().selectedMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const newMonthStr = prevDate.toISOString().substring(0, 7);
    await get().setSelectedMonth(newMonthStr);
  },

  nextMonth: async () => {
    const [year, month] = get().selectedMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    const newMonthStr = nextDate.toISOString().substring(0, 7);
    await get().setSelectedMonth(newMonthStr);
  },

  addAccount: async (data) => {
    const newAcc: Omit<FinanceAccount, 'created_at'> = {
      id: `acc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: data.name.trim(),
      type: data.type,
      color: data.color,
      icon: data.icon || '💳',
      initial_balance: Number(data.initial_balance) || 0,
      position: get().accounts.length,
    };
    const created = await accountsRepo.create(newAcc);
    await get().loadFinanceData();
    return created;
  },

  updateAccount: async (id, updates) => {
    await accountsRepo.update(id, updates);
    await get().loadFinanceData();
  },

  deleteAccount: async (id) => {
    await accountsRepo.delete(id);
    if (get().selectedAccountId === id) {
      set({ selectedAccountId: null });
    }
    await get().loadFinanceData();
  },

  addTransaction: async (data) => {
    const newTx: FinanceTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      category_id: data.category_id,
      account_id: data.account_id || null,
      type: data.type,
      amount: Number(data.amount),
      description: data.description.trim(),
      payment_method: data.payment_method,
      transaction_date: data.transaction_date,
      installments: data.installments || 1,
      installment_current: data.installment_current || 1,
      is_recurring: data.is_recurring ? 1 : 0,
      recurring_day: data.recurring_day || null,
      next_due_date: data.next_due_date || null,
      notes: data.notes?.trim() || null,
      created_at: new Date().toISOString(),
    };

    const created = await financeRepo.createTransaction(newTx);
    await get().loadFinanceData();
    return created;
  },

  deleteTransaction: async (id) => {
    await financeRepo.deleteTransaction(id);
    await get().loadFinanceData();
  },

  addCategory: async (catData) => {
    const newCat: FinanceCategory = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ...catData,
    };
    const created = await financeRepo.createCategory(newCat);
    set((state) => ({ categories: [...state.categories, created] }));
    return created;
  },
}));
