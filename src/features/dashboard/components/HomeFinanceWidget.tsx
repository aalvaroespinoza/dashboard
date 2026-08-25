/**
 * HomeFinanceWidget.tsx
 * Widget de Finanzas del Mes del Dashboard estilo iPadOS 18 (Apple HIG).
 * Muestra el balance neto en negrita, gráfico spline suave con área sombreada y píldoras compactas de Ingresos/Gastos.
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { ChevronRight } from 'lucide-react-native';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useAppStore } from '../../../store/useAppStore';
import { IOS_COLORS, IOS_FONTS, APPLE_ACCENT } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface HomeFinanceWidgetProps {
  isDark?: boolean;
}

export const HomeFinanceWidget: React.FC<HomeFinanceWidgetProps> = React.memo(({ isDark = true }) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { setActiveModule } = useAppStore();

  const summary = useFinanceStore((state) => state.summary);
  const totalIncome = summary?.totalIncome || 850000;
  const totalExpense = summary?.totalExpense || 44300;
  const netBalance = totalIncome - totalExpense;

  const formatCurrency = (val: number) => {
    return `$${Math.round(val).toLocaleString('es-AR')}`;
  };

  const width = 200;
  const height = 54;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E5EA',
        borderTopColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'space-between',
        minHeight: 168,
        gap: 12,
        ...createShadow('#000000', { width: 0, height: 4 }, isDark ? 0.22 : 0.03, 8),
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 16, fontFamily: IOS_FONTS.bold, color: theme.text.primary, letterSpacing: -0.4 }}>
          Finanzas del mes
        </Text>

        <Pressable
          onPress={() => setActiveModule('finance')}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
          })}
        >
          <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.semibold, color: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light }}>
            Ver detalles
          </Text>
          <ChevronRight size={13} color={isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light} />
        </Pressable>
      </View>

      {/* Contenido Principal: Balance + Gráfico Spline + Píldoras de Ingresos / Gastos */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        {/* Balance Neto & Mini Spline */}
        <View style={{ flex: 1.4, gap: 6 }}>
          <View>
            <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.semibold, color: theme.text.tertiary, textTransform: 'uppercase' }}>
              Balance neto
            </Text>
            <Text
              style={{
                fontSize: 22,
                fontFamily: IOS_FONTS.roundedHeavy,
                color: theme.text.primary,
                letterSpacing: -0.6,
                fontVariant: ['tabular-nums'],
              }}
            >
              {formatCurrency(netBalance)}
            </Text>
          </View>

          {/* Gráfico Spline Fluido */}
          <View style={{ width: '100%', height: height }}>
            <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
              <Defs>
                <LinearGradient id="splineGreen" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={isDark ? '#30D158' : '#34C759'} stopOpacity="0.35" />
                  <Stop offset="1" stopColor={isDark ? '#30D158' : '#34C759'} stopOpacity="0.0" />
                </LinearGradient>
              </Defs>
              <Path
                d="M 5 44 Q 40 48, 70 28 T 130 32 T 195 10 L 195 54 L 5 54 Z"
                fill="url(#splineGreen)"
              />
              <Path
                d="M 5 44 Q 40 48, 70 28 T 130 32 T 195 10"
                fill="none"
                stroke={isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <Circle cx="195" cy="10" r="3.5" fill={isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light} />
            </Svg>

            {/* Marcadores de Días */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginTop: -4 }}>
              {['1', '7', '14', '21', '28', '31'].map((d) => (
                <Text key={d} style={{ fontSize: 8, fontFamily: IOS_FONTS.regular, color: theme.text.tertiary }}>
                  {d}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Píldoras de Ingresos y Gastos */}
        <View style={{ gap: 8 }}>
          {/* Ingresos */}
          <View
            style={{
              backgroundColor: isDark ? 'rgba(48, 209, 88, 0.12)' : 'rgba(52, 199, 89, 0.1)',
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(48, 209, 88, 0.25)' : 'rgba(52, 199, 89, 0.2)',
              gap: 2,
            }}
          >
            <Text style={{ fontSize: 9, fontFamily: IOS_FONTS.bold, color: theme.text.tertiary, textTransform: 'uppercase' }}>
              Ingresos
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: IOS_FONTS.bold,
                color: isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light,
                fontVariant: ['tabular-nums'],
              }}
            >
              +{formatCurrency(totalIncome)}
            </Text>
          </View>

          {/* Gastos */}
          <View
            style={{
              backgroundColor: isDark ? 'rgba(255, 69, 58, 0.12)' : 'rgba(255, 59, 48, 0.1)',
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255, 69, 58, 0.25)' : 'rgba(255, 59, 48, 0.2)',
              gap: 2,
            }}
          >
            <Text style={{ fontSize: 9, fontFamily: IOS_FONTS.bold, color: theme.text.tertiary, textTransform: 'uppercase' }}>
              Gastos
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: IOS_FONTS.bold,
                color: isDark ? APPLE_ACCENT.red.dark : APPLE_ACCENT.red.light,
                fontVariant: ['tabular-nums'],
              }}
            >
              -{formatCurrency(totalExpense)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});
