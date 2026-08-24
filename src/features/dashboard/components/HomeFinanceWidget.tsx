import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { Wallet, ChevronRight } from 'lucide-react-native';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useAppStore } from '../../../store/useAppStore';
import { SpecularCard } from '../../../components/common/SpecularCard';
import { IOS_COLORS } from '../../../styles/theme';

interface HomeFinanceWidgetProps {
  isDark?: boolean;
}

export const HomeFinanceWidget: React.FC<HomeFinanceWidgetProps> = React.memo(({ isDark = true }) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { setActiveModule } = useAppStore();

  const summary = useFinanceStore((state) => state.summary);
  const totalIncome = summary.totalIncome || 850000;
  const totalExpense = summary.totalExpense || 324300;
  const netBalance = totalIncome - totalExpense;

  const formatCurrency = (val: number) => {
    return `$${Math.round(val).toLocaleString('es-AR')}`;
  };

  const width = 380;
  const height = 96;

  return (
    <SpecularCard isDark={isDark} padding={22}>
      {/* Header del Widget */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: 'rgba(52, 199, 89, 0.16)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Wallet size={19} color="#34C759" strokeWidth={2.5} />
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.5 }}>
              Finanzas del Mes
            </Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text.secondary }}>
              Balance neto: <Text style={{ color: netBalance >= 0 ? '#34C759' : '#FF3B30', fontWeight: '900' }}>{formatCurrency(netBalance)}</Text>
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => setActiveModule('finance')}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F2F2F7',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10,
            gap: 2,
          })}
        >
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#007AFF' }}>
            Detalles
          </Text>
          <ChevronRight size={13} color="#007AFF" />
        </Pressable>
      </View>

      {/* Gráfico Spline SVG Suave con Gradiente Translúcido */}
      <View
        style={{
          width: '100%',
          height: height,
          overflow: 'hidden',
          borderRadius: 18,
          backgroundColor: isDark ? '#242426' : '#F9FAFB',
          paddingVertical: 6,
          borderWidth: 1,
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.8)',
          borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#E5E5EA',
          borderLeftColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#E5E5EA',
          borderRightColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#E5E5EA',
          marginBottom: 14,
        }}
      >
        <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <LinearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#34C759" stopOpacity="0.32" />
              <Stop offset="1" stopColor="#34C759" stopOpacity="0.0" />
            </LinearGradient>
            <LinearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FF3B30" stopOpacity="0.28" />
              <Stop offset="1" stopColor="#FF3B30" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Área y Línea de Ingresos */}
          <Path
            d="M 10 72 Q 70 32, 140 52 T 260 22 T 370 16 L 370 96 L 10 96 Z"
            fill="url(#incomeGrad)"
          />
          <Path
            d="M 10 72 Q 70 32, 140 52 T 260 22 T 370 16"
            fill="none"
            stroke="#34C759"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Área y Línea de Gastos */}
          <Path
            d="M 10 78 Q 70 68, 140 62 T 260 48 T 370 40 L 370 96 L 10 96 Z"
            fill="url(#expenseGrad)"
          />
          <Path
            d="M 10 78 Q 70 68, 140 62 T 260 48 T 370 40"
            fill="none"
            stroke="#FF3B30"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Puntos destacados */}
          <Circle cx="370" cy="16" r="4.5" fill="#34C759" />
          <Circle cx="370" cy="40" r="4.5" fill="#FF3B30" />
        </Svg>
      </View>

      {/* Mini Desglose de Categorías de Gastos */}
      <View style={{ gap: 8 }}>
        {[
          { name: 'Alquiler & Expensas', amount: 280000, max: 350000, color: '#FF3B30' },
          { name: 'Supermercado & Alimentos', amount: 34500, max: 180000, color: '#FF9500' },
          { name: 'Servicios & Nube', amount: 9800, max: 45000, color: '#007AFF' },
        ].map((cat, i) => {
          const pct = Math.min(Math.round((cat.amount / cat.max) * 100), 100);
          return (
            <View key={i} style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text.primary }}>
                  {cat.name}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '900', color: theme.text.secondary }}>
                  {formatCurrency(cat.amount)} <Text style={{ fontSize: 10, color: theme.text.tertiary, fontWeight: '600' }}>/ {formatCurrency(cat.max)}</Text>
                </Text>
              </View>

              {/* Barra de Progreso Suave */}
              <View
                style={{
                  height: 6,
                  backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    backgroundColor: cat.color,
                    borderRadius: 3,
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>
    </SpecularCard>
  );
});
