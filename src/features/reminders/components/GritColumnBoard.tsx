import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutDown,
  LinearTransition,
} from 'react-native-reanimated';
import { Plus, CheckCircle2 } from 'lucide-react-native';
import { TaskItem, TaskList } from '../../../types';
import { GritColumnData } from '../../../store/useTasksStore';
import { HierarchicalTaskItem } from './HierarchicalTaskItem';
import { IOS_COLORS } from '../../../styles/theme';

import { createShadow } from '../../../styles/shadows';

interface GritColumnBoardProps {
  columns: GritColumnData[];
  onToggleComplete: (id: string) => void;
  onToggleCollapse?: (id: string) => void;
  onAddSubtask?: (parentId: string) => void;
  onOpenNewTask: (listId?: string) => void;
  onOpenEditTask: (task: TaskItem) => void;
  onToggleFlag?: (id: string) => void;
  isDark?: boolean;
}

export const GritColumnBoard: React.FC<GritColumnBoardProps> = ({
  columns,
  onToggleComplete,
  onToggleCollapse,
  onAddSubtask,
  onOpenNewTask,
  onOpenEditTask,
  onToggleFlag,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 20, gap: 16, flexGrow: 1 }}
    >
      {columns.map((col) => {
        const pendingTasks = col.tasks.filter((t) => !t.is_completed);
        const completedTasks = col.tasks.filter((t) => t.is_completed);

        return (
          <Animated.View
            key={col.id}
            layout={LinearTransition.springify().damping(20).stiffness(160)}
            style={{
              minWidth: 280,
              maxWidth: 340,
              flex: 1,
              backgroundColor: theme.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 16,
              maxHeight: '100%',
              display: 'flex',
              flexDirection: 'column',
              ...createShadow('#000000', { width: 0, height: 1 }, 0.03, 3),
            }}
          >
            {/* Column Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
                paddingBottom: 10,
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: col.color || IOS_COLORS.blue,
                  }}
                />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '800',
                    color: theme.text.primary,
                  }}
                >
                  {col.title}
                </Text>
                <View
                  style={{
                    backgroundColor: theme.cardSecondary,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '800',
                      color: theme.text.secondary,
                    }}
                  >
                    {pendingTasks.length}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => onOpenNewTask(col.id.startsWith('list-') ? col.id : undefined)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  padding: 6,
                  borderRadius: 8,
                  backgroundColor: theme.cardSecondary,
                })}
              >
                <Plus size={16} color={IOS_COLORS.blue} strokeWidth={2.5} />
              </Pressable>
            </View>

            {/* Column Content Scroll */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              removeClippedSubviews
              style={{ flex: 1 }}
            >
              {col.tasks.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <CheckCircle2 size={32} color={theme.text.tertiary} />
                  <Text style={{ color: theme.text.secondary, fontSize: 13, marginTop: 8 }}>
                    Sin recordatorios pendientes
                  </Text>
                </View>
              ) : (
                <View>
                  {/* Pendientes */}
                  {pendingTasks.map((task) => (
                    <Animated.View
                      key={task.id}
                      entering={FadeInUp.springify().damping(18).stiffness(180)}
                      exiting={FadeOutDown.duration(120)}
                      layout={LinearTransition.springify().damping(20).stiffness(160)}
                    >
                      <HierarchicalTaskItem
                        task={task}
                        listColor={col.color || IOS_COLORS.blue}
                        onToggleComplete={onToggleComplete}
                        onToggleCollapse={onToggleCollapse}
                        onAddSubtask={onAddSubtask}
                        onPress={onOpenEditTask}
                        onToggleFlag={onToggleFlag}
                        isDark={isDark}
                      />
                    </Animated.View>
                  ))}

                  {/* Completadas */}
                  {completedTasks.length > 0 && (
                    <Animated.View
                      layout={LinearTransition.springify().damping(20).stiffness(160)}
                      style={{ marginTop: 8 }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '800',
                          color: theme.text.tertiary,
                          marginBottom: 8,
                          textTransform: 'uppercase',
                        }}
                      >
                        Completadas ({completedTasks.length})
                      </Text>
                      {completedTasks.map((task) => (
                        <Animated.View
                          key={task.id}
                          entering={FadeInUp.springify().damping(18).stiffness(180)}
                          exiting={FadeOutDown.duration(120)}
                          layout={LinearTransition.springify().damping(20).stiffness(160)}
                        >
                          <HierarchicalTaskItem
                            task={task}
                            listColor={col.color || IOS_COLORS.blue}
                            onToggleComplete={onToggleComplete}
                            onToggleCollapse={onToggleCollapse}
                            onAddSubtask={onAddSubtask}
                            onPress={onOpenEditTask}
                            onToggleFlag={onToggleFlag}
                            isDark={isDark}
                          />
                        </Animated.View>
                      ))}
                    </Animated.View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Bottom inline add */}
            <Pressable
              onPress={() => onOpenNewTask(col.id.startsWith('list-') ? col.id : undefined)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: theme.cardSecondary,
                marginTop: 10,
                gap: 6,
              })}
            >
              <Plus size={15} color={theme.text.secondary} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text.secondary }}>
                Añadir recordatorio
              </Text>
            </Pressable>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
};
