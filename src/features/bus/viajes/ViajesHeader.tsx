import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Calendar, Clock, Bus, Sparkles } from 'lucide-react-native';
import { DayOfWeek } from '../types';
import { IOS_COLORS } from '../../../styles/theme';
import { useAppStore } from '../../../store/useAppStore';

interface ViajesHeaderProps {
  diaSeleccionado: DayOfWeek;
  setDiaSeleccionado: (dia: DayOfWeek) => void;
  isToday: boolean;
  horaActualHHMM: string;
  onOpenAllSchedules: () => void;
  isDark?: boolean;
}

const DAYS: { id: DayOfWeek; label: string }[] = [
  { id: 'lunes', label: 'Lunes' },
  { id: 'martes', label: 'Martes' },
  { id: 'miercoles', label: 'Miércoles' },
  { id: 'jueves', label: 'Jueves' },
  { id: 'viernes', label: 'Viernes' },
  { id: 'sabado', label: 'Sábado' },
];

export const ViajesHeader: React.FC<ViajesHeaderProps> = ({
  diaSeleccionado,
  setDiaSeleccionado,
  isToday,
  horaActualHHMM,
  onOpenAllSchedules,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const dayMap: Record<number, DayOfWeek> = {
    0: 'lunes',
    1: 'lunes',
    2: 'martes',
    3: 'miercoles',
    4: 'jueves',
    5: 'viernes',
    6: 'sabado',
  };
  const diaRealHoy = dayMap[new Date().getDay()];

  const diaCapitalizado =
    diaSeleccionado.charAt(0).toUpperCase() + diaSeleccionado.slice(1);

  return (
    <View style={{ gap: 14 }}>
      {/* Top row: App Horario + Reloj + Botones */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '900',
              color: '#32ADE6',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            APP HORARIO
          </Text>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '900',
              color: theme.text.primary,
              letterSpacing: -0.8,
              marginTop: 2,
            }}
          >
            {diaCapitalizado}
          </Text>
        </View>

        {/* Acciones Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {/* Botón Volver a hoy (si no está en hoy) */}
          {!isToday && (
            <Pressable
              onPress={() => setDiaSeleccionado(diaRealHoy)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isDark ? 'rgba(0, 122, 255, 0.2)' : '#EFF6FF',
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: IOS_COLORS.blue,
                gap: 6,
              })}
            >
              <Calendar size={14} color={IOS_COLORS.blue} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: IOS_COLORS.blue }}>
                Hoy
              </Text>
            </Pressable>
          )}

          {/* Reloj Digital en Vivo */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.card,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 6,
            }}
          >
            <Clock size={14} color={theme.text.secondary} />
            <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text.primary, fontVariant: ['tabular-nums'] }}>
              {horaActualHHMM}
            </Text>
          </View>

          {/* Botón Ver Todos los Horarios */}
          <Pressable
            onPress={onOpenAllSchedules}
            style={({ pressed }) => ({
              opacity: pressed ? 0.85 : 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: IOS_COLORS.blue,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 12,
              gap: 6,
              shadowColor: IOS_COLORS.blue,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            })}
          >
            <Bus size={15} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>
              Todos los Horarios
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Selector Horizontal de Días de la semana */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {DAYS.map((day) => {
          const isSelected = diaSeleccionado === day.id;

          return (
            <Pressable
              key={day.id}
              onPress={() => setDiaSeleccionado(day.id)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 14,
                backgroundColor: isSelected
                  ? isDark
                    ? '#FFFFFF'
                    : '#007AFF'
                  : theme.card,
                borderWidth: 1,
                borderColor: isSelected
                  ? isDark
                    ? '#FFFFFF'
                    : '#007AFF'
                  : theme.border,
              })}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: isSelected ? '800' : '600',
                  color: isSelected
                    ? isDark
                      ? '#000000'
                      : '#FFFFFF'
                    : theme.text.secondary,
                }}
              >
                {day.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};
