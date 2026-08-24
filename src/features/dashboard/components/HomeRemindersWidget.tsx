import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  CheckCircle2,
  ChevronRight,
  ListTodo,
  Calendar,
  CornerDownRight,
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeOutDown, LinearTransition } from 'react-native-reanimated';
import { useTasksStore } from '../../../store/useTasksStore';
import { useAppStore } from '../../../store/useAppStore';
import { ReminderCheckbox } from '../../reminders/components/ReminderCheckbox';
import { RichLinkPreviewCard } from '../../reminders/components/RichLinkPreviewCard';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface HomeRemindersWidgetProps {
  isDark?: boolean;
}

export const HomeRemindersWidget: React.FC<HomeRemindersWidgetProps> = React.memo(({ isDark = true }) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { setActiveModule } = useAppStore();

  const tasks = useTasksStore((state) => state.tasks);
  const toggleTaskComplete = useTasksStore((state) => state.toggleTaskComplete);
  const lists = useTasksStore((state) => state.lists);

  // Filtrar las tareas activas más relevantes para el Dashboard
  const displayTasks = useMemo(() => {
    const active = tasks.filter((t) => !t.is_completed);
    return active.slice(0, 4);
  }, [tasks]);

  const pendingCount = tasks.filter((t) => !t.is_completed).length;

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
        gap: 14,
        ...createShadow('#000000', { width: 0, height: 4 }, isDark ? 0.2 : 0.04, 8),
      }}
    >
      {/* Header del Widget */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: 'rgba(0, 122, 255, 0.16)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ListTodo size={18} color="#007AFF" strokeWidth={2.5} />
          </View>
          <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.4 }}>
            Recordatorios
          </Text>
          <View
            style={{
              backgroundColor: 'rgba(0, 122, 255, 0.16)',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '900', color: '#007AFF' }}>
              {pendingCount}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => setActiveModule('tasks')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#007AFF' }}>
            Ver todos
          </Text>
          <ChevronRight size={15} color="#007AFF" />
        </Pressable>
      </View>

      {/* Lista de Recordatorios Interactivos */}
      <View style={{ gap: 8 }}>
        {displayTasks.length === 0 ? (
          <View style={{ paddingVertical: 24, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <CheckCircle2 size={32} color={IOS_COLORS.green} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
              ¡Todo al día!
            </Text>
            <Text style={{ fontSize: 12, color: theme.text.secondary }}>
              No tienes recordatorios pendientes para hoy.
            </Text>
          </View>
        ) : (
          displayTasks.map((task) => {
            const listObj = lists.find((l) => l.id === task.list_id);
            const isCompleted = Boolean(task.is_completed);

            return (
              <Animated.View
                key={task.id}
                entering={FadeInUp.duration(180)}
                exiting={FadeOutDown.duration(120)}
                layout={LinearTransition.springify().damping(20).stiffness(160)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  backgroundColor: isDark ? '#242426' : '#F9FAFB',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
                  gap: 10,
                }}
              >
                {/* Checkbox Circular */}
                <View style={{ marginTop: 2 }}>
                  <ReminderCheckbox
                    checked={isCompleted}
                    onToggle={() => toggleTaskComplete(task.id)}
                    color={listObj?.color || '#007AFF'}
                    size={20}
                    isDark={isDark}
                  />
                </View>

                {/* Info Tarea */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {task.priority === 'high' && (
                      <Text style={{ fontSize: 12, fontWeight: '900', color: '#FF3B30' }}>
                        !!!
                      </Text>
                    )}
                    {task.priority === 'medium' && (
                      <Text style={{ fontSize: 12, fontWeight: '900', color: '#FF9500' }}>
                        !!
                      </Text>
                    )}
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: isCompleted ? theme.text.tertiary : theme.text.primary,
                        textDecorationLine: isCompleted ? 'line-through' : 'none',
                        flex: 1,
                      }}
                    >
                      {task.title}
                    </Text>
                  </View>

                  {/* Metadatos Rápidos */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    {task.due_date && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Calendar size={10} color={theme.text.secondary} />
                        <Text style={{ fontSize: 10, fontWeight: '700', color: theme.text.secondary }}>
                          {task.due_date === '2026-08-24' ? 'Hoy' : task.due_date}
                          {task.due_time ? ` ${task.due_time}` : ''}
                        </Text>
                      </View>
                    )}

                    {(task.tags || []).slice(0, 2).map((tag, idx) => (
                      <Text key={idx} style={{ fontSize: 10, fontWeight: '700', color: IOS_COLORS.cyan }}>
                        #{tag}
                      </Text>
                    ))}
                  </View>

                  {/* Preview de Video/Link si existe */}
                  {task.link_preview && (
                    <RichLinkPreviewCard preview={task.link_preview} isDark={isDark} />
                  )}
                </View>
              </Animated.View>
            );
          })
        )}
      </View>
    </View>
  );
});
