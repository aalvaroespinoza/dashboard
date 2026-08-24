import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { IOS_COLORS } from '../../../styles/theme';

interface FinanceMetricCardsProps {
  income: number;
  expense: number;
  savings: number;
  isDark?: boolean;
}

export const FinanceMetricCards: React.FC<FinanceMetricCardsProps> = ({
  income,
  expense,
  savings,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const formatCurrency = (val: number) => {
    return `$${val.toLocaleString('es-AR')}`;
  };

  return (
    <View style={{ flexDirection: 'row', gap: 14 }}>
      {/* 1. Ingresos */}
      <View
        style={{
          flex: 1,
          backgroundColor: theme.card,
          borderRadius: 20,
          padding: 18,
          borderWidth: 1,
          borderColor: theme.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.03,
          shadowRadius: 3,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text.secondary }}>
          Ingresos
        </Text>
        <Text
          style={{
            fontSize: 24,
            fontWeight: '900',
            color: IOS_COLORS.green,
            letterSpacing: -0.5,
            marginTop: 6,
          }}
        >
          {formatCurrency(income)}
        </Text>
      </View>

      {/* 2. Gastos */}
      <View
        style={{
          flex: 1,
          backgroundColor: theme.card,
          borderRadius: 20,
          padding: 18,
          borderWidth: 1,
          borderColor: theme.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.03,
          shadowRadius: 3,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text.secondary }}>
          Gastos
        </Text>
        <Text
          style={{
            fontSize: 24,
            fontWeight: '900',
            color: IOS_COLORS.red,
            letterSpacing: -0.5,
            marginTop: 6,
          }}
        >
          {formatCurrency(expense)}
        </Text>
      </View>

      {/* 3. Ahorro */}
      <View
        style={{
          flex: 1,
          backgroundColor: theme.card,
          borderRadius: 20,
          padding: 18,
          borderWidth: 1,
          borderColor: theme.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.03,
          shadowRadius: 3,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text.secondary }}>
          Ahorro
        </Text>
        <Text
          style={{
            fontSize: 24,
            fontWeight: '900',
            color: IOS_COLORS.blue,
            letterSpacing: -0.5,
            marginTop: 6,
          }}
        >
          {formatCurrency(savings)}
        </Text>
      </View>
    </View>
  );
};
