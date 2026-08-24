import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { Wallet, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useAppStore } from '../../../store/useAppStore';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface HomeFinanceWidgetProps {
  isDark?: boolean;
}

export const HomeFinanceWidget: React.FC<HomeFinanceWidgetProps> = React.memo(({ isDark = true }) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { setActiveModule } = useAppStore();

  const summary = useFinanceStore((state) => state.summary);
  const categories = useFinanceStore((state) => state.categories);

  const totalIncome = summary.totalIncome || 850000;
  const totalExpense = summary.totalExpense || 324300;
  const netBalance = totalIncome - totalExpense;

  const formatCurrency = (val: number) => {
    return `$${Math.round(val).toLocaleString('es-AR')}`;
  };

  // Puntos del gráfico Spline SVG
  const width = 360;
  const height = 90;

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
        gap: 14,
        ...createShadow('#000000', { width: 0, height: 4 }, isDark ? 0.2 : 0.04, 8),
      }}
    >
      {/* Header del Widget */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: 'rgba(52, 199, 89, 0.16)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Wallet size={18} color="#34C759" strokeWidth={2.5} />
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.4 }}>
              Finanzas del Mes
            </Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text.secondary }}>
              Balance neto: <Text style={{ color: netBalance >= 0 ? '#34C759' : '#FF3B30', fontWeight: '800' }}>{formatCurrency(netBalance)}</Text>
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => setActiveModule('finance')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#007AFF' }}>
            Detalles
          </Text>
          <ChevronRight size={15} color="#007AFF" />
        </Pressable>
      </View>

      {/* Gráfico Spline SVG Suave */}
      <View style={{ width: '100%', height: height, overflow: 'hidden', borderRadius: 16, backgroundColor: isDark ? '#242426' : '#F9FAFB', paddingVertical: 6 }}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <LinearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#34C759" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#34C759" stopOpacity="0.0" />
            </LinearGradient>
            <LinearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FF3B30" stopOpacity="0.25" />
              <Stop offset="1" stopColor="#FF3B30" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Área y Línea de Ingresos (Spline Suave) */}
          <Path
            d="M 10 70 Q 70 30, 130 50 T 250 20 T 350 15 L 350 90 L 10 90 Z"
            fill="url(#incomeGrad)"
          />
          <Path
            d="M 10 70 Q 70 30, 130 50 T 250 20 T 350 15"
            fill="none"
            stroke="#34C759"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Área y Línea de Gastos */}
          <Path
            d="M 10 75 Q 70 65, 130 60 T 250 45 T 350 38 L 350 90 L 10 90 Z"
            fill="url(#expenseGrad)"
          />
          <Path
            d="M 10 75 Q 70 65, 130 60 T 250 45 T 350 38"
            fill="none"
            stroke="#FF3B30"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Puntos destacados */}
          <Circle cx="350" cy="15" r="4" fill="#34C759" />
          <Circle cx="350" cy="38" r="4" fill="#FF3B30" />
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
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.primary }}>
                  {cat.name}
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary }}>
                  {formatCurrency(cat.amount)} <Text style={{ fontSize: 10, color: theme.text.tertiary }}>/ {formatCurrency(cat.max)}</Text>
                </Text>
              </View>

              {/* Barra de Progreso */}
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
    </View>
  );
});
