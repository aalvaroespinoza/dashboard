import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, LayoutChangeEvent } from 'react-native';
import Svg, {
  Path,
  Circle,
  Line,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { IOS_SPRINGS } from '../../../styles/animations';
import { IOS_COLORS } from '../../../styles/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedG = Animated.createAnimatedComponent(G);

interface FinanceChartAnimatedProps {
  monthKey?: string;
  isDark?: boolean;
}

const PATH_LENGTH = 500;

// Puntos de datos para el mes (Días 1 a 31)
const DATA_POINTS = [
  { day: '1', income: 75000, expense: 35000, yIncome: 75, yExpense: 95, x: 10 },
  { day: '6', income: 140000, expense: 20000, yIncome: 30, yExpense: 110, x: 65 },
  { day: '11', income: 65000, expense: 60000, yIncome: 85, yExpense: 75, x: 120 },
  { day: '16', income: 110000, expense: 45000, yIncome: 50, yExpense: 85, x: 175 },
  { day: '21', income: 155000, expense: 35000, yIncome: 15, yExpense: 95, x: 230 },
  { day: '26', income: 90000, expense: 70000, yIncome: 65, yExpense: 70, x: 285 },
  { day: '31', income: 145000, expense: 60000, yIncome: 30, yExpense: 70, x: 340 },
];

export const FinanceChartAnimated: React.FC<FinanceChartAnimatedProps> = ({
  monthKey = 'default',
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const [chartWidth, setChartWidth] = useState(360);
  const [activeTooltip, setActiveTooltip] = useState<{
    day: string;
    income: number;
    expense: number;
    x: number;
  } | null>(null);

  // Animación del trazo de líneas de izquierda a derecha
  const drawProgress = useSharedValue(0);

  // Animación de escala elástica para cada punto clave
  const pointScale1 = useSharedValue(0);
  const pointScale2 = useSharedValue(0);
  const pointScale3 = useSharedValue(0);
  const pointScale4 = useSharedValue(0);
  const pointScale5 = useSharedValue(0);
  const pointScale6 = useSharedValue(0);
  const pointScale7 = useSharedValue(0);

  const pointScales = [
    pointScale1,
    pointScale2,
    pointScale3,
    pointScale4,
    pointScale5,
    pointScale6,
    pointScale7,
  ];

  // Tooltip tracking
  const indicatorX = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. Reset y dibujo progresivo de las curvas spline
    drawProgress.value = 0;
    drawProgress.value = withTiming(1, {
      duration: 850,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    // 2. Aparición secuencial con rebote elástico de los puntos
    pointScales.forEach((scaleVal, idx) => {
      scaleVal.value = 0;
      scaleVal.value = withDelay(
        250 + idx * 60,
        withSpring(1, IOS_SPRINGS.bouncy)
      );
    });
  }, [monthKey]);

  // Props animadas para el strokeDashoffset de ingresos y gastos
  const animatedIncomePathProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: PATH_LENGTH * (1 - drawProgress.value),
    };
  });

  const animatedExpensePathProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: PATH_LENGTH * (1 - drawProgress.value),
    };
  });

  // Gesto interactivo de arrastre y toque para el tooltip
  const updateTooltipData = (xPos: number) => {
    const clampedX = Math.max(10, Math.min(340, (xPos / (chartWidth - 50)) * 340));
    // Encontrar el punto más cercano
    let closest = DATA_POINTS[0];
    let minDiff = 9999;
    DATA_POINTS.forEach((pt) => {
      const diff = Math.abs(pt.x - clampedX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = pt;
      }
    });

    setActiveTooltip({
      day: closest.day,
      income: closest.income,
      expense: closest.expense,
      x: xPos,
    });
  };

  const clearTooltip = () => {
    setActiveTooltip(null);
  };

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      'worklet';
      indicatorOpacity.value = withSpring(1, IOS_SPRINGS.snappy);
      indicatorX.value = e.x;
      runOnJS(updateTooltipData)(e.x);
    })
    .onUpdate((e) => {
      'worklet';
      indicatorX.value = e.x;
      runOnJS(updateTooltipData)(e.x);
    })
    .onEnd(() => {
      'worklet';
      indicatorOpacity.value = withTiming(0, { duration: 250 });
      runOnJS(clearTooltip)();
    });

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorX.value }],
      opacity: indicatorOpacity.value,
    };
  });

  const onLayoutChart = (e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width);
  };

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
      {/* Header con título y estado interactivo */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text.primary }}>
          Resumen Evolutivo
        </Text>

        {activeTooltip ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary }}>
              Día {activeTooltip.day}:
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '800', color: IOS_COLORS.green }}>
              +${activeTooltip.income.toLocaleString('es-AR')}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '800', color: IOS_COLORS.red }}>
              -${activeTooltip.expense.toLocaleString('es-AR')}
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: IOS_COLORS.green }} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text.secondary }}>Ingresos</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: IOS_COLORS.red }} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text.secondary }}>Gastos</Text>
            </View>
          </View>
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }} onLayout={onLayoutChart}>
        {/* Eje Y con escalas $150k, $100k, $50k, $0 */}
        <View style={{ width: 45, height: 150, justifyContent: 'space-between', paddingBottom: 22, alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text.tertiary }}>$150k</Text>
          <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text.tertiary }}>$100k</Text>
          <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text.tertiary }}>$50k</Text>
          <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text.tertiary }}>$0</Text>
        </View>

        {/* Gráfico SVG con interactividad y curvas continuas */}
        <GestureDetector gesture={panGesture}>
          <View style={{ flex: 1, height: 150, position: 'relative' }}>
            <Svg width="100%" height="130" viewBox="0 0 350 130">
              <Defs>
                <LinearGradient id="incomeGradAnim" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={IOS_COLORS.green} stopOpacity="0.25" />
                  <Stop offset="1" stopColor={IOS_COLORS.green} stopOpacity="0.0" />
                </LinearGradient>
              </Defs>

              {/* Guías horizontales punteadas */}
              <Line x1="0" y1="10" x2="350" y2="10" stroke={theme.borderSubtle} strokeDasharray="3,3" strokeWidth="1" />
              <Line x1="0" y1="45" x2="350" y2="45" stroke={theme.borderSubtle} strokeDasharray="3,3" strokeWidth="1" />
              <Line x1="0" y1="80" x2="350" y2="80" stroke={theme.borderSubtle} strokeDasharray="3,3" strokeWidth="1" />
              <Line x1="0" y1="115" x2="350" y2="115" stroke={theme.borderSubtle} strokeWidth="1" />

              {/* Spline Verde (Ingresos) con interpolación de trazo de izquierda a derecha */}
              <AnimatedPath
                d="M 10,75 C 60,30 110,85 160,50 C 210,15 260,65 310,40 C 330,25 338,32 340,30"
                fill="none"
                stroke={IOS_COLORS.green}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={PATH_LENGTH}
                animatedProps={animatedIncomePathProps}
              />

              {/* Spline Roja (Gastos) con interpolación de trazo de izquierda a derecha */}
              <AnimatedPath
                d="M 10,95 C 60,110 110,75 160,85 C 210,95 260,70 310,80 C 330,85 338,68 340,70"
                fill="none"
                stroke={IOS_COLORS.red}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={PATH_LENGTH}
                animatedProps={animatedExpensePathProps}
              />

              {/* Puntos destacados secuenciales con escalado elástico */}
              {DATA_POINTS.map((pt, idx) => {
                const scaleVal = pointScales[idx];

                return (
                  <G key={pt.day}>
                    <Circle
                      cx={pt.x}
                      cy={pt.yIncome}
                      r="4"
                      fill={IOS_COLORS.green}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                    <Circle
                      cx={pt.x}
                      cy={pt.yExpense}
                      r="4"
                      fill={IOS_COLORS.red}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  </G>
                );
              })}
            </Svg>

            {/* Línea indicadora vertical animada que sigue el dedo */}
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  bottom: 20,
                  width: 2,
                  backgroundColor: IOS_COLORS.blue,
                  borderRadius: 1,
                },
                animatedIndicatorStyle,
              ]}
            />

            {/* Eje X con marcas de días (1, 6, 11, 16, 21, 26, 31) */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6, marginTop: 4 }}>
              {['1', '6', '11', '16', '21', '26', '31'].map((d) => (
                <Text key={d} style={{ fontSize: 10, fontWeight: '700', color: theme.text.tertiary }}>
                  {d}
                </Text>
              ))}
            </View>
          </View>
        </GestureDetector>
      </View>
    </View>
  );
};
