import React from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  CheckCircle2,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from 'lucide-react-native';
import { useTasksStore } from '../../../store/useTasksStore';
import { useCalendarStore } from '../../../store/useCalendarStore';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useAppStore } from '../../../store/useAppStore';
import { IOS_COLORS, IOS_FONTS, getSpecularCardStyle } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface DashboardTopRowProps {
  isDark?: boolean;
}

export const DashboardTopRow: React.FC<DashboardTopRowProps> = ({ isDark = true }) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { setActiveModule } = useAppStore();

  // Selectores atómicos de grano fino
  const pendingTasksCount = useTasksStore(
    (state) => state.tasks.filter((t) => !t.is_completed).length
  );
  const eventsCount = useCalendarStore((state) => state.events.length);
  const totalIncome = useFinanceStore((state) => state.summary.totalIncome);
  const totalExpense = useFinanceStore((state) => state.summary.totalExpense);

  const formatCurrency = (val: number) => {
    return `$${Math.round(val).toLocaleString('es-AR')}`;
  };

  const METRICS = [
    {
      id: 'tasks',
      title: 'Tareas pendientes',
      value: `${pendingTasksCount}`,
      subtitle: pendingTasksCount === 1 ? '1 pendiente' : `${pendingTasksCount} pendientes`,
      icon: CheckCircle2,
      color: '#007AFF',
      bgColor: isDark ? 'rgba(0, 122, 255, 0.16)' : '#EFF6FF',
      onPress: () => setActiveModule('tasks'),
    },
    {
      id: 'calendar',
      title: 'Eventos de hoy',
      value: `${eventsCount}`,
      subtitle: eventsCount === 1 ? '1 evento agendado' : `${eventsCount} eventos agendados`,
      icon: CalendarIcon,
      color: '#34C759',
      bgColor: isDark ? 'rgba(52, 199, 89, 0.16)' : '#ECFDF5',
      onPress: () => setActiveModule('calendar'),
    },
    {
      id: 'income',
      title: 'Ingresos del mes',
      value: formatCurrency(totalIncome || 850000),
      subtitle: 'Mes de Agosto',
      icon: TrendingUp,
      color: '#32ADE6',
      bgColor: isDark ? 'rgba(50, 173, 230, 0.16)' : '#E0F2FE',
      onPress: () => setActiveModule('finance'),
    },
    {
      id: 'expense',
      title: 'Gastos del mes',
      value: formatCurrency(totalExpense || 324300),
      subtitle: 'Mes de Agosto',
      icon: TrendingDown,
      color: '#FF3B30',
      bgColor: isDark ? 'rgba(255, 59, 48, 0.16)' : '#FEF2F2',
      onPress: () => setActiveModule('finance'),
    },
  ];

  const specularStyle = getSpecularCardStyle(isDark);
  const shadow = createShadow('#000000', { width: 0, height: 4 }, isDark ? 0.22 : 0.03, 8);

  return (
    <View style={{ flexDirection: 'row', gap: 14 }}>
      {METRICS.map((metric) => {
        const Icon = metric.icon;
        return (
          <Pressable
            key={metric.id}
            onPress={metric.onPress}
            style={({ pressed }) => ({
              flex: 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
              opacity: pressed ? 0.9 : 1,
              ...specularStyle,
              padding: 18,
              justifyContent: 'space-between',
              minHeight: 110,
              ...shadow,
            })}
          >
            {/* Header: Icono Squircle + Título + Flecha */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: metric.bgColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={19} color={metric.color} strokeWidth={2.5} />
                </View>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: theme.text.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {metric.title}
                </Text>
              </View>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F2F2F7',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowUpRight size={13} color={theme.text.tertiary} />
              </View>
            </View>

            {/* Valor Principal Bold Tabular + Subtítulo */}
            <View style={{ marginTop: 10 }}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 24,
                  fontFamily: IOS_FONTS.roundedHeavy,
                  color: theme.text.primary,
                  letterSpacing: -0.8,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {metric.value}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 11,
                  fontFamily: IOS_FONTS.regular,
                  color: theme.text.secondary,
                  marginTop: 2,
                }}
              >
                {metric.subtitle}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};
