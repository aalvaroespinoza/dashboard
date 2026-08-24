import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { UnifiedCalendarItem } from '../../../types';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import { TimeBlockItem } from './TimeBlockItem';
import { IOS_COLORS } from '../../../styles/theme';

interface WeekGridViewProps {
  selectedDate: Date;
  unifiedItems: UnifiedCalendarItem[];
  onSelectEvent: (item: UnifiedCalendarItem) => void;
  onSlotPress: (dateStr: string, hour: number) => void;
  isDark?: boolean;
}

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 06:00 a 23:00
const HOUR_HEIGHT = 60; // Altura en px por cada hora

export const WeekGridView: React.FC<WeekGridViewProps> = ({
  selectedDate,
  unifiedItems,
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
    const todayStr = '2026-08-24';

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

  // Eventos de todo el día separados por fecha
  const allDayItemsByDate = useMemo(() => {
    const map: Record<string, UnifiedCalendarItem[]> = {};
    unifiedItems.forEach((item) => {
      if (item.is_all_day) {
        map[item.date] = [...(map[item.date] || []), item];
      }
    });
    return map;
  }, [unifiedItems]);

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000000' : theme.background, flexDirection: 'column' }}>
      {/* 1. Header de Días de la Semana */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#2C2C2E' : '#E5E5EA',
          paddingLeft: 56, // Espacio para el eje horario
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
              borderRightColor: isDark ? '#242426' : '#F2F2F7',
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary }}>
              {day.dayName}
            </Text>

            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: day.isToday ? '#007AFF' : 'transparent',
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

      {/* 2. Barra de Eventos "Todo el Día" */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: isDark ? '#161618' : '#F9FAFB',
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#2C2C2E' : '#E5E5EA',
          minHeight: 32,
          paddingLeft: 56,
        }}
      >
        {weekDays.map((day) => {
          const items = allDayItemsByDate[day.dateStr] || [];
          return (
            <View
              key={`allday-${day.dateStr}`}
              style={{
                flex: 1,
                padding: 4,
                borderRightWidth: 1,
                borderRightColor: isDark ? '#242426' : '#F2F2F7',
                gap: 2,
              }}
            >
              {items.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => onSelectEvent(item)}
                  style={{
                    backgroundColor: item.color || '#007AFF',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{ fontSize: 10, fontWeight: '800', color: '#FFFFFF' }}
                  >
                    {item.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          );
        })}
      </View>

      {/* 3. Grilla Horaria Scrollable */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ height: HOURS.length * HOUR_HEIGHT }}
      >
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* Eje Horario Izquierdo (06:00 a 23:00) */}
          <View style={{ width: 56, backgroundColor: isDark ? '#121214' : '#F9FAFB' }}>
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
                <Text style={{ fontSize: 10, fontWeight: '700', color: theme.text.tertiary }}>
                  {String(hour).padStart(2, '0')}:00
                </Text>
              </View>
            ))}
          </View>

          {/* 7 Columnas de Días */}
          <View style={{ flex: 1, flexDirection: 'row', position: 'relative' }}>
            {weekDays.map((day) => {
              // Filtrar actividades con horario para este día
              const dayTimedItems = unifiedItems.filter(
                (item) => !item.is_all_day && item.date === day.dateStr && item.start_time
              );

              return (
                <View
                  key={day.dateStr}
                  style={{
                    flex: 1,
                    borderRightWidth: 1,
                    borderRightColor: isDark ? '#242426' : '#F2F2F7',
                    position: 'relative',
                  }}
                >
                  {/* Líneas Horarias de Fondo */}
                  {HOURS.map((hour) => (
                    <Pressable
                      key={hour}
                      onPress={() => onSlotPress(day.dateStr, hour)}
                      style={{
                        height: HOUR_HEIGHT,
                        borderBottomWidth: 1,
                        borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F2F2F7',
                      }}
                    />
                  ))}

                  {/* Indicador de Hora Actual en Vivo (solo en la columna de Hoy) */}
                  {day.isToday && (
                    <CurrentTimeIndicator hourHeight={HOUR_HEIGHT} isDark={isDark} />
                  )}

                  {/* Bloques de Time-Blocking Posicionados Absolutamente */}
                  {dayTimedItems.map((item) => {
                    const [h, m] = (item.start_time || '08:00').split(':').map(Number);
                    const top = ((h - 6) * 60 + m) * (HOUR_HEIGHT / 60);

                    return (
                      <View
                        key={item.id}
                        style={{
                          position: 'absolute',
                          top: Math.max(top, 0),
                          left: 3,
                          right: 3,
                          zIndex: 10,
                        }}
                      >
                        <TimeBlockItem
                          item={item}
                          onPress={onSelectEvent}
                          isCompact
                          isDark={isDark}
                        />
                      </View>
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
