import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import {
  Play,
  Square,
  Plus,
  Check,
  Zap,
  Flame,
  FileText,
} from 'lucide-react-native';
import { HabitItem, HabitLogItem } from '../../../types';
import { useHabitsStore, ActiveTimerState } from '../stores/useHabitsStore';
import { IOS_COLORS } from '../../../styles/theme';
import { IOS_SPRINGS } from '../../../styles/animations';
import { createShadow } from '../../../styles/shadows';

interface HabitCardProps {
  habit: HabitItem;
  recentDates: string[];
  logsForHabit: Record<string, HabitLogItem>;
  onOpenTimerModal?: (habit: HabitItem) => void;
  onOpenNoteModal?: (habit: HabitItem) => void;
  isDark?: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  recentDates,
  logsForHabit,
  onOpenTimerModal,
  onOpenNoteModal,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const today = new Date().toISOString().split('T')[0];

  const {
    toggleCheck,
    incrementCounter,
    startTimer,
    pauseTimer,
    stopAndSaveTimer,
    activeTimers,
    getTimerSeconds,
  } = useHabitsStore();

  const currentLog = logsForHabit[today];
  const isTodayCompleted = Boolean(currentLog?.is_completed);

  // Live timer tick for this specific habit
  const timerState: ActiveTimerState | undefined = activeTimers[habit.id];
  const isTimerRunning = Boolean(timerState?.isRunning);
  const [liveSeconds, setLiveSeconds] = useState(() => getTimerSeconds(habit.id));

  useEffect(() => {
    if (!isTimerRunning) {
      setLiveSeconds(getTimerSeconds(habit.id));
      return;
    }

    const interval = setInterval(() => {
      setLiveSeconds(getTimerSeconds(habit.id));
    }, 500);

    return () => clearInterval(interval);
  }, [isTimerRunning, habit.id]);

  const formatTimerDigits = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleActionPress = async () => {
    if (habit.type === 'check') {
      await toggleCheck(habit.id);
    } else if (habit.type === 'counter') {
      await incrementCounter(habit.id, 1);
    } else if (habit.type === 'timer') {
      if (isTimerRunning) {
        await stopAndSaveTimer(habit.id);
      } else {
        startTimer(habit.id);
      }
    }
  };

  const cardAccent = habit.color || IOS_COLORS.blue;

  return (
    <Pressable
      onPress={() => {
        if (habit.type === 'timer') {
          onOpenTimerModal?.(habit);
        } else {
          onOpenNoteModal?.(habit);
        }
      }}
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
        backgroundColor: isDark ? 'rgba(28, 28, 30, 0.85)' : '#FFFFFF',
        borderRadius: 28,
        padding: 18,
        borderWidth: 1.5,
        borderColor: isTodayCompleted ? `${cardAccent}50` : theme.border,
        gap: 14,
        position: 'relative',
        overflow: 'hidden',
        ...createShadow(cardAccent, { width: 0, height: 4 }, isDark ? 0.2 : 0.06, 10),
      })}
    >
      {/* Resplandor superior sutil */}
      <View
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: `${cardAccent}15`,
        }}
      />

      {/* 1. Header de la Tarjeta */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {/* Icono / Emoji grande */}
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: `${cardAccent}20`,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: `${cardAccent}40`,
            }}
          >
            <Text style={{ fontSize: 22 }}>{habit.icon}</Text>
          </View>

          {/* Título & Frecuencia */}
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: theme.text.primary }}>
                {habit.title}
              </Text>
            </View>

            <Text style={{ fontSize: 12, fontWeight: '600', color: theme.text.secondary, marginTop: 2 }}>
              {habit.frequency}
            </Text>
          </View>
        </View>

        {/* Badge de Puntos / Energía y Botón de Acción */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: `${cardAccent}15`,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: `${cardAccent}30`,
              gap: 4,
            }}
          >
            <Zap size={11} color={cardAccent} fill={cardAccent} />
            <Text style={{ fontSize: 11, fontWeight: '900', color: cardAccent }}>
              +{habit.points}
            </Text>
          </View>

          {/* Botón Circular de Acción Rápida */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              handleActionPress();
            }}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.9 : 1 }],
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: isTodayCompleted
                ? cardAccent
                : isTimerRunning
                ? '#FF3B30'
                : `${cardAccent}25`,
              borderWidth: 2,
              borderColor: isTodayCompleted
                ? cardAccent
                : isTimerRunning
                ? '#FF3B30'
                : cardAccent,
              alignItems: 'center',
              justifyContent: 'center',
              ...createShadow(
                isTimerRunning ? '#FF3B30' : cardAccent,
                { width: 0, height: 2 },
                isTimerRunning ? 0.4 : 0.2,
                4
              ),
            })}
          >
            {habit.type === 'check' ? (
              isTodayCompleted ? (
                <Check size={18} color="#FFFFFF" strokeWidth={3} />
              ) : (
                <Plus size={18} color={cardAccent} strokeWidth={2.5} />
              )
            ) : habit.type === 'counter' ? (
              isTodayCompleted ? (
                <Check size={18} color="#FFFFFF" strokeWidth={3} />
              ) : (
                <Plus size={18} color={cardAccent} strokeWidth={2.5} />
              )
            ) : (
              // Timer type
              isTimerRunning ? (
                <Square size={14} color="#FFFFFF" fill="#FFFFFF" />
              ) : isTodayCompleted ? (
                <Check size={18} color="#FFFFFF" strokeWidth={3} />
              ) : (
                <Play size={16} color={cardAccent} fill={cardAccent} style={{ marginLeft: 2 }} />
              )
            )}
          </Pressable>
        </View>
      </View>

      {/* 2. Temporizador en Vivo (si está corriendo) o Contador */}
      {isTimerRunning ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255, 59, 48, 0.15)',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 14,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30' }} />
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#FF3B30' }}>
              En progreso...
            </Text>
          </View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '900',
              color: '#FF3B30',
              fontVariant: ['tabular-nums'],
              fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            }}
          >
            {formatTimerDigits(liveSeconds)}
          </Text>
        </View>
      ) : habit.type === 'counter' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
            Progreso hoy
          </Text>
          <Text style={{ fontSize: 12, fontWeight: '900', color: cardAccent }}>
            {currentLog?.completed_value || 0} / {habit.target_value} {habit.target_unit}
          </Text>
        </View>
      ) : null}

      {/* 3. Matriz de 10 Píldoras de Progreso (Historial de los últimos 10 días) */}
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 42 }}>
          {recentDates.map((dateStr, idx) => {
            const log = logsForHabit[dateStr];
            const isCompletedDay = Boolean(log?.is_completed);
            const isTodayDay = dateStr === today;
            const dayNumber = dateStr.slice(-2);

            return (
              <View key={dateStr} style={{ alignItems: 'center', gap: 4 }}>
                {/* Píldora vertical con altura */}
                <View
                  style={{
                    width: 18,
                    height: 28,
                    borderRadius: 9,
                    backgroundColor: isCompletedDay
                      ? cardAccent
                      : isDark
                      ? '#2C2C2E'
                      : '#E5E5EA',
                    borderWidth: isTodayDay ? 2 : 0,
                    borderColor: isTodayDay ? (isCompletedDay ? '#FFFFFF' : cardAccent) : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isCompletedDay && <Check size={10} color="#FFFFFF" strokeWidth={3.5} />}
                </View>

                {/* Número del día */}
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: isTodayDay ? '900' : '600',
                    color: isTodayDay ? cardAccent : theme.text.tertiary,
                  }}
                >
                  {dayNumber}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </Pressable>
  );
};
