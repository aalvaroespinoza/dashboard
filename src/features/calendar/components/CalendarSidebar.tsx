import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight, Check, Plus } from 'lucide-react-native';
import { IOS_COLORS } from '../../../styles/theme';

export interface CalendarCategory {
  id: string;
  name: string;
  color: string;
  isVisible: boolean;
}

interface CalendarSidebarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  categories: CalendarCategory[];
  onToggleCategory: (id: string) => void;
  onAddCategory?: () => void;
  isDark?: boolean;
}

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  selectedDate,
  onSelectDate,
  categories,
  onToggleCategory,
  onAddCategory,
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
    <View
      style={{
        width: 250,
        backgroundColor: theme.card,
        borderRightWidth: 1,
        borderRightColor: theme.border,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* 1. Mini Calendario Mensual */}
        <View style={{ marginBottom: 24 }}>
          {/* Header Mini Calendario */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text.primary }}>
              {monthName} {yearNumber}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Pressable
                onPress={handlePrevMonth}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  backgroundColor: theme.cardSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronLeft size={13} color={theme.text.secondary} />
              </Pressable>
              <Pressable
                onPress={handleNextMonth}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  backgroundColor: theme.cardSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronRight size={13} color={theme.text.secondary} />
              </Pressable>
            </View>
          </View>

          {/* Días de la semana L M M J V S D */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 6 }}>
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
              <Text
                key={i}
                style={{
                  width: 26,
                  textAlign: 'center',
                  fontSize: 10,
                  fontWeight: '700',
                  color: theme.text.tertiary,
                }}
              >
                {d}
              </Text>
            ))}
          </View>

          {/* Grilla de Días */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', gap: 2 }}>
            {calendarDays.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => onSelectDate(item.date)}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: item.isSelected ? IOS_COLORS.blue : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: item.isSelected ? '800' : item.isCurrentMonth ? '600' : '400',
                    color: item.isSelected
                      ? '#FFFFFF'
                      : item.isCurrentMonth
                      ? theme.text.primary
                      : theme.text.quaternary,
                  }}
                >
                  {item.day}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 2. Sección: Mis Calendarios */}
        <View>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '800',
              color: theme.text.primary,
              marginBottom: 12,
            }}
          >
            Mis calendarios
          </Text>

          <View style={{ gap: 8 }}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => onToggleCategory(cat.id)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.75 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 7,
                  paddingHorizontal: 8,
                  borderRadius: 8,
                  backgroundColor: cat.isVisible ? (isDark ? '#1C1C1E' : '#F8F9FA') : 'transparent',
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: 5,
                      backgroundColor: cat.color,
                    }}
                  />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text.primary }}>
                    {cat.name}
                  </Text>
                </View>

                {/* Checkmark circular */}
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: cat.isVisible ? cat.color : 'transparent',
                    borderWidth: 1.5,
                    borderColor: cat.isVisible ? cat.color : theme.text.tertiary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {cat.isVisible && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                </View>
              </Pressable>
            ))}
          </View>

          {/* Botón + Agregar Calendario */}
          {onAddCategory && (
            <Pressable
              onPress={onAddCategory}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 14,
                paddingVertical: 8,
                paddingHorizontal: 8,
                gap: 6,
              })}
            >
              <Plus size={14} color={IOS_COLORS.blue} strokeWidth={2.5} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: IOS_COLORS.blue }}>
                Agregar calendario
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
};
