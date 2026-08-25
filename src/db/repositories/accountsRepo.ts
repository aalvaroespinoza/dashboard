/**
 * accountsRepo.ts
 * Repositorio de Cuentas Financieras (Efectivo, Débito, Crédito, Mercado Pago, etc.)
 */
import { getDatabase } from '../database';
import { FinanceAccount } from '../../types';

const DEFAULT_ACCOUNTS: Omit<FinanceAccount, 'created_at'>[] = [
  { id: 'acc-cash', name: 'Efectivo', type: 'cash', color: '#34C759', icon: '💵', initial_balance: 0, position: 0 },
  { id: 'acc-galicia', name: 'Débito Galicia', type: 'debit', color: '#007AFF', icon: '💳', initial_balance: 0, position: 1 },
  { id: 'acc-mp', name: 'Mercado Pago', type: 'savings', color: '#32ADE6', icon: '📱', initial_balance: 0, position: 2 },
  { id: 'acc-visa', name: 'Crédito Visa', type: 'credit', color: '#FF9500', icon: '💳', initial_balance: 0, position: 3 },
];

export const accountsRepo = {
  async getAll(): Promise<FinanceAccount[]> {
    const db = await getDatabase();
    if (!db) return [];

    let rows = await db.getAllAsync<FinanceAccount>(
      'SELECT * FROM accounts ORDER BY position ASC, created_at ASC'
    );

    if (rows.length === 0) {
      // Seed default accounts
      const now = new Date().toISOString();
      for (const acc of DEFAULT_ACCOUNTS) {
        await db.runAsync(
          `INSERT INTO accounts (id, name, type, color, icon, initial_balance, position, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [acc.id, acc.name, acc.type, acc.color, acc.icon, acc.initial_balance, acc.position, now]
        );
      }
      rows = await db.getAllAsync<FinanceAccount>(
        'SELECT * FROM accounts ORDER BY position ASC, created_at ASC'
      );
    }

    // Calcular balances reales sumando transacciones
    const enrichedAccounts: FinanceAccount[] = [];
    for (const acc of rows) {
      const summary = await db.getFirstAsync<{ income: number; expense: number }>(
        `SELECT
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
         FROM transactions WHERE account_id = ?`,
        [acc.id]
      );

      const income = summary?.income || 0;
      const expense = summary?.expense || 0;
      const current_balance = (acc.initial_balance || 0) + income - expense;

      enrichedAccounts.push({
        ...acc,
        current_balance,
      });
    }

    return enrichedAccounts;
  },

  async getById(id: string): Promise<FinanceAccount | null> {
    const db = await getDatabase();
    if (!db) return null;
    const row = await db.getFirstAsync<FinanceAccount>('SELECT * FROM accounts WHERE id = ?', [id]);
    return row || null;
  },

  async create(account: Omit<FinanceAccount, 'created_at'>): Promise<FinanceAccount> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const newAcc: FinanceAccount = {
      ...account,
      created_at: now,
      current_balance: account.initial_balance,
    };

    await db.runAsync(
      `INSERT INTO accounts (id, name, type, color, icon, initial_balance, position, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newAcc.id, newAcc.name, newAcc.type, newAcc.color, newAcc.icon, newAcc.initial_balance, newAcc.position || 0, now]
    );

    return newAcc;
  },

  async update(id: string, updates: Partial<FinanceAccount>): Promise<void> {
    const db = await getDatabase();
    if (!db) return;

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name.trim());
    }
    if (updates.type !== undefined) {
      fields.push('type = ?');
      values.push(updates.type);
    }
    if (updates.color !== undefined) {
      fields.push('color = ?');
      values.push(updates.color);
    }
    if (updates.icon !== undefined) {
      fields.push('icon = ?');
      values.push(updates.icon);
    }
    if (updates.initial_balance !== undefined) {
      fields.push('initial_balance = ?');
      values.push(updates.initial_balance);
    }
    if (updates.position !== undefined) {
      fields.push('position = ?');
      values.push(updates.position);
    }

    if (fields.length > 0) {
      values.push(id);
      await db.runAsync(`UPDATE accounts SET ${fields.join(', ')} WHERE id = ?`, values);
    }
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    if (!db) return;
    // Set account_id to null on associated transactions
    await db.runAsync('UPDATE transactions SET account_id = NULL WHERE account_id = ?', [id]);
    await db.runAsync('DELETE FROM accounts WHERE id = ?', [id]);
  },
};
