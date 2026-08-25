import React from 'react';
import { View, Text } from 'react-native';
import { IOS_COLORS, IOS_FONTS, APPLE_ACCENT, getSpecularCardStyle } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout';

interface FinanceMetricCardsProps {
  income: number;
  expense: number;
  savings: number;
  isDark?: boolean;
}

const FinanceMetricCardsComponent: React.FC<FinanceMetricCardsProps> = ({
  income,
  expense,
  savings,
  isDark = true,
}) => {
  const { isLandscape } = useResponsiveLayout();
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const formatCurrency = (val: number) => {
    return `$${Math.round(val).toLocaleString('es-AR')}`;
  };

  const specularStyle = getSpecularCardStyle(isDark);
  const shadow = createShadow('#000000', { width: 0, height: 2 }, isDark ? 0.2 : 0.03, 6);

  return (
    <View style={{ flexDirection: isLandscape ? 'row' : 'column', gap: 12 }}>
      {/* 1. Ingresos (Apple System Green) */}
      <View
        style={{
          flex: 1,
          ...specularStyle,
          padding: 18,
          ...shadow,
        }}
      >
        <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Ingresos
        </Text>
        <Text
          style={{
            fontSize: 24,
            fontFamily: IOS_FONTS.roundedHeavy,
            color: isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light,
            letterSpacing: -0.5,
            marginTop: 6,
            fontVariant: ['tabular-nums'],
          }}
        >
          {formatCurrency(income)}
        </Text>
      </View>

      {/* 2. Gastos (Apple System Red) */}
      <View
        style={{
          flex: 1,
          ...specularStyle,
          padding: 18,
          ...shadow,
        }}
      >
        <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Gastos
        </Text>
        <Text
          style={{
            fontSize: 24,
            fontFamily: IOS_FONTS.roundedHeavy,
            color: isDark ? APPLE_ACCENT.red.dark : APPLE_ACCENT.red.light,
            letterSpacing: -0.5,
            marginTop: 6,
            fontVariant: ['tabular-nums'],
          }}
        >
          {formatCurrency(expense)}
        </Text>
      </View>

      {/* 3. Ahorro / Balance (Apple System Mint / Blue) */}
      <View
        style={{
          flex: 1,
          ...specularStyle,
          padding: 18,
          ...shadow,
        }}
      >
        <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Balance Neto
        </Text>
        <Text
          style={{
            fontSize: 24,
            fontFamily: IOS_FONTS.roundedHeavy,
            color: savings >= 0
              ? (isDark ? APPLE_ACCENT.mint.dark : APPLE_ACCENT.mint.light)
              : (isDark ? APPLE_ACCENT.red.dark : APPLE_ACCENT.red.light),
            letterSpacing: -0.5,
            marginTop: 6,
            fontVariant: ['tabular-nums'],
          }}
        >
          {formatCurrency(savings)}
        </Text>
      </View>
    </View>
  );
};

export const FinanceMetricCards = React.memo(FinanceMetricCardsComponent);
