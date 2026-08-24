import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IOS_COLORS } from '../../../styles/theme';

interface FinanceSplineChartProps {
  isDark?: boolean;
}

export const FinanceSplineChart: React.FC<FinanceSplineChartProps> = ({ isDark = true }) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text.primary, marginBottom: 14 }}>
        Resumen
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Eje Y con escalas $150k, $100k, $50k */}
        <View style={{ width: 50, height: 150, justifyContent: 'space-between', paddingBottom: 22, alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text.tertiary }}>$150k</Text>
          <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text.tertiary }}>$100k</Text>
          <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text.tertiary }}>$50k</Text>
          <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text.tertiary }}>$0</Text>
        </View>

        {/* Gráfico SVG Spline */}
        <View style={{ flex: 1, height: 150, display: 'flex', flexDirection: 'column' }}>
          <Svg width="100%" height="130" viewBox="0 0 400 130">
            <Defs>
              <LinearGradient id="incomeGradFin" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={IOS_COLORS.green} stopOpacity="0.2" />
                <Stop offset="1" stopColor={IOS_COLORS.green} stopOpacity="0.0" />
              </LinearGradient>
            </Defs>

            {/* Grid horizontal lines */}
            <Line x1="0" y1="10" x2="400" y2="10" stroke={theme.borderSubtle} strokeDasharray="3,3" strokeWidth="1" />
            <Line x1="0" y1="45" x2="400" y2="45" stroke={theme.borderSubtle} strokeDasharray="3,3" strokeWidth="1" />
            <Line x1="0" y1="80" x2="400" y2="80" stroke={theme.borderSubtle} strokeDasharray="3,3" strokeWidth="1" />
            <Line x1="0" y1="115" x2="400" y2="115" stroke={theme.borderSubtle} strokeWidth="1" />

            {/* Spline Verde (Ingresos) */}
            <Path
              d="M 10,75 C 60,30 110,85 160,50 C 210,15 260,65 310,40 C 350,20 380,35 390,30"
              fill="none"
              stroke={IOS_COLORS.green}
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Spline Roja (Gastos) */}
            <Path
              d="M 10,95 C 60,110 110,75 160,85 C 210,95 260,70 310,80 C 350,88 380,65 390,70"
              fill="none"
              stroke={IOS_COLORS.red}
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Puntos destacados en las ondas */}
            <Circle cx="390" cy="30" r="4.5" fill={IOS_COLORS.green} stroke="#FFFFFF" strokeWidth="1.5" />
            <Circle cx="390" cy="70" r="4.5" fill={IOS_COLORS.red} stroke="#FFFFFF" strokeWidth="1.5" />
          </Svg>

          {/* Eje X con marcas de días (1, 6, 11, 16, 21, 26, 31) */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6 }}>
            {['1', '6', '11', '16', '21', '26', '31'].map((d) => (
              <Text key={d} style={{ fontSize: 10, fontWeight: '700', color: theme.text.tertiary }}>
                {d}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};
