import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import {
  Play,
  Square,
  Plus,
  Check,
  Zap,
  Flame,
  Clock,
  RotateCcw,
} from 'lucide-react-native';
import { HabitItem, HabitLogItem } from '../../../types';
import { useHabitsStore, ActiveTimerState } from '../stores/useHabitsStore';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';
import { IOS_SPRINGS } from '../../../styles/animations';

interface GritHabitCardProps {
  habit: HabitItem;
  logsForHabit: Record<string, HabitLogItem>;
  recentDates: string[];
  onOpenDetail: (habit: HabitItem) => void;
  isDark?: boolean;
}

export const GritHabitCard: React.FC<GritHabitCardProps> = ({
  habit,
  logsForHabit,
  recentDates,
  onOpenDetail,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const {
    selectedDate,
    toggleCheck,
    incrementCounter,
    startTimer,
    stopAndSaveTimer,
    activeTimers,
    getTimerSeconds,
  } = useHabitsStore();

  const currentLog = logsForHabit[selectedDate];
  const isCompleted = Boolean(currentLog?.is_completed);
  const isSkipped = Boolean(currentLog?.is_skipped);

  // Live timer tick
  const timerState: ActiveTimerState | undefined = activeTimers[habit.id];
  const isTimerRunning = Boolean(timerState?.isRunning);
  const [liveSeconds, setLiveSeconds] = useState(() => getTimerSeconds(habit.id));

  // Animación de pulso para cuando el cronómetro está corriendo
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isTimerRunning) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 600 }),
          withTiming(1.0, { duration: 600 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [isTimerRunning]);

  useEffect(() => {
    if (!isTimerRunning) {
      setLiveSeconds(getTimerSeconds(habit.id));
      return;
    }
    const interval = setInterval(() => {
      setLiveSeconds(getTimerSeconds(habit.id));
    }, 400);
    return () => clearInterval(interval);
  }, [isTimerRunning, habit.id]);

  const formatTimerDigits = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleActionPress = async () => {
    if (habit.type === 'check') {
      await toggleCheck(habit.id, selectedDate);
    } else if (habit.type === 'counter') {
      await incrementCounter(habit.id, 1, selectedDate);
    } else if (habit.type === 'timer') {
      if (isTimerRunning) {
        await stopAndSaveTimer(habit.id, selectedDate);
      } else {
        startTimer(habit.id);
      }
    }
  };

  const cardAccent = habit.color || '#34C759';
  const streak = habit.streak_count ?? 0;
  const isStreakNegative = streak < 0;

  return (
    <Pressable
      onPress={() => onOpenDetail(habit)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.92 : 1,
        flex: 1,
        minWidth: 320,
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1.5,
        borderColor: isCompleted
          ? `${cardAccent}60`
          : isSkipped
          ? 'rgba(255, 149, 0, 0.4)'
          : theme.border,
        gap: 12,
        position: 'relative',
        overflow: 'hidden',
        ...createShadow(
          isCompleted ? cardAccent : '#000000',
          { width: 0, height: 3 },
          isDark ? (isCompleted ? 0.25 : 0.12) : 0.05,
          8
        ),
      })}
    >
      {/* Franja Vertical Izquierda Saturada */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: 5,
          backgroundColor: cardAccent,
        }}
      />

      {/* 1. Header: Racha (Streak) & Puntos */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 4 }}>
        {/* Badge de Racha */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isStreakNegative
              ? 'rgba(255, 59, 48, 0.16)'
              : 'rgba(52, 199, 89, 0.16)',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isStreakNegative
              ? 'rgba(255, 59, 48, 0.3)'
              : 'rgba(52, 199, 89, 0.3)',
            gap: 4,
          }}
        >
          <Flame
            size={11}
            color={isStreakNegative ? '#FF3B30' : '#34C759'}
            fill={isStreakNegative ? '#FF3B30' : '#34C759'}
          />
          <Text
            style={{
              fontSize: 11,
              fontWeight: '900',
              color: isStreakNegative ? '#FF3B30' : '#34C759',
            }}
          >
            {isStreakNegative ? `${streak}` : `+${streak}`}
          </Text>
        </View>

        {/* Badge de Puntos */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Zap size={11} color={cardAccent} fill={cardAccent} />
          <Text style={{ fontSize: 11, fontWeight: '800', color: cardAccent }}>
            +{habit.points} pts
          </Text>
        </View>
      </View>

      {/* 2. Cuerpo: Emoji, Título, Subtítulo y Botón de Acción */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          {/* Emoji */}
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: `${cardAccent}20`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 22 }}>{habit.icon}</Text>
          </View>

          {/* Título & Frecuencia */}
          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 15,
                fontWeight: '900',
                color: isCompleted ? theme.text.secondary : theme.text.primary,
                textDecorationLine: isCompleted ? 'line-through' : 'none',
              }}
            >
              {habit.title}
            </Text>

            <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text.secondary, marginTop: 2 }}>
              {isSkipped
                ? 'Saltado hoy ☀️'
                : habit.type === 'counter'
                ? `${currentLog?.completed_value || 0}/${habit.target_value} ${habit.target_unit}`
                : habit.frequency}
            </Text>
          </View>
        </View>

        {/* Botón Circular de Acción Táctil */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            handleActionPress();
          }}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.88 : 1 }],
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: isCompleted
              ? cardAccent
              : isTimerRunning
              ? '#FF3B30'
              : `${cardAccent}25`,
            borderWidth: 2,
            borderColor: isCompleted
              ? cardAccent
              : isTimerRunning
              ? '#FF3B30'
              : cardAccent,
            alignItems: 'center',
            justifyContent: 'center',
            ...createShadow(
              isTimerRunning ? '#FF3B30' : cardAccent,
              { width: 0, height: 2 },
              isTimerRunning ? 0.4 : 0.15,
              4
            ),
          })}
        >
          {habit.type === 'check' ? (
            isCompleted ? (
              <Check size={18} color="#FFFFFF" strokeWidth={3} />
            ) : (
              <Check size={18} color={cardAccent} strokeWidth={2.5} />
            )
          ) : habit.type === 'counter' ? (
            isCompleted ? (
              <Check size={18} color="#FFFFFF" strokeWidth={3} />
            ) : (
              <Plus size={18} color={cardAccent} strokeWidth={2.5} />
            )
          ) : (
            // Timer
            isTimerRunning ? (
              <Square size={14} color="#FFFFFF" fill="#FFFFFF" />
            ) : isCompleted ? (
              <Check size={18} color="#FFFFFF" strokeWidth={3} />
            ) : (
              <Play size={16} color={cardAccent} fill={cardAccent} style={{ marginLeft: 2 }} />
            )
          )}
        </Pressable>
      </View>

      {/* Temporizador corriendo en vivo dentro de la tarjeta */}
      {isTimerRunning && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255, 59, 48, 0.15)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
            marginLeft: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30' }} />
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#FF3B30' }}>
              Corriendo...
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '900',
              color: '#FF3B30',
              fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            }}
          >
            {formatTimerDigits(liveSeconds)}
          </Text>
        </View>
      )}

      {/* 3. Mini Gráfico Dinámico de 10 Barras en la Base */}
      <View style={{ paddingTop: 4, paddingLeft: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 26, gap: 4 }}>
          {recentDates.slice(-10).map((dateStr) => {
            const log = logsForHabit[dateStr];
            const isDayCompleted = Boolean(log?.is_completed);
            const isDaySelected = dateStr === selectedDate;

            // Altura de la barra
            let barHeight = isDayCompleted ? 20 : 6;
            if (habit.type === 'counter' && log?.completed_value) {
              const ratio = Math.min(1, log.completed_value / habit.target_value);
              barHeight = Math.max(6, Math.round(ratio * 20));
            }

            return (
              <View
                key={dateStr}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
              >
                <View
                  style={{
                    width: '100%',
                    height: barHeight,
                    borderRadius: 4,
                    backgroundColor: isDayCompleted
                      ? cardAccent
                      : isDark
                      ? '#2C2C2E'
                      : '#E5E5EA',
                    borderWidth: isDaySelected ? 1.5 : 0,
                    borderColor: isDaySelected ? (isDayCompleted ? '#FFFFFF' : cardAccent) : 'transparent',
                  }}
                />
              </View>
            );
          })}
        </View>
      </View>
    </Pressable>
  );
};
