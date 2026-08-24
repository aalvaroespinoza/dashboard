import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Calendar as CalendarIcon, ChevronRight, Clock, MapPin } from 'lucide-react-native';
import { useCalendarStore } from '../../../store/useCalendarStore';
import { useAppStore } from '../../../store/useAppStore';
import { SpecularCard } from '../../../components/common/SpecularCard';
import { IOS_COLORS } from '../../../styles/theme';

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
    <SpecularCard isDark={isDark} padding={22}>
      {/* Header del Widget */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: 'rgba(52, 199, 89, 0.16)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarIcon size={19} color="#34C759" strokeWidth={2.5} />
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.5 }}>
              Agenda de Hoy
            </Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text.secondary }}>
              Eventos y clases
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => setActiveModule('calendar')}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F2F2F7',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10,
            gap: 2,
          })}
        >
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#34C759' }}>
            Calendario
          </Text>
          <ChevronRight size={13} color="#34C759" />
        </Pressable>
      </View>

      {/* Lista de Eventos con Bloques Pastel y Bordes Especulares */}
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
                borderRadius: 16,
                backgroundColor: isDark ? '#242426' : '#F9FAFB',
                borderWidth: 1,
                borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.8)',
                borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#E5E5EA',
                borderLeftColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#E5E5EA',
                borderRightColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#E5E5EA',
                overflow: 'hidden',
              }}
            >
              {/* Barra de Color Izquierda */}
              <View style={{ width: 5, backgroundColor: eventColor }} />

              {/* Contenido */}
              <View style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 14, gap: 4 }}>
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

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color={theme.text.secondary} />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
                      {startTime} - {endTime}
                    </Text>
                  </View>

                  {evt.location && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} color={theme.text.tertiary} />
                      <Text style={{ fontSize: 11, color: theme.text.tertiary, fontWeight: '600' }} numberOfLines={1}>
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
    </SpecularCard>
  );
});
