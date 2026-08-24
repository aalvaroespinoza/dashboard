import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight, Check, Plus } from 'lucide-react-native';
import { IOS_COLORS } from '../../../styles/theme';
import { GlassContainer } from '../../../components/common/GlassContainer';
import { CalendarCategoryItem } from '../../../store/useCalendarStore';

interface CalendarSidebarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  categories: CalendarCategoryItem[];
  onToggleCategory: (id: string) => void;
  onAddEvent: () => void;
  isDark?: boolean;
}

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  selectedDate,
  onSelectDate,
  categories,
  onToggleCategory,
  onAddEvent,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const { monthName, yearNumber, calendarDays, currentDayNumber } = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const currentDay = selectedDate.getDate();

    const monthStr = selectedDate.toLocaleDateString('es-ES', { month: 'long' });
    const capitalizedMonth = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);

    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const daysArray: { date: Date; day: number; isCurrentMonth: boolean; isSelected: boolean }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      daysArray.push({ date: d, day: prevMonthDays - i, isCurrentMonth: false, isSelected: false });
    }

    for (let i = 1; i <= totalDaysInMonth; i++) {
      const d = new Date(year, month, i);
      daysArray.push({
        date: d,
        day: i,
        isCurrentMonth: true,
        isSelected: i === currentDay,
      });
    }

    const remaining = 35 - daysArray.length;
    for (let i = 1; i <= (remaining > 0 ? remaining : 42 - daysArray.length); i++) {
      const d = new Date(year, month + 1, i);
      daysArray.push({ date: d, day: i, isCurrentMonth: false, isSelected: false });
    }

    return {
      monthName: capitalizedMonth,
      yearNumber: year,
      calendarDays: daysArray.slice(0, 35),
      currentDayNumber: currentDay,
    };
  }, [selectedDate]);

  const handlePrevMonth = () => {
    const prev = new Date(selectedDate);
    prev.setMonth(prev.getMonth() - 1);
    onSelectDate(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(selectedDate);
    next.setMonth(next.getMonth() + 1);
    onSelectDate(next);
  };

  return (
    <GlassContainer
      isDark={isDark}
      intensity={35}
      style={{
        width: 250,
        borderRightWidth: 1,
        borderRightColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E5EA',
        padding: 16,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Botón + Nuevo Evento */}
        <Pressable
          onPress={onAddEvent}
          style={({ pressed }) => ({
            opacity: pressed ? 0.85 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#007AFF',
            paddingVertical: 11,
            borderRadius: 14,
            marginBottom: 20,
            gap: 8,
          })}
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={{ fontSize: 14, fontWeight: '900', color: '#FFFFFF' }}>
            Nuevo Evento
          </Text>
        </Pressable>

        {/* 1. Mini Calendario Mensual */}
        <View style={{ marginBottom: 24 }}>
          {/* Header del Mini Mes */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.3 }}>
              {monthName} {yearNumber}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Pressable
                onPress={handlePrevMonth}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E5E5EA',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronLeft size={13} color={theme.text.primary} />
              </Pressable>
              <Pressable
                onPress={handleNextMonth}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E5E5EA',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronRight size={13} color={theme.text.primary} />
              </Pressable>
            </View>
          </View>

          {/* Días L M M J V S D */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, idx) => (
              <Text
                key={idx}
                style={{
                  width: 28,
                  textAlign: 'center',
                  fontSize: 10,
                  fontWeight: '800',
                  color: theme.text.tertiary,
                }}
              >
                {d}
              </Text>
            ))}
          </View>

          {/* Grid de 35 días */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 4 }}>
            {calendarDays.map((item, index) => {
              const isToday =
                item.date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

              return (
                <Pressable
                  key={index}
                  onPress={() => onSelectDate(item.date)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: item.isSelected
                      ? '#007AFF'
                      : isToday
                      ? isDark
                        ? 'rgba(0, 122, 255, 0.2)'
                        : '#EFF6FF'
                      : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: item.isSelected || isToday ? '900' : '600',
                      color: item.isSelected
                        ? '#FFFFFF'
                        : !item.isCurrentMonth
                        ? theme.text.quaternary
                        : isToday
                        ? '#007AFF'
                        : theme.text.primary,
                    }}
                  >
                    {item.day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 2. Categorías / Calendarios Visibles */}
        <View style={{ gap: 10 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '800',
              color: theme.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              paddingLeft: 2,
            }}
          >
            Mis Calendarios
          </Text>

          <View style={{ gap: 6 }}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => onToggleCategory(cat.id)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.75 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 12,
                  backgroundColor: cat.isVisible
                    ? isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : '#F2F2F7'
                    : 'transparent',
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 6,
                      backgroundColor: cat.isVisible ? cat.color : 'transparent',
                      borderWidth: 2,
                      borderColor: cat.color,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {cat.isVisible && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: cat.isVisible ? '700' : '500',
                      color: cat.isVisible ? theme.text.primary : theme.text.secondary,
                    }}
                  >
                    {cat.name}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </GlassContainer>
  );
};
