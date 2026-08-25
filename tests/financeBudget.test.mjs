/**
 * Suite de pruebas unitarias para Presupuestos Mensuales por Categoría (Finanzas v2)
 * Ejecutable vía: node --test tests/financeBudget.test.mjs
 */

import assert from 'node:assert/strict';
import test from 'node:test';

function calculateCategoryBudgetMetrics(spentAmount, budgetLimit) {
  if (!budgetLimit || budgetLimit <= 0) {
    return {
      hasBudget: false,
      percentage: 0,
      remaining: 0,
      isOverBudget: false,
      excess: 0,
    };
  }

  const percentage = Math.round((spentAmount / budgetLimit) * 100);
  const remaining = budgetLimit - spentAmount;
  const isOverBudget = spentAmount > budgetLimit;
  const excess = isOverBudget ? spentAmount - budgetLimit : 0;

  return {
    hasBudget: true,
    percentage,
    remaining,
    isOverBudget,
    excess,
  };
}

function calculateGlobalBudgetMetrics(categoriesWithBudgets) {
  let totalBudget = 0;
  let totalSpent = 0;

  for (const cat of categoriesWithBudgets) {
    if (cat.budgetLimit && cat.budgetLimit > 0) {
      totalBudget += cat.budgetLimit;
    }
    totalSpent += cat.amount || 0;
  }

  const spentPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const isOverBudget = totalSpent > totalBudget;

  return {
    totalBudget,
    totalSpent,
    spentPercentage,
    isOverBudget,
  };
}

function resolveBudgetWithInheritance(categoryId, targetMonth, budgetsHistory, categoryDefaultLimit) {
  // 1. Verificar si hay presupuesto explícito para el mes
  const directBudget = budgetsHistory.find((b) => b.categoryId === categoryId && b.month === targetMonth);
  if (directBudget && directBudget.amountLimit > 0) {
    return directBudget.amountLimit;
  }

  // 2. Buscar el presupuesto anterior más reciente
  const pastBudgets = budgetsHistory
    .filter((b) => b.categoryId === categoryId && b.month < targetMonth)
    .sort((a, b) => b.month.localeCompare(a.month));

  if (pastBudgets.length > 0 && pastBudgets[0].amountLimit > 0) {
    return pastBudgets[0].amountLimit;
  }

  // 3. Fallback al límite por defecto de la categoría
  return categoryDefaultLimit || null;
}

test('1. Cálculo de métricas y porcentajes de presupuesto por categoría', () => {
  // Caso A: Gasto por debajo del límite (60%)
  const metricsA = calculateCategoryBudgetMetrics(60000, 100000);
  assert.equal(metricsA.hasBudget, true);
  assert.equal(metricsA.percentage, 60);
  assert.equal(metricsA.remaining, 40000);
  assert.equal(metricsA.isOverBudget, false);

  // Caso B: Gasto exacto al límite (100%)
  const metricsB = calculateCategoryBudgetMetrics(150000, 150000);
  assert.equal(metricsB.percentage, 100);
  assert.equal(metricsB.remaining, 0);
  assert.equal(metricsB.isOverBudget, false);
});

test('2. Detección de sobrepaso y cálculo de exceso de presupuesto', () => {
  // Caso: Límite de $80.000 y gasto de $105.000 (131% consumido, $25.000 excedido)
  const metrics = calculateCategoryBudgetMetrics(105000, 80000);
  assert.equal(metrics.hasBudget, true);
  assert.equal(metrics.percentage, 131);
  assert.equal(metrics.remaining, -25000);
  assert.equal(metrics.isOverBudget, true);
  assert.equal(metrics.excess, 25000);
});

test('3. Cálculo de presupuesto mensual total y porcentaje de consumo global', () => {
  const categories = [
    { name: 'Vivienda', amount: 350000, budgetLimit: 400000 },
    { name: 'Comida', amount: 160000, budgetLimit: 150000 }, // Excedido
    { name: 'Transporte', amount: 80000, budgetLimit: 100000 },
    { name: 'Ocio', amount: 50000, budgetLimit: null }, // Sin presupuesto
  ];

  const global = calculateGlobalBudgetMetrics(categories);
  assert.equal(global.totalBudget, 650000); // 400k + 150k + 100k
  assert.equal(global.totalSpent, 640000); // 350k + 160k + 80k + 50k
  assert.equal(global.spentPercentage, 98); // 640k / 650k = 98.46% -> 98%
  assert.equal(global.isOverBudget, false);
});

test('4. Herencia automática de presupuestos entre meses consecutivos', () => {
  const history = [
    { categoryId: 'cat-comida', month: '2026-06', amountLimit: 120000 },
    { categoryId: 'cat-comida', month: '2026-07', amountLimit: 140000 },
    { categoryId: 'cat-transporte', month: '2026-05', amountLimit: 60000 },
  ];

  // Agosto 2026 para Comida debe heredar Julio 2026 ($140.000)
  const budgetAgostoComida = resolveBudgetWithInheritance('cat-comida', '2026-08', history, null);
  assert.equal(budgetAgostoComida, 140000);

  // Agosto 2026 para Transporte debe heredar Mayo 2026 ($60.000)
  const budgetAgostoTransp = resolveBudgetWithInheritance('cat-transporte', '2026-08', history, null);
  assert.equal(budgetAgostoTransp, 60000);

  // Categoría sin historial debe usar default
  const budgetDefault = resolveBudgetWithInheritance('cat-nueva', '2026-08', history, 50000);
  assert.equal(budgetDefault, 50000);
});
