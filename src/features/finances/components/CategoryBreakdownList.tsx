/**
 * CategoryBreakdownList.tsx
 * Desglose de Categorías y Presupuestos Mensuales con Barras de Progreso Apple Wallet.
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Home,
  Bus,
  Utensils,
  Film,
  Tag,
  Briefcase,
  Zap,
  Coffee,
  ShoppingBag,
  Target,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react-native';
import { IOS_COLORS, IOS_FONTS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

export interface CategoryItem {
  id: string;
  name: string;
  amount: number;
  amountSpent?: number;
  percentage: number;
  color: string;
  iconName?: string;
  budgetLimit?: number | null;
  budgetSpentPercentage?: number | null;
  remainingBudget?: number | null;
  isOverBudget?: boolean;
}

interface CategoryBreakdownListProps {
  categories: CategoryItem[];
  totalBudget?: number;
  totalSpent?: number;
  onSelectCategory?: (id: string) => void;
  isDark?: boolean;
}

const getCategoryIcon = (name: string, iconName?: string) => {
  const n = (iconName || name).toLowerCase();
  if (n.includes('vivienda') || n.includes('alquiler') || n.includes('home')) return Home;
  if (n.includes('transporte') || n.includes('colectivo') || n.includes('bus')) return Bus;
  if (n.includes('comida') || n.includes('supermercado') || n.includes('food')) return Utensils;
  if (n.includes('entretenimiento') || n.includes('ocio') || n.includes('film')) return Film;
  if (n.includes('servicios') || n.includes('zap')) return Zap;
  if (n.includes('café') || n.includes('coffee')) return Coffee;
  if (n.includes('compras') || n.includes('shopping')) return ShoppingBag;
  if (n.includes('salario') || n.includes('briefcase')) return Briefcase;
  return Tag;
};

export const CategoryBreakdownList: React.FC<CategoryBreakdownListProps> = ({
  categories,
  totalBudget = 0,
  totalSpent = 0,
  onSelectCategory,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const formatCurrency = (val: number) => `$${Math.round(val).toLocaleString('es-AR')}`;

  const defaultCategories: CategoryItem[] = [
    { id: 'cat-viv', name: 'Vivienda', amount: 450000, percentage: 40, color: IOS_COLORS.orange, budgetLimit: 500000, budgetSpentPercentage: 90, remainingBudget: 50000 },
    { id: 'cat-trans', name: 'Transporte', amount: 200000, percentage: 18, color: IOS_COLORS.cyan, budgetLimit: 250000, budgetSpentPercentage: 80, remainingBudget: 50000 },
    { id: 'cat-com', name: 'Comida', amount: 180000, percentage: 16, color: IOS_COLORS.yellow, budgetLimit: 150000, budgetSpentPercentage: 120, remainingBudget: -30000, isOverBudget: true },
    { id: 'cat-ent', name: 'Entretenimiento', amount: 120000, percentage: 11, color: IOS_COLORS.red, budgetLimit: 100000, budgetSpentPercentage: 120, remainingBudget: -20000, isOverBudget: true },
    { id: 'cat-otr', name: 'Otros', amount: 70000, percentage: 6, color: theme.text.tertiary },
  ];

  const listToRender = categories.length > 0 ? categories : defaultCategories;

  const totalBudgetSpentPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 22,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.border,
        gap: 16,
        ...createShadow('#000000', { width: 0, height: 2 }, isDark ? 0.25 : 0.04, 8),
      }}
    >
      {/* Cabecera de la Sección */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Target size={16} color={IOS_COLORS.blue} />
            <Text style={{ fontSize: 16, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
              Presupuestos y Categorías
            </Text>
          </View>
          <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
            Toca cualquier categoría para fijar o ajustar su límite mensual
          </Text>
        </View>

        {totalBudget > 0 && (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.semibold, color: theme.text.tertiary, textTransform: 'uppercase' }}>
              Presupuesto Total
            </Text>
            <Text style={{ fontSize: 14, fontFamily: IOS_FONTS.bold, color: totalBudgetSpentPct >= 100 ? '#FF3B30' : theme.text.primary }}>
              {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
            </Text>
          </View>
        )}
      </View>

      {/* Barra de Progreso Global si hay presupuesto configurado */}
      {totalBudget > 0 && (
        <View
          style={{
            backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
            padding: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.border,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.semibold, color: theme.text.secondary }}>
              Consumo Mensual Global
            </Text>
            <View
              style={{
                backgroundColor: totalBudgetSpentPct >= 100 ? 'rgba(255, 59, 48, 0.15)' : totalBudgetSpentPct >= 75 ? 'rgba(255, 149, 0, 0.15)' : 'rgba(52, 199, 89, 0.15)',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: IOS_FONTS.bold,
                  color: totalBudgetSpentPct >= 100 ? '#FF3B30' : totalBudgetSpentPct >= 75 ? '#FF9500' : '#34C759',
                }}
              >
                {totalBudgetSpentPct}% consumido
              </Text>
            </View>
          </View>

          <View style={{ height: 6, borderRadius: 3, backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA', overflow: 'hidden' }}>
            <View
              style={{
                height: '100%',
                width: `${Math.min(100, totalBudgetSpentPct)}%`,
                backgroundColor: totalBudgetSpentPct >= 100 ? '#FF3B30' : totalBudgetSpentPct >= 75 ? '#FF9500' : '#34C759',
                borderRadius: 3,
              }}
            />
          </View>
        </View>
      )}

      {/* Lista de Categorías con Barras de Progreso Individuales */}
      <View style={{ gap: 14 }}>
        {listToRender.map((cat) => {
          const Icon = getCategoryIcon(cat.name, cat.iconName);
          const hasBudget = Boolean(cat.budgetLimit && cat.budgetLimit > 0);
          const spentPct = hasBudget && cat.budgetLimit ? Math.round((cat.amount / cat.budgetLimit) * 100) : 0;
          const isOver = hasBudget && cat.amount > (cat.budgetLimit || 0);
          const remaining = hasBudget && cat.budgetLimit ? cat.budgetLimit - cat.amount : 0;

          // Color semántico de la barra
          const barColor = isOver
            ? '#FF3B30'
            : spentPct >= 75
            ? '#FF9500'
            : (cat.color || '#34C759');

          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelectCategory?.(cat.id)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                backgroundColor: isDark ? '#1C1C1E' : '#FAFAFC',
                borderRadius: 16,
                padding: 12,
                borderWidth: 1,
                borderColor: isOver ? 'rgba(255, 59, 48, 0.4)' : theme.border,
                gap: 8,
              })}
            >
              {/* Fila Superior: Icono + Nombre + Montos */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: `${cat.color}22`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={17} color={cat.color} />
                  </View>

                  <View>
                    <Text style={{ fontSize: 14, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                      {cat.name}
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.regular, color: theme.text.tertiary }}>
                      {cat.percentage}% del gasto total
                    </Text>
                  </View>
                </View>

                {/* Monto Gastado vs Presupuesto */}
                <View style={{ alignItems: 'flex-end', gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: IOS_FONTS.bold,
                        color: isOver ? '#FF3B30' : theme.text.primary,
                      }}
                    >
                      {formatCurrency(cat.amount)}
                    </Text>
                    {hasBudget && (
                      <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.regular, color: theme.text.tertiary }}>
                        / {formatCurrency(cat.budgetLimit || 0)}
                      </Text>
                    )}
                  </View>

                  {/* Badge de Porcentaje de Presupuesto */}
                  {hasBudget ? (
                    <View
                      style={{
                        backgroundColor: isOver ? 'rgba(255, 59, 48, 0.15)' : spentPct >= 75 ? 'rgba(255, 149, 0, 0.15)' : 'rgba(52, 199, 89, 0.15)',
                        paddingHorizontal: 6,
                        paddingVertical: 1,
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: IOS_FONTS.bold,
                          color: isOver ? '#FF3B30' : spentPct >= 75 ? '#FF9500' : '#34C759',
                        }}
                      >
                        {spentPct}%
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.semibold, color: IOS_COLORS.blue }}>
                      + Fijar límite
                    </Text>
                  )}
                </View>
              </View>

              {/* Barra de Progreso si tiene Presupuesto */}
              {hasBudget ? (
                <View style={{ gap: 4 }}>
                  <View
                    style={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        height: '100%',
                        width: `${Math.min(100, spentPct)}%`,
                        backgroundColor: barColor,
                        borderRadius: 3,
                      }}
                    />
                  </View>

                  {/* Subtexto: Disponible vs Excedido */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: IOS_FONTS.semibold,
                        color: isOver ? '#FF3B30' : theme.text.secondary,
                      }}
                    >
                      {isOver
                        ? `⚠️ Excedido por ${formatCurrency(Math.abs(remaining))}`
                        : `Te quedan ${formatCurrency(remaining)} disponibles`}
                    </Text>

                    <ChevronRight size={13} color={theme.text.tertiary} />
                  </View>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
