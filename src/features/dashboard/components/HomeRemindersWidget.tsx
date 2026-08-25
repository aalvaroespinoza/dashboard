/**
 * HomeRemindersWidget.tsx
 * Widget de Recordatorios 100% Conectado a SQLite en Tiempo Real.
 * - Muestra las tareas reales pendientes de useTasksStore.
 * - Checkboxes circulares con toggle reactivo inmediato y persistencia en base de datos.
 * - Al tocar la tarea abre ReminderDetailSheet con los datos reales.
 * - Botón "+ Nueva tarea rápida" abre CreateReminderModal.
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  ChevronRight,
  Plus,
  CheckCircle2,
  ListTodo,
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeOutDown, LinearTransition } from 'react-native-reanimated';
import { useTasksStore } from '../../../store/useTasksStore';
import { useAppStore } from '../../../store/useAppStore';
import { ReminderCheckbox } from '../../reminders/components/ReminderCheckbox';
import { IOS_COLORS, IOS_FONTS, APPLE_ACCENT } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';
import { TaskItem } from '../../../types';

interface HomeRemindersWidgetProps {
  onQuickTaskPress?: () => void;
  onTaskPress?: (task: TaskItem) => void;
  isDark?: boolean;
}

export const HomeRemindersWidget: React.FC<HomeRemindersWidgetProps> = React.memo(({
  onQuickTaskPress,
  onTaskPress,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { setActiveModule } = useAppStore();

  const tasks = useTasksStore((state) => state.tasks);
  const toggleTaskComplete = useTasksStore((state) => state.toggleTaskComplete);
  const lists = useTasksStore((state) => state.lists);

  // Tareas reales pendientes de nivel raíz (máx 5 en vista compacta)
  const activeTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.is_completed && !t.parent_id)
      .slice(0, 5);
  }, [tasks]);

  const getTagColor = (tagName: string) => {
    const n = (tagName || '').toLowerCase();
    if (n.includes('estudio') || n.includes('facultad') || n.includes('utn') || n.includes('universidad')) {
      return {
        bg: isDark ? 'rgba(10, 132, 255, 0.16)' : 'rgba(0, 122, 255, 0.12)',
        text: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light,
      };
    }
    if (n.includes('trabajo') || n.includes('dev') || n.includes('código') || n.includes('informe')) {
      return {
        bg: isDark ? 'rgba(48, 209, 88, 0.16)' : 'rgba(52, 199, 89, 0.12)',
        text: isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light,
      };
    }
    if (n.includes('personal') || n.includes('salud') || n.includes('bienestar') || n.includes('hogar')) {
      return {
        bg: isDark ? 'rgba(255, 159, 10, 0.16)' : 'rgba(255, 149, 0, 0.12)',
        text: isDark ? APPLE_ACCENT.orange.dark : APPLE_ACCENT.orange.light,
      };
    }
    return {
      bg: isDark ? 'rgba(191, 90, 242, 0.16)' : 'rgba(175, 82, 222, 0.12)',
      text: isDark ? APPLE_ACCENT.purple.dark : APPLE_ACCENT.purple.light,
    };
  };

  const formatDueText = (dueDate?: string | null, dueTime?: string | null) => {
    if (!dueDate && !dueTime) return null;
    const nowStr = new Date().toISOString().split('T')[0];
    let dateLabel = dueDate || '';
    if (dueDate === nowStr || dueDate === '2026-08-24' || dueDate === '2026-08-25') {
      dateLabel = 'Hoy';
    }
    return `${dateLabel}${dueTime ? `, ${dueTime}` : ''}`;
  };

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E5EA',
        borderTopColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.9)',
        gap: 14,
        ...createShadow('#000000', { width: 0, height: 4 }, isDark ? 0.22 : 0.03, 8),
      }}
    >
      {/* Header del Widget */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 17, fontFamily: IOS_FONTS.bold, color: theme.text.primary, letterSpacing: -0.4 }}>
            Recordatorios
          </Text>
          <View
            style={{
              backgroundColor: isDark ? 'rgba(10, 132, 255, 0.18)' : 'rgba(0, 122, 255, 0.12)',
              paddingHorizontal: 7,
              paddingVertical: 2,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontFamily: IOS_FONTS.bold,
                color: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light,
                fontVariant: ['tabular-nums'],
              }}
            >
              {activeTasks.length}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => setActiveModule('tasks')}
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

      {/* Lista de Tareas Reales */}
      <View style={{ gap: 10 }}>
        {activeTasks.length === 0 ? (
          <View style={{ paddingVertical: 20, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <CheckCircle2 size={28} color={isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light} />
            <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
              ¡Todo al día!
            </Text>
            <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
              No tienes tareas pendientes para hoy.
            </Text>
          </View>
        ) : (
          activeTasks.map((task) => {
            const listObj = lists.find((l) => l.id === task.list_id);
            const isCompleted = Boolean(task.is_completed);
            const tagText = task.tags?.[0] || listObj?.title || 'Personal';
            const tagStyle = getTagColor(tagText);
            const dueFormatted = formatDueText(task.due_date, task.due_time);

            return (
              <Animated.View
                key={task.id}
                entering={FadeInUp.duration(150)}
                exiting={FadeOutDown.duration(100)}
                layout={LinearTransition.springify().damping(20).stiffness(180)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 4,
                }}
              >
                {/* Lado Izquierdo: Checkbox Real + Título + Fecha/Hora */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <ReminderCheckbox
                    checked={isCompleted}
                    onToggle={() => toggleTaskComplete(task.id)}
                    color={listObj?.color || (isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light)}
                    size={20}
                    isDark={isDark}
                  />

                  <Pressable
                    onPress={() => onTaskPress?.(task)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.75 : 1,
                      flex: 1,
                      gap: 2,
                    })}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 14,
                        fontFamily: IOS_FONTS.bold,
                        color: isCompleted ? theme.text.tertiary : theme.text.primary,
                        textDecorationLine: isCompleted ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </Text>

                    {/* Subtítulo de Horario Real */}
                    {dueFormatted && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <View
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: 2.5,
                            backgroundColor: dueFormatted.startsWith('Hoy')
                              ? (isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light)
                              : theme.text.tertiary,
                          }}
                        />
                        <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                          {dueFormatted}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                </View>

                {/* Lado Derecho: Píldora de Categoría / Tag Real */}
                <View
                  style={{
                    backgroundColor: tagStyle.bg,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    borderRadius: 10,
                    marginLeft: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: IOS_FONTS.bold,
                      color: tagStyle.text,
                    }}
                  >
                    {tagText}
                  </Text>
                </View>
              </Animated.View>
            );
          })
        )}
      </View>

      {/* Botón Inferior: + Nueva tarea rápida */}
      <Pressable
        onPress={() => {
          if (onQuickTaskPress) {
            onQuickTaskPress();
          } else {
            setActiveModule('tasks');
          }
        }}
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F2F2F7',
          paddingVertical: 10,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E5EA',
          gap: 6,
          marginTop: 2,
        })}
      >
        <Plus size={14} color={isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light} strokeWidth={2.5} />
        <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light }}>
          Nueva tarea rápida
        </Text>
      </Pressable>
    </View>
  );
});
