import { getDatabase } from '../database';
import { FinanceCategory, FinanceTransaction, TransactionType, PaymentMethod } from '../../types';

interface TransactionJoinedRow {
  id: string;
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  type: TransactionType;
  amount: number;
  description: string;
  payment_method: PaymentMethod;
  transaction_date: string;
  created_at: string;
}

export const financeRepo = {
  // Categorías
  async getCategories(): Promise<FinanceCategory[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<FinanceCategory>('SELECT * FROM categories ORDER BY name ASC');
    return rows;
  },

  async getCategoryById(id: string): Promise<FinanceCategory | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<FinanceCategory>('SELECT * FROM categories WHERE id = ?', [id]);
    return row || null;
  },

  async createCategory(cat: FinanceCategory): Promise<FinanceCategory> {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT INTO categories (id, name, type, icon, color, budget_limit) VALUES (?, ?, ?, ?, ?, ?)',
      [cat.id, cat.name, cat.type, cat.icon, cat.color, cat.budget_limit || null]
    );
    return cat;
  },

  // Transacciones
  async getTransactions(limit: number = 100): Promise<FinanceTransaction[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<TransactionJoinedRow>(
      `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       ORDER BY t.transaction_date DESC, t.created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },

  async getTransactionsByMonth(yearMonth: string): Promise<FinanceTransaction[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<TransactionJoinedRow>(
      `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.transaction_date LIKE ?
       ORDER BY t.transaction_date DESC, t.created_at DESC`,
      [`${yearMonth}%`]
    );
    return rows;
  },

  async createTransaction(tx: FinanceTransaction): Promise<FinanceTransaction> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO transactions (id, category_id, type, amount, description, payment_method, transaction_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tx.id,
        tx.category_id,
        tx.type,
        tx.amount,
        tx.description,
        tx.payment_method || 'debit',
        tx.transaction_date,
        tx.created_at || new Date().toISOString(),
      ]
    );
    return tx;
  },

  async deleteTransaction(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
  },

  async getMonthlySummary(yearMonth: string): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
    savingsRate: number;
    categoryBreakdown: { categoryId: string; name: string; icon: string; color: string; total: number; percentage: number }[];
  }> {
    const transactions = await this.getTransactionsByMonth(yearMonth);
    let totalIncome = 0;
    let totalExpense = 0;
    const catMap: { [catId: string]: { name: string; icon: string; color: string; total: number } } = {};

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

    const categoryBreakdown = Object.keys(catMap).map(cId => {
      const item = catMap[cId];
      return {
        categoryId: cId,
        name: item.name,
        icon: item.icon,
        color: item.color,
        total: item.total,
        percentage: totalExpense > 0 ? (item.total / totalExpense) * 100 : 0,
      };
    }).sort((a, b) => b.total - a.total);

    return {
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      categoryBreakdown,
    };
  },
};
