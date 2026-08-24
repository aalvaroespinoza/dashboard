import React from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Clock,
  Calendar,
  Flag,
  ChevronDown,
  ChevronRight,
  Repeat,
  CornerDownRight,
  MoreHorizontal,
  Trash2,
  Edit2,
  Plus,
} from 'lucide-react-native';
import { TaskItem, Priority } from '../../../types';
import { ReminderCheckbox } from './ReminderCheckbox';
import { IOS_COLORS } from '../../../styles/theme';
import { getHumanReadableRRule } from '../../../services/recurrenceService';

interface HierarchicalTaskItemProps {
  task: TaskItem;
  listColor?: string;
  onToggleComplete: (id: string) => void;
  onToggleCollapse?: (id: string) => void;
  onAddSubtask?: (parentId: string) => void;
  onPress?: (task: TaskItem) => void;
  onDelete?: (id: string) => void;
  onToggleFlag?: (id: string) => void;
  isDark?: boolean;
}

export const HierarchicalTaskItem: React.FC<HierarchicalTaskItemProps> = ({
  task,
  listColor = IOS_COLORS.blue,
  onToggleComplete,
  onToggleCollapse,
  onAddSubtask,
  onPress,
  onDelete,
  onToggleFlag,
  isDark = true,
}) => {
  const isCompleted = Boolean(task.is_completed);
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const level = task.level || 0;
  const isOverdue =
    !isCompleted &&
    task.due_date &&
    task.due_date < new Date().toISOString().split('T')[0];

  const getPriorityInfo = (p: Priority) => {
    switch (p) {
      case 'high':
        return { label: '1', color: IOS_COLORS.red, bg: isDark ? 'rgba(255, 59, 48, 0.2)' : '#FEE2E2' };
      case 'medium':
        return { label: '5', color: IOS_COLORS.orange, bg: isDark ? 'rgba(255, 149, 0, 0.2)' : '#FEF3C7' };
      case 'low':
        return { label: '9', color: IOS_COLORS.blue, bg: isDark ? 'rgba(0, 122, 255, 0.2)' : '#DBEAFE' };
      default:
        return null;
    }
  };

  const priorityInfo = getPriorityInfo(task.priority);

  return (
    <Pressable
      onPress={() => onPress?.(task)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        backgroundColor: theme.cardSecondary,
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: isCompleted ? theme.borderSubtle : theme.border,
        marginLeft: level * 20, // Indentación visual de subtareas
        position: 'relative',
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        {/* Indicador de jerarquía para subtareas */}
        {level > 0 && (
          <View style={{ marginTop: 4, marginRight: -4 }}>
            <CornerDownRight size={14} color={theme.text.tertiary} />
          </View>
        )}

        {/* Checkbox Circular Animado */}
        <View style={{ marginTop: 1 }}>
          <ReminderCheckbox
            checked={isCompleted}
            onToggle={() => onToggleComplete(task.id)}
            color={listColor}
            size={22}
            isDark={isDark}
          />
        </View>

        {/* Contenido Principal */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              {/* Color Dot de la Lista (solo en raíces) */}
              {level === 0 && (
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: listColor,
                  }}
                />
              )}

              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: isCompleted ? theme.text.tertiary : theme.text.primary,
                  textDecorationLine: isCompleted ? 'line-through' : 'none',
                  flex: 1,
                  lineHeight: 18,
                }}
              >
                {task.title}
              </Text>
            </View>

            {/* Acciones Rápidas (Subtareas / Flag / Opciones) */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {/* Botón de Colapso de Subtareas si tiene hijos */}
              {task.has_subtasks && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    onToggleCollapse?.(task.id);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: theme.border,
                    gap: 3,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '800', color: theme.text.secondary }}>
                    {task.subtasks_completed_count}/{task.subtasks_count}
                  </Text>
                  {task.is_collapsed ? (
                    <ChevronRight size={12} color={theme.text.secondary} />
                  ) : (
                    <ChevronDown size={12} color={theme.text.secondary} />
                  )}
                </Pressable>
              )}

              {/* Botón Flag Banderín */}
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onToggleFlag?.(task.id);
                }}
                style={{ padding: 2 }}
              >
                <Flag
                  size={13}
                  color={task.flagged ? IOS_COLORS.orange : theme.text.tertiary}
                  fill={task.flagged ? IOS_COLORS.orange : 'none'}
                />
              </Pressable>

              {/* Botón Añadir Subtarea rápida */}
              {onAddSubtask && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    onAddSubtask(task.id);
                  }}
                  style={{ padding: 2 }}
                >
                  <Plus size={14} color={theme.text.secondary} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Notas */}
          {task.notes && (
            <Text
              numberOfLines={2}
              style={{
                fontSize: 12,
                color: theme.text.secondary,
                marginTop: 3,
                lineHeight: 16,
              }}
            >
              {task.notes}
            </Text>
          )}

          {/* Fila de Badges y Metadatos */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {/* Fecha / Hora */}
            {task.due_date && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isOverdue
                    ? isDark
                      ? 'rgba(255, 59, 48, 0.2)'
                      : '#FEE2E2'
                    : isDark
                    ? '#1C1C1E'
                    : '#FFFFFF',
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: isOverdue ? IOS_COLORS.red : theme.border,
                  gap: 4,
                }}
              >
                <Calendar size={10} color={isOverdue ? IOS_COLORS.red : theme.text.secondary} />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: isOverdue ? IOS_COLORS.red : theme.text.secondary,
                  }}
                >
                  {task.due_date} {task.due_time ? `· ${task.due_time}` : ''}
                </Text>
              </View>
            )}

            {/* Recurrencia */}
            {task.rrule && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: theme.border,
                  gap: 4,
                }}
              >
                <Repeat size={10} color={IOS_COLORS.purple} />
                <Text style={{ fontSize: 10, fontWeight: '700', color: IOS_COLORS.purple }}>
                  {getHumanReadableRRule(task.rrule)}
                </Text>
              </View>
            )}

            {/* Prioridad */}
            {priorityInfo && (
              <View
                style={{
                  backgroundColor: priorityInfo.bg,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 6,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '800', color: priorityInfo.color }}>
                  P{priorityInfo.label}
                </Text>
              </View>
            )}

            {/* Tags */}
            {(task.tags || []).map((tag, idx) => (
              <View
                key={idx}
                style={{
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Text style={{ fontSize: 10, color: IOS_COLORS.cyan, fontWeight: '600' }}>
                  #{tag}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Pressable>
  );
};
