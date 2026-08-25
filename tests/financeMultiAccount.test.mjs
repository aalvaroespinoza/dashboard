/**
 * Suite de pruebas unitarias para Finanzas v2 (Multi-Cuenta, Cuotas y Recurrentes)
 * Ejecutable vía: node --test tests/financeMultiAccount.test.mjs
 */

import assert from 'node:assert/strict';
import test from 'node:test';

function calculateAccountBalance(initialBalance, transactions, accountId) {
  const accountTxs = transactions.filter((t) => t.account_id === accountId);
  const income = accountTxs
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  const expense = accountTxs
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  return initialBalance + income - expense;
}

function calculateTotalNetWorth(accounts) {
  return accounts.reduce((sum, a) => sum + (a.current_balance || 0), 0);
}

function filterRecurringOrInstallments(transactions) {
  return transactions.filter(
    (t) => t.is_recurring === 1 || (t.installments && t.installments > 1)
  );
}

test('1. Cálculo de balance por cuenta individual', () => {
  const txs = [
    { id: '1', account_id: 'acc-cash', type: 'income', amount: 50000 },
    { id: '2', account_id: 'acc-cash', type: 'expense', amount: 15000 },
    { id: '3', account_id: 'acc-galicia', type: 'income', amount: 300000 },
    { id: '4', account_id: 'acc-galicia', type: 'expense', amount: 80000 },
  ];

  const cashBal = calculateAccountBalance(10000, txs, 'acc-cash');
  const galiciaBal = calculateAccountBalance(0, txs, 'acc-galicia');

  assert.equal(cashBal, 45000); // 10000 + 50000 - 15000
  assert.equal(galiciaBal, 220000); // 0 + 300000 - 80000
});

test('2. Cálculo de patrimonio neto total multicuenta', () => {
  const accounts = [
    { id: 'acc-cash', current_balance: 45000 },
    { id: 'acc-galicia', current_balance: 220000 },
    { id: 'acc-mp', current_balance: 150000 },
    { id: 'acc-visa', current_balance: -30000 }, // Deuda en tarjeta
  ];

  const netWorth = calculateTotalNetWorth(accounts);
  assert.equal(netWorth, 385000);
});

test('3. Filtrado de gastos recurrentes y compras en cuotas', () => {
  const txs = [
    { id: '1', description: 'Supermercado', amount: 45000, is_recurring: 0, installments: 1 },
    { id: '2', description: 'Spotify Familiar', amount: 4200, is_recurring: 1, recurring_day: 10 },
    { id: '3', description: 'Notebook UTN', amount: 120000, is_recurring: 0, installments: 6, installment_current: 2 },
  ];

  const recurring = filterRecurringOrInstallments(txs);
  assert.equal(recurring.length, 2);
  assert.equal(recurring[0].description, 'Spotify Familiar');
  assert.equal(recurring[1].description, 'Notebook UTN');
});
