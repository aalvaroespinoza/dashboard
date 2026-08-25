/**
 * HomeHabitsWidget.tsx
 * Widget de Hábitos y Rutinas del Dashboard estilo Grit Hub (iPadOS 18).
 * - Carrusel deslizable horizontal entre hábitos con dots indicadores.
 * - Submenú flotante en Long-Press para selección rápida de cualquier hábito.
 * - Acciones interactivas in-situ (Temporizador ▶️/⏹️, Contador +1, Check ✓).
 * - 10 píldoras de historial quincenal calculadas en tiempo real con SQLite.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import {
  Zap,
  Play,
  Square,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Minus,
  Clock,
  X,
} from 'lucide-react-native';
import { useHabitsStore } from '../../habits/stores/useHabitsStore';
import { useAppStore } from '../../../store/useAppStore';
import { IOS_COLORS, IOS_FONTS, APPLE_ACCENT } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';
import { HabitItem } from '../../../types';

interface HomeHabitsWidgetProps {
  isDark?: boolean;
}

export const HomeHabitsWidget: React.FC<HomeHabitsWidgetProps> = React.memo(({ isDark = true }) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { setActiveModule } = useAppStore();

  const habits = useHabitsStore((state) => state.habits);
  const activeTimers = useHabitsStore((state) => state.activeTimers);
  const logsMap = useHabitsStore((state) => state.logsMap);
  const recentDates = useHabitsStore((state) => state.recentDates);
  const selectedDate = useHabitsStore((state) => state.selectedDate);

  const startTimer = useHabitsStore((state) => state.startTimer);
  const pauseTimer = useHabitsStore((state) => state.pauseTimer);
  const incrementCounter = useHabitsStore((state) => state.incrementCounter);
  const decrementCounter = useHabitsStore((state) => state.decrementCounter);
  const toggleCheck = useHabitsStore((state) => state.toggleCheck);
  const getTimerSeconds = useHabitsStore((state) => state.getTimerSeconds);

  // Índice del hábito activo en el carrusel
  const [activeHabitIndex, setActiveHabitIndex] = useState(0);
  const [isHabitsSelectorOpen, setIsHabitsSelectorOpen] = useState(false);

  // Lista de hábitos a mostrar (con mock si está vacío)
  const habitList: HabitItem[] = useMemo(() => {
    if (habits && habits.length > 0) return habits;
    return [
      {
        id: 'mock-1',
        category_id: 'mind',
        title: 'Lectura Técnica & Enfoque',
        type: 'timer',
        target_value: 15,
        target_unit: 'min',
        frequency: 'daily',
        color: '#AF52DE',
        icon: '📖',
        points: 25,
        streak_count: 8,
        created_at: '',
        updated_at: '',
      },
      {
        id: 'mock-2',
        category_id: 'health',
        title: 'Entrenamiento & Rutina',
        type: 'check',
        target_value: 1,
        target_unit: 'sesión',
        frequency: 'daily',
        color: '#FF2D55',
        icon: '🏋️',
        points: 30,
        streak_count: 12,
        created_at: '',
        updated_at: '',
      },
      {
        id: 'mock-3',
        category_id: 'focus',
        title: 'Vasos de Agua (Hidratación)',
        type: 'counter',
        target_value: 8,
        target_unit: 'vasos',
        frequency: 'daily',
        color: '#30B0C7',
        icon: '💧',
        points: 15,
        streak_count: 5,
        created_at: '',
        updated_at: '',
      },
    ];
  }, [habits]);

  const currentHabit = habitList[activeHabitIndex] || habitList[0];
  const timerState = activeTimers[currentHabit?.id || ''];
  const isRunning = Boolean(timerState?.isRunning);
  const [seconds, setSeconds] = useState(540);

  useEffect(() => {
    if (currentHabit && !currentHabit.id.startsWith('mock-')) {
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
    setActiveHabitIndex((prev) => (prev + 1) % habitList.length);
  };

  const handlePrevHabit = () => {
    setActiveHabitIndex((prev) => (prev - 1 + habitList.length) % habitList.length);
  };

  // Historial quincenal de los últimos 10 días para el hábito actual
  const progressPills = useMemo(() => {
    if (currentHabit && logsMap[currentHabit.id] && recentDates.length >= 10) {
      const last10 = recentDates.slice(-10);
      return last10.map((d) => Boolean(logsMap[currentHabit.id]?.[d]?.is_completed));
    }
    return [true, true, true, true, true, true, true, true, false, false];
  }, [currentHabit, logsMap, recentDates]);

  const completedCount = progressPills.filter(Boolean).length;
  const progressPercentage = Math.round((completedCount / 10) * 100);

  const handleAction = () => {
    if (!currentHabit || currentHabit.id.startsWith('mock-')) return;

    if (currentHabit.type === 'timer') {
      if (isRunning) {
        pauseTimer(currentHabit.id);
      } else {
        startTimer(currentHabit.id);
      }
    } else if (currentHabit.type === 'counter') {
      incrementCounter(currentHabit.id);
    } else if (currentHabit.type === 'check') {
      toggleCheck(currentHabit.id);
    }
  };

  const logForToday = currentHabit ? logsMap[currentHabit.id]?.[selectedDate] : null;
  const isCompletedToday = Boolean(logForToday?.is_completed);
  const currentCount = logForToday?.completed_value || 0;

  return (
    <Pressable
      onLongPress={() => setIsHabitsSelectorOpen(true)}
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
      {/* Header con Navegación < > y Enlace */}
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
              maxWidth: 480,
              backgroundColor: theme.card,
              borderRadius: 24,
              padding: 20,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 14,
              maxHeight: '80%',
              ...createShadow('#000000', { width: 0, height: 8 }, isDark ? 0.35 : 0.08, 16),
            }}
          >
            {/* Header del Submenú */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Zap size={18} color={isDark ? APPLE_ACCENT.orange.dark : APPLE_ACCENT.orange.light} />
                <Text style={{ fontSize: 17, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                  Seleccionar Hábito
                </Text>
              </View>
              <Pressable
                onPress={() => setIsHabitsSelectorOpen(false)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F2F2F7',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={15} color={theme.text.secondary} />
              </Pressable>
            </View>

            {/* Lista de Hábitos */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {habitList.map((h, idx) => {
                const isSelected = activeHabitIndex === idx;
                return (
                  <Pressable
                    key={h.id}
                    onPress={() => {
                      setActiveHabitIndex(idx);
                      setIsHabitsSelectorOpen(false);
                    }}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.8 : 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: isSelected
                        ? (isDark ? 'rgba(10, 132, 255, 0.18)' : 'rgba(0, 122, 255, 0.12)')
                        : theme.cardSecondary,
                      padding: 12,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: isSelected
                        ? (isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light)
                        : theme.border,
                    })}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          backgroundColor: `${h.color || '#AF52DE'}25`,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 16 }}>{h.icon || '📖'}</Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                          {h.title}
                        </Text>
                        <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                          Tipo: {h.type} · Meta: {h.target_value} {h.target_unit}
                        </Text>
                      </View>
                    </View>

                    {isSelected && (
                      <Check size={16} color={isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light} strokeWidth={2.5} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Pressable>
  );
});
