/**
 * HomeHabitsWidget.tsx
 * Widget de Hábitos y Rutinas del Día estilo Grit (Apple HIG).
 * Conectado en tiempo real a SQLite y useHabitsStore.
 * - Deslizamiento horizontal entre hábitos (carrusel con dots y botones de flecha).
 * - Long-Press para desplegar el submenú de todos los hábitos activos.
 * - Acciones directas según tipo (temporizador ▶️/⏹️, contador +1, check ✓).
 * - Estado limpio 0 cuando no hay hábitos creados.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import {
  ChevronRight,
  ChevronLeft,
  Play,
  Square,
  Plus,
  Check,
  Flame,
  X,
  Sparkles,
} from 'lucide-react-native';
import { useHabitsStore } from '../../habits/stores/useHabitsStore';
import { useAppStore } from '../../../store/useAppStore';
import { IOS_COLORS, IOS_FONTS, APPLE_ACCENT } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';
import { HabitItem } from '../../../types';

interface HomeHabitsWidgetProps {
  isDark?: boolean;
}

export const HomeHabitsWidget: React.FC<HomeHabitsWidgetProps> = React.memo(({
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { setActiveModule } = useAppStore();

  const habits = useHabitsStore((state) => state.habits);
  const logsMap = useHabitsStore((state) => state.logsMap);
  const activeTimers = useHabitsStore((state) => state.activeTimers);
  const startTimer = useHabitsStore((state) => state.startTimer);
  const pauseTimer = useHabitsStore((state) => state.pauseTimer);
  const incrementCounter = useHabitsStore((state) => state.incrementCounter);
  const toggleCheck = useHabitsStore((state) => state.toggleCheck);
  const getTimerSeconds = useHabitsStore((state) => state.getTimerSeconds);

  // Índice del hábito activo en el carrusel
  const [activeHabitIndex, setActiveHabitIndex] = useState(0);
  const [isHabitsSelectorOpen, setIsHabitsSelectorOpen] = useState(false);

  // Lista de hábitos reales activos (sin mocks)
  const habitList: HabitItem[] = useMemo(() => {
    return (habits || []).filter((h) => !h.is_archived);
  }, [habits]);

  const currentHabit = habitList[activeHabitIndex] || habitList[0];
  const timerState = activeTimers[currentHabit?.id || ''];
  const isRunning = Boolean(timerState?.isRunning);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (currentHabit) {
      setSeconds(getTimerSeconds(currentHabit.id));
    }
  }, [currentHabit, activeTimers]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && currentHabit) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentHabit]);

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleNextHabit = () => {
    if (habitList.length <= 1) return;
    setActiveHabitIndex((prev) => (prev + 1) % habitList.length);
  };

  const handlePrevHabit = () => {
    if (habitList.length <= 1) return;
    setActiveHabitIndex((prev) => (prev - 1 + habitList.length) % habitList.length);
  };

  const handleAction = async () => {
    if (!currentHabit) return;

    if (currentHabit.type === 'timer') {
      if (isRunning) {
        await pauseTimer(currentHabit.id);
      } else {
        await startTimer(currentHabit.id);
      }
    } else if (currentHabit.type === 'counter') {
      await incrementCounter(currentHabit.id);
    } else {
      await toggleCheck(currentHabit.id);
    }
  };

  const todayStr = '2026-08-24';
  const currentLog = logsMap[currentHabit?.id || '']?.[todayStr];
  const isCompletedToday = Boolean(currentLog?.is_completed);
  const currentCount = currentLog?.completed_value || 0;

  // 10 Píldoras de historial quincenal
  const progressPills = useMemo(() => {
    if (!currentHabit) return Array(10).fill(false);
    const pills: boolean[] = [];
    for (let i = 9; i >= 0; i--) {
      const d = new Date(2026, 7, 24 - i);
      const dStr = d.toISOString().split('T')[0];
      const log = logsMap[currentHabit.id]?.[dStr];
      pills.push(Boolean(log?.is_completed));
    }
    return pills;
  }, [currentHabit, logsMap]);

  const completedCount = progressPills.filter(Boolean).length;
  const progressPercentage = Math.round((completedCount / 10) * 100);

  return (
    <Pressable
      onLongPress={() => {
        if (habitList.length > 0) setIsHabitsSelectorOpen(true);
      }}
      delayLongPress={400}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.99 : 1 }],
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
      })}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 16, fontFamily: IOS_FONTS.bold, color: theme.text.primary, letterSpacing: -0.4 }}>
            Hábitos y Rutinas
          </Text>
          {habitList.length > 1 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Pressable
                onPress={handlePrevHabit}
                style={{ padding: 3 }}
              >
                <ChevronLeft size={14} color={theme.text.tertiary} />
              </Pressable>
              <Pressable
                onPress={handleNextHabit}
                style={{ padding: 3 }}
              >
                <ChevronRight size={14} color={theme.text.tertiary} />
              </Pressable>
            </View>
          )}
        </View>

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

      {/* Contenido: Si no hay hábitos, mostrar Estado Vacío */}
      {!currentHabit ? (
        <View style={{ paddingVertical: 14, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Sparkles size={22} color={isDark ? APPLE_ACCENT.yellow.dark : APPLE_ACCENT.yellow.light} />
          <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
            Sin hábitos activos
          </Text>
          <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.regular, color: theme.text.secondary, textAlign: 'center' }}>
            Crea tus hábitos y rutinas para comenzar a ganar EXP.
          </Text>
          <Pressable
            onPress={() => setActiveModule('habits')}
            style={{
              marginTop: 4,
              backgroundColor: isDark ? 'rgba(10, 132, 255, 0.2)' : 'rgba(0, 122, 255, 0.12)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light }}>
              + Crear primer hábito
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Tarjeta del Hábito Activo en Carrusel */}
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
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  backgroundColor: `${currentHabit.color || '#AF52DE'}25`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 16 }}>{currentHabit.icon || '📖'}</Text>
              </View>

              <View style={{ flex: 1, gap: 1 }}>
                <Text numberOfLines={1} style={{ fontSize: 13, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                  {currentHabit.title}
                </Text>

                {/* Subtítulo dinámico según tipo */}
                {currentHabit.type === 'timer' && (
                  <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                    Meta: {currentHabit.target_value} min · {formatTime(seconds)} acumulados
                  </Text>
                )}

                {currentHabit.type === 'counter' && (
                  <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                    Progreso: {currentCount} / {currentHabit.target_value} {currentHabit.target_unit}
                  </Text>
                )}

                {currentHabit.type === 'check' && (
                  <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.regular, color: isCompletedToday ? (isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light) : theme.text.secondary }}>
                    {isCompletedToday ? '¡Completado hoy! 🎉' : 'Pendiente de realizar'}
                  </Text>
                )}
              </View>
            </View>

            {/* Botón de Acción Principal */}
            <Pressable
              onPress={handleAction}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: currentHabit.type === 'timer'
                  ? (isRunning ? (isDark ? APPLE_ACCENT.orange.dark : APPLE_ACCENT.orange.light) : (isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light))
                  : isCompletedToday
                  ? (isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light)
                  : (isDark ? 'rgba(10, 132, 255, 0.25)' : 'rgba(0, 122, 255, 0.15)'),
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              {currentHabit.type === 'timer' && (
                isRunning ? (
                  <Square size={13} color="#FFFFFF" fill="#FFFFFF" />
                ) : (
                  <Play size={13} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
                )
              )}

              {currentHabit.type === 'counter' && (
                <Plus size={16} color={isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light} strokeWidth={2.5} />
              )}

              {currentHabit.type === 'check' && (
                <Check size={16} color={isCompletedToday ? '#FFFFFF' : (isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light)} strokeWidth={2.5} />
              )}
            </Pressable>
          </View>

          {/* 10 Píldoras de Progreso Quincenal + Dots de Carrusel */}
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.semibold, color: theme.text.tertiary, textTransform: 'uppercase' }}>
                Racha Quincenal ({completedCount}/10 días)
              </Text>
              <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.bold, color: isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light }}>
                {progressPercentage}%
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 4 }}>
              {progressPills.map((completed, idx) => (
                <View
                  key={idx}
                  style={{
                    flex: 1,
                    height: 7,
                    borderRadius: 3.5,
                    backgroundColor: completed
                      ? (isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light)
                      : (isDark ? '#3A3A3C' : '#E5E5EA'),
                  }}
                />
              ))}
            </View>

            {/* Puntos Indicadores del Carrusel (Dots) */}
            {habitList.length > 1 && (
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 2 }}>
                {habitList.map((_, i) => (
                  <Pressable
                    key={i}
                    onPress={() => setActiveHabitIndex(i)}
                    style={{
                      width: activeHabitIndex === i ? 14 : 5,
                      height: 5,
                      borderRadius: 2.5,
                      backgroundColor: activeHabitIndex === i
                        ? (isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light)
                        : (isDark ? '#3A3A3C' : '#E5E5EA'),
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        </>
      )}

      {/* Modal Submenú en Long-Press: Selector de Todos los Hábitos */}
      <Modal visible={isHabitsSelectorOpen} transparent animationType="fade" onRequestClose={() => setIsHabitsSelectorOpen(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 440,
              backgroundColor: theme.card,
              borderRadius: 24,
              padding: 20,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 12,
              ...createShadow('#000000', { width: 0, height: 8 }, isDark ? 0.35 : 0.08, 16),
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Flame size={18} color={isDark ? APPLE_ACCENT.orange.dark : APPLE_ACCENT.orange.light} />
                <Text style={{ fontSize: 16, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                  Seleccionar Hábito Rápido
                </Text>
              </View>
              <Pressable onPress={() => setIsHabitsSelectorOpen(false)} style={{ padding: 4 }}>
                <X size={16} color={theme.text.secondary} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 300 }} contentContainerStyle={{ gap: 6 }}>
              {habitList.map((habit, idx) => (
                <Pressable
                  key={habit.id}
                  onPress={() => {
                    setActiveHabitIndex(idx);
                    setIsHabitsSelectorOpen(false);
                  }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.75 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 14,
                    backgroundColor: activeHabitIndex === idx
                      ? (isDark ? 'rgba(10, 132, 255, 0.2)' : 'rgba(0, 122, 255, 0.12)')
                      : (isDark ? '#2C2C2E' : '#F2F2F7'),
                  })}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 16 }}>{habit.icon || '🎯'}</Text>
                    <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                      {habit.title}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.semibold, color: theme.text.secondary }}>
                    {habit.frequency}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Pressable>
  );
});
