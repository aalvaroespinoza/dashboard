import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { CalendarEventItem } from '../../../types';
import { IOS_COLORS } from '../../../styles/theme';

interface WeekGridViewProps {
  selectedDate: Date;
  events: CalendarEventItem[];
  onSelectEvent: (event: CalendarEventItem) => void;
  onSlotPress: (dateStr: string, hour: number) => void;
  isDark?: boolean;
}

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const HOUR_HEIGHT = 64; // Altura en píxeles por cada hora

export const WeekGridView: React.FC<WeekGridViewProps> = ({
  selectedDate,
  events,
  onSelectEvent,
  onSlotPress,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  // Calcular los 7 días de la semana visible (Lunes a Domingo)
  const weekDays = useMemo(() => {
    const curr = new Date(selectedDate);
    const dayOfWeek = (curr.getDay() + 6) % 7; // 0 = Lunes, 6 = Domingo
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - dayOfWeek);

    const days: { date: Date; dateStr: string; dayName: string; dayNum: number; isToday: boolean }[] = [];
    const dayNames = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const str = d.toISOString().split('T')[0];

      days.push({
        date: d,
        dateStr: str,
        dayName: dayNames[i],
        dayNum: d.getDate(),
        isToday: str === todayStr,
      });
    }

    return days;
  }, [selectedDate]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, display: 'flex', flexDirection: 'column' }}>
      {/* 1. Header de Días de la Semana */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: theme.card,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          paddingLeft: 60, // Espacio para el eje horario
        }}
      >
        {weekDays.map((day) => (
          <View
            key={day.dateStr}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 10,
              borderRightWidth: 1,
              borderRightColor: theme.borderSubtle,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
              {day.dayName}
            </Text>

            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: day.isToday ? IOS_COLORS.blue : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: day.isToday ? '900' : '700',
                  color: day.isToday ? '#FFFFFF' : theme.text.primary,
                }}
              >
                {day.dayNum}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* 2. Grilla Horaria Scrollable */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', position: 'relative', height: HOURS.length * HOUR_HEIGHT }}>
          {/* Eje de Horas Vertical (08:00 a 20:00) */}
          <View style={{ width: 60, borderRightWidth: 1, borderRightColor: theme.border, backgroundColor: theme.card }}>
            {HOURS.map((hour) => (
              <View
                key={hour}
                style={{
                  height: HOUR_HEIGHT,
                  justifyContent: 'flex-start',
                  paddingTop: 2,
                  paddingRight: 8,
                  alignItems: 'flex-end',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text.tertiary }}>
                  {hour.toString().padStart(2, '0')}:00
                </Text>
              </View>
            ))}
          </View>

          {/* 7 Columnas de Días */}
          <View style={{ flex: 1, flexDirection: 'row' }}>
            {weekDays.map((day) => {
              // Filtrar eventos del día
              const dayEvents = events.filter((e) => e.start_date.startsWith(day.dateStr));

              return (
                <View
                  key={day.dateStr}
                  style={{
                    flex: 1,
                    position: 'relative',
                    borderRightWidth: 1,
                    borderRightColor: theme.borderSubtle,
                  }}
                >
                  {/* Slots por hora para tocar y crear evento */}
                  {HOURS.map((hour) => (
                    <Pressable
                      key={hour}
                      onPress={() => onSlotPress(day.dateStr, hour)}
                      style={({ pressed }) => ({
                        height: HOUR_HEIGHT,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.borderSubtle,
                        backgroundColor: pressed ? (isDark ? '#2C2C2E' : '#F2F2F7') : 'transparent',
                      })}
                    />
                  ))}

                  {/* Renderizado de Bloques de Eventos Posicionados Absolutamente */}
                  {dayEvents.map((evt) => {
                    // Calcular hora de inicio y duración en minutos
                    const startTimeStr = evt.start_date.includes('T') ? evt.start_date.split('T')[1] : '09:00:00';
                    const endTimeStr = evt.end_date.includes('T') ? evt.end_date.split('T')[1] : '10:00:00';

                    const [startH, startM] = startTimeStr.split(':').map(Number);
                    const [endH, endM] = endTimeStr.split(':').map(Number);

                    const startMinutes = (startH - 8) * 60 + (startM || 0);
                    const endMinutes = (endH - 8) * 60 + (endM || 0);
                    const durationMinutes = Math.max(30, endMinutes - startMinutes);

                    const top = (startMinutes / 60) * HOUR_HEIGHT;
                    const height = (durationMinutes / 60) * HOUR_HEIGHT;

                    const eventColor = evt.color || IOS_COLORS.blue;

                    return (
                      <Pressable
                        key={evt.id}
                        onPress={() => onSelectEvent(evt)}
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.85 : 1,
                          position: 'absolute',
                          top: Math.max(0, top),
                          left: 2,
                          right: 2,
                          height: Math.max(32, height - 3),
                          backgroundColor: `${eventColor}20`,
                          borderColor: eventColor,
                          borderLeftWidth: 3,
                          borderRadius: 8,
                          padding: 6,
                          overflow: 'hidden',
                          zIndex: 10,
                        })}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: 12,
                            fontWeight: '800',
                            color: isDark ? '#FFFFFF' : '#111827',
                          }}
                        >
                          {evt.title}
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: 10,
                            fontWeight: '600',
                            color: eventColor,
                            marginTop: 1,
                          }}
                        >
                          {startTimeStr.slice(0, 5)} - {endTimeStr.slice(0, 5)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
