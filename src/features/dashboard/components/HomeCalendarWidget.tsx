/**
 * HomeCalendarWidget.tsx
 * Widget de Próximos Eventos del Dashboard con diseño Split 50/50 interactivo:
 * - Lado Izquierdo: Lista textual sincronizada con el día seleccionado y toque para inspeccionar.
 * - Lado Derecho: Mini grilla semanal con selector táctil de días y bloques de tiempo pastel interactivos.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronRight, Calendar as CalendarIcon } from 'lucide-react-native';
import { useCalendarStore } from '../../../store/useCalendarStore';
import { useAppStore } from '../../../store/useAppStore';
import { IOS_COLORS, IOS_FONTS, APPLE_ACCENT } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';
import { CalendarEventItem } from '../../../types';

interface HomeCalendarWidgetProps {
  onEventPress?: (event: CalendarEventItem) => void;
  isDark?: boolean;
}

const WEEK_DAYS = [
  { short: 'LUN', num: '24', fullDate: '2026-08-24' },
  { short: 'MAR', num: '25', fullDate: '2026-08-25', isCurrent: true },
  { short: 'MIÉ', num: '26', fullDate: '2026-08-26' },
  { short: 'JUE', num: '27', fullDate: '2026-08-27' },
  { short: 'VIE', num: '28', fullDate: '2026-08-28' },
  { short: 'SÁB', num: '29', fullDate: '2026-08-29' },
  { short: 'DOM', num: '30', fullDate: '2026-08-30' },
];

export const HomeCalendarWidget: React.FC<HomeCalendarWidgetProps> = React.memo(({
  onEventPress,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { setActiveModule } = useAppStore();

  const [selectedDayIndex, setSelectedDayIndex] = useState(1); // MAR 25
  const events = useCalendarStore((state) => state.events);

  const selectedDateObj = WEEK_DAYS[selectedDayIndex] || WEEK_DAYS[1];

  // Eventos filtrados según el día seleccionado en la mini grilla
  const dayEvents: CalendarEventItem[] = useMemo(() => {
    const filtered = events.filter((e) => e.start_date.startsWith(selectedDateObj.fullDate));
    if (filtered.length > 0) return filtered;

    // Fallbacks elegantes para simular la maqueta si la base de datos está vacía para ese día
    if (selectedDateObj.num === '25') {
      return [
        {
          id: 'mock-evt-1',
          title: 'Clase de Sistemas Operativos',
          location: 'UTN · Aula 3',
          start_date: '2026-08-25T14:30:00',
          end_date: '2026-08-25T18:00:00',
          color: '#BF5AF2',
          is_all_day: 0,
          sync_status: 'synced',
          created_at: '',
          updated_at: '',
        },
        {
          id: 'mock-evt-2',
          title: 'Entrenamiento físico',
          location: 'Gimnasio Central',
          start_date: '2026-08-25T19:00:00',
          end_date: '2026-08-25T20:15:00',
          color: '#30D158',
          is_all_day: 0,
          sync_status: 'synced',
          created_at: '',
          updated_at: '',
        },
      ];
    }

    if (selectedDateObj.num === '26') {
      return [
        {
          id: 'mock-evt-3',
          title: 'Reunión de proyecto',
          location: 'Google Meet',
          start_date: '2026-08-26T11:00:00',
          end_date: '2026-08-26T12:00:00',
          color: '#0A84FF',
          is_all_day: 0,
          sync_status: 'synced',
          created_at: '',
          updated_at: '',
        },
        {
          id: 'mock-evt-4',
          title: 'Cumpleaños de Ana',
          location: 'Cena en lo de Fer',
          start_date: '2026-08-26T17:00:00',
          end_date: '2026-08-26T19:00:00',
          color: '#40C8E0',
          is_all_day: 0,
          sync_status: 'synced',
          created_at: '',
          updated_at: '',
        },
      ];
    }

    return [];
  }, [events, selectedDateObj]);

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E5EA',
        borderTopColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.9)',
        gap: 14,
        ...createShadow('#000000', { width: 0, height: 4 }, isDark ? 0.22 : 0.03, 8),
      }}
    >
      {/* Header del Widget */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 17, fontFamily: IOS_FONTS.bold, color: theme.text.primary, letterSpacing: -0.4 }}>
          Próximos eventos
        </Text>

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
        {/* Lado Izquierdo (~46%): Lista Textual de Eventos Sincronizada */}
        <View style={{ flex: 1, gap: 12, borderRightWidth: 1, borderRightColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F2F2F7', paddingRight: 14 }}>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.bold, color: theme.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                {selectedDateObj.short} {selectedDateObj.num}
              </Text>
              <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.semibold, color: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light }}>
                {dayEvents.length} eventos
              </Text>
            </View>

            {dayEvents.length === 0 ? (
              <View style={{ paddingVertical: 24, alignItems: 'center', gap: 4 }}>
                <CalendarIcon size={24} color={theme.text.tertiary} />
                <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                  Sin eventos agendados
                </Text>
              </View>
            ) : (
              dayEvents.map((evt) => {
                const startTime = evt.start_date.includes('T') ? evt.start_date.split('T')[1].slice(0, 5) : '14:30';
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
                        backgroundColor: evt.color || (isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light),
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
              })
            )}
          </View>
        </View>

        {/* Lado Derecho (~54%): Mini Grilla Semanal con Time-Blocking */}
        <View style={{ flex: 1.25, gap: 8 }}>
          {/* Selector de Días Semanales */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {WEEK_DAYS.map((day, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <Pressable
                  key={day.short}
                  onPress={() => setSelectedDayIndex(idx)}
                  style={{ alignItems: 'center', gap: 2 }}
                >
                  <Text style={{ fontSize: 9, fontFamily: IOS_FONTS.bold, color: isSelected ? (isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light) : theme.text.tertiary }}>
                    {day.short}
                  </Text>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: isSelected ? (isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light) : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
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

          {/* Mini Franja de Horas con Bloques Pastel */}
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
            {/* Líneas Horarias */}
            {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'].map((hour) => (
              <View key={hour} style={{ flexDirection: 'row', alignItems: 'center', height: 24, gap: 4 }}>
                <Text style={{ fontSize: 9, fontFamily: IOS_FONTS.regular, color: theme.text.tertiary, width: 28 }}>
                  {hour}
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#E5E5EA' }} />
              </View>
            ))}

            {/* Bloques Pastel Interactivos */}
            {selectedDateObj.num === '25' && dayEvents.length >= 2 && (
              <>
                <Pressable
                  onPress={() => onEventPress?.(dayEvents[0])}
                  style={{
                    position: 'absolute',
                    top: 76,
                    left: 36,
                    right: 10,
                    height: 38,
                    backgroundColor: isDark ? 'rgba(191, 90, 242, 0.25)' : 'rgba(175, 82, 222, 0.15)',
                    borderRadius: 6,
                    borderLeftWidth: 3,
                    borderLeftColor: isDark ? APPLE_ACCENT.purple.dark : APPLE_ACCENT.purple.light,
                    paddingHorizontal: 6,
                    justifyContent: 'center',
                  }}
                >
                  <Text numberOfLines={1} style={{ fontSize: 10, fontFamily: IOS_FONTS.bold, color: isDark ? APPLE_ACCENT.purple.dark : APPLE_ACCENT.purple.light }}>
                    Clase Sistemas Operativos (UTN)
                  </Text>
                  <Text style={{ fontSize: 8, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                    14:30 - 18:00 · Aula 3
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => onEventPress?.(dayEvents[1])}
                  style={{
                    position: 'absolute',
                    top: 118,
                    left: 36,
                    right: 60,
                    height: 22,
                    backgroundColor: isDark ? 'rgba(48, 209, 88, 0.25)' : 'rgba(52, 199, 89, 0.15)',
                    borderRadius: 6,
                    borderLeftWidth: 3,
                    borderLeftColor: isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light,
                    paddingHorizontal: 6,
                    justifyContent: 'center',
                  }}
                >
                  <Text numberOfLines={1} style={{ fontSize: 9, fontFamily: IOS_FONTS.bold, color: isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light }}>
                    Entrenamiento físico · 19:00
                  </Text>
                </Pressable>
              </>
            )}

            {selectedDateObj.num === '26' && dayEvents.length >= 2 && (
              <>
                <Pressable
                  onPress={() => onEventPress?.(dayEvents[0])}
                  style={{
                    position: 'absolute',
                    top: 36,
                    left: 36,
                    right: 40,
                    height: 22,
                    backgroundColor: isDark ? 'rgba(10, 132, 255, 0.25)' : 'rgba(0, 122, 255, 0.15)',
                    borderRadius: 6,
                    borderLeftWidth: 3,
                    borderLeftColor: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light,
                    paddingHorizontal: 6,
                    justifyContent: 'center',
                  }}
                >
                  <Text numberOfLines={1} style={{ fontSize: 9, fontFamily: IOS_FONTS.bold, color: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light }}>
                    Reunión de proyecto · 11:00
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => onEventPress?.(dayEvents[1])}
                  style={{
                    position: 'absolute',
                    top: 104,
                    left: 36,
                    right: 50,
                    height: 24,
                    backgroundColor: isDark ? 'rgba(64, 200, 224, 0.25)' : 'rgba(48, 176, 199, 0.15)',
                    borderRadius: 6,
                    borderLeftWidth: 3,
                    borderLeftColor: isDark ? APPLE_ACCENT.teal.dark : APPLE_ACCENT.teal.light,
                    paddingHorizontal: 6,
                    justifyContent: 'center',
                  }}
                >
                  <Text numberOfLines={1} style={{ fontSize: 9, fontFamily: IOS_FONTS.bold, color: isDark ? APPLE_ACCENT.teal.dark : APPLE_ACCENT.teal.light }}>
                    Cumpleaños de Ana · 17:00
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
});
