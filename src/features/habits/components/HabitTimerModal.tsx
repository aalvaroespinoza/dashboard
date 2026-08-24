import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import Svg, { Circle, G, Line } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Check,
  Plus,
  Minus,
  Sparkles,
  FileText,
  Zap,
  Flame,
} from 'lucide-react-native';
import { HabitItem } from '../../../types';
import { useHabitsStore } from '../stores/useHabitsStore';
import { IOS_COLORS } from '../../../styles/theme';
import { IOS_SPRINGS } from '../../../styles/animations';
import { createShadow } from '../../../styles/shadows';

interface HabitTimerModalProps {
  visible: boolean;
  habit: HabitItem | null;
  onClose: () => void;
  onOpenNote?: (habit: HabitItem) => void;
  isDark?: boolean;
}

const RADIUS = 110;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const HabitTimerModal: React.FC<HabitTimerModalProps> = ({
  visible,
  habit,
  onClose,
  onOpenNote,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const {
    activeTimers,
    startTimer,
    pauseTimer,
    stopAndSaveTimer,
    setTimerElapsed,
    getTimerSeconds,
  } = useHabitsStore();

  const [currentSeconds, setCurrentSeconds] = useState(0);

  const habitId = habit?.id || '';
  const timerState = activeTimers[habitId];
  const isRunning = Boolean(timerState?.isRunning);

  const targetMinutes = habit?.target_value || 25;
  const targetSeconds = targetMinutes * 60;

  useEffect(() => {
    if (!visible || !habitId) return;

    setCurrentSeconds(getTimerSeconds(habitId));

    const interval = setInterval(() => {
      setCurrentSeconds(getTimerSeconds(habitId));
    }, 300);

    return () => clearInterval(interval);
  }, [visible, habitId, isRunning]);

  const cardAccent = habit?.color || IOS_COLORS.blue;

  const progress = Math.min(1, currentSeconds / (targetSeconds || 1));
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const formatDigits = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = () => {
    if (!habit) return;
    if (isRunning) {
      pauseTimer(habit.id);
    } else {
      startTimer(habit.id);
    }
  };

  const handleAddMinutes = (minsToAdd: number) => {
    if (!habit) return;
    const nextSecs = Math.max(0, currentSeconds + minsToAdd * 60);
    setTimerElapsed(habit.id, nextSecs);
    setCurrentSeconds(nextSecs);
  };

  const handleFinishSession = async () => {
    if (!habit) return;
    await stopAndSaveTimer(habit.id);
    onClose();
  };

  if (!habit) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.65)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <View
          style={{
            width: '90%',
            maxWidth: 520,
            backgroundColor: theme.card,
            borderRadius: 36,
            padding: 28,
            borderWidth: 1.5,
            borderColor: `${cardAccent}40`,
            alignItems: 'center',
            gap: 22,
            ...createShadow(cardAccent, { width: 0, height: 8 }, 0.25, 20),
          }}
        >
          {/* Top Bar: Cerrar, Notas, Puntos */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Pressable
              onPress={onClose}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: theme.cardSecondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} color={theme.text.primary} />
            </Pressable>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 24 }}>{habit.icon}</Text>
              <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary }}>
                {habit.title}
              </Text>
            </View>

            {/* Acceso a Notas */}
            <Pressable
              onPress={() => {
                onClose();
                onOpenNote?.(habit);
              }}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: theme.cardSecondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={18} color={theme.text.secondary} />
            </Pressable>
          </View>

          {/* Anillo SVG Interactivo con Display Digital */}
          <View style={{ width: 260, height: 260, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Svg width="260" height="260" viewBox="0 0 260 260">
              {/* Anillo de Fondo */}
              <Circle
                cx="130"
                cy="130"
                r={RADIUS}
                stroke={isDark ? '#2C2C2E' : '#E5E5EA'}
                strokeWidth="12"
                fill="none"
              />

              {/* Anillo de Progreso */}
              <Circle
                cx="130"
                cy="130"
                r={RADIUS}
                stroke={cardAccent}
                strokeWidth="12"
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 130 130)"
              />
            </Svg>

            {/* Display Digital Central */}
            <View style={{ position: 'absolute', alignItems: 'center', gap: 4 }}>
              <Text
                style={{
                  fontSize: 44,
                  fontWeight: '900',
                  color: theme.text.primary,
                  fontVariant: ['tabular-nums'],
                  fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                  letterSpacing: -1,
                }}
              >
                {formatDigits(currentSeconds)}
              </Text>

              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary }}>
                Meta: {habit.target_value} {habit.target_unit}
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: `${cardAccent}20`,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 10,
                  marginTop: 4,
                  gap: 4,
                }}
              >
                <Zap size={11} color={cardAccent} fill={cardAccent} />
                <Text style={{ fontSize: 11, fontWeight: '900', color: cardAccent }}>
                  +{habit.points} pts al completar
                </Text>
              </View>
            </View>
          </View>

          {/* Botones Elásticos para Sumar/Restar Tiempo al Vuelo */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Pressable
              onPress={() => handleAddMinutes(-5)}
              style={{
                backgroundColor: theme.cardSecondary,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.primary }}>-5 min</Text>
            </Pressable>

            <Pressable
              onPress={() => handleAddMinutes(-1)}
              style={{
                backgroundColor: theme.cardSecondary,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.primary }}>-1 min</Text>
            </Pressable>

            <Pressable
              onPress={() => handleAddMinutes(1)}
              style={{
                backgroundColor: theme.cardSecondary,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.primary }}>+1 min</Text>
            </Pressable>

            <Pressable
              onPress={() => handleAddMinutes(5)}
              style={{
                backgroundColor: theme.cardSecondary,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.primary }}>+5 min</Text>
            </Pressable>
          </View>

          {/* Acciones Principales */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, width: '100%' }}>
            {/* Play / Pause Toggle */}
            <Pressable
              onPress={handleToggleTimer}
              style={({ pressed }) => ({
                flex: 1,
                opacity: pressed ? 0.85 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isRunning ? '#FF3B30' : cardAccent,
                paddingVertical: 14,
                borderRadius: 18,
                gap: 8,
                ...createShadow(isRunning ? '#FF3B30' : cardAccent, { width: 0, height: 4 }, 0.3, 8),
              })}
            >
              {isRunning ? (
                <>
                  <Pause size={18} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={{ fontSize: 15, fontWeight: '900', color: '#FFFFFF' }}>Pausar</Text>
                </>
              ) : (
                <>
                  <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={{ fontSize: 15, fontWeight: '900', color: '#FFFFFF' }}>
                    {currentSeconds > 0 ? 'Continuar' : 'Iniciar'}
                  </Text>
                </>
              )}
            </Pressable>

            {/* Guardar y Finalizar */}
            <Pressable
              onPress={handleFinishSession}
              style={({ pressed }) => ({
                opacity: pressed ? 0.85 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.cardSecondary,
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: theme.border,
                gap: 6,
              })}
            >
              <Check size={18} color={IOS_COLORS.green} strokeWidth={2.5} />
              <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text.primary }}>
                Guardar
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
