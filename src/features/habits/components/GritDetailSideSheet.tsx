/**
 * GritDetailSideSheet.tsx
 * Panel lateral detallado para interacción con hábitos (Timer, Counter, Check).
 * Incluye backdrop interactivo, animaciones Reanimated y controles completos de sesión.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import {
  X,
  Sun,
  FileText,
  MoreHorizontal,
  Play,
  Pause,
  Plus,
  Minus,
  Check,
  RotateCcw,
  FastForward,
  Zap,
  Square,
  RefreshCw,
} from 'lucide-react-native';
import { HabitItem } from '../../../types';
import { useHabitsStore } from '../stores/useHabitsStore';
import { GritHabitOptionsMenu } from './GritHabitOptionsMenu';
import { AppleEmoji } from '../../../components/ui/AppleEmoji';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface GritDetailSideSheetProps {
  habit: HabitItem | null;
  onClose: () => void;
  isDark?: boolean;
}

const RING_RADIUS = 95;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const SHEET_WIDTH = 440;

export const GritDetailSideSheet: React.FC<GritDetailSideSheetProps> = ({
  habit,
  onClose,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const {
    habits,
    selectedDate,
    logsMap,
    activeTimers,
    startTimer,
    pauseTimer,
    resetTimer,
    stopAndSaveTimer,
    setTimerElapsed,
    toggleCheck,
    incrementCounter,
    decrementCounter,
    skipToday,
    undoSkip,
    saveHabitNote,
    setEditingHabit,
    getTimerSeconds,
    checkTimerAutoCompletion,
  } = useHabitsStore();

  // Obtener el hábito fresco de la lista del store
  const liveHabit = habits.find((h) => h.id === habit?.id) || habit;
  const habitId = liveHabit?.id || '';

  const currentLog = logsMap[habitId]?.[selectedDate];
  const isCompleted = Boolean(currentLog?.is_completed);
  const isSkipped = Boolean(currentLog?.is_skipped);

  // Estado del temporizador activo
  const timerState = activeTimers[habitId];
  const isTimerRunning = Boolean(timerState?.isRunning);
  const [liveSeconds, setLiveSeconds] = useState(() => getTimerSeconds(habitId));

  // Animación de apertura y backdrop
  const slideProgress = useSharedValue(0);

  useEffect(() => {
    if (habit) {
      slideProgress.value = withTiming(1, {
        duration: 280,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      slideProgress.value = withTiming(0, { duration: 200 });
    }
  }, [habit]);

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(slideProgress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          slideProgress.value,
          [0, 1],
          [SHEET_WIDTH, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  // Actualización del segundero en vivo
  useEffect(() => {
    if (!isTimerRunning) {
      setLiveSeconds(getTimerSeconds(habitId));
      return;
    }
    const interval = setInterval(async () => {
      setLiveSeconds(getTimerSeconds(habitId));
      await checkTimerAutoCompletion(habitId, selectedDate);
    }, 400);
    return () => clearInterval(interval);
  }, [isTimerRunning, habitId, selectedDate]);

  // Editor de notas
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);

  useEffect(() => {
    if (currentLog?.notes) {
      setNoteText(currentLog.notes);
    } else {
      setNoteText('');
    }
  }, [currentLog]);

  if (!liveHabit) return null;

  const cardAccent = liveHabit.color || '#FF9500';

  // Cálculos de Progreso según Tipo
  let progressRatio = 0;
  let centerDisplay = '';
  let subDisplay = '';

  if (liveHabit.type === 'timer') {
    // completed_value ya está guardado en segundos
    const savedSecs = currentLog?.completed_value || 0;
    const currentSessionSecs = liveSeconds;
    const totalEffectiveSecs = savedSecs + currentSessionSecs;
    const targetSecs = (liveHabit.target_value || 25) * 60;

    progressRatio = Math.min(1, totalEffectiveSecs / (targetSecs || 1));

    const m = Math.floor(totalEffectiveSecs / 60);
    const s = totalEffectiveSecs % 60;
    centerDisplay = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    subDisplay = `Meta: ${liveHabit.target_value} min`;
  } else if (liveHabit.type === 'counter') {
    const val = currentLog?.completed_value || 0;
    progressRatio = Math.min(1, val / (liveHabit.target_value || 1));
    centerDisplay = `${val} / ${liveHabit.target_value}`;
    subDisplay = liveHabit.target_unit;
  } else {
    // Check
    progressRatio = isCompleted ? 1 : 0;
    centerDisplay = isCompleted ? 'Completado' : 'Pendiente';
    subDisplay = liveHabit.frequency;
  }

  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progressRatio);

  const handleToggleTimer = () => {
    if (isTimerRunning) {
      pauseTimer(liveHabit.id);
    } else {
      startTimer(liveHabit.id);
    }
  };

  const handleSaveTimer = async () => {
    await stopAndSaveTimer(liveHabit.id, selectedDate);
    setLiveSeconds(0);
  };

  const handleResetTimerPrompt = () => {
    if (liveSeconds > 0 || isTimerRunning) {
      Alert.alert(
        'Reiniciar Cronómetro',
        '¿Deseas volver el tiempo actual a 00:00 sin guardar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Reiniciar',
            style: 'destructive',
            onPress: async () => {
              await resetTimer(liveHabit.id);
              setLiveSeconds(0);
            },
          },
        ]
      );
    } else {
      resetTimer(liveHabit.id);
      setLiveSeconds(0);
    }
  };

  const handleAdjustTimerMinutes = (minutesDelta: number) => {
    const deltaSeconds = minutesDelta * 60;
    const current = getTimerSeconds(liveHabit.id);
    const nextSecs = Math.max(0, current + deltaSeconds);
    setTimerElapsed(liveHabit.id, nextSecs);
    setLiveSeconds(nextSecs);
  };

  const handleSaveNote = async () => {
    await saveHabitNote(liveHabit.id, noteText.trim(), selectedDate);
    setIsNoteOpen(false);
  };

  return (
    <>
      {/* 1. Backdrop Translúcido para Cerrar con un Tap Afuera */}
      <Animated.View
        style={[
          animatedBackdropStyle,
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 90,
          },
        ]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* 2. Side Sheet Deslizante */}
      <Animated.View
        style={[
          animatedSheetStyle,
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: SHEET_WIDTH,
            backgroundColor: isDark ? '#141416' : '#FFFFFF',
            borderLeftWidth: 1,
            borderLeftColor: theme.border,
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 100,
            ...createShadow('#000000', { width: -4, height: 0 }, isDark ? 0.4 : 0.1, 16),
          },
        ]}
      >
        {/* Header (Cerrar, Saltar, Nota, Opciones) */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: 14,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          }}
        >
          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: theme.cardSecondary,
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <X size={18} color={theme.text.primary} />
          </Pressable>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {/* Saltar día */}
            <Pressable
              onPress={() =>
                isSkipped ? undoSkip(liveHabit.id, selectedDate) : skipToday(liveHabit.id, selectedDate)
              }
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: isSkipped ? 'rgba(255, 149, 0, 0.2)' : theme.cardSecondary,
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <Sun size={18} color={isSkipped ? '#FF9500' : theme.text.secondary} />
            </Pressable>

            {/* Bitácora / Nota */}
            <Pressable
              onPress={() => setIsNoteOpen(!isNoteOpen)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor:
                  isNoteOpen || currentLog?.notes ? 'rgba(0, 122, 255, 0.2)' : theme.cardSecondary,
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <FileText
                size={18}
                color={isNoteOpen || currentLog?.notes ? IOS_COLORS.blue : theme.text.secondary}
              />
            </Pressable>

            {/* Opciones */}
            <Pressable
              onPress={() => setIsOptionsMenuOpen(true)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: isOptionsMenuOpen ? theme.border : theme.cardSecondary,
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <MoreHorizontal size={18} color={theme.text.secondary} />
            </Pressable>
          </View>
        </View>

        {/* Cuerpo Scrollable */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24, alignItems: 'center', gap: 20 }}
        >
          {/* Título & Emoji */}
          <View style={{ alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 22,
                backgroundColor: `${cardAccent}20`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppleEmoji emoji={liveHabit.icon} size={34} />
            </View>

            <Text style={{ fontSize: 22, fontWeight: '900', color: theme.text.primary, textAlign: 'center' }}>
              {liveHabit.title}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Zap size={14} color={cardAccent} fill={cardAccent} />
              <Text style={{ fontSize: 13, fontWeight: '800', color: cardAccent }}>
                +{liveHabit.points} pts de experiencia
              </Text>
            </View>

            {liveHabit.motivation && (
              <View
                style={{
                  backgroundColor: theme.cardSecondary,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 12,
                  marginTop: 4,
                }}
              >
                <Text style={{ fontSize: 12, fontStyle: 'italic', color: theme.text.secondary, textAlign: 'center' }}>
                  "{liveHabit.motivation}"
                </Text>
              </View>
            )}
          </View>

          {/* Anillo Circular Interactivo */}
          <View style={{ width: 280, height: 260, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {/* Botón Decrementar / -5m */}
            {liveHabit.type !== 'check' && (
              <Pressable
                onPress={() => {
                  if (liveHabit.type === 'counter') {
                    decrementCounter(liveHabit.id, 1, selectedDate);
                  } else if (liveHabit.type === 'timer') {
                    handleAdjustTimerMinutes(-5);
                  }
                }}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.88 : 1 }],
                  position: 'absolute',
                  left: 0,
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  backgroundColor: theme.cardSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: theme.border,
                  zIndex: 10,
                })}
              >
                {liveHabit.type === 'timer' ? (
                  <Text style={{ fontSize: 12, fontWeight: '900', color: theme.text.primary }}>-5m</Text>
                ) : (
                  <Minus size={20} color={theme.text.primary} />
                )}
              </Pressable>
            )}

            {/* SVG Circular Ring */}
            <Svg width="220" height="220" viewBox="0 0 220 220">
              <Circle
                cx="110"
                cy="110"
                r={RING_RADIUS}
                stroke={isDark ? '#242426' : '#E5E5EA'}
                strokeWidth="14"
                fill="none"
              />
              <Circle
                cx="110"
                cy="110"
                r={RING_RADIUS}
                stroke={isCompleted ? '#34C759' : cardAccent}
                strokeWidth="14"
                fill="none"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 110 110)"
              />
            </Svg>

            {/* Contenido Central del Anillo */}
            {liveHabit.type === 'check' ? (
              <Pressable
                onPress={() => toggleCheck(liveHabit.id, selectedDate)}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.92 : 1 }],
                  position: 'absolute',
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  backgroundColor: isCompleted
                    ? 'rgba(52, 199, 89, 0.2)'
                    : theme.cardSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: isCompleted ? '#34C759' : theme.border,
                  gap: 6,
                })}
              >
                <Check
                  size={42}
                  color={isCompleted ? '#34C759' : theme.text.tertiary}
                  strokeWidth={3.5}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '900',
                    color: isCompleted ? '#34C759' : theme.text.secondary,
                  }}
                >
                  {isCompleted ? 'Completado' : 'Tocar para marcar'}
                </Text>
              </Pressable>
            ) : (
              <View style={{ position: 'absolute', alignItems: 'center', gap: 4 }}>
                <Text
                  style={{
                    fontSize: 34,
                    fontWeight: '900',
                    color: isTimerRunning ? '#FF3B30' : theme.text.primary,
                    fontVariant: ['tabular-nums'],
                    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                    letterSpacing: -0.5,
                  }}
                >
                  {centerDisplay}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text.secondary }}>
                  {subDisplay}
                </Text>
              </View>
            )}

            {/* Botón Incrementar / +5m */}
            {liveHabit.type !== 'check' && (
              <Pressable
                onPress={() => {
                  if (liveHabit.type === 'counter') {
                    incrementCounter(liveHabit.id, 1, selectedDate);
                  } else if (liveHabit.type === 'timer') {
                    handleAdjustTimerMinutes(5);
                  }
                }}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.88 : 1 }],
                  position: 'absolute',
                  right: 0,
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  backgroundColor: theme.cardSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: theme.border,
                  zIndex: 10,
                })}
              >
                {liveHabit.type === 'timer' ? (
                  <Text style={{ fontSize: 12, fontWeight: '900', color: theme.text.primary }}>+5m</Text>
                ) : (
                  <Plus size={20} color={theme.text.primary} />
                )}
              </Pressable>
            )}
          </View>

          {/* Fila de Controles para Cronómetro (Play/Pause, Guardar, Resetear) */}
          {liveHabit.type === 'timer' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', justifyContent: 'center' }}>
              {/* Botón Play / Pausa */}
              <Pressable
                onPress={handleToggleTimer}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.85 : 1,
                  flex: 1,
                  minHeight: 46,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isTimerRunning ? '#FF9500' : cardAccent,
                  borderRadius: 14,
                  gap: 8,
                })}
              >
                {isTimerRunning ? (
                  <>
                    <Pause size={18} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#FFFFFF' }}>Pausar</Text>
                  </>
                ) : (
                  <>
                    <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#FFFFFF' }}>
                      {liveSeconds > 0 ? 'Reanudar' : 'Iniciar'}
                    </Text>
                  </>
                )}
              </Pressable>

              {/* Botón Guardar Sesión */}
              <Pressable
                onPress={handleSaveTimer}
                disabled={liveSeconds === 0}
                style={({ pressed }) => ({
                  opacity: liveSeconds === 0 ? 0.5 : pressed ? 0.85 : 1,
                  minHeight: 46,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.border,
                  gap: 6,
                })}
              >
                <Square size={14} color={theme.text.primary} fill={theme.text.primary} />
                <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text.primary }}>
                  Guardar
                </Text>
              </Pressable>

              {/* Botón Resetear */}
              <Pressable
                onPress={handleResetTimerPrompt}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  backgroundColor: theme.cardSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: theme.border,
                })}
              >
                <RotateCcw size={16} color={theme.text.secondary} />
              </Pressable>
            </View>
          )}

          {/* Acciones Secundarias: Saltar día / Deshacer */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <Pressable
              onPress={() => skipToday(liveHabit.id, selectedDate)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.cardSecondary,
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
                gap: 6,
              })}
            >
              <FastForward size={14} color={theme.text.secondary} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary }}>
                Saltar objetivo
              </Text>
            </Pressable>

            <Pressable
              onPress={() => undoSkip(liveHabit.id, selectedDate)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.cardSecondary,
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
                gap: 6,
              })}
            >
              <RotateCcw size={14} color={theme.text.secondary} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary }}>
                Deshacer
              </Text>
            </Pressable>
          </View>

          {/* Bitácora de la Sesión */}
          {isNoteOpen && (
            <View
              style={{
                width: '100%',
                backgroundColor: theme.cardSecondary,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: theme.border,
                gap: 10,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.secondary }}>
                Bitácora de la Sesión
              </Text>
              <TextInput
                value={noteText}
                onChangeText={setNoteText}
                placeholder="Escribe notas sobre tu progreso..."
                placeholderTextColor={theme.text.tertiary}
                multiline
                numberOfLines={3}
                style={{
                  fontSize: 13,
                  color: theme.text.primary,
                  minHeight: 60,
                  padding: 0,
                }}
              />
              <Pressable
                onPress={handleSaveNote}
                style={{
                  alignSelf: 'flex-end',
                  backgroundColor: cardAccent,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFFFFF' }}>
                  Guardar Nota
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        {/* Footer con Botón Principal para Counter y Check */}
        {liveHabit.type !== 'timer' && (
          <View
            style={{
              padding: 20,
              borderTopWidth: 1,
              borderTopColor: theme.border,
              backgroundColor: isDark ? '#141416' : '#FFFFFF',
            }}
          >
            <Pressable
              onPress={() => {
                if (liveHabit.type === 'counter') {
                  incrementCounter(liveHabit.id, 1, selectedDate);
                } else {
                  toggleCheck(liveHabit.id, selectedDate);
                }
              }}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.96 : 1 }],
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isCompleted ? '#34C759' : cardAccent,
                paddingVertical: 16,
                borderRadius: 20,
                gap: 10,
                ...createShadow(isCompleted ? '#34C759' : cardAccent, { width: 0, height: 4 }, 0.3, 10),
              })}
            >
              {liveHabit.type === 'counter' ? (
                <>
                  <Plus size={20} color="#FFFFFF" strokeWidth={3} />
                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#FFFFFF' }}>
                    +1 {liveHabit.target_unit}
                  </Text>
                </>
              ) : (
                <>
                  <Check size={20} color="#FFFFFF" strokeWidth={3} />
                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#FFFFFF' }}>
                    {isCompleted ? 'Desmarcar Hábito' : 'Completar Hábito'}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </Animated.View>

      {/* Menú de Opciones */}
      <GritHabitOptionsMenu
        visible={isOptionsMenuOpen}
        habit={liveHabit}
        onClose={() => setIsOptionsMenuOpen(false)}
        onEdit={(h) => {
          setEditingHabit(h);
          onClose();
        }}
        isDark={isDark}
      />
    </>
  );
};
