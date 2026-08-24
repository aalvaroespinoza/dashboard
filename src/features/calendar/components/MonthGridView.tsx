import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { CalendarEventItem } from '../../../types';
import { IOS_COLORS } from '../../../styles/theme';

interface MonthGridViewProps {
  selectedDate: Date;
  events: CalendarEventItem[];
  onSelectEvent: (event: CalendarEventItem) => void;
  onSelectDay: (dateStr: string) => void;
  isDark?: boolean;
}

export const MonthGridView: React.FC<MonthGridViewProps> = ({
  selectedDate,
  events,
  onSelectEvent,
  onSelectDay,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const { calendarDays } = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const todayStr = new Date().toISOString().split('T')[0];

    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: { dateStr: string; day: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      const str = d.toISOString().split('T')[0];
      days.push({ dateStr: str, day: prevMonthDays - i, isCurrentMonth: false, isToday: str === todayStr });
    }

    for (let i = 1; i <= totalDaysInMonth; i++) {
      const d = new Date(year, month, i);
      const str = d.toISOString().split('T')[0];
      days.push({
        dateStr: str,
        day: i,
        isCurrentMonth: true,
        isToday: str === todayStr,
      });
    }

    const remaining = 35 - days.length;
    for (let i = 1; i <= (remaining > 0 ? remaining : 42 - days.length); i++) {
      const d = new Date(year, month + 1, i);
      const str = d.toISOString().split('T')[0];
      days.push({ dateStr: str, day: i, isCurrentMonth: false, isToday: str === todayStr });
    }

    return { calendarDays: days.slice(0, 35) };
  }, [selectedDate]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header Días de la semana */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: theme.card,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          paddingVertical: 10,
        }}
      >
        {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map((d, i) => (
          <Text
            key={i}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 12,
              fontWeight: '700',
              color: theme.text.secondary,
            }}
          >
            {d}
          </Text>
        ))}
      </View>

      {/* Grilla 7x5 */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
          {calendarDays.map((item, index) => {
            const dayEvents = events.filter((e) => e.start_date.startsWith(item.dateStr));

            return (
              <Pressable
                key={index}
                onPress={() => onSelectDay(item.dateStr)}
                style={({ pressed }) => ({
                  width: '14.28%',
                  minHeight: 110,
                  borderRightWidth: 1,
                  borderBottomWidth: 1,
                  borderColor: theme.borderSubtle,
                  backgroundColor: pressed
                    ? isDark
                      ? '#2C2C2E'
                      : '#F2F2F7'
                    : theme.card,
                  padding: 6,
                })}
              >
                {/* Número del día */}
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: item.isToday ? IOS_COLORS.blue : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: item.isToday ? '900' : '600',
                      color: item.isToday
                        ? '#FFFFFF'
                        : item.isCurrentMonth
                        ? theme.text.primary
                        : theme.text.quaternary,
                    }}
                  >
                    {item.day}
                  </Text>
                </View>

                {/* Eventos del día */}
                <View style={{ gap: 2 }}>
                  {dayEvents.slice(0, 3).map((evt) => (
                    <Pressable
                      key={evt.id}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        onSelectEvent(evt);
                      }}
                      style={{
                        backgroundColor: `${evt.color || IOS_COLORS.blue}20`,
                        paddingHorizontal: 4,
                        paddingVertical: 2,
                        borderRadius: 4,
                        borderLeftWidth: 2,
                        borderLeftColor: evt.color || IOS_COLORS.blue,
                      }}
                    >
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: 10,
                          fontWeight: '700',
                          color: isDark ? '#FFFFFF' : '#111827',
                        }}
                      >
                        {evt.title}
                      </Text>
                    </Pressable>
                  ))}
                  {dayEvents.length > 3 && (
                    <Text style={{ fontSize: 9, color: theme.text.tertiary, fontWeight: '700' }}>
                      +{dayEvents.length - 3} más
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};
