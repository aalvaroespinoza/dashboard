import { create } from 'zustand';
import { FinanceCategory, FinanceTransaction, TransactionType, PaymentMethod } from '../types';
import { financeRepo } from '../db/repositories/financeRepo';

interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  categoryBreakdown: {
    categoryId: string;
    name: string;
    icon: string;
    color: string;
    total: number;
    percentage: number;
  }[];
}

interface FinanceState {
  categories: FinanceCategory[];
  transactions: FinanceTransaction[];
  selectedMonth: string; // YYYY-MM
  summary: FinanceSummary;
  isLoading: boolean;

  loadFinanceData: () => Promise<void>;
  setSelectedMonth: (yearMonth: string) => Promise<void>;
  prevMonth: () => Promise<void>;
  nextMonth: () => Promise<void>;

  addTransaction: (tx: {
    category_id: string;
    type: TransactionType;
    amount: number;
    description: string;
    payment_method: PaymentMethod;
    transaction_date: string;
  }) => Promise<FinanceTransaction>;

  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (cat: Omit<FinanceCategory, 'id'>) => Promise<FinanceCategory>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  categories: [],
  transactions: [],
  selectedMonth: new Date().toISOString().substring(0, 7),
  summary: {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    savingsRate: 0,
    categoryBreakdown: [],
  },
  isLoading: false,

  loadFinanceData: async () => {
    set({ isLoading: true });
    try {
      const month = get().selectedMonth;
      const [categories, transactions, summary] = await Promise.all([
        financeRepo.getCategories(),
        financeRepo.getTransactionsByMonth(month),
        financeRepo.getMonthlySummary(month),
      ]);
      set({ categories, transactions, summary, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setSelectedMonth: async (yearMonth: string) => {
    set({ selectedMonth: yearMonth, isLoading: true });
    try {
      const [transactions, summary] = await Promise.all([
        financeRepo.getTransactionsByMonth(yearMonth),
        financeRepo.getMonthlySummary(yearMonth),
      ]);
      set({ transactions, summary, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
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

  addTransaction: async (data) => {
    const newTx: FinanceTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      category_id: data.category_id,
      type: data.type,
      amount: Number(data.amount),
      description: data.description.trim(),
      payment_method: data.payment_method,
      transaction_date: data.transaction_date,
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
