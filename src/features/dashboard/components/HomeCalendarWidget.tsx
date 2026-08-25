/**
 * HomeCalendarWidget.tsx
 * Widget de Próximos Eventos del Dashboard con diseño Split 50/50:
 * - Lado Izquierdo: Lista textual cronológica de eventos (Hoy / Mañana) con dots de color y ubicación.
 * - Lado Derecho: Mini grilla semanal con selector de días y bloques de tiempo pastel interactivos.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { ChevronRight, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react-native';
import { useCalendarStore } from '../../../store/useCalendarStore';
import { useAppStore } from '../../../store/useAppStore';
import { IOS_COLORS, IOS_FONTS, APPLE_ACCENT } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface HomeCalendarWidgetProps {
  isDark?: boolean;
}

const WEEK_DAYS = [
  { short: 'LUN', num: '19', fullDate: '2026-08-24' },
  { short: 'MAR', num: '20', fullDate: '2026-08-25', isCurrent: true },
  { short: 'MIÉ', num: '21', fullDate: '2026-08-26' },
  { short: 'JUE', num: '22', fullDate: '2026-08-27' },
  { short: 'VIE', num: '23', fullDate: '2026-08-28' },
  { short: 'SÁB', num: '24', fullDate: '2026-08-29' },
  { short: 'DOM', num: '25', fullDate: '2026-08-30' },
];

export const HomeCalendarWidget: React.FC<HomeCalendarWidgetProps> = React.memo(({ isDark = true }) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { setActiveModule } = useAppStore();

  const [selectedDayIndex, setSelectedDayIndex] = useState(1); // MAR 20
  const events = useCalendarStore((state) => state.events);

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
        {/* Lado Izquierdo (~46%): Lista Textual de Eventos */}
        <View style={{ flex: 1, gap: 12, borderRightWidth: 1, borderRightColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F2F2F7', paddingRight: 14 }}>
          {/* Sección HOY */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.bold, color: theme.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              HOY
            </Text>

            {/* Evento 1 */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light, marginTop: 5 }} />
              <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: theme.text.primary, width: 44 }}>
                14:30
              </Text>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                  Clase de Sistemas Operativos
                </Text>
                <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                  UTN · Aula 3
                </Text>
              </View>
            </View>

            {/* Evento 2 */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light, marginTop: 5 }} />
              <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: theme.text.primary, width: 44 }}>
                19:00
              </Text>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                  Entrenamiento físico
                </Text>
                <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                  Gimnasio Central
                </Text>
              </View>
            </View>
          </View>

          {/* Sección MAÑANA */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.bold, color: theme.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              MAÑANA
            </Text>

            {/* Evento 3 */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light, marginTop: 5 }} />
              <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: theme.text.primary, width: 44 }}>
                11:00
              </Text>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                  Reunión de proyecto
                </Text>
                <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                  Google Meet
                </Text>
              </View>
            </View>

            {/* Evento 4 */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isDark ? APPLE_ACCENT.teal.dark : APPLE_ACCENT.teal.light, marginTop: 5 }} />
              <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: theme.text.primary, width: 44 }}>
                17:00
              </Text>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                  Cumpleaños de Ana
                </Text>
                <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                  Cena en lo de Fer
                </Text>
              </View>
            </View>
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
            {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'].map((hour, i) => (
              <View key={hour} style={{ flexDirection: 'row', alignItems: 'center', height: 24, gap: 4 }}>
                <Text style={{ fontSize: 9, fontFamily: IOS_FONTS.regular, color: theme.text.tertiary, width: 28 }}>
                  {hour}
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#E5E5EA' }} />
              </View>
            ))}

            {/* Bloque 1: Reunión equipo 10:00 - 11:00 (Pastel Azul) */}
            <View
              style={{
                position: 'absolute',
                top: 24,
                left: 36,
                right: 80,
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
                Reunión equipo · 10:00
              </Text>
            </View>

            {/* Bloque 2: Diseñar mockups 11:00 - 13:00 (Pastel Verde) */}
            <View
              style={{
                position: 'absolute',
                top: 48,
                left: 36,
                right: 40,
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
                Diseñar mockups · 11:00
              </Text>
            </View>

            {/* Bloque 3: Sistemas Operativos 14:30 - 18:00 (Pastel Púrpura) */}
            <View
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
            </View>

            {/* Bloque 4: Entrenamiento físico 19:00 (Pastel Naranja) */}
            <View
              style={{
                position: 'absolute',
                top: 118,
                left: 36,
                right: 60,
                height: 22,
                backgroundColor: isDark ? 'rgba(255, 159, 10, 0.25)' : 'rgba(255, 149, 0, 0.15)',
                borderRadius: 6,
                borderLeftWidth: 3,
                borderLeftColor: isDark ? APPLE_ACCENT.orange.dark : APPLE_ACCENT.orange.light,
                paddingHorizontal: 6,
                justifyContent: 'center',
              }}
            >
              <Text numberOfLines={1} style={{ fontSize: 9, fontFamily: IOS_FONTS.bold, color: isDark ? APPLE_ACCENT.orange.dark : APPLE_ACCENT.orange.light }}>
                Entrenamiento físico · 19:00
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
});
