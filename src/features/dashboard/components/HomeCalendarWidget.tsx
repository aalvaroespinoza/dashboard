import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Calendar as CalendarIcon, ChevronRight, Clock, MapPin } from 'lucide-react-native';
import { useCalendarStore } from '../../../store/useCalendarStore';
import { useAppStore } from '../../../store/useAppStore';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface HomeCalendarWidgetProps {
  isDark?: boolean;
}

export const HomeCalendarWidget: React.FC<HomeCalendarWidgetProps> = React.memo(({ isDark = true }) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { setActiveModule } = useAppStore();

  const events = useCalendarStore((state) => state.events);

  const displayEvents = events.length > 0 ? events.slice(0, 3) : [
    {
      id: 'evt-1',
      title: 'Clase de Sistemas Operativos (UTN)',
      description: 'Aula 304 - Campus Virtual',
      location: 'Córdoba',
      start_date: '2026-08-24T14:30:00',
      end_date: '2026-08-24T18:00:00',
      color: '#FF9500',
    },
    {
      id: 'evt-2',
      title: 'Entrenamiento físico',
      description: 'Rutina en Despeñaderos',
      location: 'Gimnasio Central',
      start_date: '2026-08-24T19:00:00',
      end_date: '2026-08-24T20:15:00',
      color: '#34C759',
    },
  ];

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
        gap: 14,
        ...createShadow('#000000', { width: 0, height: 4 }, isDark ? 0.2 : 0.04, 8),
      }}
    >
      {/* Header del Widget */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: 'rgba(52, 199, 89, 0.16)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarIcon size={18} color="#34C759" strokeWidth={2.5} />
          </View>
          <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.4 }}>
            Agenda de Hoy
          </Text>
        </View>

        <Pressable
          onPress={() => setActiveModule('calendar')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#34C759' }}>
            Calendario
          </Text>
          <ChevronRight size={15} color="#34C759" />
        </Pressable>
      </View>

      {/* Lista de Eventos con Bloques Pastel */}
      <View style={{ gap: 10 }}>
        {displayEvents.map((evt) => {
          const startTime = evt.start_date.includes('T') ? evt.start_date.split('T')[1].slice(0, 5) : '14:30';
          const endTime = evt.end_date.includes('T') ? evt.end_date.split('T')[1].slice(0, 5) : '18:00';
          const eventColor = evt.color || '#34C759';

          return (
            <View
              key={evt.id}
              style={{
                flexDirection: 'row',
                borderRadius: 14,
                backgroundColor: isDark ? '#242426' : '#F9FAFB',
                borderWidth: 1,
                borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
                overflow: 'hidden',
              }}
            >
              {/* Barra de Color Izquierda */}
              <View style={{ width: 5, backgroundColor: eventColor }} />

              {/* Contenido */}
              <View style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 12, gap: 3 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 14,
                    fontWeight: '800',
                    color: theme.text.primary,
                  }}
                >
                  {evt.title}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} color={theme.text.secondary} />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
                      {startTime} - {endTime}
                    </Text>
                  </View>

                  {evt.location && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <MapPin size={11} color={theme.text.tertiary} />
                      <Text style={{ fontSize: 11, color: theme.text.tertiary }} numberOfLines={1}>
                        {evt.location}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
});
