import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Clock } from 'lucide-react-native';
import { TaskItem, Priority } from '../../../types';
import { ReminderCheckbox } from './ReminderCheckbox';
import { IOS_COLORS } from '../../../styles/theme';

interface ReminderCardProps {
  task: TaskItem;
  listColor?: string;
  onToggleComplete: (id: string) => void;
  onPress?: (task: TaskItem) => void;
  isDark?: boolean;
}

const ReminderCardComponent: React.FC<ReminderCardProps> = ({
  task,
  listColor = IOS_COLORS.blue,
  onToggleComplete,
  onPress,
  isDark = true,
}) => {
  const isCompleted = Boolean(task.is_completed);
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

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
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.border,
        gap: 6,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        {/* Checkbox Circular Animado Apple Reminders */}
        <View style={{ marginTop: 1 }}>
          <ReminderCheckbox
            checked={isCompleted}
            onToggle={() => onToggleComplete(task.id)}
            color={listColor}
            size={22}
            isDark={isDark}
          />
        </View>

        {/* Título y Notas */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {/* Color Dot de la lista */}
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: listColor,
              }}
            />
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

          {task.notes && (
            <Text
              numberOfLines={2}
              style={{
                fontSize: 12,
                color: theme.text.secondary,
                marginTop: 4,
                lineHeight: 16,
              }}
            >
              {task.notes}
            </Text>
          )}

          {/* Badges de Hora, Fecha y Prioridad */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {task.due_time && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: theme.border,
                  gap: 4,
                }}
              >
                <Clock size={11} color={theme.text.secondary} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
                  {task.due_time}
                </Text>
              </View>
            )}

            {task.due_date && (
              <View
                style={{
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Text style={{ fontSize: 10, color: theme.text.tertiary, fontWeight: '600' }}>
                  {task.due_date}
                </Text>
              </View>
            )}

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
                <Text style={{ fontSize: 10, color: theme.text.secondary }}>
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

export const ReminderCard = React.memo(ReminderCardComponent);
