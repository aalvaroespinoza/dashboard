import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { UnifiedCalendarItem, CalendarSettings } from '../../../types';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import { TimeBlockItem } from './TimeBlockItem';
import { IOS_COLORS } from '../../../styles/theme';

interface WeekGridViewProps {
  selectedDate: Date;
  unifiedItems: UnifiedCalendarItem[];
  settings: CalendarSettings;
  onSelectEvent: (item: UnifiedCalendarItem) => void;
  onSlotPress: (dateStr: string, hour: number) => void;
  isDark?: boolean;
}

export const WeekGridView: React.FC<WeekGridViewProps> = ({
  selectedDate,
  unifiedItems,
  settings,
  onSelectEvent,
  onSlotPress,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  // 1. Configuración de Horas según hourRange
  const { startHour, endHour, hoursList } = useMemo(() => {
    let start = 6;
    let end = 23;

    if (settings.hourRange === 'work') {
      start = 8;
      end = 20;
    } else if (settings.hourRange === '24h') {
      start = 0;
      end = 23;
    }

    const list = Array.from({ length: end - start + 1 }, (_, i) => i + start);
    return { startHour: start, endHour: end, hoursList: list };
  }, [settings.hourRange]);

  // 2. Altura de fila según slotDensity
  const hourHeight = useMemo(() => {
    if (settings.slotDensity === 'compact') return 48;
    if (settings.slotDensity === 'spacious') return 76;
    return 60; // standard
  }, [settings.slotDensity]);

  // 3. Calcular los días de la semana visible según firstDayOfWeek y hideWeekends
  const weekDays = useMemo(() => {
    const curr = new Date(selectedDate);
    const dayOfWeek = curr.getDay(); // 0 = Domingo, 1 = Lunes, ... 6 = Sábado
    
    let offset = 0;
    if (settings.firstDayOfWeek === 'monday') {
      offset = (dayOfWeek + 6) % 7; // 0 = Lunes, 6 = Domingo
    } else {
      offset = dayOfWeek; // 0 = Domingo, 6 = Sábado
    }

    const startDate = new Date(curr);
    startDate.setDate(curr.getDate() - offset);

    const days: { date: Date; dateStr: string; dayName: string; dayNum: number; isToday: boolean; isWeekend: boolean }[] = [];
    const allDayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    const todayStr = '2026-08-24';

    const count = settings.hideWeekends ? 5 : 7;

    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dayIdx = d.getDay();
      const isWeekend = dayIdx === 0 || dayIdx === 6;

      if (settings.hideWeekends && isWeekend) {
        continue;
      }

      const str = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr: str,
        dayName: allDayNames[dayIdx],
        dayNum: d.getDate(),
        isToday: str === todayStr,
        isWeekend,
      });

      if (days.length === count) break;
    }

    return days;
  }, [selectedDate, settings.firstDayOfWeek, settings.hideWeekends]);

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
          paddingLeft: 56,
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
            <Text
              style={{
                fontSize: 11,
                fontWeight: '800',
                color: day.isWeekend ? '#FF3B30' : theme.text.secondary,
              }}
            >
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
        contentContainerStyle={{ height: hoursList.length * hourHeight }}
      >
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* Eje Horario Izquierdo */}
          <View style={{ width: 56, backgroundColor: isDark ? '#121214' : '#F9FAFB' }}>
            {hoursList.map((hour) => (
              <View
                key={hour}
                style={{
                  height: hourHeight,
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

          {/* Columnas de Días */}
          <View style={{ flex: 1, flexDirection: 'row', position: 'relative' }}>
            {weekDays.map((day) => {
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
                  {hoursList.map((hour) => (
                    <Pressable
                      key={hour}
                      onPress={() => onSlotPress(day.dateStr, hour)}
                      style={{
                        height: hourHeight,
                        borderBottomWidth: 1,
                        borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F2F2F7',
                      }}
                    />
                  ))}

                  {/* Indicador de Hora Actual en Vivo (solo en la columna de Hoy si cae en el rango) */}
                  {day.isToday && (
                    <CurrentTimeIndicator hourHeight={hourHeight} isDark={isDark} />
                  )}

                  {/* Bloques de Time-Blocking Posicionados Absolutamente */}
                  {dayTimedItems.map((item) => {
                    const [h, m] = (item.start_time || '08:00').split(':').map(Number);
                    if (h < startHour || h > endHour) return null;

                    const top = ((h - startHour) * 60 + m) * (hourHeight / 60);

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
                          isCompact={settings.slotDensity === 'compact'}
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
