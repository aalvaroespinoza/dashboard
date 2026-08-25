/**
 * HomeHabitsWidget.tsx
 * Widget de Hábitos y Rutinas del Dashboard estilo Grit Hub (iPadOS 18).
 * Permite reproducir/pausar ▶️/⏹️ el temporizador del hábito prioritario en vivo y muestra las 10 píldoras de progreso quincenal.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Zap, Play, Square, ChevronRight, Check } from 'lucide-react-native';
import { useHabitsStore } from '../../habits/stores/useHabitsStore';
import { useAppStore } from '../../../store/useAppStore';
import { IOS_COLORS, IOS_FONTS, APPLE_ACCENT } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface HomeHabitsWidgetProps {
  isDark?: boolean;
}

export const HomeHabitsWidget: React.FC<HomeHabitsWidgetProps> = React.memo(({ isDark = true }) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { setActiveModule } = useAppStore();

  const habits = useHabitsStore((state) => state.habits);
  const activeTimers = useHabitsStore((state) => state.activeTimers);
  const startTimer = useHabitsStore((state) => state.startTimer);
  const pauseTimer = useHabitsStore((state) => state.pauseTimer);
  const getTimerSeconds = useHabitsStore((state) => state.getTimerSeconds);

  const featuredHabit = habits.length > 0 ? habits[0] : null;
  const habitId = featuredHabit?.id || 'habit-mock';
  const habitTitle = featuredHabit?.title || 'Lectura Técnica & Enfoque';
  const habitIcon = featuredHabit?.icon || '📖';
  const targetSeconds = (featuredHabit?.target_value ? featuredHabit.target_value * 60 : 900);

  const timerState = activeTimers[habitId];
  const isRunning = Boolean(timerState?.isRunning);
  const [seconds, setSeconds] = useState(540);

  useEffect(() => {
    if (featuredHabit) {
      setSeconds(getTimerSeconds(featuredHabit.id));
    }
  }, [featuredHabit, activeTimers]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && featuredHabit) {
      interval = setInterval(() => {
        setSeconds((prev: number) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, featuredHabit]);

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const targetMinutes = Math.floor(targetSeconds / 60);

  const handleTogglePlay = () => {
    if (!featuredHabit) return;
    if (isRunning) {
      pauseTimer(featuredHabit.id);
    } else {
      startTimer(featuredHabit.id);
    }
  };

  // 10 píldoras de progreso quincenal
  const progressPills = [true, true, true, true, true, true, true, true, false, false];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E5EA',
        borderTopColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'space-between',
        minHeight: 168,
        gap: 12,
        ...createShadow('#000000', { width: 0, height: 4 }, isDark ? 0.22 : 0.03, 8),
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 16, fontFamily: IOS_FONTS.bold, color: theme.text.primary, letterSpacing: -0.4 }}>
          Hábitos y Rutinas
        </Text>

        <Pressable
          onPress={() => setActiveModule('habits')}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
          })}
        >
          <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.semibold, color: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light }}>
            Ver todos
          </Text>
          <ChevronRight size={13} color={isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light} />
        </Pressable>
      </View>

      {/* Hábito Prioritario Destacado con Timer */}
      <View
        style={{
          backgroundColor: isDark ? '#2C2C2E' : '#F9FAFB',
          borderRadius: 16,
          padding: 12,
          borderWidth: 1,
          borderColor: theme.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: isDark ? 'rgba(191, 90, 242, 0.18)' : 'rgba(175, 82, 222, 0.14)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 16 }}>{habitIcon}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ fontSize: 13, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
              {habitTitle}
            </Text>
            <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
              Meta: {targetMinutes} min · {formatTime(seconds)} acumulados
            </Text>
          </View>
        </View>

        {/* Botón Play / Stop */}
        <Pressable
          onPress={handleTogglePlay}
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: isRunning
              ? (isDark ? APPLE_ACCENT.orange.dark : APPLE_ACCENT.orange.light)
              : (isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light),
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          {isRunning ? (
            <Square size={13} color="#FFFFFF" fill="#FFFFFF" />
          ) : (
            <Play size={13} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
          )}
        </Pressable>
      </View>

      {/* 10 Píldoras de Progreso Quincenal */}
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.semibold, color: theme.text.tertiary, textTransform: 'uppercase' }}>
            Racha Quincenal (8/10 días)
          </Text>
          <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.bold, color: isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light }}>
            80%
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 4 }}>
          {progressPills.map((completed, idx) => (
            <View
              key={idx}
              style={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                backgroundColor: completed
                  ? (isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light)
                  : (isDark ? '#3A3A3C' : '#E5E5EA'),
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
});
