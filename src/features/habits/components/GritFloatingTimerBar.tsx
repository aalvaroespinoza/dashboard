import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { Square } from 'lucide-react-native';
import { useHabitsStore } from '../stores/useHabitsStore';
import { AppleEmoji } from '../../../components/ui/AppleEmoji';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface GritFloatingTimerBarProps {
  onPressHabit: () => void;
  isDark?: boolean;
}

export const GritFloatingTimerBar: React.FC<GritFloatingTimerBarProps> = ({
  onPressHabit,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { getActiveRunningTimer, stopAndSaveTimer, selectedDate } = useHabitsStore();

  const [liveSecs, setLiveSecs] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Interval GLOBAL que vive mientras el FloatingTimerBar esté montado.
  // Siempre activo: calcula liveSeconds leyendo delta Date.now() en cada tick.
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const info = getActiveRunningTimer();
      if (info) {
        setLiveSecs(info.liveSeconds);
      }
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // [] → solo se monta/desmonta una vez — sobrevive cambios de pantalla

  const activeInfo = getActiveRunningTimer();
  if (!activeInfo) return null;

  const { habit } = activeInfo;
  const m = Math.floor(liveSecs / 60);
  const s = liveSecs % 60;
  const timeFormatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;


  return (
    <Pressable
      onPress={onPressHabit}
      style={({ pressed }) => ({
        opacity: pressed ? 0.95 : 1,
        position: 'absolute',
        bottom: 20,
        left: 290,
        right: 24,
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderWidth: 1.5,
        borderColor: '#FF3B30',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 40,
        ...createShadow('#FF3B30', { width: 0, height: 4 }, 0.25, 12),
      })}
    >
      {/* Izquierda: Indicador Pulsante + Info Hábito */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: 'rgba(255, 59, 48, 0.15)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppleEmoji emoji={habit.icon} size={20} />
        </View>

        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FF3B30' }} />
            <Text style={{ fontSize: 13, fontWeight: '900', color: theme.text.primary }}>
              {habit.title}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: theme.text.secondary }}>
            Cronómetro en progreso · Toca para abrir
          </Text>
        </View>
      </View>

      {/* Derecha: Tiempo Vivo + Botón Detener */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '900',
            color: '#FF3B30',
            fontVariant: ['tabular-nums'],
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
          }}
        >
          {timeFormatted}
        </Text>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            stopAndSaveTimer(habit.id, selectedDate);
          }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#FF3B30',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Square size={14} color="#FFFFFF" fill="#FFFFFF" />
        </Pressable>
      </View>
    </Pressable>
  );
};
