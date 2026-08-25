/**
 * FinancesScreen.tsx
 * Módulo de Finanzas v2 — Sistema Multi-Cuenta iPadOS 18
 *
 * TODO: MP_SYNC — Próximo sprint:
 * - Integración OAuth con Mercado Pago SDK / Webhook de movimientos
 * - Conciliación bancaria automática y lectura de extractos
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Wallet,
  Repeat,
  Receipt,
  PieChart,
  Trash2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react-native';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useAppStore } from '../../store/useAppStore';
import { FinanceMetricCards } from './components/FinanceMetricCards';
import { FinanceChartAnimated } from './components/FinanceChartAnimated';
import { CategoryBreakdownList, CategoryItem } from './components/CategoryBreakdownList';
import { AccountCard } from './components/AccountCard';
import { RecurringPaymentItem } from './components/RecurringPaymentItem';
import { NewTransactionModal } from './components/NewTransactionModal';
import { NewAccountModal } from './components/NewAccountModal';
import { IOSSegmentedControl, SegmentTab } from '../../components/ui/IOSSegmentedControl';
import { IOS_COLORS } from '../../styles/theme';
import { createShadow } from '../../styles/shadows';

type FinanceTab = 'overview' | 'transactions' | 'recurring';

const FINANCE_TABS: SegmentTab<FinanceTab>[] = [
  { id: 'overview', label: 'Resumen' },
  { id: 'transactions', label: 'Movimientos' },
  { id: 'recurring', label: 'Cuotas & Fijos' },
];

export const FinancesScreen: React.FC = () => {
  const { themeMode } = useAppStore();
  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const {
    accounts,
    selectedAccountId,
    categories,
    transactions,
    recurringPayments,
    selectedMonth,
    summary,
    totalNetWorth,
    loadFinanceData,
    setSelectedAccountId,
    prevMonth,
    nextMonth,
    addAccount,
    deleteAccount,
    addTransaction,
    deleteTransaction,
  } = useFinanceStore();

  useEffect(() => {
    loadFinanceData();
  }, [selectedMonth]);

  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Formato del mes visible: "Agosto 2026"
  const formattedMonthLabel = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, (month || 1) - 1, 1);
    const monthStr = date.toLocaleDateString('es-ES', { month: 'long' });
    const capitalized = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
    return `${capitalized} ${year}`;
  }, [selectedMonth]);

  // Filtrar transacciones según cuenta seleccionada y buscador
  const filteredTransactions = useMemo(() => {
    let list = transactions;
    if (selectedAccountId) {
      list = list.filter((t) => t.account_id === selectedAccountId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category_name?.toLowerCase().includes(q) ||
          t.account_name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [transactions, selectedAccountId, searchQuery]);

  // Transformar desglose de categorías
  const categoryItems: CategoryItem[] = useMemo(() => {
    if (summary?.categoryBreakdown && summary.categoryBreakdown.length > 0) {
      return summary.categoryBreakdown.map((b) => ({
        id: b.categoryId,
        name: b.name,
        amount: b.total,
        percentage: b.percentage,
        color: b.color || IOS_COLORS.blue,
        iconName: b.icon,
      }));
    }
    return [];
  }, [summary]);

  const income = summary?.totalIncome || 0;
  const expense = summary?.totalExpense || 0;
  const savings = summary?.balance || (income - expense);

  const handleDeleteAccount = (acc: { id: string; name: string }) => {
    Alert.alert(
      'Eliminar Cuenta',
      `¿Deseas eliminar la cuenta "${acc.name}"? Los movimientos asociados permanecerán sin cuenta asignada.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteAccount(acc.id),
        },
      ]
    );
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: 24, gap: 20 }}
    >
      {/* 1. Header con Selector de Mes, Patrimonio Neto y Botones de Acción */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        {/* Selector de Mes */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.card,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 8,
              ...createShadow('#000000', { width: 0, height: 2 }, isDark ? 0.2 : 0.04, 4),
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
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeft size={18} color={theme.text.primary} />
            </Pressable>

            <Pressable
              onPress={nextMonth}
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronRight size={18} color={theme.text.primary} />
            </Pressable>
          </View>
        </View>

        {/* Patrimonio Neto Total + Botones */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              backgroundColor: theme.cardSecondary,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary, textTransform: 'uppercase' }}>
              Patrimonio Neto
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '900', color: totalNetWorth >= 0 ? '#34C759' : '#FF3B30', fontVariant: ['tabular-nums'] }}>
              ${totalNetWorth.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </Text>
          </View>

          {/* Botón + Nueva Cuenta */}
          <Pressable
            onPress={() => setIsAccModalOpen(true)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              minHeight: 44,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F2F2F7',
              paddingHorizontal: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 6,
            })}
          >
            <Wallet size={16} color={theme.text.primary} />
            <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text.primary }}>
              + Cuenta
            </Text>
          </Pressable>

          {/* Botón + Nuevo Movimiento */}
          <Pressable
            onPress={() => setIsTxModalOpen(true)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.85 : 1,
              minHeight: 44,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: IOS_COLORS.blue,
              paddingHorizontal: 16,
              borderRadius: 12,
              gap: 6,
              ...createShadow('#007AFF', { width: 0, height: 2 }, 0.3, 6),
            })}
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={3} />
            <Text style={{ fontSize: 14, fontWeight: '900', color: '#FFFFFF' }}>
              Nuevo Movimiento
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 2. Carrusel Horizontal de Cuentas Financieras */}
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Mis Cuentas & Billeteras
          </Text>
          {selectedAccountId && (
            <Pressable onPress={() => setSelectedAccountId(null)}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#007AFF' }}>
                Ver todas las cuentas
              </Text>
            </Pressable>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 4 }}>
          {/* Card Especial: Todas las Cuentas */}
          <Pressable
            onPress={() => setSelectedAccountId(null)}
            style={{
              width: 160,
              backgroundColor: selectedAccountId === null
                ? isDark
                  ? 'rgba(0, 122, 255, 0.18)'
                  : 'rgba(0, 122, 255, 0.12)'
                : theme.card,
              borderRadius: 20,
              padding: 16,
              borderWidth: 1.5,
              borderColor: selectedAccountId === null ? '#007AFF' : theme.border,
              gap: 12,
              ...createShadow('#000000', { width: 0, height: 4 }, isDark ? 0.2 : 0.04, 8),
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(0, 122, 255, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Layers size={18} color="#007AFF" />
            </View>
            <View style={{ gap: 2 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text.secondary }}>
                Todas las cuentas
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary, fontVariant: ['tabular-nums'] }}>
                ${totalNetWorth.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Text>
            </View>
          </Pressable>

          {/* Tarjetas de cada cuenta */}
          {accounts.map((acc) => (
            <AccountCard
              key={acc.id}
              account={acc}
              isSelected={selectedAccountId === acc.id}
              onPress={() => setSelectedAccountId(acc.id === selectedAccountId ? null : acc.id)}
              onLongPress={() => handleDeleteAccount(acc)}
              isDark={isDark}
            />
          ))}
        </ScrollView>
      </View>

      {/* 3. Segmented Control de Pestañas Principales */}
      <IOSSegmentedControl<FinanceTab>
        tabs={FINANCE_TABS}
        selectedTab={activeTab}
        onTabChange={setActiveTab}
        isDark={isDark}
      />

      {/* 4. Contenido según Pestaña Activa */}
      {activeTab === 'overview' && (
        <View style={{ gap: 20 }}>
          {/* Tarjetas de Métricas (Ingresos, Gastos, Ahorro) */}
          <FinanceMetricCards
            income={income}
            expense={expense}
            savings={savings}
            isDark={isDark}
          />

          {/* Gráfico de Evolución */}
          <FinanceChartAnimated monthKey={selectedMonth} isDark={isDark} />

          {/* Desglose por Categorías */}
          <CategoryBreakdownList
            categories={categoryItems}
            isDark={isDark}
          />
        </View>
      )}

      {activeTab === 'transactions' && (
        <View style={{ gap: 14 }}>
          {/* Buscador de Movimientos */}
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por concepto, categoría o cuenta..."
              placeholderTextColor={theme.text.tertiary}
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: theme.text.primary,
              }}
            />
          </View>

          {/* Lista de Transacciones */}
          {filteredTransactions.length === 0 ? (
            <View
              style={{
                backgroundColor: theme.card,
                borderRadius: 20,
                padding: 32,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme.border,
                gap: 10,
              }}
            >
              <Receipt size={32} color={theme.text.tertiary} />
              <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text.primary }}>
                No hay movimientos registrados
              </Text>
              <Text style={{ fontSize: 12, color: theme.text.secondary }}>
                Presioná "+ Nuevo Movimiento" para registrar un ingreso o gasto.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <View
                    key={tx.id}
                    style={{
                      backgroundColor: theme.card,
                      borderRadius: 16,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: theme.border,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    {/* Icono + Info */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: isIncome ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 59, 48, 0.15)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isIncome ? (
                          <ArrowDownLeft size={18} color="#34C759" />
                        ) : (
                          <ArrowUpRight size={18} color="#FF3B30" />
                        )}
                      </View>

                      <View style={{ flex: 1, gap: 2 }}>
                        <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '800', color: theme.text.primary }}>
                          {tx.description}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <Text style={{ fontSize: 11, color: theme.text.secondary, fontWeight: '600' }}>
                            {tx.transaction_date}
                          </Text>
                          {tx.category_name && (
                            <View style={{ backgroundColor: theme.cardSecondary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                              <Text style={{ fontSize: 10, fontWeight: '800', color: tx.category_color || theme.text.secondary }}>
                                {tx.category_name}
                              </Text>
                            </View>
                          )}
                          {tx.account_name && (
                            <View style={{ backgroundColor: theme.cardSecondary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                              <Text style={{ fontSize: 10, fontWeight: '700', color: theme.text.tertiary }}>
                                {tx.account_name}
                              </Text>
                            </View>
                          )}
                          {tx.installments && tx.installments > 1 && (
                            <View style={{ backgroundColor: 'rgba(255, 149, 0, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                              <Text style={{ fontSize: 10, fontWeight: '900', color: '#FF9500' }}>
                                Cuota {tx.installment_current || 1}/{tx.installments}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Monto + Botón Eliminar */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '900',
                          color: isIncome ? '#34C759' : theme.text.primary,
                          fontVariant: ['tabular-nums'],
                        }}
                      >
                        {isIncome ? '+' : '-'}${tx.amount.toLocaleString('es-AR')}
                      </Text>

                      <Pressable
                        onPress={() => deleteTransaction(tx.id)}
                        style={{ padding: 4 }}
                      >
                        <Trash2 size={15} color={theme.text.tertiary} />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {activeTab === 'recurring' && (
        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
              Gastos Fijos, Suscripciones y Cuotas Pendientes
            </Text>
          </View>

          {recurringPayments.length === 0 ? (
            <View
              style={{
                backgroundColor: theme.card,
                borderRadius: 20,
                padding: 32,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme.border,
                gap: 10,
              }}
            >
              <Repeat size={32} color={theme.text.tertiary} />
              <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text.primary }}>
                Sin pagos recurrentes o cuotas activas
              </Text>
              <Text style={{ fontSize: 12, color: theme.text.secondary }}>
                Al registrar un gasto podés marcar "Pago en Cuotas" o "Gasto Fijo / Recurrente".
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {recurringPayments.map((item) => (
                <RecurringPaymentItem
                  key={item.id}
                  item={item}
                  isDark={isDark}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Modal Nueva Transacción */}
      <NewTransactionModal
        visible={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={async (tx) => {
          await addTransaction(tx);
        }}
        categories={categories}
        accounts={accounts}
        isDark={isDark}
      />

      {/* Modal Nueva Cuenta */}
      <NewAccountModal
        visible={isAccModalOpen}
        onClose={() => setIsAccModalOpen(false)}
        onSave={async (acc) => {
          await addAccount(acc);
        }}
        isDark={isDark}
      />
    </ScrollView>
  );
};
