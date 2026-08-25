import { getDatabase } from '../database';
import { FinanceCategory, FinanceTransaction, TransactionType, PaymentMethod } from '../../types';

interface TransactionJoinedRow {
  id: string;
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  account_id?: string | null;
  account_name?: string | null;
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
  created_at: string;
}

export const financeRepo = {
  // Categorías
  async getCategories(): Promise<FinanceCategory[]> {
    const db = await getDatabase();
    if (!db) return [];
    const rows = await db.getAllAsync<FinanceCategory>('SELECT * FROM categories ORDER BY name ASC');
    return rows;
  },

  async getCategoryById(id: string): Promise<FinanceCategory | null> {
    const db = await getDatabase();
    if (!db) return null;
    const row = await db.getFirstAsync<FinanceCategory>('SELECT * FROM categories WHERE id = ?', [id]);
    return row || null;
  },

  async createCategory(cat: FinanceCategory): Promise<FinanceCategory> {
    const db = await getDatabase();
    if (!db) return cat;
    await db.runAsync(
      'INSERT INTO categories (id, name, type, icon, color, budget_limit) VALUES (?, ?, ?, ?, ?, ?)',
      [cat.id, cat.name, cat.type, cat.icon, cat.color, cat.budget_limit || null]
    );
    return cat;
  },

  // Transacciones
  async getTransactions(limit: number = 100): Promise<FinanceTransaction[]> {
    const db = await getDatabase();
    if (!db) return [];
    const rows = await db.getAllAsync<TransactionJoinedRow>(
      `SELECT t.*,
              c.name as category_name, c.icon as category_icon, c.color as category_color,
              a.name as account_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN accounts a ON t.account_id = a.id
       ORDER BY t.transaction_date DESC, t.created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows.map((r) => ({
      ...r,
      account_id: r.account_id || null,
      account_name: r.account_name || undefined,
    }));
  },

  async getTransactionsByMonth(yearMonth: string): Promise<FinanceTransaction[]> {
    const db = await getDatabase();
    if (!db) return [];
    const rows = await db.getAllAsync<TransactionJoinedRow>(
      `SELECT t.*,
              c.name as category_name, c.icon as category_icon, c.color as category_color,
              a.name as account_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN accounts a ON t.account_id = a.id
       WHERE t.transaction_date LIKE ?
       ORDER BY t.transaction_date DESC, t.created_at DESC`,
      [`${yearMonth}%`]
    );
    return rows.map((r) => ({
      ...r,
      account_id: r.account_id || null,
      account_name: r.account_name || undefined,
    }));
  },

  async getTransactionsByAccount(accountId: string): Promise<FinanceTransaction[]> {
    const db = await getDatabase();
    if (!db) return [];
    const rows = await db.getAllAsync<TransactionJoinedRow>(
      `SELECT t.*,
              c.name as category_name, c.icon as category_icon, c.color as category_color,
              a.name as account_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN accounts a ON t.account_id = a.id
       WHERE t.account_id = ?
       ORDER BY t.transaction_date DESC, t.created_at DESC`,
      [accountId]
    );
    return rows.map((r) => ({
      ...r,
      account_id: r.account_id || null,
      account_name: r.account_name || undefined,
    }));
  },

  async getRecurringPayments(): Promise<FinanceTransaction[]> {
    const db = await getDatabase();
    if (!db) return [];
    const rows = await db.getAllAsync<TransactionJoinedRow>(
      `SELECT t.*,
              c.name as category_name, c.icon as category_icon, c.color as category_color,
              a.name as account_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN accounts a ON t.account_id = a.id
       WHERE t.is_recurring = 1 OR (t.installments IS NOT NULL AND t.installments > 1)
       ORDER BY t.next_due_date ASC, t.transaction_date DESC`
    );
    return rows.map((r) => ({
      ...r,
      account_id: r.account_id || null,
      account_name: r.account_name || undefined,
    }));
  },

  async createTransaction(tx: FinanceTransaction): Promise<FinanceTransaction> {
    const db = await getDatabase();
    if (!db) return tx;
    await db.runAsync(
      `INSERT INTO transactions (
        id, category_id, account_id, type, amount, description, payment_method,
        transaction_date, installments, installment_current, is_recurring,
        recurring_day, next_due_date, notes, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tx.id,
        tx.category_id,
        tx.account_id || null,
        tx.type,
        tx.amount,
        tx.description,
        tx.payment_method || 'debit',
        tx.transaction_date,
        tx.installments || 1,
        tx.installment_current || 1,
        tx.is_recurring ? 1 : 0,
        tx.recurring_day || null,
        tx.next_due_date || null,
        tx.notes || null,
        tx.created_at || new Date().toISOString(),
      ]
    );
    return tx;
  },

  async deleteTransaction(id: string): Promise<void> {
    const db = await getDatabase();
    if (!db) return;
    await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
  },

  // Presupuestos (Budgets)
  async getBudgetsForMonth(yearMonth: string): Promise<Record<string, number>> {
    const db = await getDatabase();
    if (!db) return {};

    // 1. Obtener presupuestos específicos del mes actual
    const currentRows = await db.getAllAsync<{ category_id: string; amount_limit: number }>(
      'SELECT category_id, amount_limit FROM finance_budgets WHERE month = ?',
      [yearMonth]
    );

    const budgetMap: Record<string, number> = {};
    for (const row of currentRows) {
      budgetMap[row.category_id] = row.amount_limit;
    }

    // 2. Para categorías que aún no tengan presupuesto en este mes, buscar el último histórico o de categories.budget_limit
    const allCategories = await this.getCategories();
    for (const cat of allCategories) {
      if (budgetMap[cat.id] === undefined) {
        // Buscar el último presupuesto registrado antes de este mes
        const lastBudget = await db.getFirstAsync<{ amount_limit: number }>(
          'SELECT amount_limit FROM finance_budgets WHERE category_id = ? AND month < ? ORDER BY month DESC LIMIT 1',
          [cat.id, yearMonth]
        );

        if (lastBudget && lastBudget.amount_limit > 0) {
          budgetMap[cat.id] = lastBudget.amount_limit;
        } else if (cat.budget_limit && cat.budget_limit > 0) {
          budgetMap[cat.id] = cat.budget_limit;
        }
      }
    }

    return budgetMap;
  },

  async setCategoryBudget(categoryId: string, yearMonth: string, amountLimit: number): Promise<void> {
    const db = await getDatabase();
    if (!db) return;

    const id = `budg-${categoryId}-${yearMonth}`;
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO finance_budgets (id, category_id, month, amount_limit, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(category_id, month) DO UPDATE SET amount_limit = excluded.amount_limit, updated_at = excluded.updated_at`,
      [id, categoryId, yearMonth, amountLimit, now, now]
    );

    // Actualizar también el budget_limit base de la categoría
    await db.runAsync('UPDATE categories SET budget_limit = ? WHERE id = ?', [amountLimit, categoryId]);
  },

  async deleteCategoryBudget(categoryId: string, yearMonth: string): Promise<void> {
    const db = await getDatabase();
    if (!db) return;

    await db.runAsync('DELETE FROM finance_budgets WHERE category_id = ? AND month = ?', [categoryId, yearMonth]);
    await db.runAsync('UPDATE categories SET budget_limit = NULL WHERE id = ?', [categoryId]);
  },

  async getMonthlySummary(yearMonth: string): Promise<{
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
  }> {
    const transactions = await this.getTransactionsByMonth(yearMonth);
    const budgetMap = await this.getBudgetsForMonth(yearMonth);
    const allCategories = await this.getCategories();

    let totalIncome = 0;
    let totalExpense = 0;
    const catMap: { [catId: string]: { name: string; icon: string; color: string; total: number } } = {};

    // Inicializar categorías de gasto existentes
    for (const cat of allCategories) {
      if (cat.type === 'expense') {
        catMap[cat.id] = {
          name: cat.name,
          icon: cat.icon || 'tag',
          color: cat.color || '#6366F1',
          total: 0,
        };
      }
    }

    for (const tx of transactions) {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
        const cId = tx.category_id;
        if (!catMap[cId]) {
          catMap[cId] = {
            name: tx.category_name || 'Otros',
            icon: tx.category_icon || 'tag',
            color: tx.category_color || '#6366F1',
            total: 0,
          };
        }
        catMap[cId].total += tx.amount;
      }
    }

    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100) : 0;

    let totalBudget = 0;
    const categoryBreakdown = Object.keys(catMap).map((cId) => {
      const item = catMap[cId];
      const budgetLimit = budgetMap[cId] || null;
      if (budgetLimit && budgetLimit > 0) {
        totalBudget += budgetLimit;
      }

      const budgetSpentPercentage = budgetLimit && budgetLimit > 0 ? (item.total / budgetLimit) * 100 : null;
      const remainingBudget = budgetLimit !== null ? budgetLimit - item.total : null;
      const isOverBudget = budgetLimit !== null && item.total > budgetLimit;

      return {
        categoryId: cId,
        name: item.name,
        icon: item.icon,
        color: item.color,
        total: item.total,
        percentage: totalExpense > 0 ? (item.total / totalExpense) * 100 : 0,
        budgetLimit,
        budgetSpentPercentage,
        remainingBudget,
        isOverBudget,
      };
    }).sort((a, b) => {
      // Priorizar las que tienen gastos mayores o presupuestos asignados
      if (b.total !== a.total) return b.total - a.total;
      return (b.budgetLimit || 0) - (a.budgetLimit || 0);
    });

    const totalBudgetSpentPercentage = totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;

    return {
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      totalBudget,
      totalBudgetSpentPercentage,
      categoryBreakdown,
    };
  },
};
