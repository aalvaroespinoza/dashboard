import React from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Calendar,
  Flag,
  ChevronDown,
  ChevronRight,
  Repeat,
  CornerDownRight,
  Plus,
} from 'lucide-react-native';
import { TaskItem, Priority } from '../../../types';
import { ReminderCheckbox } from './ReminderCheckbox';
import { RichLinkPreviewCard } from './RichLinkPreviewCard';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';
import { getHumanReadableRRule } from '../../../services/recurrenceService';

interface HierarchicalTaskItemProps {
  task: TaskItem;
  listColor?: string;
  onToggleComplete: (id: string) => void;
  onToggleCollapse?: (id: string) => void;
  onAddSubtask?: (parentId: string) => void;
  onPress?: (task: TaskItem) => void;
  onLongPress?: (task: TaskItem) => void;
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
  onLongPress,
  onToggleFlag,
  isDark = true,
}) => {
  const isCompleted = Boolean(task.is_completed);
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const level = task.level || 0;
  const todayStr = '2026-08-24';
  const isToday = task.due_date === todayStr;
  const isOverdue = !isCompleted && task.due_date && task.due_date < todayStr;

  const getPriorityInfo = (p: Priority) => {
    switch (p) {
      case 'high':
        return { label: '!!!', color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.16)' };
      case 'medium':
        return { label: '!!', color: '#FF9500', bg: 'rgba(255, 149, 0, 0.16)' };
      case 'low':
        return { label: '!', color: '#007AFF', bg: 'rgba(0, 122, 255, 0.16)' };
      default:
        return null;
    }
  };

  const priorityInfo = getPriorityInfo(task.priority);

  return (
    <Pressable
      onPress={() => onPress?.(task)}
      onLongPress={() => onLongPress?.(task)}
      delayLongPress={350}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
        marginLeft: level * 20, // Indentación visual de subtareas
        position: 'relative',
        ...createShadow('#000000', { width: 0, height: 2 }, isDark ? 0.2 : 0.03, 4),
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
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
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {/* Indicador de Prioridad Exclamation */}
                {priorityInfo && (
                  <Text style={{ fontSize: 13, fontWeight: '900', color: priorityInfo.color }}>
                    {priorityInfo.label}
                  </Text>
                )}

                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: isCompleted ? theme.text.tertiary : theme.text.primary,
                    textDecorationLine: isCompleted ? 'line-through' : 'none',
                    lineHeight: 20,
                    flex: 1,
                  }}
                >
                  {task.title}
                </Text>
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
            </View>

            {/* Acciones Rápidas (Subtareas / Flag / Plus) */}
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
                    backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
                    paddingHorizontal: 7,
                    paddingVertical: 3,
                    borderRadius: 8,
                    gap: 3,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary }}>
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
                style={{ padding: 3 }}
              >
                <Flag
                  size={14}
                  color={task.flagged ? '#FF9500' : theme.text.tertiary}
                  fill={task.flagged ? '#FF9500' : 'none'}
                />
              </Pressable>

              {/* Botón Añadir Subtarea rápida */}
              {onAddSubtask && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    onAddSubtask(task.id);
                  }}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Plus size={13} color={theme.text.secondary} strokeWidth={2.5} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Tarjeta Enriquecida de Link Preview (si la tarea contiene URL o video) */}
          {task.link_preview && (
            <RichLinkPreviewCard preview={task.link_preview} isDark={isDark} />
          )}

          {/* Fila de Badges y Metadatos */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {/* Fecha / Hora Relativa */}
            {task.due_date && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isOverdue || isToday
                    ? 'rgba(255, 59, 48, 0.15)'
                    : isDark
                    ? '#2C2C2E'
                    : '#E5E5EA',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: isOverdue || isToday ? 'rgba(255, 59, 48, 0.3)' : theme.border,
                  gap: 4,
                }}
              >
                <Calendar size={11} color={isOverdue || isToday ? '#FF3B30' : IOS_COLORS.blue} />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '800',
                    color: isOverdue || isToday ? '#FF3B30' : IOS_COLORS.blue,
                  }}
                >
                  {isToday ? 'Hoy' : task.due_date} {task.due_time ? `· ${task.due_time}` : ''}
                </Text>
              </View>
            )}

            {/* Recurrencia */}
            {task.rrule && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
                  paddingHorizontal: 7,
                  paddingVertical: 3,
                  borderRadius: 8,
                  gap: 4,
                }}
              >
                <Repeat size={11} color={IOS_COLORS.purple} />
                <Text style={{ fontSize: 11, fontWeight: '800', color: IOS_COLORS.purple }}>
                  {getHumanReadableRRule(task.rrule)}
                </Text>
              </View>
            )}

            {/* Tags */}
            {(task.tags || []).map((tag, idx) => (
              <View
                key={idx}
                style={{
                  backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 11, color: IOS_COLORS.cyan, fontWeight: '700' }}>
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
