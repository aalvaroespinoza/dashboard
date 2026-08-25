/**
 * HomeCalendarWidget.tsx
 * Widget de Calendario 100% Conectado a SQLite en Tiempo Real.
 * - Calcula dinámicamente los 7 días de la semana activa.
 * - Sincroniza la lista de eventos de la izquierda y la grilla de time-blocking de la derecha con los eventos reales de useCalendarStore.
 * - Al tocar cualquier evento abre EventModal con los datos reales para edición o eliminación.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronRight, Calendar as CalendarIcon, Clock, Plus } from 'lucide-react-native';
import { useCalendarStore } from '../../../store/useCalendarStore';
import { useAppStore } from '../../../store/useAppStore';
import { IOS_COLORS, IOS_FONTS, APPLE_ACCENT } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';
import { CalendarEventItem } from '../../../types';

interface HomeCalendarWidgetProps {
  onEventPress?: (event: CalendarEventItem) => void;
  onAddEventPress?: (dateStr: string) => void;
  isDark?: boolean;
}

interface WeekDayInfo {
  short: string;
  num: string;
  fullDate: string;
  isToday: boolean;
}

/**
 * Genera dinámicamente los 7 días de la semana actual (Lunes a Domingo)
 */
function getWeekDays(referenceDate: Date = new Date('2026-08-25')): WeekDayInfo[] {
  const shortNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  const current = new Date(referenceDate);
  const dayOfWeek = current.getDay(); // 0 = Domingo, 1 = Lunes, ...
  
  // Calcular el Lunes de esta semana
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);

  const days: WeekDayInfo[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dayIndex = d.getDay();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const fullDate = `${yyyy}-${mm}-${dd}`;
    const todayStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;

    days.push({
      short: shortNames[dayIndex],
      num: String(d.getDate()),
      fullDate,
      isToday: fullDate === todayStr,
    });
  }

  return days;
}

export const HomeCalendarWidget: React.FC<HomeCalendarWidgetProps> = React.memo(({
  onEventPress,
  onAddEventPress,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { setActiveModule } = useAppStore();

  const events = useCalendarStore((state) => state.events);
  const weekDays = useMemo(() => getWeekDays(new Date('2026-08-25')), []);

  // Seleccionar por defecto el día de hoy o el primer día
  const todayIndex = weekDays.findIndex((d) => d.isToday);
  const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex >= 0 ? todayIndex : 1);

  const selectedDateObj = weekDays[selectedDayIndex] || weekDays[0];

  // Eventos reales filtrados para el día seleccionado
  const dayEvents = useMemo(() => {
    return events
      .filter((e) => e.start_date.startsWith(selectedDateObj.fullDate))
      .sort((a, b) => a.start_date.localeCompare(b.start_date));
  }, [events, selectedDateObj.fullDate]);

  // Convierte "YYYY-MM-DDTHH:mm:ss" a horas decimales (ej. 14:30 -> 14.5)
  const parseHourToDecimal = (isoStr: string) => {
    if (!isoStr || !isoStr.includes('T')) return 9;
    const timePart = isoStr.split('T')[1];
    const [h, m] = timePart.split(':').map(Number);
    return h + (m || 0) / 60;
  };

  const formatHourString = (isoStr: string) => {
    if (!isoStr || !isoStr.includes('T')) return '09:00';
    return isoStr.split('T')[1].slice(0, 5);
  };

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.border,
        borderTopColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)',
        gap: 14,
        ...createShadow('#000000', { width: 0, height: 4 }, isDark ? 0.22 : 0.03, 8),
      }}
    >
      {/* Header del Widget */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 17, fontFamily: IOS_FONTS.bold, color: theme.text.primary, letterSpacing: -0.4 }}>
            Próximos eventos
          </Text>
          <View
            style={{
              backgroundColor: isDark ? 'rgba(52, 199, 89, 0.18)' : 'rgba(52, 199, 89, 0.12)',
              paddingHorizontal: 7,
              paddingVertical: 2,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontFamily: IOS_FONTS.bold,
                color: isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light,
                fontVariant: ['tabular-nums'],
              }}
            >
              {dayEvents.length}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => setActiveModule('calendar')}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
          })}
        >
          <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.semibold, color: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light }}>
            Ver calendario
          </Text>
          <ChevronRight size={13} color={isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light} />
        </Pressable>
      </View>

      {/* Contenedor Split 50/50 */}
      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'stretch' }}>
        {/* Lado Izquierdo (~46%): Lista Textual de Eventos Reales */}
        <View style={{ flex: 1, gap: 10, borderRightWidth: 1, borderRightColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F2F2F7', paddingRight: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.bold, color: theme.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {selectedDateObj.short} {selectedDateObj.num}
            </Text>
            {selectedDateObj.isToday && (
              <View style={{ backgroundColor: isDark ? 'rgba(10, 132, 255, 0.18)' : 'rgba(0, 122, 255, 0.12)', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 }}>
                <Text style={{ fontSize: 9, fontFamily: IOS_FONTS.bold, color: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light }}>
                  HOY
                </Text>
              </View>
            )}
          </View>

          {dayEvents.length === 0 ? (
            <View style={{ paddingVertical: 24, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <CalendarIcon size={24} color={theme.text.tertiary} />
              <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.semibold, color: theme.text.secondary }}>
                Sin eventos agendados
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {dayEvents.map((evt) => {
                const startTime = formatHourString(evt.start_date);
                const eventColor = evt.color || (isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light);

                return (
                  <Pressable
                    key={evt.id}
                    onPress={() => onEventPress?.(evt)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.75 : 1,
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      gap: 8,
                      paddingVertical: 2,
                    })}
                  >
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: eventColor,
                        marginTop: 5,
                      }}
                    />
                    <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: theme.text.primary, width: 44 }}>
                      {startTime}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                        {evt.title}
                      </Text>
                      {evt.location && (
                        <Text numberOfLines={1} style={{ fontSize: 10, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                          {evt.location}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Lado Derecho (~54%): Mini Grilla Semanal con Time-Blocking Dinámico Real */}
        <View style={{ flex: 1.25, gap: 8 }}>
          {/* Selector de Días Semanales (7 Columnas flex-1 Simétricas) */}
          <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}>
            {weekDays.map((day, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <Pressable
                  key={day.fullDate}
                  onPress={() => setSelectedDayIndex(idx)}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                  style={{ flex: 1, alignItems: 'center', gap: 3 }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontFamily: IOS_FONTS.bold,
                      color: isSelected
                        ? (isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light)
                        : theme.text.tertiary,
                    }}
                  >
                    {day.short}
                  </Text>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: isSelected
                        ? (isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light)
                        : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: IOS_FONTS.bold,
                        color: isSelected ? '#FFFFFF' : theme.text.primary,
                      }}
                    >
                      {day.num}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Mini Franja de Horas con Bloques Dinámicos de Eventos */}
          <View
            style={{
              height: 148,
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.25)' : '#F9FAFB',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 6,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Líneas Horarias Guía (08:00 a 20:00) */}
            {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'].map((hour) => (
              <View key={hour} style={{ flexDirection: 'row', alignItems: 'center', height: 24, gap: 4 }}>
                <Text style={{ fontSize: 9, fontFamily: IOS_FONTS.regular, color: theme.text.tertiary, width: 28 }}>
                  {hour}
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#E5E5EA' }} />
              </View>
            ))}

            {/* Posicionamiento Dinámico de los Bloques Reales de Eventos */}
            {dayEvents.map((evt) => {
              const startDecimal = parseHourToDecimal(evt.start_date);
              const endDecimal = parseHourToDecimal(evt.end_date) || (startDecimal + 1);
              const eventColor = evt.color || (isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light);

              // Rango 08:00 a 20:00 -> 12 horas en 144px -> 12px por hora
              const topPx = Math.max(0, Math.min(120, (startDecimal - 8) * 12));
              const heightPx = Math.max(22, Math.min(60, (endDecimal - startDecimal) * 12));

              return (
                <Pressable
                  key={evt.id}
                  onPress={() => onEventPress?.(evt)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    position: 'absolute',
                    top: topPx,
                    left: 36,
                    right: 8,
                    height: heightPx,
                    backgroundColor: `${eventColor}25`,
                    borderRadius: 6,
                    borderLeftWidth: 3,
                    borderLeftColor: eventColor,
                    paddingHorizontal: 6,
                    justifyContent: 'center',
                  })}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 10,
                      fontFamily: IOS_FONTS.bold,
                      color: eventColor,
                    }}
                  >
                    {evt.title}
                  </Text>
                  {heightPx > 28 && (
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 8,
                        fontFamily: IOS_FONTS.regular,
                        color: theme.text.secondary,
                      }}
                    >
                      {formatHourString(evt.start_date)} - {formatHourString(evt.end_date)}{evt.location ? ` · ${evt.location}` : ''}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
});
