/**
 * HomeRemindersWidget.tsx
 * Widget de Recordatorios Inteligentes del Dashboard estilo iPadOS 18.
 * Checkboxes circulares táctiles, subtítulo de vencimiento, píldoras temáticas Apple HIG y botón de creación rápida.
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  ChevronRight,
  Plus,
  CheckCircle2,
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeOutDown, LinearTransition } from 'react-native-reanimated';
import { useTasksStore } from '../../../store/useTasksStore';
import { useAppStore } from '../../../store/useAppStore';
import { ReminderCheckbox } from '../../reminders/components/ReminderCheckbox';
import { IOS_COLORS, IOS_FONTS, APPLE_ACCENT } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface HomeRemindersWidgetProps {
  onQuickTaskPress?: () => void;
  isDark?: boolean;
}

export const HomeRemindersWidget: React.FC<HomeRemindersWidgetProps> = React.memo(({
  onQuickTaskPress,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { setActiveModule } = useAppStore();

  const tasks = useTasksStore((state) => state.tasks);
  const toggleTaskComplete = useTasksStore((state) => state.toggleTaskComplete);
  const lists = useTasksStore((state) => state.lists);

  // Muestra las primeras 5 tareas activas pendientes
  const activeTasks = useMemo(() => {
    const active = tasks.filter((t) => !t.is_completed);
    if (active.length > 0) return active.slice(0, 5);

    // Fallback con tareas de ejemplo si no hay en base de datos para simular la maqueta
    return [
      { id: 'mock-1', title: 'Estudiar Vue 3', due_date: 'Hoy', due_time: '10:00', list_id: 'estudios', tags: ['Estudios'], is_completed: 0 },
      { id: 'mock-2', title: 'Enviar informe mensual', due_date: 'Hoy', due_time: '12:30', list_id: 'trabajo', tags: ['Trabajo'], is_completed: 0 },
      { id: 'mock-3', title: 'Entrenamiento físico', due_date: 'Hoy', due_time: '18:00', list_id: 'personal', tags: ['Personal'], is_completed: 0 },
      { id: 'mock-4', title: 'Comprar regalos de cumpleaños', due_date: 'Mañana', due_time: '17:00', list_id: 'personal', tags: ['Personal'], is_completed: 0 },
      { id: 'mock-5', title: 'Revisar PR del proyecto', due_date: 'Jue, 27 ago', due_time: '16:00', list_id: 'trabajo', tags: ['Trabajo'], is_completed: 0 },
    ];
  }, [tasks]);

  const getTagColor = (tagName: string) => {
    const n = tagName.toLowerCase();
    if (n.includes('estudio') || n.includes('facultad') || n.includes('vue')) {
      return {
        bg: isDark ? 'rgba(10, 132, 255, 0.16)' : 'rgba(0, 122, 255, 0.12)',
        text: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light,
      };
    }
    if (n.includes('trabajo') || n.includes('informe') || n.includes('pr')) {
      return {
        bg: isDark ? 'rgba(48, 209, 88, 0.16)' : 'rgba(52, 199, 89, 0.12)',
        text: isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light,
      };
    }
    if (n.includes('personal') || n.includes('entrenamiento') || n.includes('regalo')) {
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
        <Text style={{ fontSize: 17, fontFamily: IOS_FONTS.bold, color: theme.text.primary, letterSpacing: -0.4 }}>
          Recordatorios
        </Text>

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

      {/* Lista de Tareas */}
      <View style={{ gap: 10 }}>
        {activeTasks.map((task) => {
          const listObj = lists.find((l) => l.id === task.list_id);
          const isCompleted = Boolean(task.is_completed);
          const tagText = task.tags?.[0] || listObj?.title || 'Personal';
          const tagStyle = getTagColor(tagText);

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
                paddingVertical: 6,
              }}
            >
              {/* Lado Izquierdo: Checkbox + Título + Fecha/Hora */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <ReminderCheckbox
                  checked={isCompleted}
                  onToggle={() => {
                    if (task.id.startsWith('mock-')) return;
                    toggleTaskComplete(task.id);
                  }}
                  color={listObj?.color || (isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light)}
                  size={20}
                  isDark={isDark}
                />

                <View style={{ flex: 1, gap: 2 }}>
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

                  {/* Subtítulo de Horario */}
                  {(task.due_date || task.due_time) && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <View
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: 2.5,
                          backgroundColor: task.due_date === 'Hoy' || task.due_date?.includes('2026-08-25')
                            ? (isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light)
                            : theme.text.tertiary,
                        }}
                      />
                      <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                        {task.due_date === '2026-08-25' ? 'Hoy' : task.due_date}
                        {task.due_time ? `, ${task.due_time}` : ''}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Lado Derecho: Píldora de Categoría / Tag */}
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
        })}
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
