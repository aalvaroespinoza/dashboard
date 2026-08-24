import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  CircleDollarSign,
  TrendingUp,
} from 'lucide-react-native';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useAppStore } from '../../store/useAppStore';
import { FinanceMetricCards } from './components/FinanceMetricCards';
import { FinanceChartAnimated } from './components/FinanceChartAnimated';
import { CategoryBreakdownList, CategoryItem } from './components/CategoryBreakdownList';
import { TransactionModal } from './components/TransactionModal';
import { IOS_COLORS } from '../../styles/theme';

export const FinancesScreen: React.FC = () => {
  const { themeMode } = useAppStore();
  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const {
    categories,
    transactions,
    selectedMonth,
    summary,
    loadFinanceData,
    prevMonth,
    nextMonth,
    addTransaction,
  } = useFinanceStore();

  useEffect(() => {
    loadFinanceData();
  }, [selectedMonth]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formato del mes visible: "Mayo 2025"
  const formattedMonthLabel = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, (month || 1) - 1, 1);
    const monthStr = date.toLocaleDateString('es-ES', { month: 'long' });
    const capitalized = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
    return `${capitalized} ${year}`;
  }, [selectedMonth]);

  // Transformar desglose de categorías
  const categoryItems: CategoryItem[] = useMemo(() => {
    if (summary && summary.categoryBreakdown && summary.categoryBreakdown.length > 0) {
      return summary.categoryBreakdown.map((b) => ({
        id: b.categoryId,
        name: b.name,
        amount: b.total,
        percentage: b.percentage,
        color: b.color || IOS_COLORS.blue,
        iconName: b.icon,
      }));
    }
    // Fallback de demostración con estilo idéntico a las capturas de MiHub
    return [
      { id: 'cat-1', name: 'Vivienda', amount: 450000, percentage: 40, color: IOS_COLORS.orange, iconName: 'home' },
      { id: 'cat-2', name: 'Transporte', amount: 200000, percentage: 18, color: IOS_COLORS.cyan, iconName: 'bus' },
      { id: 'cat-3', name: 'Comida', amount: 180000, percentage: 16, color: IOS_COLORS.yellow, iconName: 'food' },
      { id: 'cat-4', name: 'Entretenimiento', amount: 120000, percentage: 11, color: IOS_COLORS.red, iconName: 'film' },
      { id: 'cat-5', name: 'Otros', amount: 70000, percentage: 6, color: theme.text.tertiary, iconName: 'tag' },
    ];
  }, [summary, theme.text.tertiary]);

  const income = summary?.totalIncome || 1850000;
  const expense = summary?.totalExpense || 1120000;
  const savings = summary?.balance || income - expense;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: 24, gap: 20 }}
    >
      {/* 1. Header con Selector de Mes y Botón Nuevo */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Dropdown / Selector de Mes: Mayo 2025 v */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.card,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.5 }}>
              {formattedMonthLabel}
            </Text>
            <ChevronDown size={18} color={theme.text.secondary} />
          </View>

          {/* Flechas de Navegación de Mes */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Pressable
              onPress={prevMonth}
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeft size={16} color={theme.text.primary} />
            </Pressable>

            <Pressable
              onPress={nextMonth}
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronRight size={16} color={theme.text.primary} />
            </Pressable>
          </View>
        </View>

        {/* Botón + Nuevo Movimiento */}
        <Pressable
          onPress={() => setIsModalOpen(true)}
          style={({ pressed }) => ({
            opacity: pressed ? 0.85 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: IOS_COLORS.blue,
            paddingVertical: 9,
            paddingHorizontal: 16,
            borderRadius: 12,
            gap: 6,
            shadowColor: IOS_COLORS.blue,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          })}
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>
            Nuevo
          </Text>
        </Pressable>
      </View>

      {/* 2. Tarjetas de Métricas de Resumen (Ingresos, Gastos, Ahorro) */}
      <FinanceMetricCards
        income={income}
        expense={expense}
        savings={savings}
        isDark={isDark}
      />

      {/* 3. Gráfico de Evolución Spline Animado con Tooltip ("Resumen") */}
      <FinanceChartAnimated monthKey={selectedMonth} isDark={isDark} />

      {/* 4. Lista de Desglose por Categorías */}
      <CategoryBreakdownList
        categories={categoryItems}
        isDark={isDark}
      />

      {/* Modal para Registrar Transacción */}
      <TransactionModal
        visible={isModalOpen}
        categories={categories}
        onClose={() => setIsModalOpen(false)}
        onSave={async (tx) => {
          await addTransaction(tx);
        }}
        isDark={isDark}
      />
    </ScrollView>
  );
};
