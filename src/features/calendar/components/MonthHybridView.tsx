import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Animated, { FadeInUp, FadeOutDown, LinearTransition } from 'react-native-reanimated';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react-native';
import { UnifiedCalendarItem } from '../../../types';
import { TimeBlockItem } from './TimeBlockItem';
import { SpecularCard } from '../../../components/common/SpecularCard';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout';

interface MonthHybridViewProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  unifiedItems: UnifiedCalendarItem[];
  allEventsForMonth: Record<string, { count: number; colors: string[] }>;
  onOpenNewEvent: (dateStr: string) => void;
  onOpenEditEvent: (item: UnifiedCalendarItem) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isDark?: boolean;
}

export const MonthHybridView: React.FC<MonthHybridViewProps> = ({
  selectedDate,
  onSelectDate,
  unifiedItems,
  allEventsForMonth,
  onOpenNewEvent,
  onOpenEditEvent,
  onPrevMonth,
  onNextMonth,
  isDark = true,
}) => {
  const { isLandscape } = useResponsiveLayout();
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  // Cálculo de la cuadrícula del mes
  const { monthLabel, daysGrid, todayStr } = useMemo(() => {
    const curr = new Date(selectedDate);
    const year = curr.getFullYear();
    const month = curr.getMonth();

    const monthStr = curr.toLocaleDateString('es-ES', { month: 'long' });
    const capitalizedMonth = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
    const label = `${capitalizedMonth} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Lunes = 0
    const totalDays = lastDay.getDate();

    const grid: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Días del mes anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      grid.push({
        day: d,
        dateStr: prevDate.toISOString().split('T')[0],
        isCurrentMonth: false,
      });
    }

    // Días del mes actual
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      grid.push({
        day: i,
        dateStr,
        isCurrentMonth: true,
      });
    }

    // Días del mes siguiente para completar 35 o 42 celdas
    const remaining = (7 - (grid.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      grid.push({
        day: i,
        dateStr: nextDate.toISOString().split('T')[0],
        isCurrentMonth: false,
      });
    }

    return {
      monthLabel: label,
      daysGrid: grid,
      todayStr: new Date().toISOString().split('T')[0],
    };
  }, [selectedDate]);

  // Formato del día seleccionado: "Lunes, 24 de agosto"
  const formattedSelectedDate = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const str = dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, [selectedDate]);

  return (
    <View style={{ flex: 1, flexDirection: isLandscape ? 'row' : 'column', gap: 16 }}>
      {/* 1. Columna Izquierda: Cuadrícula Mensual Interactiva */}
      <SpecularCard isDark={isDark} padding={20} style={{ flex: isLandscape ? 1.1 : undefined }}>
        {/* Header del Mes & Navegación */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.6 }}>
            {monthLabel}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Pressable
              onPress={onPrevMonth}
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E5E5EA',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeft size={16} color={theme.text.primary} />
            </Pressable>
            <Pressable
              onPress={onNextMonth}
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E5E5EA',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronRight size={16} color={theme.text.primary} />
            </Pressable>
          </View>
        </View>

        {/* Días de la semana */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 4 }}>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <Text
              key={i}
              style={{
                width: 38,
                textAlign: 'center',
                fontSize: 11,
                fontWeight: '800',
                color: i >= 5 ? IOS_COLORS.red : theme.text.secondary,
              }}
            >
              {d}
            </Text>
          ))}
        </View>

        {/* Celdas de Días del Mes */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 }}>
          {daysGrid.map((item, index) => {
            const isSelected = item.dateStr === selectedDate;
            const isToday = item.dateStr === todayStr;
            const meta = allEventsForMonth[item.dateStr];
            const hasItems = meta && meta.count > 0;

            return (
              <Pressable
                key={index}
                onPress={() => onSelectDate(item.dateStr)}
                style={({ pressed }) => ({
                  width: 38,
                  height: 48,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.75 : item.isCurrentMonth ? 1 : 0.35,
                  backgroundColor: isSelected
                    ? isDark
                      ? '#007AFF'
                      : '#007AFF'
                    : isToday
                    ? isDark
                      ? 'rgba(0, 122, 255, 0.2)'
                      : '#EFF6FF'
                    : 'transparent',
                  borderWidth: isToday && !isSelected ? 1 : 0,
                  borderColor: '#007AFF',
                })}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: isSelected || isToday ? '900' : '700',
                    color: isSelected
                      ? '#FFFFFF'
                      : isToday
                      ? '#007AFF'
                      : theme.text.primary,
                  }}
                >
                  {item.day}
                </Text>

                {/* Puntos de color de eventos y tareas */}
                <View style={{ flexDirection: 'row', gap: 2, marginTop: 4, height: 4 }}>
                  {hasItems &&
                    meta.colors.slice(0, 3).map((col, cIdx) => (
                      <View
                        key={cIdx}
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: isSelected ? '#FFFFFF' : col,
                        }}
                      />
                    ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      </SpecularCard>

      {/* 2. Columna Derecha (50%): Agenda Vertical del Día Seleccionado */}
      <SpecularCard isDark={isDark} padding={20} style={{ flex: 1 }}>
        {/* Header de la Agenda */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.5 }}>
              {formattedSelectedDate}
            </Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text.secondary, marginTop: 2 }}>
              {unifiedItems.length === 1 ? '1 actividad agendada' : `${unifiedItems.length} actividades agendadas`}
            </Text>
          </View>

          <Pressable
            onPress={() => onOpenNewEvent(selectedDate)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.75 : 1,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: isDark ? 'rgba(0, 122, 255, 0.2)' : '#EFF6FF',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(0, 122, 255, 0.3)',
            })}
          >
            <Plus size={16} color="#007AFF" strokeWidth={2.5} />
          </Pressable>
        </View>

        {/* Feed Vertical de Time-Blocking (Eventos + Tareas) */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
          {unifiedItems.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <CalendarIcon size={36} color={theme.text.tertiary} />
              <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text.primary }}>
                Sin actividades para este día
              </Text>
              <Text style={{ fontSize: 11, color: theme.text.secondary, textAlign: 'center' }}>
                Toca el botón + para programar un evento o examen.
              </Text>
            </View>
          ) : (
            unifiedItems.map((item) => (
              <Animated.View
                key={item.id}
                entering={FadeInUp.springify().damping(18).stiffness(200)}
                exiting={FadeOutDown.duration(120)}
                layout={LinearTransition.springify().damping(20).stiffness(180)}
              >
                <TimeBlockItem
                  item={item}
                  onPress={onOpenEditEvent}
                  isDark={isDark}
                />
              </Animated.View>
            ))
          )}
        </ScrollView>
      </SpecularCard>
    </View>
  );
};
