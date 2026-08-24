import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
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
  Flame,
} from 'lucide-react-native';
import { HabitItem } from '../../../types';
import { useHabitsStore } from '../stores/useHabitsStore';
import { GritHabitOptionsMenu } from './GritHabitOptionsMenu';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface GritDetailSideSheetProps {
  habit: HabitItem | null;
  onClose: () => void;
  isDark?: boolean;
}

const RING_RADIUS = 100;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export const GritDetailSideSheet: React.FC<GritDetailSideSheetProps> = ({
  habit,
  onClose,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const {
    selectedDate,
    logsMap,
    activeTimers,
    startTimer,
    pauseTimer,
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
  } = useHabitsStore();

  const habitId = habit?.id || '';
  const currentLog = logsMap[habitId]?.[selectedDate];
  const isCompleted = Boolean(currentLog?.is_completed);
  const isSkipped = Boolean(currentLog?.is_skipped);

  // Live timer tick
  const timerState = activeTimers[habitId];
  const isTimerRunning = Boolean(timerState?.isRunning);
  const [liveSeconds, setLiveSeconds] = useState(() => getTimerSeconds(habitId));

  // Note editor toggle
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

  useEffect(() => {
    if (!isTimerRunning) {
      setLiveSeconds(getTimerSeconds(habitId));
      return;
    }
    const interval = setInterval(() => {
      setLiveSeconds(getTimerSeconds(habitId));
    }, 300);
    return () => clearInterval(interval);
  }, [isTimerRunning, habitId]);

  const cardAccent = habit?.color || '#FF9500';

  // Cálculo de Progreso
  let progressRatio = 0;
  let centerDisplay = '';
  let subDisplay = '';

  if (habit) {
    if (habit.type === 'timer') {
      const targetSecs = (habit.target_value || 25) * 60;
      const effectiveSecs = (currentLog?.completed_value || 0) * 60 + liveSeconds;
      progressRatio = Math.min(1, effectiveSecs / (targetSecs || 1));

      const m = Math.floor(effectiveSecs / 60);
      const s = effectiveSecs % 60;
      centerDisplay = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      subDisplay = `Meta: ${habit.target_value} min`;
    } else if (habit.type === 'counter') {
      const val = currentLog?.completed_value || 0;
      progressRatio = Math.min(1, val / (habit.target_value || 1));
      centerDisplay = `${val} / ${habit.target_value}`;
      subDisplay = habit.target_unit;
    } else {
      // check
      progressRatio = isCompleted ? 1 : 0;
      centerDisplay = isCompleted ? '✓ Hecho' : 'Pendiente';
      subDisplay = habit.frequency;
    }
  }

  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progressRatio);

  const handleMainAction = async () => {
    if (!habit) return;

    if (habit.type === 'timer') {
      if (isTimerRunning) {
        await stopAndSaveTimer(habit.id, selectedDate);
      } else {
        startTimer(habit.id);
      }
    } else if (habit.type === 'counter') {
      await incrementCounter(habit.id, 1, selectedDate);
    } else {
      await toggleCheck(habit.id, selectedDate);
    }
  };

  const handleSaveNote = async () => {
    if (!habit) return;
    await saveHabitNote(habit.id, noteText.trim(), selectedDate);
    setIsNoteOpen(false);
  };

  if (!habit) return null;

  return (
    <>
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          width: 420,
          backgroundColor: isDark ? '#141416' : '#FFFFFF',
          borderLeftWidth: 1,
          borderLeftColor: theme.border,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 50,
          ...createShadow('#000000', { width: -4, height: 0 }, isDark ? 0.4 : 0.1, 16),
        }}
      >
        {/* 1. Header del Side Sheet (Botón cerrar, sol, nota, más) */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 14,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          }}
        >
          {/* Cerrar Side Sheet */}
          <Pressable
            onPress={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: theme.cardSecondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} color={theme.text.primary} />
          </Pressable>

          {/* Botones de Acción de Cabecera */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {/* Saltar hoy (Sun) */}
            <Pressable
              onPress={() => (isSkipped ? undoSkip(habit.id, selectedDate) : skipToday(habit.id, selectedDate))}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isSkipped ? 'rgba(255, 149, 0, 0.2)' : theme.cardSecondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sun size={17} color={isSkipped ? '#FF9500' : theme.text.secondary} />
            </Pressable>

            {/* Nota */}
            <Pressable
              onPress={() => setIsNoteOpen(!isNoteOpen)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isNoteOpen || currentLog?.notes ? 'rgba(0, 122, 255, 0.2)' : theme.cardSecondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={17} color={isNoteOpen || currentLog?.notes ? IOS_COLORS.blue : theme.text.secondary} />
            </Pressable>

            {/* Menú Más Opciones */}
            <Pressable
              onPress={() => setIsOptionsMenuOpen(true)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isOptionsMenuOpen ? theme.border : theme.cardSecondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MoreHorizontal size={17} color={theme.text.secondary} />
            </Pressable>
          </View>
        </View>

        {/* 2. Cuerpo Principal Scrollable */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24, alignItems: 'center', gap: 20 }}
        >
          {/* Título & Emoji */}
          <View style={{ alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 20,
                backgroundColor: `${cardAccent}20`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 30 }}>{habit.icon}</Text>
            </View>

            <Text style={{ fontSize: 22, fontWeight: '900', color: theme.text.primary, textAlign: 'center' }}>
              {habit.title}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Zap size={13} color={cardAccent} fill={cardAccent} />
              <Text style={{ fontSize: 12, fontWeight: '800', color: cardAccent }}>
                +{habit.points} pts de recompensa
              </Text>
            </View>

            {habit.motivation && (
              <View
                style={{
                  backgroundColor: theme.cardSecondary,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 10,
                  marginTop: 4,
                }}
              >
                <Text style={{ fontSize: 11, fontStyle: 'italic', color: theme.text.secondary, textAlign: 'center' }}>
                  "{habit.motivation}"
                </Text>
              </View>
            )}
          </View>

          {/* 3. Gran Anillo Circular Interactivo SVG con Botones Flotantes +/- */}
          <View style={{ width: 280, height: 260, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {/* Botón Decrementar a la Izquierda */}
            <Pressable
              onPress={() => {
                if (habit.type === 'counter') {
                  decrementCounter(habit.id, 1, selectedDate);
                } else if (habit.type === 'timer') {
                  const nextSecs = Math.max(0, liveSeconds - 300);
                  setTimerElapsed(habit.id, nextSecs);
                  setLiveSeconds(nextSecs);
                }
              }}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.85 : 1 }],
                position: 'absolute',
                left: 0,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.cardSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme.border,
                zIndex: 10,
              })}
            >
              <Minus size={20} color={theme.text.primary} />
            </Pressable>

            {/* Anillo Circular SVG */}
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
                stroke={cardAccent}
                strokeWidth="14"
                fill="none"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 110 110)"
              />
            </Svg>

            {/* Display Digital Central */}
            <View style={{ position: 'absolute', alignItems: 'center', gap: 4 }}>
              <Text
                style={{
                  fontSize: 34,
                  fontWeight: '900',
                  color: theme.text.primary,
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

            {/* Botón Incrementar a la Derecha */}
            <Pressable
              onPress={() => {
                if (habit.type === 'counter') {
                  incrementCounter(habit.id, 1, selectedDate);
                } else if (habit.type === 'timer') {
                  const nextSecs = liveSeconds + 300;
                  setTimerElapsed(habit.id, nextSecs);
                  setLiveSeconds(nextSecs);
                }
              }}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.85 : 1 }],
                position: 'absolute',
                right: 0,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.cardSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme.border,
                zIndex: 10,
              })}
            >
              <Plus size={20} color={theme.text.primary} />
            </Pressable>
          </View>

          {/* 4. Fila de Acciones Secundarias (Saltar, Resetear, etc.) */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable
              onPress={() => skipToday(habit.id, selectedDate)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.cardSecondary,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: theme.border,
                gap: 6,
              }}
            >
              <FastForward size={14} color={theme.text.secondary} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary }}>
                Saltar objetivo
              </Text>
            </Pressable>

            <Pressable
              onPress={() => undoSkip(habit.id, selectedDate)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.cardSecondary,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: theme.border,
                gap: 6,
              }}
            >
              <RotateCcw size={14} color={theme.text.secondary} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary }}>
                Deshacer
              </Text>
            </Pressable>
          </View>

          {/* 5. Sección de Notas Inline */}
          {isNoteOpen && (
            <View
              style={{
                width: '100%',
                backgroundColor: theme.cardSecondary,
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: theme.border,
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.secondary }}>
                Bitácora de la Sesión
              </Text>
              <TextInput
                value={noteText}
                onChangeText={setNoteText}
                placeholder="Escribe notas sobre tu sesión..."
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
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>
                  Guardar Nota
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        {/* 6. Botón Principal Inferior Táctil */}
        <View
          style={{
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            backgroundColor: isDark ? '#141416' : '#FFFFFF',
          }}
        >
          <Pressable
            onPress={handleMainAction}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.96 : 1 }],
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isTimerRunning ? '#FF3B30' : isCompleted ? '#34C759' : cardAccent,
              paddingVertical: 16,
              borderRadius: 20,
              gap: 10,
              ...createShadow(
                isTimerRunning ? '#FF3B30' : cardAccent,
                { width: 0, height: 4 },
                0.3,
                10
              ),
            })}
          >
            {habit.type === 'timer' ? (
              isTimerRunning ? (
                <>
                  <Pause size={20} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#FFFFFF' }}>
                    Detener y Guardar
                  </Text>
                </>
              ) : (
                <>
                  <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#FFFFFF' }}>
                    Iniciar cronómetro
                  </Text>
                </>
              )
            ) : habit.type === 'counter' ? (
              <>
                <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#FFFFFF' }}>
                  +1 {habit.target_unit}
                </Text>
              </>
            ) : (
              <>
                <Check size={20} color="#FFFFFF" strokeWidth={3} />
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#FFFFFF' }}>
                  {isCompleted ? 'Desmarcar' : 'Completar hábito'}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      {/* Menú Action Sheet de Opciones Avanzadas */}
      <GritHabitOptionsMenu
        visible={isOptionsMenuOpen}
        habit={habit}
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
